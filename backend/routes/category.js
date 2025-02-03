const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/:categoryName", async (req, res) => {
  const { categoryName } = req.params;

  try {
    // 기본 쿼리 작성
    let query = `
            SELECT 
                s.s_id AS StoreId,
                s.owner AS Owner,
                s.s_name AS StoreName,
                s.contact AS Contact,
                s.s_date AS StartDate,
                s.e_date AS EndDate,
                s.business_hours AS BusinessHours,
                s.location AS Location,
                c.name AS CategoryName,
                JSON_ARRAYAGG(si.image_url) AS Images
            FROM store s
            JOIN category c ON s.s_id = c.s_id
            LEFT JOIN store_image si ON s.s_id = si.s_id
        `;

    const params = [];

    // 모든 카테고리에 대해 날짜 조건 추가
    query += ` WHERE CURRENT_DATE() BETWEEN s.s_date AND s.e_date`;

    // categoryName이 "whole"이 아닐 경우
    if (categoryName.toLowerCase() !== "whole") {
      query += ` AND LOWER(c.name) = LOWER(?)`;
      params.push(categoryName);
    } else {
      query += ` AND LOWER(c.name) NOT IN ('popular', 'scheduled')`;
    }

    query += ` GROUP BY s.s_id, c.name;`;

    // 쿼리 실행
    const [rows] = await db.promise().query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: `No stores found for category "${categoryName}"` });
    }

    // 결과 매핑
    const categories = rows.map((row) => ({
      id: row.StoreId,
      owner: row.Owner,
      name: row.StoreName,
      contact: row.Contact,
      startDate: row.StartDate,
      endDate: row.EndDate,
      business_hours: row.BusinessHours,
      location: row.Location,
      type: row.CategoryName,
      images: row.Images || [],
    }));

    res.json({ categories });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
