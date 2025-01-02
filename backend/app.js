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
                        await transport.sendMail({
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
app.post("/api/signup/users", (req, res) => {
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
            console.error("로그인 쿼리 에러:", err);
            return res.status(500).json({ error: "서버 내부 오류로 인해 로그인할 수 없습니다." });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("비밀번호 비교 중 에러 발생:", err);
                return res.status(500).json({ error: "서버 내부 오류로 인해 로그인할 수 없습니다." });
            }

            if (!isMatch) {
                setTimeout(() => {
                    return res.status(400).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
                }, 1000); // 지연 추가
            } else {
                const token = jwt.sign(
                    { u_id: user.u_id, email: user.email },
                    JWT_SECRET_KEY,
                    { expiresIn: "1h"}
                );

                res.json({
                    message: "로그인 성공",
                    token,
                    user: { u_id: user.u_id, name: user.name, email: user.email }
                });
            }
        });
    });
});


// 로그아웃 기능
app.post("/api/logout", (req, res) => {
    // 로그아웃 시 서버에서 할 작업은 사실 없음.
    // 클라이언트에서 JWT 토큰을 삭제하는 작업이 필요함.
    res.json({ message: "로그아웃 되었습니다." });
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
    const { u_id } = req.params;

    // 사용자 인증을 통과한 사용자의 u_id와 요청된 u_id가 일치하는지 확인
    if (u_id !== req.user.u_id) {
        return res.status(403).json({ error: "You are not authorized to access this user's data" });
    }

    // u_id가 숫자 형식인지 확인
    if (isNaN(u_id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    const query = `
        SELECT email, name, nickname, profileImage, introduction 
        FROM User 
        WHERE u_id = ?
    `;
    db.query(query, [u_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to retrieve user information" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            success: true,
            profile: results[0]
        });
    });
});

