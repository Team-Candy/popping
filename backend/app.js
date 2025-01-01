require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const morgan = require("morgan");
const axios = require("axios");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const path = require("path");

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

app.use(morgan("dev"));
app.use(express.json());

db.connect((err) => {
    if (err) {
        console.error("DB 연결 실패");
    } else {
        console.log("성공");
    }
});

// 사용자 조회 (test용)
app.get('/users', (req, res) => {
    const query = 'SELECT * FROM user';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error fetching user');
        return;
      }
      res.json(results);
      console.log(results);
  });
});

const transport = nodemailer.createTransport({
    host: "smtp.naver.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 회원가입 (이메일 인증코드 전송)
app.post("/api/signup/email-code", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "이메일을 입력해주세요." });
    }

    const code = generateCode();
    const timestamp = Date.now();

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
            transport.sendMail({
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
            })
            .then(() => res.json({ success: true, message: "인증 코드가 이메일로 전송되었습니다" }))
            .catch((error) => {
                console.error(error);
                res.status(500).json({ error: "이메일 전송 실패" });
            });
        } else {
            console.log("이메일 발송 비활성화: 코드가 전송되지 않았습니다.");
            res.json({ success: true, message: `이메일 발송이 비활성화 되었습니다. Code: ${code}` });
        }
    });
});

// 회원가입 (이메일 인증코드 확인)
app.post("/api/signup/verify-code", (req, res) => {
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

        const isExpired = Date.now() - timestamp > 10 * 60 * 1000; // 10분 유효
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
app.post("/api/signup/users", (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: "이메일, 비밀번호, 이름을 입력해주세요." });
    }

    // 이메일 인증 확인
    const verifyQuery = `
        SELECT verified
        FROM EmailVerification
        WHERE email = ?
    `;
    db.query(verifyQuery, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to verify email" });
        }

        if (results.length === 0 || !results[0].verified) {
            return res.status(400).json({ error: "이메일 인증을 완료해주세요." });
        }

        // 중복 가입 확인
        const checkUserQuery = `
            SELECT email
            FROM User
            WHERE email = ?
        `;
        db.query(checkUserQuery, [email], (err, userResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to check existing users" });
            }

            if (userResults.length > 0) {
                return res.status(400).json({ error: "이미 등록된 이메일 입니다." });
            }

            // 사용자 정보 저장
            const insertUserQuery = `
                INSERT INTO User (email, password, name)
                VALUES (?, ?, ?)
            `;
            const hashedPassword = bcrypt.hashSync(password, 10); // 비밀번호 암호화
            db.query(insertUserQuery, [email, hashedPassword, name], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Failed to register user" });
                }

                // 인증 데이터 삭제
                const deleteCodeQuery = `
                    DELETE FROM EmailVerification
                    WHERE email = ?
                `;
                db.query(deleteCodeQuery, [email], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: "Failed to delete verification data" });
                    }

                    res.status(201).json({ message: "User registered successfully" });
                });
            });
        });
    });
});

// 로그인
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
    }

    const query = `
        SELECT u_id, email, password, name
        FROM User
        WHERE email = ?
    `;
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to login" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "등록되지 않은 이메일입니다." });
        }

        const user = results[0];

        // 비밀번호 확인
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "비밀번호 확인 오류" });
            }

            if (!isMatch) {
                return res.status(400).json({ error: "비밀번호가 일치하지 않습니다." });
            }

            // JWT 토큰 발급
            const token = jwt.sign({ u_id: user.u_id, email: user.email }, JWT_SECRET_KEY, { expiresIn: "1h" });

            // JWT를 클라이언트에 전달
            res.json({ message: "로그인 성공", token });
        });
    });
});

// JWT 검증 미들웨어
function authenticateJWT(req, res, next) {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "토큰이 필요합니다." });
    }

    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "토큰이 만료되었습니다." });
        }

        req.user = user;
        next();
    });
}

// 사용자 정보 조회
app.get("/api/users/:u_id", authenticateJWT, (req, res) => {
    const { u_id } = req.user;

    const query = `
        SELECT email, name, nickname, profileImage, introduction 
        FROM User 
        WHERE u_id = ?
    `;
    db.query(query, [u_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to retrieve user information" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ profile: results[0] });
    });
});

