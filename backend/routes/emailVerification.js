const express = require("express");
const transporter = require("../config/transporter");
const db = require("../config/db");

const router = express.Router();

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/email-code", (req, res) => {
    const { email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "유효한 이메일 주소를 입력해주세요." });
    }

    const code = generateCode();
    const timestamp = Date.now();

    // 인증된 이메일인지 확인
    const checkVerifiedQuery = `SELECT * FROM EmailVerification WHERE email = ? AND verified = 1`;
    db.query(checkVerifiedQuery, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "이메일 인증 상태 조회 실패" });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: "이미 인증된 이메일입니다." });
        }

        // 기존 이메일 코드 삭제 후 새 코드 삽입
        const upsertQuery = `
            INSERT INTO EmailVerification (email, code, timestamp, verified)
            VALUES (?, ?, ?, 0)
            ON DUPLICATE KEY UPDATE code = ?, timestamp = ?, verified = 0
        `;
        db.query(upsertQuery, [email, code, timestamp, code, timestamp], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to save verification code" });
            }

            console.log(`인증코드 발송: ${email} -> ${code}`);

            const emailEnabled = process.env.EMAIL_ENABLED === "true"; // 발송 여부 확인

            if (emailEnabled) {
                const sendEmail = async () => {
                    try {
                        await transporter.sendMail({
                            from: process.env.NAVER_EMAIL,
                            to: email,
                            subject: "이메일 인증 코드",
                            html: `
                                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                                    <h2 style="color: #4CAF50;">서비스 가입을 환영합니다!</h2>
                                    <p>아래의 6자리 코드를 입력하여 인증을 완료해주세요:</p>
                                    <h1 style="color: #333; letter-spacing: 5px;">${code}</h1>
                                    <p>이 요청을 본인이 하지 않았다면, 이 메일을 무시하세요.</p>
                                </div>
                            `
                        });
                        res.json({ success: true, message: "인증 코드가 이메일로 전송되었습니다" });
                    } catch (error) {
                        console.error(error);
                        res.status(500).json({ error: "이메일 전송 실패" });
                    }
                };
                sendEmail();
            } else {
                console.log("이메일 발송 비활성화: 코드가 전송되지 않았습니다.");
                res.json({ success: true, message: `이메일 발송이 비활성화 되었습니다. Code: ${code}` });
            }
        });
    });
});

router.post("/verify-code", (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: "이메일과 코드를 입력해주세요." });
    }

    const query = `
        SELECT code, timestamp, verified
        FROM EmailVerification
        WHERE email = ?
    `;
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to verify code" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "인증 코드가 존재하지 않습니다." });
        }

        const { code: savedCode, timestamp, verified } = results[0];
        if (verified) {
            return res.status(400).json({ error: "이미 인증된 이메일입니다." });
        }

        const currentTime = Date.now();
        const isExpired = currentTime - timestamp > 10 * 60 * 1000; // 10분 유효

        if (isExpired) {
            return res.status(400).json({ error: "인증 코드가 만료되었습니다." });
        }

        if (savedCode !== code) {
            return res.status(400).json({ error: "인증 코드가 일치하지 않습니다." });
        }

        // 인증 상태 업데이트
        const updateQuery = `
            UPDATE EmailVerification
            SET verified = 1
            WHERE email = ?
        `;
        db.query(updateQuery, [email], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to update verification status" });
            }

            res.json({ success: true, message: "인증되었습니다." });
        });
    });
});

// 회원가입 후 사용자 db에 저장
router.post("/users", (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: "이메일, 비밀번호, 이름을 입력해주세요." });
    }

    // 비밀번호 정책 검증
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
        return res.status(400).json({ error: "비밀번호는 최소 8자, 대문자, 숫자, 특수문자를 포함해야 합니다." });
    }

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: "Failed to connect to database" });

        connection.beginTransaction((err) => {
            if (err) return res.status(500).json({ error: "Failed to start transaction" });

            // 이메일 인증 확인
            const verifyQuery = `SELECT verified FROM EmailVerification WHERE email = ?`;
            connection.query(verifyQuery, [email], (err, results) => {
                if (err) return connection.rollback(() => res.status(500).json({ error: "Failed to verify email" }));

                if (results.length === 0 || !results[0].verified) {
                    return connection.rollback(() => res.status(400).json({ error: "이메일 인증을 완료해주세요." }));
                }

                // 중복 가입 확인
                const checkUserQuery = `SELECT email FROM User WHERE email = ?`;
                connection.query(checkUserQuery, [email], (err, userResults) => {
                    if (err) return connection.rollback(() => res.status(500).json({ error: "Failed to check existing users" }));

                    if (userResults.length > 0) {
                        return connection.rollback(() => res.status(400).json({ error: "이미 등록된 이메일 입니다." }));
                    }

                    // 사용자 정보 저장
                    const insertUserQuery = `INSERT INTO User (email, password, name) VALUES (?, ?, ?)`;
                    const hashedPassword = bcrypt.hashSync(password, 10);
                    connection.query(insertUserQuery, [email, hashedPassword, name], (err) => {
                        if (err) return connection.rollback(() => res.status(500).json({ error: "Failed to register user" }));

                        // 인증 데이터 삭제
                        const deleteCodeQuery = `DELETE FROM EmailVerification WHERE email = ?`;
                        connection.query(deleteCodeQuery, [email], (err) => {
                            if (err) return connection.rollback(() => res.status(500).json({ error: "Failed to delete verification data" }));

                            connection.commit((err) => {
                                if (err) return connection.rollback(() => res.status(500).json({ error: "Failed to commit transaction" }));

                                res.status(201).json({ message: "User registered successfully" });
                            });
                        });
                    });
                });
            });
        });
    });
})

module.exports = router;
