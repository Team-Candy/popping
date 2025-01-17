const axios = require('axios');
// DB 불러오기
const db = require('../config/db');

// 카카오 로그인 요청 - /api/auth2/kakao/
exports.kakaoLogin = (req, res) => {
  try {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
    res.redirect(kakaoAuthUrl);
  } catch (error) {
    console.error('카카오 로그인 요청 에러:', error);
    res.status(500).send('카카오 로그인 요청 실패');
  }
};

// 카카오 로그인 콜백 처리 - /api/auth2/kakao/callback
exports.kakaoCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code가 없습니다.');
    }

    try {
        // 1. 토큰 요청
        const { data: tokenData } = await axios.post('https://kauth.kakao.com/oauth/token', null, {
        params: {
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_CLIENT_ID,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
            code,
        },
        });

        const accessToken = tokenData.access_token;

        // 2. 사용자 정보 요청
        const { data: kakaoUser } = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const email = kakaoUser.kakao_account?.email;
        const nickname = kakaoUser.kakao_account?.profile?.nickname || '닉네임 없음';

        if (!email) {
            return res.status(400).send('카카오 계정에 이메일 정보가 없습니다.');
        }

        // 3. DB 조회 및 처리
        const [rows] = await db.promise().query('SELECT * FROM user WHERE email = ?', [email]);

        if (rows.length === 0) {
            await db.promise().query('INSERT INTO user (email, name) VALUES (?, ?)', [email, nickname]);
        } else {
            return res.status(400).json({
                success: false,
                message: '이미 가입된 이메일입니다. 로그인해주세요.',
            });
        }

        // 4. JWT 토큰 발급
        const token = jwt.sign(
            { email, name: nickname },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        // 5. 응답
        res.json({
            success: true,
            message: '회원가입 및 로그인 성공',
            data: {
                user: { email, name: nickname },
                token,
            },
        });
    } catch (error) {
        console.error('카카오 로그인 콜백 에러:', error.message || error.response?.data || error);

        if (error.response && error.response.status === 401) {
            return res.status(401).json({
                success: false,
                message: '카카오 인증에 실패했습니다.',
            });
        }

        res.status(500).json({
            success: false,
            message: '서버 에러로 인해 카카오 로그인에 실패했습니다.',
        });
    }
};  