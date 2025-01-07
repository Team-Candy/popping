const express = require("express");
const authenticateJWT = require("../middleware/authenticateJWT");
const db = require("../config/db");

const router = express.Router();

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
router.get("/:u_id/profile", authenticateJWT, (req, res) => {
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

        const user = results[0];
        res.status(200).json({
            user: {
                u_id: user.u_id,
                email: user.email,
                name: user.name,
                nickname: user.nickname,
                profileImage: user.profileImage,
                introduction: user.introduction,
                created_at: user.created_at,
            }
        });
    });
});

// 유저가 게시글 등록하는 기능
router.post("/:u_id/stores", (req, res) => {
    const { u_id } = req.params;
    const { s_name, contact, location, s_date, e_date, business_hours, description, image_urls } = req.body;

    // 필수 필드 확인
    if (!s_name || !contact || !location || !s_date || !e_date || !business_hours || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // 시작 트랜잭션
    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Transaction initialization failed" });
        }

        const storeQuery = `
            INSERT INTO Store (u_id, s_name, contact, location, s_date, e_date, business_hours, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const storeValues = [u_id, s_name, contact, location, s_date, e_date, business_hours, description];

        // Store 테이블에 데이터 삽입
        db.query(storeQuery, storeValues, (err, results) => {
            if (err) {
                console.error(err);
                return db.rollback(() => {
                    res.status(500).json({ error: "Failed to register store" });
                });
            }

            const s_id = results.insertId; // 새로 삽입된 Store ID

            // image_urls 배열 확인 및 처리
            if (Array.isArray(image_urls) && image_urls.length > 0) {
                const imageQuery = `
                    INSERT INTO Store_Image (s_id, image_url) VALUES ?
                `;
                const imageValues = image_urls.map((url) => [s_id, url]); // 각 이미지 URL과 Store ID 매핑

                // Store_Image 테이블에 데이터 삽입
                db.query(imageQuery, [imageValues], (err) => {
                    if (err) {
                        console.error(err);
                        return db.rollback(() => {
                            res.status(500).json({ error: "Failed to register store images" });
                        });
                    }

                    // 트랜잭션 커밋
                    db.commit((err) => {
                        if (err) {
                            console.error(err);
                            return db.rollback(() => {
                                res.status(500).json({ error: "Transaction commit failed" });
                            });
                        }

                        res.status(201).json({
                            message: "Store and images registered successfully",
                            store: { s_id, s_name, contact, location },
                            images: image_urls,
                        });
                    });
                });
            } else {
                // 이미지가 없는 경우, 단순히 Store만 저장
                db.commit((err) => {
                    if (err) {
                        console.error(err);
                        return db.rollback(() => {
                            res.status(500).json({ error: "Transaction commit failed" });
                        });
                    }

                    res.status(201).json({
                        message: "Store registered successfully (no images provided)",
                        store: { s_id, s_name, contact, location },
                    });
                });
            }
        });
    });
});

// 유저가 작성한 게시글 조회
router.get("/:u_id/stores", (req, res) => {
    const { u_id } = req.params;

    const query = `
        SELECT 
            Store.s_id, 
            Store.owner, 
            Store.s_name, 
            Store.contact, 
            Store.location, 
            Store.s_date, 
            Store.e_date, 
            Store.business_hours, 
            Store.description,
            JSON_ARRAYAGG(Store_Image.image_url) AS images
        FROM Store
        LEFT JOIN Store_Image ON Store.s_id = Store_Image.s_id
        WHERE Store.u_id = ?
        GROUP BY Store.s_id
    `;

    db.query(query, [u_id], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Failed to retrieve user stores" });
        }

        // 결과가 없을 때
        if (results.length === 0) {
            return res.status(404).json({ error: "Stores not found" });
        }

        res.status(200).json({
            stores: results.map(store => ({
                s_id: store.s_id,
                owner: store.owner,
                s_name: store.s_name,
                contact: store.contact,
                location: store.location,
                s_date: store.s_date,
                e_date: store.e_date,
                business_hours: store.business_hours,
                description: store.description,
                images: JSON.parse(store.images) || [], // JSON 배열로 파싱
            }))
        });
    });
});

// 유저가 작성한 게시글 수정
router.put("/:u_id/stores/:s_id", (req, res) => {
    const { u_id, s_id } = req.params;
    const { s_name, contact, location, s_date, e_date, business_hours, description, image_urls } = req.body;

    // 필수 필드 확인
    if (!s_name || !contact || !location || !s_date || !e_date || !business_hours || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // 시작 트랜잭션
    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Transaction initialization failed" });
        }

        const storeQuery = `
            UPDATE Store
            SET s_name = ?, contact = ?, location = ?, s_date = ?, e_date = ?, business_hours = ?, description = ?
            WHERE s_id = ? AND u_id = ?
        `;
        const storeValues = [s_name, contact, location, s_date, e_date, business_hours, description, s_id, u_id];

        // Store 테이블에 데이터 업데이트
        db.query(storeQuery, storeValues, (err, results) => {
            if (err) {
                console.error(err);
                return db.rollback(() => {
                    res.status(500).json({ error: "Failed to update store" });
                });
            }

            if (results.affectedRows === 0) {
                return db.rollback(() => {
                    res.status(404).json({ error: "Store not found" });
                });
            }

            // image_urls 배열 확인 및 처리
            if (Array.isArray(image_urls) && image_urls.length > 0) {
                const deleteImagesQuery = `DELETE FROM Store_Image WHERE s_id = ?`;
                db.query(deleteImagesQuery, [s_id], (err) => {
                    if (err) {
                        console.error(err);
                        return db.rollback(() => {
                            res.status(500).json({ error: "Failed to delete store images" });
                        });
                    }

                    const imageQuery = `
                        INSERT INTO Store_Image (s_id, image_url) VALUES ?
                    `;
                    const imageValues = image_urls.map((url) => [s_id, url]); // 각 이미지 URL과 Store ID 매핑

                    // Store_Image 테이블에 데이터 삽입
                    db.query(imageQuery, [imageValues], (err) => {
                        if (err) {
                            console.error(err);
                            return db.rollback(() => {
                                res.status(500).json({ error: "Failed to register store images" });
                            });
                        }

                        // 트랜잭션 커밋
                        db.commit((err) => {
                            if (err) {
                                console.error(err);
                                return db.rollback(() => {
                                    res.status(500).json({ error: "Transaction commit failed" });
                                });
                            }

                            res.status(200).json({
                                message: "Store and images updated successfully",
                                store: { s_id, s_name, contact, location },
                                images: image_urls,
                            });
                        });
                    });
                });
            } else {
                // 이미지가 없는 경우, 단순히 Store만 저장
                db.commit((err) => {
                    if (err) {
                        console.error(err);
                        return db.rollback(() => {
                            res.status(500).json({ error: "Transaction commit failed" });
                        });
                    }

                    res.status(200).json({
                        message: "Store updated successfully (no images provided)",
                        store: { s_id, s_name, contact, location },
                    });
                });
            }
        });
    });
});

// 유저가 작성한 게시글 삭제
router.delete("/:u_id/stores/:s_id", (req, res) => {
    const { u_id, s_id } = req.params;

    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        const deleteImagesQuery = `DELETE FROM Store_Image WHERE s_id = ?`;
        db.query(deleteImagesQuery, [s_id], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete store images" }));

            const deleteStoreQuery = `DELETE FROM Store WHERE s_id = ? AND u_id = ?`;
            db.query(deleteStoreQuery, [s_id, u_id], (err, results) => {
                if (err) return db.rollback(() => res.status(500).json({ error: "Failed to delete store" }));

                if (results.affectedRows === 0) {
                    return db.rollback(() => res.status(404).json({ error: "Store not found" }));
                }

                db.commit((err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: "Failed to commit transaction" }));
                    res.status(200).json({ message: `Store with ID ${s_id} deleted successfully` });
                });
            });
        });
    });
});

// 사용자가 팝업 스토어에 좋아요 추가
router.post("/:u_id/stores/:s_id/likes", (req, res) => {
    const { u_id, s_id } = req.params;

    // 입력 검증
    if (!u_id || isNaN(u_id) || !s_id || isNaN(s_id)) {
        return res.status(400).json({ error: "Invalid user ID or store ID" });
    }

    // 좋아요 추가
    const insertQuery = `
        INSERT INTO Likes (u_id, s_id)
        VALUES (?, ?)
    `;

    db.query(insertQuery, [u_id, s_id], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: "Like already exists" });
            }
            console.error("Database error during like addition:", err.message);
            return res.status(500).json({ error: "Failed to add like" });
        }

        res.status(201).json({ message: "Like added successfully" });
    });
});

// 사용자가 팝업 스토어에 좋아요 취소
router.delete("/:u_id/stores/:s_id/likes", (req, res) => {
    const { u_id, s_id } = req.params;

    // 입력 검증
    if (!u_id || isNaN(u_id) || !s_id || isNaN(s_id)) {
        return res.status(400).json({ error: "Invalid user ID or store ID" });
    }

    // 좋아요 취소 쿼리
    const deleteQuery = `
        DELETE FROM Likes
        WHERE u_id = ? AND s_id = ?
    `;

    db.query(deleteQuery, [u_id, s_id], (err, results) => {
        if (err) {
            console.error("Database error during like removal:", err.message);
            return res.status(500).json({ error: "Failed to remove like" });
        }

        if (results.affectedRows > 0) {
            res.status(200).json({
                message: "Like removed successfully",
                liked: false,
            });
        } else {
            res.status(404).json({ error: "Like not found" });
        }
    });
});

// 사용자가 좋아요 누른 게시글 조회
router.get("/:u_id/likes", (req, res) => {
    const { u_id } = req.params;

    const query = `
        SELECT 
            Store.s_id, 
            Store.owner, 
            Store.s_name, 
            Store.contact, 
            Store.location, 
            Store.s_date, 
            Store.e_date, 
            Store.business_hours, 
            Store.description,
            JSON_ARRAYAGG(Store_Image.image_url) AS images
        FROM Store
        JOIN Likes ON Store.s_id = Likes.s_id
        LEFT JOIN Store_Image ON Store.s_id = Store_Image.s_id
        WHERE Likes.u_id = ?
        GROUP BY Store.s_id
    `;

    db.query(query, [u_id], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Failed to retrieve user likes" });
        }

        // 결과가 없을 때
        if (results.length === 0) {
            return res.status(404).json({ error: "Likes not found" });
        }

        res.status(200).json({
            likes: results.map(store => ({
                s_id: store.s_id,
                owner: store.owner,
                s_name: store.s_name,
                contact: store.contact,
                location: store.location,
                s_date: store.s_date,
                e_date: store.e_date,
                business_hours: store.business_hours,
                description: store.description,
                images: JSON.parse(store.images) || [], // JSON 배열로 파싱
            }))
        });
    });
});

module.exports = router;