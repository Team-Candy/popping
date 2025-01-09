import PropTypes from "prop-types";
import { useEffect } from "react";

async function fetchLatLng(location) {
  try {
    const response = await fetch(`http://localhost:3000/api/map/getLatLng/${location}`);
    if (!response.ok) {
      throw new Error("Failed to fetch LatLng data");
    }
    const data = response.json();
    return data;
  } catch (err) {
    console.error("Error fetching data: ", err.message);
  }
}

const Map = ({ location }) => {
  //   const [lat, setLat] = useState(null);
  //   const [lng, setLng] = useState(null);
  useEffect(() => {
    // 이미 스크립트가 로드되었는지 확인
    if (document.getElementById("kakao-map-script")) {
      initializeMap(); // 맵 초기화 함수 호출
      return;
    }

    // 스크립트 태그 동적으로 추가
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
    script.async = true;
    script.onload = initializeMap; // 스크립트 로드 후 지도 초기화
    document.body.appendChild(script);

    return () => {
      // Cleanup: 기존 지도와 마커 제거
      const mapContainer = document.getElementById("map");
      if (mapContainer) {
        mapContainer.innerHTML = ""; // 맵 컨테이너 정리
      }
    };
  }, [location]); // location이 변경될 때만 실행

  // 맵 초기화
  const initializeMap = async () => {
    const coordinates = await fetchLatLng(location);
    if (!coordinates) return;

    const { x: lng, y: lat } = coordinates;

    // 스크립트 로드 완료 후 카카오 맵을 초기화
    window.kakao.maps.load(() => {
      // 지도를 표시할 div
      const container = document.getElementById("map");

      // 지도 중심 좌표
      const options = {
        center: new window.kakao.maps.LatLng(lat, lng), // 예시 좌표
        level: 3,
      };

      // 마커가 표시될 위치
      const map = new window.kakao.maps.Map(container, options);

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(lat, lng),
      });

      // 마커가 지도 위에 표시되도록 설정
      marker.setMap(map);

      const iwContent = `<div style="padding:5px;">${location}<br><a href="https://map.kakao.com/link/map/${location},${lat},${lng}" style="color:blue" target="_blank">큰지도보기</a> <a href="https://map.kakao.com/link/to/${location},${lat},${lng}" style="color:blue" target="_blank">길찾기</a></div>`; // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능
      const iwPosition = new window.kakao.maps.LatLng(33.450701, 126.570667); //인포윈도우 표시 위치

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        position: iwPosition,
        content: iwContent,
      });

      // 마커 위에 인포위도우 표시, marker를 넣어야 마커 위에 표시.
      infowindow.open(map, marker);
    });
  };

  // 지도 페이지 UI
  return (
    <div>
      <div id="map" style={{ width: "100%", height: "500px" }}></div>
      <p>{/* 위치: <a href={`https://map.kakao.com/link/map/${lat},${lng}`}>{location}</a> */}</p>
    </div>
  );
};

Map.propTypes = {
  //   location: PropTypes.list.isRequired,
  location: PropTypes.string.isRequired,
};

export default Map;

// import PropTypes from "prop-types";
// import { useState, useEffect } from "react";

// async function fetchLatLng(location) {
//   try {
//     const response = await fetch(`http://localhost:3000/api/map/getLatLng/${location}`);
//     if (!response.ok) {
//       throw new Error("Failed to fetch LatLng data");
//     }
//     const data = response.json();
//     return data;
//   } catch (err) {
//     console.error("Error fetching data: ", err.message);
//   }
// }

// const Map = ({ location }) => {
//   //   const [lat, setLat] = useState(null);
//   //   const [lng, setLng] = useState(null);
//   useEffect(() => {
//     // 이미 카카오맵 스크립트가 로드되었는지 확인
//     if (window.kakao) return; // 이미 로드되었으면 리턴

//     // 스크립트 태그 동적으로 추가
//     const script = document.createElement("script");
//     script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
//     script.async = true;
//     script.onload = async () => {
//       const coordinates = await fetchLatLng(location);
//       const { x: lng, y: lat } = coordinates;
//       //   setLat(coordinates.x);
//       //   setLng(coordinates.y);

//       console.log("lat: ", lat, "lng: ", lng);

//       // 스크립트 로드 완료 후 카카오 맵을 초기화
//       window.kakao.maps.load(() => {
//         // 지도를 표시할 div
//         const container = document.getElementById("map");

//         // 지도 중심 좌표
//         const options = {
//           center: new window.kakao.maps.LatLng(lat, lng), // 예시 좌표
//           level: 3,
//         };

//         // 마커가 표시될 위치
//         const map = new window.kakao.maps.Map(container, options);

//         // 마커 생성
//         const marker = new window.kakao.maps.Marker({
//           position: new window.kakao.maps.LatLng(lat, lng),
//         });

//         // 마커가 지도 위에 표시되도록 설정
//         marker.setMap(map);

//         const iwContent = `<div style="padding:5px;">${location}<br><a href="https://map.kakao.com/link/map/${location},${lat},${lng}" style="color:blue" target="_blank">큰지도보기</a> <a href="https://map.kakao.com/link/to/${location},${lat},${lng}" style="color:blue" target="_blank">길찾기</a></div>`; // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능
//         const iwPosition = new window.kakao.maps.LatLng(33.450701, 126.570667); //인포윈도우 표시 위치

//         // 인포윈도우 생성
//         const infowindow = new window.kakao.maps.InfoWindow({
//           position: iwPosition,
//           content: iwContent,
//         });

//         // 마커 위에 인포위도우 표시, marker를 넣어야 마커 위에 표시.
//         infowindow.open(map, marker);
//       });
//     };
//     document.body.appendChild(script); // body에 스크립트 추가
//   }, []);
//   // React Strict Mode, useEffect가 두 번 실행됨 -> 스크립트 중복

//   // 지도 페이지 UI
//   return (
//     <div>
//       <div id="map" style={{ width: "100%", height: "500px" }}></div>
//       <p>{/* 위치: <a href={`https://map.kakao.com/link/map/${lat},${lng}`}>{location}</a> */}</p>
//     </div>
//   );
// };

// Map.propTypes = {
//   //   location: PropTypes.list.isRequired,
//   location: PropTypes.string.isRequired,
// };

// export default Map;
