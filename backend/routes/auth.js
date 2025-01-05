const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// 로그인 기능
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
    }

    const query = `SELECT u_id, email, password, name FROM User WHERE email = ?`;
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "서버 오류" });

        if (results.length === 0) {
            return res.status(400).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: "서버 오류" });

            if (!isMatch) {
                return res.status(400).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
            }

            const token = jwt.sign(
                { u_id: user.u_id, email: user.email },
                JWT_SECRET_KEY,
                { expiresIn: "1h" }
            );

            res.json({
                message: "로그인 성공",
                token,
                user: { u_id: user.u_id, name: user.name, email: user.email },
            });
        });
    });
});

// 로그아웃 기능
router.post("/logout", (req, res) => {
    // 로그아웃 시 서버에서 할 작업은 사실 없음.
    // 클라이언트에서 JWT 토큰을 삭제하는 작업이 필요함.
    res.json({ message: "로그아웃 되었습니다." });
});

module.exports = router;