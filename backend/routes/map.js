const express = require("express");
const fetch = require("node-fetch"); // fetch가 node 환경에서 사용될 수 있도록 node-fetch 모듈을 추가
const router = express.Router();

router.get("/getLatLng/:location", async (req, res) => {
  const query = req.params.location.trim();

  // 입력값 검증
  if (!query) {
    return res.status(400).json({ error: "Location query is required" });
  }

  const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
  if (!KAKAO_REST_API_KEY) {
    return res.status(500).json({ error: "API key is missing" });
  }

  const apiUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    });

    // 응답이 실패한 경우에 대한 처리를 추가
    if (!response.ok) {
      const errorMessage = `Failed to fetch Kakao Map data: ${response.statusText}`;
      console.error(errorMessage);
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();

    // API 응답에서 데이터가 존재하는지 확인
    if (data.documents.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    const coordinates = {
      x: data.documents[0].x,
      y: data.documents[0].y,
    };

    // 정상적으로 좌표를 반환
    return res.json(coordinates);
  } catch (err) {
    console.error("데이터 로드 실패: ", err.message);
    return res.status(500).json({ error: "Server Error: " + err.message });
  }
});

module.exports = router;
