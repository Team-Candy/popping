const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 팝업스토어 상세 정보
router.get("/:s_id", (req, res) => {
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
        const images = results.map(result => result.image_url).filter(postimg => postimg); // 이미지 URL만 배열로 만듦

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
router.put("/:s_id", (req, res) => {
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

// 팝업스토어 삭제
router.delete("/:s_id", (req, res) => {
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
router.post("/:s_id/likes", (req, res) => {
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
router.get("/:s_id/likes/count", (req, res) => {
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
module.exports = router;