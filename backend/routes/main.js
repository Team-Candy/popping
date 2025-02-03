const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 메인 페이지 배너(Store_Image 테이블 안에 image_url & Store 테이블 모든든 정보 전달)
router.get("/banners", async (req, res) => {
    try {
        const query = `
                SELECT 
                    s.s_id AS StoreId, 
                    s.owner AS Owner, 
                    s.s_name AS StoreName, 
                    s.contact AS Contact, 
                    s.s_date AS StartDate, 
                    s.e_date AS EndDate, 
                    s.business_hours AS BusinessHours, 
                    s.location AS Location, 
                    JSON_ARRAYAGG(si.image_url) AS Images,
                    c.name AS Category
                FROM store s
                LEFT JOIN store_image si ON si.s_id = s.s_id
                LEFT JOIN category c ON c.s_id = s.s_id
                GROUP BY s.s_id, c.name
            `;

        const [rows] = await db.promise().query(query);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No banners found" });
        }

        const banners = rows.map((row) => ({
            StoreId: row.StoreId,
            Owner: row.Owner,
            StoreName: row.StoreName,
            Contact: row.Contact,
            StartDate: row.StartDate,
            EndDate: row.EndDate,
            BusinessHours: row.BusinessHours,
            Location: row.Location,
            Category: row.Category,
            Images: row.Images || [], 
        }));

        res.json({ success: true, banners });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
