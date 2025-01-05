const express = require("express");
const authenticateJWT = require("../middleware/authenticateJWT");
const db = require("../config/db");

const router = express.Router();

// 사용자 정보 조회
router.get("/:u_id", authenticateJWT, (req, res) => {
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

        res.json({ success: true, profile: results[0] });
    });
});

// 유저 프로필 정보 등록
router.post("/", (req, res) => {
    const { email, name, nickname, profileImage, introduction } = req.body;

    if (!email || !name) return res.status(400).json({ error: "email and name are required" });

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Invalid email format" });

    const checkEmailQuery = `SELECT COUNT(*) AS count FROM User WHERE email = ?`;
    db.query(checkEmailQuery, [email], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to check email uniqueness" });
        if (result[0].count > 0) return res.status(400).json({ error: "Email is already in use" });

        const query = `INSERT INTO User (email, name, nickname, profileImage, introduction) VALUES (?, ?, ?, ?, ?)`;
        const values = [email, name, nickname, profileImage, introduction || ''];

        db.query(query, values, (err, results) => {
            if (err) return res.status(500).json({ error: "Failed to register user profile" });
            res.status(201).json({ message: "User profile registered successfully" });
        });
    });
});

// 유저 정보 수정
router.put("/:u_id/profile", authenticateJWT, (req, res) => {
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
router.delete("/:u_id", authenticateJWT, (req, res) => {
    const { u_id } = req.params;

    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        const deleteLikesQuery = `DELETE FROM Likes WHERE u_id = ?`;
        db.query(deleteLikesQuery, [u_id], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete user likes" }));

            const deleteStoreImagesQuery = `DELETE FROM Store_Image WHERE s_id IN (SELECT s_id FROM Store WHERE u_id = ?)`;
            db.query(deleteStoreImagesQuery, [u_id], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete store images" }));

                const deleteStoresQuery = `DELETE FROM Store WHERE u_id = ?`;
                db.query(deleteStoresQuery, [u_id], (err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete stores" }));

                    const deleteUserQuery = `DELETE FROM User WHERE u_id = ?`;
                    db.query(deleteUserQuery, [u_id], (err, results) => {
                        if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete user" }));
                        if (results.affectedRows === 0) return db.rollback(() => res.status(404).json({ error: "User not found" }));

                        db.commit((err) => {
                            if (err) return db.rollback(() => res.status(500).json({ error: "Failed to commit transaction" }));
                            res.status(200).json({ message: `User with ID ${u_id} and related data deleted successfully` });
                        });
                    });
                });
            });
        });
    });
});

// 사용자 디테일 프로필 정보 조회
router.get("/:u_id/profile", (req, res) => {
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
router.get("/:u_id/stores", (req, res) => {
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

// 사용자가 좋아요 누른 게시글 조회
router.get("/:u_id/likes", (req, res) => {
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

module.exports = router;