const express = require('express');
const router = express.Router();
const { kakaoLogin, kakaoCallback } = require('../controllers/kakaoAuthController');

// 카카오 로그인 URL로 리다이렉트
router.get('/kakao', kakaoLogin);

// 카카오에서 인증 후 콜백
router.get('/kakao/callback', kakaoCallback);

module.exports = router;