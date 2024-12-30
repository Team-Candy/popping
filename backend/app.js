require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const morgan = require("morgan");
// const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(morgan("dev"));
app.use(express.json());

// 사용자 이메일 인증 데이터를 저장할 임시 저장소
let userCodes = [];
// let registeredUsers = []; 

db.connect((err) => {
    if (err) {
        console.error("DB 연결 실패");
    } else {
        console.log("성공");
    }
});

app.get('/users', (req, res) => {
    const query = 'SELECT * FROM user';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error fetching user');
        return;
      }
      res.json(results);
      console.log(results);
  });
});

// 검색 기능
app.get("/api/search", (req, res) => {
    const { region, name, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

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
    queryParams.push(parseInt(limit), parseInt(offset));

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        db.query(`SELECT COUNT(*) AS total FROM Store WHERE 1=1`, queryParams.slice(0, -2), (err, countResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            const totalItems = countResults[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            res.json({
                results: results.map((row) => ({
                    id: row.s_id,
                    owner: row.owner,
                    name: row.s_name,
                    contact: row.contact,
                    location: row.location,
                    businessHours: row.business_hours,
                    description: row.description,
                    startDate: row.s_date,
                    endDate: row.e_date,
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems
                },
            })
        })
    });
});

// 메인 페이지 - 카테고리 별 팝업 스토어 정보 전달
app.get("/api/main/categories/:categoryName", async (req, res) => {
    const { categoryName } = req.params;

    try {
        const [ rows ] = await db.query(
            `SELECT s.s_id AS StoreId, s.owner AS Owner, s.s_name AS StoreName, s.contact AS Contact, s.s_date AS StartDate, s.e_date AS EndDate, s.business_hours AS BusinessHours, c.name AS CategoryName, si.image_url AS ImageUrl
             FROM Store s
             JOIN Category c ON s.s_id = c.s_id
             JOIN Store_Image si ON s.s_id = si.s_id
             WHERE c.name = ?
            `, [categoryName]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: `No stores found for category ${categoryName}` });
        }

        res.json({ stores: rows });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 팝업스토어 상세 정보
app.get("/api/stores/:s_id", (req, res) => {

});

// 팝업스토어 정보 수정
app.put("/api/stores/:s_id", (req, res) => {
    const { s_id } = req.params; // URL 경로에서 팝업스토어 ID 가져오기
    const { owner, s_name, contact, location, s_date, e_date, business_hours, desciption, imageUrl } = req.body;

    if (!s_name || !location || !s_date || !e_date) {
        return res.status(400).json({ error: "s_name, location, s_date, e_date are required" });
    }

    const query = `
        UPDATE Store
        SET 
            owner = ?,
            s_name = ?,
            contact = ?,
            location = ?,
            s_date = ?,
            e_date = ?,
            business_hours = ?,
            description = ?,
            imageUrl = ?
        JOIN Store_Image ON Store.s_id = Store_Image.s_id
        WHERE s_id = ?
    `;

    const values = [
        
    ]
});

// 팝업스토어 삭제 기능
app.delete("/api/stores/:s_id", (req, res) => {

});

app.listen(PORT, () => {
    console.log("Server is Running");
});