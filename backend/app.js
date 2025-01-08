import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import fetch from "node-fetch"; // ESM 형식으로 작성

dotenv.config();

// require("dotenv").config();

// const express = require("express");
// const morgan = require("morgan");
// const cors = require("cors");
// const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // React 앱의 주소
  })
); // CORS를 설정하여 특정 도메인만 요청을 받아들일 수 있도록

app.use((req, res, next) => {
  console.log("Request Origin: ", req.get("Origin"));
  next();
}); // Origin 헤더를 확인해서 요청이 어디서 왔는지 알 수 있음.

app.get("/api/map/getLatLng/:location", async (req, res) => {
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

    const data = await response.json();
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

// app.get("/api/getKakaoMapData", async (req, res) => {
//   try {
//     // 외부 API 호출 (여기선 예시로 다른 API를 호출)
//     const response = await fetch("https://dapi.kakao.com/v2/maps/sdk.js", {
//       method: "GET",
//       headers: {
//         Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`, // 카카오 REST API 키
//       },
//     });

//     // 외부 API에서 받은 데이터를 JSON으로 파싱
//     const data = await response.json();

//     console.log("data: ", data);

//     // 클라이언트로 데이터 전달
//     res.json(data);
//   } catch (err) {
//     console.error("Error fetching data:", err);
//     res.status(500).send("Error fetching data from Kakao API");
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// MapPage.jsx
// 예시: 위치 데이터 제공 API
// app.get("/api/getLocation", (req, res) => {
//   const locationData = {
//     lat: 37.5665,   // 예시 위도
//     lng: 126.9780,  // 예시 경도
//   };
//   res.json(locationData);
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
