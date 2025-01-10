const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 달력 데이터 가져오기
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT s_id AS id, s_name AS title, s_date AS startDate, e_date AS endDate 
             FROM Store
            `
        );

        // 결과 데이터를 가공
        const results = rows.map(row => ({
            id: row.id.toString(),
            title: row.title,
            start: row.startDate.toISOString().split("T")[0],
            end: row.endDate.toISOString().split("T")[0],
        }));

        console.log(results);

        res.json({ results });
    } catch (error) {
        console.error("Database query failed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;