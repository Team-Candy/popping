const express = require('express');
const fetch = require('node-fetch'); // fetch가 node 환경에서 사용될 수 있도록 node-fetch 모듈을 추가
const router = express.Router();

router.get('/getLatLng/:location', async (req, res) => {
    const query = req.params.location;
    console.log("query: ", query);
    const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
    const apiUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`;

    // 인증 오류 -> 허용 서버 IP 주소에 localhost를 넣음.
    // 카카오 API는 도메인 주소가 아닌 공인 IP 주소를 기준으로 인증
    // 핫스팟(curl -4 ifconfig.me) -> 핫스팟에서 제공되는 공인 IP는 특정 시간 동안 당신의 장치에 할당된 공용 IP
    //  이 IP 주소는 고정되지 않고 동적이기 때문에 시간이 지나면 변경될 수 있음.
    // 클라우드 서버의 공인 IP 주소 넣기.
    try {
        const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch Kakao Map data: ${response.statusText}`);
        }

        console.log("Kakao api response: ", response.status);
        const data = await response.json();
        console.log("Kakao api response data: ", data);

        if (data.documents.length === 0) {
            res.status(404).send("Location not found");
        }
        
        const coordinates = {
            x: data.documents[0].x,
            y: data.documents[0].y,
        };

        // console.log("data: ", data.documents);
        // console.log("coordinates: ", coordinates);

        if (data.documents.length === 0) {
            res.status(404).send("Location not found");
        } else {
            res.json(coordinates); // 필요한 데이터만 전달
        }

        // res.send(data);
    } catch (err) {
        console.error("데이터 로드 실패 : ", err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
