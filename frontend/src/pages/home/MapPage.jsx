import { useState, useEffect } from "react";
import Map from "../../components/SearchMap";
import Region from "../../components/Region";

const MapPage = () => {
  const [selectedRegion, setSelectedRegion] = useState("total"); // Default region
  const [location, setLocation] = useState([]);

  useEffect(() => {
    // 현재 활성화된 전체 팝업 정보 요청
    const fetchLocationData = async () => {
      try {
        // const response = await fetch(`http://localhost:3000/api/activePopups`);
        // if (!response.ok) {
        //   throw new Error("");
        // }
        // const data = await response.json();
        // 팝업고유 id, 팝업 이름, 주소, startDate, endDate, 이미지 url

        // 임시 데이터
        const data = {
          list: [
            {
              id: 100,
              name: "오징어게임2 팝업스토어 in 강남",
              location: "서울 서초구 신반포로 176 신세계백화점 강남점 1층 오픈스테이지",
              startDate: "2024.12.20",
              endDate: "2025.01.12",
              image: "https://i.ibb.co/tPJYqCB/detail2-1.jpg",
            },
            {
              id: 200,
              name: "바나나맛우유 50주년 팝업스토어",
              location: "서울 종로구 삼일대로28길 28 누디트 익선 B동",
              startDate: "2024.12.21",
              endDate: "2024.12.28",
              image: "https://i.ibb.co/2df8xYG/detail1.jpg",
            },
          ],
        };

        setLocation(data.list);
      } catch (err) {
        console.error("Error fetching location data: ", err);
      }
    };

    fetchLocationData();
  }, []);

  return (
    <div>
      <h2 style={{ color: "red" }}>지도</h2>
      <Region onSelectRegion={setSelectedRegion}></Region>
      {/* 지역 선택 버튼에서 선택된 값을 setSelectedRegion으로 업데이트 */}
      <Map region={selectedRegion} location={location}></Map>
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