// 유저 프로필 정보 등록
app.post("/api/users", (req, res) => {
    const { email, name, nickname, profileImage, introduction } = req.body;

    // 필수 필드 검증
    if (!email || !name) {
        return res.status(400).json({ error: "email and name are required" });
    }

    // 이메일 형식 검증 (정규식 사용)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    // 이메일 중복 체크
    const checkEmailQuery = `SELECT COUNT(*) AS count FROM User WHERE email = ?`;
    db.query(checkEmailQuery, [email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to check email uniqueness" });
        }

        if (result[0].count > 0) {
            return res.status(400).json({ error: "Email is already in use" });
        }

        // 사용자 프로필 등록 쿼리
        const query = `
            INSERT INTO User (email, name, nickname, profileImage, introduction)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [email, name, nickname, profileImage, introduction || ''];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to register user profile" });
            }

            res.status(201).json({ message: "User profile registered successfully" });
        });
    });
});

// 유저 정보 수정
app.put("/api/users/:u_id/profile", (req, res) => {
    const { u_id } = req.params;
    const { email, name, nickname, profileImage, introduction } = req.body;
    
    // 필수 필드 검증
    if (!email || !name) {
        return res.status(400).json({ error: "email and name are required" });
    }

    // 이메일 형식 검증 (정규식 사용)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    // 이메일 중복 체크 (변경된 이메일에 대해서만 확인)
    const checkEmailQuery = `SELECT COUNT(*) AS count FROM User WHERE email = ? AND u_id != ?`;
    db.query(checkEmailQuery, [email, u_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to check email uniqueness" });
        }

        if (result[0].count > 0) {
            return res.status(400).json({ error: "Email is already in use" });
        }

        // 유저 정보 업데이트
        const query = `
            UPDATE User
            SET email = ?, name = ?, nickname = ?, profileImage = ?, introduction = ?
            WHERE u_id = ?
        `;
        const values = [email, name, nickname, profileImage, introduction, u_id];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to update user profile" });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json({ message: "User profile updated successfully" });
        });
    });
});

// 유저 정보 삭제
app.delete("/api/users/:u_id", (req, res) => {
    const { u_id } = req.params;

    // 트랜잭션 시작
    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        // 유저가 누른 좋아요 삭제
        const deleteLikesQuery = `DELETE FROM Likes WHERE u_id = ?`;
        db.query(deleteLikesQuery, [u_id], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    return res.status(500).json({ error: "Failed to delete user likes" });
                });
            }

            // 유저가 작성한 스토어 이미지 삭제
            const deleteStoreImagesQuery = `DELETE FROM Store_Image WHERE s_id IN (SELECT s_id FROM Store WHERE u_id = ?)`;
            db.query(deleteStoreImagesQuery, [u_id], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(err);
                        return res.status(500).json({ error: "Failed to delete store images" });
                    });
                }

                // 유저가 생성한 스토어 삭제
                const deleteStoresQuery = `DELETE FROM Store WHERE u_id = ?`;
                db.query(deleteStoresQuery, [u_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(err);
                            return res.status(500).json({ error: "Failed to delete stores" });
                        });
                    }

                    // 유저 삭제
                    const deleteUserQuery = `DELETE FROM User WHERE u_id = ?`;
                    db.query(deleteUserQuery, [u_id], (err, results) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                return res.status(500).json({ error: "Failed to delete user" });
                            });
                        }

                        if (results.affectedRows === 0) {
                            return db.rollback(() => {
                                return res.status(404).json({ error: "User not found" });
                            });
                        }

                        // 트랜잭션 커밋
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(err);
                                    return res.status(500).json({ error: "Failed to commit transaction" });
                                });
                            }

                            res.status(200).json({ message: `User with ID ${u_id} and related data deleted successfully` });
                        });
                    });
                });
            });
        });
    });
});

// 검색 기능
app.get("/api/search", (req, res) => {
    const { region, name, page = 1, limit = 10 } = req.query;

    // 페이지네이션의 유효성 검사
    const currentPage = Math.max(1, parseInt(page));  // 최소 페이지 1
    const currentLimit = Math.max(1, parseInt(limit)); // 최소 limit 1
    const offset = (currentPage - 1) * currentLimit;

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
    queryParams.push(currentLimit, offset);

    // 데이터 쿼리
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        // 카운트 쿼리
        let countQuery = `SELECT COUNT(*) AS total FROM Store WHERE 1=1`;
        const countParams = [];

        if (region) {
            countQuery += ` AND location LIKE ?`;
            countParams.push(`%${region}%`);
        }

        if (name) {
            countQuery += ` AND s_name LIKE ?`;
            countParams.push(`%${name}%`);
        }

        db.query(countQuery, countParams, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            const totalItems = countResults[0].total;
            const totalPages = Math.ceil(totalItems / currentLimit);

            res.json({
                results: results.map((row) => ({
                    id: row.s_id,
                    owner: row.owner,
                    name: row.s_name,
                    contact: row.contact,
                    location: row.location,
                    businessHours: row.business_hours,
                    description: row.description,
                    startDate: new Date(row.s_date).toISOString(),  // 날짜 형식 변경
                    endDate: new Date(row.e_date).toISOString(),    // 날짜 형식 변경
                })),
                pagination: {
                    currentPage: currentPage,
                    totalPages: totalPages,
                    totalItems: totalItems
                },
            });
        });
    });
});

// 메인 페이지 - 배너(Store_Image 테이블 안에 image_url & Store 테이블 모든든 정보 전달)
app.get("/api/main/banners", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT si.image_url AS ImageUrl, s.s_id AS StoreId, s.owner AS Owner, s.s_name AS StoreName, s.contact AS Contact, 
                    s.s_date AS StartDate, s.e_date AS EndDate, s.business_hours AS BusinessHours, s.location AS Location
             FROM Store_Image si
             JOIN Store s ON si.s_id = s.s_id`
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No banners found" });
        }

        // 반환할 데이터 가공
        const banners = rows.map(row => ({
            ImageUrl: row.ImageUrl,
            StoreId: row.StoreId,
            Owner: row.Owner,
            StoreName: row.StoreName,
            Contact: row.Contact,
            StartDate: row.StartDate,
            EndDate: row.EndDate,
            BusinessHours: row.BusinessHours,
            Location: row.Location
        }));

        res.json({
            success: true,
            banners
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error', 
            error: error.message,
            stack: error.stack // 에러 스택 트레이스 추가
        });
    }
});

