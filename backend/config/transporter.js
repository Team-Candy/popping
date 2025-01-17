const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.naver.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

transporter.verify((error) => {
    if (error) {
        console.error("이메일 서버 설정 실패:", error.message);
    } else {
        console.log("이메일 서버 준비 완료");
    }
});

module.exports = transporter;