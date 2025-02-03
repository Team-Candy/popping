// 디테일 페이지
import PropTypes from "prop-types";
<<<<<<< HEAD
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
=======
import { useEffect, useRef } from "react";
import { formatDate, formatURL } from "../utils/util";
>>>>>>> 332d25afe2b0e3fe93e4a9ca1e49217fc4b38ff3

const Map = ({ region, location }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infowindowsRef = useRef([]);

  useEffect(() => {
    const scriptId = "kakao-map-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if (window.kakao && window.kakao.maps) {
        initializeMap(region, location);
      } else {
        existingScript.onload = () => initializeMap(region, location);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
    script.async = true;
    script.id = scriptId;
    script.onload = () => {
      console.log("Kakao Maps SDK 로드 완료");
      initializeMap(region, location);
    };
    document.body.appendChild(script);

    return () => {
      const mapContainer = document.getElementById("map");
      if (mapContainer) {
        mapContainer.innerHTML = "";
      }

      markersRef.current.forEach((marker) => marker.setMap(null));
      infowindowsRef.current.forEach((infowindow) => infowindow.close());
    };
  }, [region, location]);

  const initializeMap = async (region = "seoul", location) => {
    const { lat, lng } = await getCoordinates(region);

    if (window.kakao) {
      window.kakao.maps.load(async () => {
        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(lat, lng),
          level: 6,
        };

        if (!mapRef.current) {
          mapRef.current = new window.kakao.maps.Map(container, options);
        } else {
          mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
        }

        const map = mapRef.current;
        if (!map.zoomControl) {
          const zoomControl = new window.kakao.maps.ZoomControl();
          map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
          map.zoomControl = zoomControl;
        }

        for (const item of location) {
          const { id, name, location, startDate, endDate, images } = item;

          const coords = await fetchLatLng(location);
          const { x: lng, y: lat } = coords;

          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(lat, lng),
          });

          const iwContent = `
              <div class="info-window-link" style="display: flex; padding: 15px; background-color: #fff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                <div style="flex: 1; margin-right: 12px;">
                  <p style="margin: 0; font-size: 13px; font-weight: bold; white-space: nowrap; ">${name}</p>
                  <p style="margin: 5px 0; font-size: 11px; color: #888; white-space: nowrap;">${formatDate(startDate)} ~ ${formatDate(endDate)}</p>
                  <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <a href="/popup/${id}" style="white-space: nowrap; background-color: #c8a0c8;  color:white; font-size: 10px; border-radius: 5px; text-decoration: none; padding: 8px 12px; transition: background-color 0.3s;">
                      상세보기
                    </a>
                    <a href="https://map.kakao.com/link/map/${location},${lat},${lng}" style="white-space: nowrap; background-color: #c8a0c8; border-radius: 5px; color: white; font-size: 10px; text-decoration: none; padding: 8px 12px; transition: background-color 0.3s;">
                      큰 지도
                    </a>
                    <a href="https://map.kakao.com/link/to/${location},${lat},${lng}" style="white-space: nowrap; background-color: #c8a0c8; border-radius: 5px; color: white; font-size: 10px; text-decoration: none; padding: 8px 12px; transition: background-color 0.3s;">
                      길찾기
                    </a>
                  </div>
                </div>
                <div>
                  <img src="${formatURL(images[0])}" alt="popupStore image" style="width: 60px; height: 60px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"/>
                </div>
              </div>
            `;

          const infowindow = new window.kakao.maps.InfoWindow({
            position: new window.kakao.maps.LatLng(lat, lng),
            content: iwContent,
            zIndex: 1,
            disableAutoPan: true,
          });

          window.kakao.maps.event.addListener(marker, "click", () => {
            markersRef.current.forEach((m) => {
              m.setZIndex(1);
            });

            infowindowsRef.current.forEach((infowindow) => {
              infowindow.setZIndex(1);
            });

            marker.setZIndex(9999);

            infowindow.setZIndex(9999);
          });

          marker.setMap(map);
          infowindow.open(map, marker);

          markersRef.current.push(marker);
          infowindowsRef.current.push(infowindow);
        }
      });
    } else {
      console.error("Kakao Maps SDK is not loaded.");
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchLatLng = async (location) => {
    const cachedCoords = JSON.parse(localStorage.getItem("coords")) || {};

    if (cachedCoords && cachedCoords[location]) {
      return cachedCoords[location];
    } else {
      try {
        const REQUEST_DELAY = 3000;
        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/map/getLatLng/${encodeURIComponent(location)}`);
        console.log("response: ", response);

        if (!response.ok) {
          const data = await response.json();
          console.error("서버 오류 발생: ", data.error);
          return;
        }
        const data = await response.json();

        cachedCoords[location] = data;
        localStorage.setItem("coords", JSON.stringify(cachedCoords));

        await delay(REQUEST_DELAY);
        return data;
      } catch (err) {
        console.error("네트워크 오류", err.message);
      }
    }
  };

  const getCoordinates = async (region) => {
    const regionCoordinates = {
      seoul: { lat: 37.5665, lng: 126.9788 },
      busan: { lat: 35.1796, lng: 129.0756 },
      jeju: { lat: 33.4996, lng: 126.5312 },
      incheon: { lat: 37.4563, lng: 126.7052 },
    };

    if (regionCoordinates[region]) {
      return regionCoordinates[region];
    } else {
      const data = await fetchLatLng(region);
      const lat = parseFloat(data.y);
      const lng = parseFloat(data.x);
      return { lat, lng };
    }
  };

// import PropTypes from "prop-types";
// import { useEffect } from "react";

// // 지역에 따른 좌표 데이터
// const regionCoordinates = {
//   total: { lat: 37.5665, lng: 126.9788 }, // 서울의 중심 좌표
//   seoul: { lat: 37.5665, lng: 126.9788 },
//   busan: { lat: 35.1796, lng: 129.0756 },
//   jeju: { lat: 33.4996, lng: 126.5312 },
//   incheon: { lat: 37.4563, lng: 126.7052 },
//   Gangnam: { lat: 37.4979, lng: 127.0276 }, // 강남구
//   Gangdong: { lat: 37.5301, lng: 127.1238 }, // 강동구
//   Gangbuk: { lat: 37.6386, lng: 127.0256 }, // 강북구
//   Gangseo: { lat: 37.5512, lng: 126.8496 }, // 강서구
//   Gwanak: { lat: 37.478, lng: 126.9516 }, // 관악구
//   Gwangjin: { lat: 37.5415, lng: 127.0828 }, // 광진구
//   Guro: { lat: 37.4951, lng: 126.8852 }, // 구로구
//   Geumcheon: { lat: 37.4538, lng: 126.8984 }, // 금천구
//   Nowon: { lat: 37.6542, lng: 127.0473 }, // 노원구
//   Dobong: { lat: 37.6545, lng: 127.0435 }, // 도봉구
//   Dongdaemun: { lat: 37.5737, lng: 127.0246 }, // 동대문구
//   Dongjak: { lat: 37.5047, lng: 126.9394 }, // 동작구
//   Mapo: { lat: 37.5662, lng: 126.9017 }, // 마포구
//   Seodaemun: { lat: 37.5774, lng: 126.9368 }, // 서대문구
//   Seocho: { lat: 37.4836, lng: 127.032 }, // 서초구
//   Seongdong: { lat: 37.5637, lng: 127.0351 }, // 성동구
//   Seongbuk: { lat: 37.602, lng: 127.0251 }, // 성북구
//   Songpa: { lat: 37.5113, lng: 127.1052 }, // 송파구
//   Yangcheon: { lat: 37.5187, lng: 126.8647 }, // 양천구
//   Yeongdeungpo: { lat: 37.5268, lng: 126.8972 }, // 영등포구
//   Yongsan: { lat: 37.5326, lng: 126.9909 }, // 용산구
//   Eunpyeong: { lat: 37.6106, lng: 126.9277 }, // 은평구
//   Jongno: { lat: 37.5707, lng: 126.9853 }, // 종로구
//   Jung: { lat: 37.561, lng: 126.9979 }, // 중구
//   Jungnang: { lat: 37.6111, lng: 127.0851 }, // 중랑구
// };

// const Map = ({ region, location }) => {
//   // 만약 region이 regionCoordinates의 key 중 있다면 => 그에 해당하는 lat, lng 값
//   // 없다면 그걸로 fetchLatLng(region)으로 찾기
//   // region의 lat, lng으로 맵 focus

//   // location은 []으로 받는데
//   // 모두 map에 마커, 인포위도우 표시.

//   useEffect(() => {
//     // 이미 스크립트가 로드되었는지 확인
//     if (document.getElementById("kakao-map-script")) {
//       console.log("여기임");
//       initializeMap(region, location); // 맵 초기화 함수 호출
//       return;
//     }

//     // 스크립트 태그 동적으로 추가
//     const script = document.createElement("script");
//     script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
//     script.async = true;
//     script.onload = () => initializeMap(region, location); // 스크립트 로드 후 지도 초기화
//     document.body.appendChild(script);

//     return () => {
//       // Cleanup: 기존 지도와 마커 제거
//       const mapContainer = document.getElementById("map");
//       if (mapContainer) {
//         mapContainer.innerHTML = ""; // 맵 컨테이너 정리
//       }
//     };
//   }, [region, location]);

//   return (
//     <div>
//       <div id="map" style={{ width: "100%", height: "500px" }}></div>
//     </div>
//   );
// };

// Map.propTypes = {
//   region: PropTypes.string.isRequired,
//   location: PropTypes.array.isRequired,
// };

export default Map;
