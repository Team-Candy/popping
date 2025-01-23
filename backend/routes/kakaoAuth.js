const express = require("express");
const router = express.Router();
const kakaoAuthController = require("../controllers/kakaoAuthController");

router.get("/kakao", kakaoAuthController.kakaoLogin);

router.get("/kakao/callback", kakaoAuthController.kakaoCallback);

module.exports = router; 