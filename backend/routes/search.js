const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 검색 기능
router.get("/", (req, res) => {
    const { value, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(page));
    const currentLimit = Math.max(1, parseInt(limit));
    const offset = (currentPage - 1) * currentLimit;

    // 기본 검색 쿼리
    let query = `
          SELECT 
              s.s_id AS id, 
              s.owner AS owner, 
              s.s_name AS name, 
              s.contact AS contact, 
              s.location AS location, 
              s.business_hours AS businessHours, 
              s.description AS description, 
              s.s_date AS startDate, 
              s.e_date AS endDate, 
              JSON_ARRAYAGG(si.image_url) AS images,
              c.name AS category
          FROM store s
          LEFT JOIN store_image si ON s.s_id = si.s_id
          LEFT JOIN category c ON s.s_id = c.s_id
          WHERE 1=1
      `;
    const queryParams = [];

    // value 검색 조건 추가
    if (value) {
        query += ` AND (s.s_name LIKE ? OR s.location LIKE ?)`;
        queryParams.push(`%${value}%`, `%${value}%`);
    }

    query += `AND LOWER(c.name) NOT IN ('popular', 'scheduled') GROUP BY s.s_id, c.name LIMIT ? OFFSET ?`;
    queryParams.push(currentLimit, offset);

    // 메인 쿼리 실행
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        // 총 개수 조회 쿼리
        let countQuery = `SELECT COUNT(DISTINCT s.s_id) AS total FROM store s WHERE 1=1`;
        const countParams = [];

        if (value) {
            countQuery += ` AND (s.s_name LIKE ? OR s.location LIKE ?)`;
            countParams.push(`%${value}%`, `%${value}%`);
        }

        db.query(countQuery, countParams, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            const totalItems = countResults[0].total;
            const totalPages = Math.ceil(totalItems / currentLimit);

            // 응답 데이터 구성
            res.json({
                results: results.map((row) => ({
                    id: row.id,
                    owner: row.owner,
                    name: row.name,
                    contact: row.contact,
                    location: row.location,
                    businessHours: row.businessHours,
                    description: row.description,
                    startDate: new Date(row.startDate).toISOString(),
                    endDate: new Date(row.endDate).toISOString(),
                    images: row.images || [], // 이미지 배열 파싱
                    category: row.category,
                })),
                pagination: {
                    currentPage: currentPage,
                    totalPages: totalPages,
                    totalItems: totalItems,
                },
            });
        });
    });
});
module.exports = router;
