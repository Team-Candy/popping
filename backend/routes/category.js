const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 카테고리 저장 FE측에서 카테고리 정보를 받아와서 DB에 저장
router.post("/", (req, res) => {
    const { s_id, categories } = req.body;

    if (!s_id || !categories || !Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({ error: "s_id and a non-empty categories array are required" });
    }

    // 중복 카테고리 제거
    const uniqueCategories = [...new Set(categories)];

    // DB 연결 및 트랜잭션 실행
    db.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to connect to the database" });
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to start transaction" });
            }

            // 1. s_id 검증
            const checkStoreQuery = `SELECT s_id FROM Store WHERE s_id = ?`;
            connection.query(checkStoreQuery, [s_id], (err, results) => {
                if (err || results.length === 0) {
                    connection.rollback(() => {
                        console.error(err || "Invalid id");
                        return res.status(400).json({ error: "Invalid id" });
                    });
                } else {
                    // 2. 기존 카테고리 삭제
                    const deleteQuery = `DELETE FROM Category WHERE s_id = ?`;
                    connection.query(deleteQuery, [s_id], (err) => {
                        if (err) {
                            connection.rollback(() => {
                                console.error(err);
                                return res.status(500).json({ error: "Failed to delete existing categories" });
                            });
                        } else {
                            // 3. 새로운 카테고리 삽입
                            const insertQuery = `INSERT INTO Category (s_id, name) VALUES ?`;
                            const values = uniqueCategories.map(category => [s_id, category]);
                            connection.query(insertQuery, [values], (err) => {
                                if (err) {
                                    connection.rollback(() => {
                                        console.error(err);
                                        return res.status(500).json({ error: "Failed to insert categories" });
                                    });
                                } else {
                                    // 4. 트랜잭션 커밋
                                    connection.commit((err) => {
                                        if (err) {
                                            connection.rollback(() => {
                                                console.error(err);
                                                return res.status(500).json({ error: "Failed to commit transaction" });
                                            });
                                        } else {
                                            res.status(201).json({ message: "Categories saved successfully" });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });

        // DB 연결 해제
        connection.release();
    });
});

// 카테고리별 팝업스토어 정보 
router.get("/:categoryName", async (req, res) => {
    const { categoryName } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT s.s_id AS StoreId, s.owner AS Owner, s.s_name AS StoreName, 
                    s.contact AS Contact, s.s_date AS StartDate, s.e_date AS EndDate, 
                    s.business_hours AS BusinessHours, c.name AS CategoryName, 
                    GROUP_CONCAT(si.image_url) AS ImageUrls
             FROM Store s
             JOIN Category c ON s.s_id = c.s_id
             LEFT JOIN Store_Image si ON s.s_id = si.s_id
             WHERE LOWER(c.name) = LOWER(?)
             GROUP BY s.s_id`,
            [categoryName]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: `No stores found for category "${categoryName}"` });
        }

        const stores = rows.map(row => ({
            StoreId: row.StoreId,
            Owner: row.Owner,
            StoreName: row.StoreName,
            Contact: row.Contact,
            StartDate: row.StartDate,
            EndDate: row.EndDate,
            BusinessHours: row.BusinessHours,
            CategoryName: row.CategoryName,
            ImageUrls: row.ImageUrls ? row.ImageUrls.split(",") : [], // 이미지 URL이 여러 개일 경우 배열로 변환
        }));

        res.json({ stores });
    } catch (error) {
        console.error("Database query error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