// 검색 기능
app.get("/api/search", (req, res) => {
    const { region, name, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    let query = `SELECT * FROM Store WHERE 1=1`;
    const queryParams = [];

    if (region) {
        query += ` AND location LIKE ?`;
        queryParams.push(`%${region}%`);
    }

    if (name) {
        query += ` AND s_name LIKE ?`;
        queryParams.push(`%${name}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        db.query(`SELECT COUNT(*) AS total FROM Store WHERE 1=1`, queryParams.slice(0, -2), (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            const totalItems = countResults[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            res.json({
                results: results.map((row) => ({
                    id: row.s_id,
                    owner: row.owner,
                    name: row.s_name,
                    contact: row.contact,
                    location: row.location,
                    businessHours: row.business_hours,
                    description: row.description,
                    startDate: row.s_date,
                    endDate: row.e_date,
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems
                },
            })
        })
    });
});

// 메인 페이지 - 카테고리 별 팝업 스토어 정보 전달
app.get("/api/main/categories/:categoryName", async (req, res) => {
    const { categoryName } = req.params;

    try {
        const [ rows ] = await db.query(
            `SELECT s.s_id AS StoreId, s.owner AS Owner, s.s_name AS StoreName, s.contact AS Contact, s.s_date AS StartDate, s.e_date AS EndDate, s.business_hours AS BusinessHours, c.name AS CategoryName, si.image_url AS ImageUrl
             FROM Store s
             JOIN Category c ON s.s_id = c.s_id
             JOIN Store_Image si ON s.s_id = si.s_id
             WHERE c.name = ?
            `, [categoryName]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: `No stores found for category ${categoryName}` });
        }

        res.json({ stores: rows });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 네이버 블로그 검색 API를 사용하여 글 가져오기
app.get("/api/blogs", async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "query is required" });
    }

    const url = `https://openapi.naver.com/v1/search/blog?query=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                "X-Naver-Client-Id": NAVER_CLIENT_ID,
                "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
            }
        });

        // 필요한 데이터만 추출출
        const blogs = response.data.items.map((item) => ({
            title: item.title.replace(/<[^>]*>/g, ""), // HTML 태그 제거
            link: item.link,
        }));

        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch blog data" });
    }
});

// 팝업스토어 상세 정보
app.get("/api/stores/:s_id", (req, res) => {
    const { s_id } = req.params;

    const query = `
        SELECT 
            s.s_id, s.owner, s.s_name, s.contact, s.location, 
            s.s_date, s.e_date, s.business_hours, s.description,
            si.imageUrl
        FROM Store s
        LEFT JOIN Store_Image si ON s.s_id = si.s_id
        WHERE s.s_id = ?
    `;

    db.query(query, [s_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to retrieve store details" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Store not found" });
        }
        res.status(200).json(results[0]);
    });
});

// 팝업스토어 정보 수정
app.put("/api/stores/:s_id", (req, res) => {
    const { s_id } = req.params; // URL 경로에서 팝업스토어 ID 가져오기
    const { owner, s_name, contact, location, s_date, e_date, business_hours, description, imageUrl } = req.body;

    if (!s_name || !location || !s_date || !e_date) {
        return res.status(400).json({ error: "s_name, location, s_date, e_date are required" });
    }

    const query = `
        UPDATE Store
        SET 
            owner = ?,
            s_name = ?,
            contact = ?,
            location = ?,
            s_date = ?,
            e_date = ?,
            business_hours = ?,
            description = ?,
            imageUrl = ?
        JOIN Store_Image ON Store.s_id = Store_Image.s_id
        WHERE s_id = ?
    `;

    const values = [
        owner, s_name, contact, location, s_date, e_date, business_hours, description, imageUrl, s_id
    ];

    db.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to update store information" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Store not found" });
        }
        res.status(200).json({ message: "Store updated successfully" });
    });
});

// 팝업스토어 삭제 기능
app.delete("/api/stores/:s_id", (req, res) => {
    const { s_id } = req.params;

    const query = `
        DELETE s, si
        FROM Store s
        LEFT JOIN Store_Image si ON s.s_id = si.s_id
        WHERE s.s_id = ?
    `;

    db.query(query, [s_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to delete store" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Store not found" });
        }
        res.status(200).json({ message: "Store deleted successfully" });
    });
});

// 유저 프로필 정보 조회
app.get("/api/users/:u_id/profile", (req, res) => {
    const { u_id } = req.params;

    const query = `
        SELECT u_id, email, name, nickname, profileImage, introduction, created_at
        FROM User
        WHERE u_id = ?
    `;

    db.query(query, [u_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to retrieve user profile" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(results[0]);
    });
});

// 유저 프로필 정보 등록
app.post("/api/users/:u_id", (req, res) => {
    const { u_id } = req.params;
    const { email, name, nickname, profileImage, introduction } = req.body;

    if (!email || !name) {
        return res.status(400).json({ error: "email, name are required" });
    }

    const query = `
        INSERT INTO User (u_id, email, name, nickname, profileImage, introduction)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [u_id, email, name, nickname, profileImage, introduction];

    db.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to register user profile" });
        }
        res.status(201).json({ message: "User profile registered successfully" });
    });
});

// 유저 정보 수정
app.put("/api/users/:u_id/profile", (req, res) => {
    const { u_id } = req.params;
    const { email, name, nickname, profileImage, introduction } = req.body;
    
    if (!email || !name) {
        return res.status(400).json({ error: "email, name are required" });
    }

    const query = `
        UPDATE User
        SET email = ?, name = ?, nickname = ?, profileImage = ?, introduction = ?
        WHERE u_id = ?
    `;

    const values = [email, name, nickname, profileImage, introduction, u_id];

    db.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to update user profile" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User profile updated successfully" });
    });
});

// 유저 정보 삭제
app.delete("/api/users/:u_id", (req, res) => {
    const { u_id } = req.params;

    const query = `
        DELETE FROM User
        WHERE u_id = ?
    `;

    db.query(query, [u_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to delete user" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    });
});

app.listen(PORT, () => {
    console.log("Server is Running");
});