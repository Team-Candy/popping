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