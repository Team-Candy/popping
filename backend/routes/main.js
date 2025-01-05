const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 메인 페이지 배너(Store_Image 테이블 안에 image_url & Store 테이블 모든든 정보 전달)
router.get("/banners", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT si.image_url AS ImageUrl, s.s_id AS StoreId, s.owner AS Owner, s.s_name AS StoreName, 
                   s.contact AS Contact, s.s_date AS StartDate, s.e_date AS EndDate, 
                   s.business_hours AS BusinessHours, s.location AS Location
            FROM Store_Image si
            JOIN Store s ON si.s_id = s.s_id
        `);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No banners found" });
        }

        const banners = rows.map(row => ({
            ImageUrl: row.ImageUrl,
            StoreId: row.StoreId,
            Owner: row.Owner,
            StoreName: row.StoreName,
            Contact: row.Contact,
            StartDate: row.StartDate,
            EndDate: row.EndDate,
            BusinessHours: row.BusinessHours,
            Location: row.Location,
        }));

        res.json({ success: true, banners });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
