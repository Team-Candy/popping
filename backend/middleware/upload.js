const multer = require("multer");
const path = require("path");

// 파일 저장 경로 및 이름 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // 업로드 폴더
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // 고유 파일명 생성
    },
});

// 파일 필터 (이미지만 허용)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("이미지 파일만 업로드 가능합니다."), false);
    }
};

// multer 설정
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

module.exports = upload;
