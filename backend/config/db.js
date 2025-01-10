const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// DB 연결 테스트
db.connect((err) => {
    if (err) {
        console.error("DB connection failed: ", err);
    } else {
        console.log("DB connection successful");
    }
});

module.exports = db;