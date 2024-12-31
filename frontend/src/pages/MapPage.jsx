import { useState, useEffect } from "react";
import Map from "../components/Map";

// 서버에서 지역별 팝업 위치 가져오기
async function fetchLocationData(region) {
  // 에러 처리
  const response = await fetch(`http://localhost:3000/api/getLocation/${region}`);
  const data = await response.json();
  // {"location": ["", "", "", ...]}
  return data.location;
}

const MapPage = () => {
  const [location, setLocation] = useState(null);
  setLocation(fetchLocationData());

  return (
    <div>
      <h1>맵 페이지</h1>
      <Map location={location}></Map>
    </div>
  );
};

export default MapPage;

// import { useEffect, useState } from "react";

// // 서버에서 위치 데이터 가져오기
// async function fetchLocationData() {
//   const response = await fetch("http://localhost:3000/api/getLocation");
//   const data = await response.json();
//   return data;
// }

// const Map = () => {
//   const [location, setLocation] = useState(null);

//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_KEY}&autoload=false`;
//     script.async = true;
//     script.onload = () => {
//       window.Kakao.init(process.env.REACT_APP_KAKAO_JS_KEY);
//     };
//     document.head.appendChild(script);

//     fetchLocationData().then((data) => {
//       setLocation(data);
//     });

//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   useEffect(() => {
//     if (location) {
//       const container = document.getElementById("kakao-map");
//       const options = {
//         center: new window.Kakao.LatLng(location.lat, location.lng),
//         level: 3,
//       };
//       const map = new window.Kakao.Map(container, options);
//       const marker = new window.Kakao.Marker({
//         position: new window.Kakao.LatLng(location.lat, location.lng),
//       });
//       marker.setMap(map);
//     }
//   }, [location]);

//   return <div id="kakao-map" style={{ width: "500px", height: "500px" }} />;
// };

// export default Map;