// FE측에서 카테고리 정보를 받아와서 DB에 저장
app.post("/api/categories", (req, res) => {
    const { s_id, categories } = req.body;

    if (!s_id || !categories || !Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({ error: "s_id and a non-empty categories array are required" });
    }

    // 중복 카테고리 제거
    const uniqueCategories = [...new Set(categories)];

    // DB 연결 및 트랜잭션 실행
    db.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to connect to the database" });
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to start transaction" });
            }

            // 1. s_id 검증
            const checkStoreQuery = `SELECT s_id FROM Store WHERE s_id = ?`;
            connection.query(checkStoreQuery, [s_id], (err, results) => {
                if (err || results.length === 0) {
                    connection.rollback(() => {
                        console.error(err || "Invalid s_id");
                        return res.status(400).json({ error: "Invalid s_id" });
                    });
                } else {
                    // 2. 기존 카테고리 삭제
                    const deleteQuery = `DELETE FROM Category WHERE s_id = ?`;
                    connection.query(deleteQuery, [s_id], (err) => {
                        if (err) {
                            connection.rollback(() => {
                                console.error(err);
                                return res.status(500).json({ error: "Failed to delete existing categories" });
                            });
                        } else {
                            // 3. 새로운 카테고리 삽입
                            const insertQuery = `INSERT INTO Category (s_id, name) VALUES ?`;
                            const values = uniqueCategories.map(category => [s_id, category]);
                            connection.query(insertQuery, [values], (err) => {
                                if (err) {
                                    connection.rollback(() => {
                                        console.error(err);
                                        return res.status(500).json({ error: "Failed to insert categories" });
                                    });
                                } else {
                                    // 4. 트랜잭션 커밋
                                    connection.commit((err) => {
                                        if (err) {
                                            connection.rollback(() => {
                                                console.error(err);
                                                return res.status(500).json({ error: "Failed to commit transaction" });
                                            });
                                        } else {
                                            res.status(201).json({ message: "Categories saved successfully" });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });

        // DB 연결 해제
        connection.release();
    });
});

// 메인 페이지 - 카테고리 별 팝업 스토어 정보 전달
app.get("/api/main/categories/:categoryName", async (req, res) => {
    const { categoryName } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT s.s_id AS StoreId, s.owner AS Owner, s.s_name AS StoreName, s.contact AS Contact, 
                    s.s_date AS StartDate, s.e_date AS EndDate, s.business_hours AS BusinessHours, 
                    c.name AS CategoryName, GROUP_CONCAT(si.image_url) AS ImageUrls
             FROM Store s
             JOIN Category c ON s.s_id = c.s_id
             LEFT JOIN Store_Image si ON s.s_id = si.s_id
             WHERE LOWER(c.name) = LOWER(?)
             GROUP BY s.s_id`,
            [categoryName]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: `No stores found for category "${categoryName}"` });
        }

        // 반환할 데이터 가공
        const stores = rows.map(row => ({
            StoreId: row.StoreId,
            Owner: row.Owner,
            StoreName: row.StoreName,
            Contact: row.Contact,
            StartDate: row.StartDate,
            EndDate: row.EndDate,
            BusinessHours: row.BusinessHours,
            CategoryName: row.CategoryName,
            ImageUrls: row.ImageUrls ? row.ImageUrls.split(',') : []  // 이미지 URL이 여러 개일 경우 배열로 변환
        }));

        res.json({ stores });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// 메인 페이지 - 

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

// 달력 관련 api
// 달력에 표시할 팝업스토어 정보 가져오기


// 팝업스토어 상세 정보
app.get("/api/stores/:s_id", (req, res) => {
    const { s_id } = req.params;

    const query = `
        SELECT 
            s.s_id, s.owner, s.s_name, s.contact, s.location, 
            s.s_date, s.e_date, s.business_hours, s.description,
            si.image_url
        FROM Store s
        LEFT JOIN Store_Image si ON s.s_id = si.s_id
        WHERE s.s_id = ?
    `;

    db.query(query, [s_id], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Failed to retrieve store details" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Store not found" });
        }

        // 결과가 여러 개일 수 있기 때문에 첫 번째 결과를 가져오기 전에 이미지를 배열로 처리
        const store = results[0];
        const images = results.map(result => result.image_url).filter(image => image); // 이미지 URL만 배열로 만듦

        // 응답 구조 변경: store 정보와 images 배열을 분리
        res.status(200).json({
            store: {
                s_id: store.s_id,
                owner: store.owner,
                s_name: store.s_name,
                contact: store.contact,
                location: store.location,
                s_date: store.s_date,
                e_date: store.e_date,
                business_hours: store.business_hours,
                description: store.description
            },
            images
        });
    });
});


// 팝업스토어 정보 수정
app.put("/api/stores/:s_id", (req, res) => {
    const { s_id } = req.params; // URL 경로에서 s_id 가져오기
    const { owner, s_name, contact, location, s_date, e_date, business_hours, description, image_url } = req.body;

    // 필수 필드 검증
    if (!s_name || !location || !s_date || !e_date) {
        return res.status(400).json({ error: "s_name, location, s_date, and e_date are required" });
    }

    // 날짜 형식 검증
    if (!Date.parse(s_date) || !Date.parse(e_date)) {
        return res.status(400).json({ error: "Invalid date format" });
    }

    // 트랜잭션 시작
    db.beginTransaction(err => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        // Store 업데이트 쿼리
        const storeQuery = `
            UPDATE Store
            SET 
                owner = ?,
                s_name = ?,
                contact = ?,
                location = ?,
                s_date = ?,
                e_date = ?,
                business_hours = ?,
                description = ?
            WHERE s_id = ?;
        `;
        const storeValues = [owner, s_name, contact, location, s_date, e_date, business_hours, description, s_id];

        db.query(storeQuery, storeValues, (err, storeResults) => {
            if (err) {
                console.error("Store update error:", err);
                return db.rollback(() => res.status(500).json({ error: "Failed to update store" }));
            }

            if (storeResults.affectedRows === 0) {
                return db.rollback(() => res.status(404).json({ error: "Store not found" }));
            }

            // Store_Image 업데이트 쿼리
            const storeImageQuery = `
                UPDATE Store_Image
                SET image_url = ?
                WHERE s_id = ?;
            `;
            const storeImageValues = [image_url, s_id];

            db.query(storeImageQuery, storeImageValues, (err, imageResults) => {
                if (err) {
                    console.error("Store_Image update error:", err);
                    return db.rollback(() => res.status(500).json({ error: "Failed to update store image" }));
                }

                // 트랜잭션 커밋
                db.commit(err => {
                    if (err) {
                        console.error("Transaction commit error:", err);
                        return db.rollback(() => res.status(500).json({ error: "Failed to commit transaction" }));
                    }

                    res.status(200).json({ message: "Store and image updated successfully" });
                });
            });
        });
    });
});

// 팝업스토어 삭제 기능
app.delete("/api/stores/:s_id", (req, res) => {
    const { s_id } = req.params;

    // 트랜잭션 시작
    db.beginTransaction(err => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        // Store_Image 삭제 쿼리
        const deleteImagesQuery = `
            DELETE FROM Store_Image WHERE s_id = ?;
        `;
        db.query(deleteImagesQuery, [s_id], (err, imageResults) => {
            if (err) {
                console.error("Error deleting images:", err);
                return db.rollback(() => res.status(500).json({ error: "Failed to delete store images" }));
            }

            // Store 삭제 쿼리
            const deleteStoreQuery = `
                DELETE FROM Store WHERE s_id = ?;
            `;
            db.query(deleteStoreQuery, [s_id], (err, storeResults) => {
                if (err) {
                    console.error("Error deleting store:", err);
                    return db.rollback(() => res.status(500).json({ error: "Failed to delete store" }));
                }

                // 삭제된 행이 없는 경우
                if (storeResults.affectedRows === 0) {
                    return db.rollback(() => res.status(404).json({ error: "Store not found" }));
                }

                // 트랜잭션 커밋
                db.commit(err => {
                    if (err) {
                        console.error("Transaction commit error:", err);
                        return db.rollback(() => res.status(500).json({ error: "Failed to commit transaction" }));
                    }

                    // 성공적으로 삭제된 경우
                    res.status(200).json({ message: "Store and its images deleted successfully" });
                });
            });
        });
    });
});

// 팝업 스토어 좋아요 추가, 취소
app.post("/api/stores/:s_id/likes", (req, res) => {
    const { s_id } = req.params;
    const { u_id } = req.body;

    if (!u_id) {
        return res.status(400).json({ error: "User ID is required" });
    }

    // 좋아요 여부 확인
    const checkQuery = `
        SELECT * FROM Likes
        WHERE u_id = ? AND s_id = ?
    `;

    db.query(checkQuery, [u_id, s_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to check like status" });
        }

        if (results.length > 0) {
            // 좋아요 취소
            const deleteQuery = `
                DELETE FROM Likes
                WHERE u_id = ? AND s_id = ?
            `;
            db.query(deleteQuery, [u_id, s_id], (err) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to delete like" });
                }
                res.status(200).json({ message: "Like removed successfully" });
            });
        } else {
            // 좋아요 추가
            const insertQuery = `
                INSERT INTO Likes (u_id, s_id)
                VALUES (?, ?)
            `;
            db.query(insertQuery, [u_id, s_id], (err) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to add like" });
                }
                res.status(201).json({ message: "Like added successfully" });
            });
        }
    });
});

// 좋아요 총 수 조회
app.get("/api/stores/:s_id/likes/count", (req, res) => {
    const { s_id } = req.params;

    const countQuery = `
        SELECT COUNT(*) AS totalLikes
        FROM Likes
        WHERE s_id = ?
    `;

    db.query(countQuery, [s_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to retrieve like count" });
        }

        res.status(200).json({ totalLikes: results[0].totalLikes });
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

// 유저가 작성한 게시글 조회
app.get("/api/users/:u_id/stores", (req, res) => {
    const { u_id } = req.params;

    const query = `
        SELECT s_id, owner, s_name, contact, location, s_date, e_date, business_hours, description
        FROM Store
        JOIN User ON Store.u_id = User.u_id
        WHERE User.u_id = ?
    `;

    db.query(query, [u_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to retrieve user stores" });
        }

        // 결과가 없을 때
        if (results.length === 0) {
            return res.status(404).json({ error: "Stores not found" });
        }

        res.status(200).json(results);
    });
});

// 유저가 좋아요 누른 게시글 조회
app.get("/api/users/:u_id/likes", (req, res) => {
    const { u_id } = req.params;

    const query = `
        SELECT s_id, owner, s_name, contact, location, s_date, e_date, business_hours, description
        FROM Store
        JOIN Likes ON Store.s_id = Likes.s_id
        WHERE Likes.u_id = ?
    `;

    db.query(query, [u_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to retrieve user likes" });
        }

        // 결과가 없을 때
        if (results.length === 0) {
            return res.status(404).json({ error: "Likes not found" });
        }

        res.status(200).json(results);
    });
});

app.listen(PORT, () => {
    console.log("Server is Running");
});