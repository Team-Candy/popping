const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 팝업스토어 상세 정보
router.get("/:s_id", async (req, res) => {
  const { s_id } = req.params;

  const query = `
        SELECT 
            s.s_id, s.owner, s.s_name, s.contact, s.location, 
            s.s_date, s.e_date, s.business_hours, s.description,
            JSON_ARRAYAGG(si.image_url) AS image_urls,
            c.name AS category
        FROM store s
        LEFT JOIN store_image si ON s.s_id = si.s_id
        LEFT JOIN category c ON s.s_id = c.s_id
        WHERE s.s_id = ?
        GROUP BY s.s_id, c.name;
    `;

  try {
    const [results] = await db.promise().query(query, [s_id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    const store = results[0];
    const images = store.image_urls ? store.image_urls : [];

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
        category: store.category,
        images,
      },
    });
  } catch (err) {
    console.error("Database query error:", err);
    return res.status(500).json({ error: "Failed to retrieve store details" });
  }
});

// 좋아요 총 수 조회
router.get("/:s_id/likes/count", async (req, res) => {
  const { s_id } = req.params;

  const countQuery = `
        SELECT COUNT(*) AS totalLikes
        FROM likes
        WHERE s_id = ?
    `;

  try {
    const [results] = await db.promise().query(countQuery, [s_id]);

    res.status(200).json({ totalLikes: results[0].totalLikes });
  } catch (err) {
    console.error("Database query error:", err);
    return res.status(500).json({ error: "Failed to retrieve like count" });
  }
});

module.exports = router;
