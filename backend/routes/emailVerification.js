const express = require("express");
const transporter = require("../config/transporter");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const router = express.Router();
const app = express();
const cors = require("cors");

app.use(cors());

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/email-code", async (req, res) => {
  const { email } = req.body;
  console.log("email: ", email);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "유효한 이메일 주소를 입력해주세요." });
  }

  const code = generateCode();
  console.log(code);

  // 트랜잭션 시작
  try {
    await db.promise().beginTransaction(); // 트랜잭션 시작

    // 인증된 이메일인지 확인
    const checkVerifiedQuery = `SELECT * FROM user WHERE email = ? `;
    const [results] = await db.promise().query(checkVerifiedQuery, [email]);

    if (results.length > 0) {
      return res.status(400).json({ error: "이미 인증된 이메일입니다." });
    }

    // 기존 이메일 코드 삭제 후 새 코드 삽입
    const upsertQuery = `
            INSERT INTO emailverification (email, code, created_at, verified)
            VALUES (?, ?, CURRENT_TIMESTAMP, 0)
            ON DUPLICATE KEY UPDATE code = ?, created_at = CURRENT_TIMESTAMP
        `;
    await db.promise().query(upsertQuery, [email, code, code]);

    console.log(`인증코드 발송: ${email} -> ${code}`);

    // 이메일 발송 여부 확인
    const emailEnabled = process.env.EMAIL_ENABLED === "true";

    if (emailEnabled) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "이메일 인증 코드",
        html: `
                    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                        <h2 style="color: #4CAF50;">서비스 가입을 환영합니다!</h2>
                        <p>아래의 6자리 코드를 입력하여 인증을 완료해주세요:</p>
                        <h1 style="color: #333; letter-spacing: 5px;">${code}</h1>
                        <p>이 요청을 본인이 하지 않았다면, 이 메일을 무시하세요.</p>
                    </div>
                `,
      });
      res.json({ success: true, message: "인증 코드가 이메일로 전송되었습니다" });
    } else {
      console.log("이메일 발송 비활성화: 코드가 전송되지 않았습니다.");
      res.json({ success: true, message: `이메일 발송이 비활성화 되었습니다. Code: ${code}` });
    }

    await db.promise().commit(); // 트랜잭션 커밋
  } catch (error) {
    await db.promise().rollback(); // 오류 발생 시 롤백
    console.error(error);
    res.status(500).json({ error: "처리 중 오류가 발생했습니다." });
  }
});

router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;
  console.log("email: ", email);
  console.log("code: ", code);

  if (!email || !code) {
    return res.status(400).json({ error: "이메일과 코드를 입력해주세요." });
  }

  try {
    await db.promise().beginTransaction(); // 트랜잭션 시작

    // 이메일과 인증 코드 조회
    const query = `
          SELECT code, created_at, verified
          FROM emailverification
          WHERE email = ?
      `;
    const [results] = await db.promise().query(query, [email]);

    if (results.length === 0) {
      await db.promise().rollback(); // 오류 발생 시 롤백
      return res.status(400).json({ error: "인증 코드가 존재하지 않습니다." });
    }

    const { code: savedCode, created_at, verified } = results[0];

    if (verified) {
      await db.promise().rollback(); // 오류 발생 시 롤백
      return res.status(400).json({ error: "이미 인증된 이메일입니다." });
    }

    // 인증 코드 만료 확인 (10분 유효)
    const currentTime = Date.now() / 1000;
    const createdAtMillis = new Date(created_at).getTime() / 1000; // 문자열 -> 밀리초 변환
    const tenMinute = 6004802;
    const isExpired = parseInt(currentTime - createdAtMillis) > tenMinute; // 10분 유효
    console.log("isExpired: ", isExpired, "currentTime: ", currentTime, "createdAtMillis: ", createdAtMillis);
    console.log("currentTime - createdAtMillis: ", currentTime - createdAtMillis);

    if (isExpired) {
      await db.promise().rollback(); // 오류 발생 시 롤백
      return res.status(400).json({ error: "인증 코드가 만료되었습니다." });
    }

    if (savedCode !== code) {
      await db.promise().rollback(); // 오류 발생 시 롤백
      return res.status(400).json({ error: "인증 코드가 일치하지 않습니다." });
    }

    // 인증 상태 업데이트
    const updateQuery = `
          UPDATE emailverification
          SET verified = 1
          WHERE email = ?
      `;
    await db.promise().query(updateQuery, [email]);

    await db.promise().commit(); // 트랜잭션 커밋

    res.json({ success: true, message: "인증되었습니다." });
  } catch (err) {
    await db.promise().rollback(); // 오류 발생 시 롤백
    console.error(err);
    res.status(500).json({ error: "인증 처리 중 오류가 발생했습니다." });
  }
});

// 회원가입 후 사용자 db에 저장
router.post("/users", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "이메일, 비밀번호, 이름을 입력해주세요." });
  }

  // 비밀번호 정책 검증
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
    return res.status(400).json({ error: "비밀번호는 최소 8자, 대문자, 숫자, 특수문자를 포함해야 합니다." });
  }

  try {
    await db.promise().beginTransaction(); // 트랜잭션 시작

    // 이메일 인증 확인
    const verifyQuery = `SELECT verified FROM emailverification WHERE email = ?`;
    const [verifyResults] = await db.promise().query(verifyQuery, [email]);

    if (verifyResults.length === 0 || verifyResults[0].verified === 0) {
      await db.promise().rollback(); // 오류 발생 시 롤백
      return res.status(400).json({ error: "이메일 인증을 완료해주세요." });
    }

    // 중복 가입 확인
    const checkUserQuery = `SELECT email FROM user WHERE email = ?`;
    const [userResults] = await db.promise().query(checkUserQuery, [email]);
    
    if (userResults.length > 0) {
      await db.promise().rollback(); // 오류 발생 시 롤백
      return res.status(400).json({ error: "이미 등록된 이메일 입니다." });
    }
    
    // 사용자 정보 저장
    const insertUserQuery = `INSERT INTO user (email, password, name) VALUES (?, ?, ?)`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.promise().query(insertUserQuery, [email, hashedPassword, name]);
    
    // 인증 데이터 삭제
    const deleteCodeQuery = `DELETE FROM emailverification WHERE email = ?`;
    await db.promise().query(deleteCodeQuery, [email]);

    await db.promise().commit(); // 트랜잭션 커밋

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    await db.promise().rollback(); // 오류 발생 시 롤백
    console.error(err);
    res.status(500).json({ error: "회원가입 처리 중 오류가 발생했습니다." });
  }
});

module.exports = router;
