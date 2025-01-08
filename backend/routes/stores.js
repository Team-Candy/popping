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
            JSON_ARRAYAGG(si.image_url) AS image_urls,
            c.name AS category
        FROM Store s
        LEFT JOIN Store_Image si ON s.s_id = si.s_id
        LEFT JOIN Category c ON s.s_id = c.s_id
        WHERE s.s_id = ?
        GROUP BY s.s_id
    `;

    db.query(query, [s_id], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Failed to retrieve store details" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Store not found" });
        }

        const store = results[0];
        // JSON_ARRAYAGG 결과는 이미 배열로 반환되므로 그대로 사용 가능
        const images = store.image_urls || [];

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
                description: store.description,
                category: store.category
            },
            images
        });
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