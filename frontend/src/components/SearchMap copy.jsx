import PropTypes from "prop-types";
import { useEffect } from "react";
import { formatDate } from "../utils/util";

// 지역에 따른 좌표 데이터
const regionCoordinates = {
  total: { lat: 37.5665, lng: 126.9788 }, // 서울의 중심 좌표
  seoul: { lat: 37.5665, lng: 126.9788 },
  busan: { lat: 35.1796, lng: 129.0756 },
  jeju: { lat: 33.4996, lng: 126.5312 },
  incheon: { lat: 37.4563, lng: 126.7052 },
};

const Map = ({ region, location }) => {
  useEffect(() => {
    // 이미 스크립트가 로드되었는지 확인
    if (document.getElementById("kakao-map-script")) {
      console.log("여기임");
      initializeMap(region, location); // 맵 초기화 함수 호출
      return;
    }

    // 스크립트 태그 동적으로 추가
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => initializeMap(region, location); // 스크립트 로드 후 지도 초기화
    document.body.appendChild(script);

    return () => {
      // Cleanup: 기존 지도와 마커 제거
      const mapContainer = document.getElementById("map");
      if (mapContainer) {
        mapContainer.innerHTML = ""; // 맵 컨테이너 정리
      }
    };
  }, []);

  return (
    <div>
      <div id="map" style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
};

Map.propTypes = {
  region: PropTypes.string.isRequired,
  location: PropTypes.array.isRequired,
};

export default Map;

async function fetchLatLng(location) {
  try {
    console.log("location: ", location);
    const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/map/getLatLng/${encodeURIComponent(location)}`);
    if (!response.ok) {
      const data = await response.json();
      console.error("서버 오류 발생: ", data.error);
      return;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("네트워크 오류", err.message);
  }
}

// lat,lng 찾기 함수 (지역 좌표 찾을 때 사용)
// const getCoordinates = async (region) => {
//   // regionCoordinates에 좌표가 없으면 fetchLatLng로 좌표를 찾음
//   // return regionCoordinates[region] || (await fetchLatLng(region));
//   const coordinates = regionCoordinates[region];
//   if (coordinates) {
//     return coordinates;
//   } else {
//     const data = await fetchLatLng(region);
//     return data;
//   }
// };

const getCoordinates = (region) => {
  const cachedCoords = localStorage.getItem(region);
  if (cachedCoords) {
    return Promise.resolve(JSON.parse(cachedCoords)); // 로컬 스토리지에서 좌표 반환
  }

  if (regionCoordinates[region]) {
    return Promise.resolve(regionCoordinates[region]);
  } else {
    return fetchLatLng(region).then((coords) => {
      localStorage.setItem(region, JSON.stringify(coords)); // 로컬 스토리지에 좌표 저장
      return coords;
    });
  }
};

// 맵 초기화 함수
const initializeMap = async (region = "seoul", location) => {
  const { lat, lng } = await getCoordinates(region); // region에 해당하는 좌표

  // 스크립트 로드 완료 후 카카오 맵을 초기화
  window.kakao.maps.load(() => {
    // 지도를 표시할 div
    const container = document.getElementById("map");

    // 지도 중심 좌표
    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 6,
    };

    // 마커가 표시될 위치
    const map = new window.kakao.maps.Map(container, options);

    // location 배열에 있는 각 위치에 대해 마커 및 인포윈도우 추가
    location.forEach((item) => {
      const { id, name, location, startDate, endDate, images } = item;

      fetchLatLng(location).then((coords) => {
        const { x: lng, y: lat } = coords;

        // 마커 생성
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(lat, lng),
        });

        // 인포윈도우 내용 설정
        const iwContent = `
          <div style="display: flex; padding:5px;">
            <div style="flex: 1; margin-right: 5px;">
              ${name}<br>
              ${formatDate(startDate)}~${formatDate(endDate)}<br>
              <a href="/popup/${id}" style="color:blue" target="_blank">상세보기</a><br>
              <a href="https://map.kakao.com/link/map/${location},${lat},${lng}" style="color:blue" target="_blank">큰지도보기</a>
               | 
              <a href="https://map.kakao.com/link/to/${location},${lat},${lng}" style="color:blue" target="_blank">길찾기</a><br>
            </div>
            <div>
              <img src="${images}" alt="popupStore image" style="width:100px;height:100px; border-radius:10px;"/>
            </div>
          </div>
        `;

        const infowindow = new window.kakao.maps.InfoWindow({
          position: new window.kakao.maps.LatLng(lat, lng),
          content: iwContent,
        });

        marker.setMap(map); // 마커 맵에 표시
        infowindow.open(map, marker); // 인포윈도우 표시
      });
    });
  });
};
