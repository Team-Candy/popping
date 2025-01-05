const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 검색 기능
router.get("/", (req, res) => {
    const { region, name, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(page));
    const currentLimit = Math.max(1, parseInt(limit));
    const offset = (currentPage - 1) * currentLimit;

    let query = `SELECT * FROM Store WHERE 1=1`;
    const queryParams = [];

    if (region) {
        query += ` AND location LIKE ?`;
        queryParams.push(`%${region}%`);
    }

    if (name) {
        query += ` AND s_name LIKE ?`;
        queryParams.push(`%${name}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(currentLimit, offset);

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        let countQuery = `SELECT COUNT(*) AS total FROM Store WHERE 1=1`;
        const countParams = [];

        if (region) {
            countQuery += ` AND location LIKE ?`;
            countParams.push(`%${region}%`);
        }

        if (name) {
            countQuery += ` AND s_name LIKE ?`;
            countParams.push(`%${name}%`);
        }

        db.query(countQuery, countParams, (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            const totalItems = countResults[0].total;
            const totalPages = Math.ceil(totalItems / currentLimit);

            res.json({
                results: results.map(row => ({
                    id: row.s_id,
                    owner: row.owner,
                    name: row.s_name,
                    contact: row.contact,
                    location: row.location,
                    businessHours: row.business_hours,
                    description: row.description,
                    startDate: new Date(row.s_date).toISOString(),
                    endDate: new Date(row.e_date).toISOString(),
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
