const express = require("express");
const axios = require("axios");

const router = express.Router();

// 네이버 API 인증 정보
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// 블로그 검색
router.get("/", async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    const url = `https://openapi.naver.com/v1/search/blog?query=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                "X-Naver-Client-Id": NAVER_CLIENT_ID,
                "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
            },
        });

        const blogs = response.data.items.map((item) => ({
            title: item.title.replace(/<[^>]*>/g, ""), // HTML 태그 제거
            link: item.link,
        }));

        res.json({ blogs });
    } catch (error) {
        console.error("Failed to fetch blog data:", error);
        res.status(500).json({ error: "Failed to fetch blog data" });
    }
});

module.exports = router;
