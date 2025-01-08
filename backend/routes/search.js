const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 검색 기능
router.get("/", (req, res) => {
    const { region, name, page = 1, limit = 10 } = req.query;

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
        FROM Store s
        LEFT JOIN Store_Image si ON s.s_id = si.s_id
        LEFT JOIN Category c ON s.s_id = c.s_id
        WHERE 1=1
    `;
    const queryParams = [];

    // 지역(region) 검색 조건
    if (region) {
        query += ` AND s.location LIKE ?`;
        queryParams.push(`%${region}%`);
    }

    // 이름(name) 검색 조건
    if (name) {
        query += ` AND s.s_name LIKE ?`;
        queryParams.push(`%${name}%`);
    }

    query += ` GROUP BY s.s_id LIMIT ? OFFSET ?`;
    queryParams.push(currentLimit, offset);

    // 메인 쿼리 실행
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        // 총 개수 조회 쿼리
        let countQuery = `SELECT COUNT(DISTINCT s.s_id) AS total FROM Store s WHERE 1=1`;
        const countParams = [];

        if (region) {
            countQuery += ` AND s.location LIKE ?`;
            countParams.push(`%${region}%`);
        }

        if (name) {
            countQuery += ` AND s.s_name LIKE ?`;
            countParams.push(`%${name}%`);
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
                results: results.map(row => ({
                    id: row.id,
                    owner: row.owner,
                    name: row.name,
                    contact: row.contact,
                    location: row.location,
                    businessHours: row.businessHours,
                    description: row.description,
                    startDate: new Date(row.startDate).toISOString(),
                    endDate: new Date(row.endDate).toISOString(),
                    images: JSON.parse(row.images) || [], // 이미지 배열 파싱
                    category: row.category,
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


module.exports = router;
