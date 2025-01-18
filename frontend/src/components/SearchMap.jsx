import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { formatDate, formatURL } from "../utils/util";

const Map = ({ region, location }) => {
  const mapRef = useRef(null); // To store the map instance

  useEffect(() => {
    // 이미 스크립트가 로드되었는지 확인
    if (document.getElementById("kakao-map-script")) {
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
  }, [region, location]);

  useEffect(() => {
    if (mapRef.current) {
      updateMapCenter(region);
    }
  }, [region]);

  const updateMapCenter = async (region) => {
    // 주소가 아닌 장소명이라면 ERROR
    const { lat, lng } = await getCoordinates(region);

    if (mapRef.current) {
      const newCenter = new window.kakao.maps.LatLng(lat, lng);
      mapRef.current.setCenter(newCenter);
      console.log("Map center updated", newCenter); // 중심이 잘 업데이트 되는지 확인
    }
  };

  // lat,lng 찾기 함수
  async function fetchLatLng(location) {
    const cachedCoords = JSON.parse(localStorage.getItem("coords")) || {};

    if (cachedCoords && cachedCoords[location]) {
      return cachedCoords[location]; // 로컬 스토리지에서 좌표 반환
    } else {
      try {
        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/map/getLatLng/${encodeURIComponent(location)}`);
        if (!response.ok) {
          const data = await response.json();
          console.error("서버 오류 발생: ", data.error);
          return;
        }
        const data = await response.json();

        cachedCoords[location] = data;
        localStorage.setItem("coords", JSON.stringify(cachedCoords)); // 업데이트된 좌표 객체를 로컬 스토리지에 저장
        return data; // {lng: , lat: }
      } catch (err) {
        console.error("네트워크 오류", err.message);
      }
    }
  }

  // 포커스용 lat,lng 찾기 함수
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
      console.log("Fetching coordinates for region:", region, data);

      // 좌표 값 숫자형으로 변환
      const lat = parseFloat(data.y);
      const lng = parseFloat(data.x);
      console.log("Fetched coordinates:", { lat, lng }); // 변환된 좌표 값
      return { lat, lng };
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

      // 지도 생성
      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map; // Store the map instance in ref
      console.log("mapRef.current: ", mapRef.current); // 제대로 저장되는지 확인

      // 줌 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      // location 배열에 있는 각 위치에 대해 마커 및 인포윈도우 추가
      // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      location.forEach(async (item) => {
        // await delay(index * 100); // 호출 간 100ms 지연
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
              <a href="/popup/${id}" style="color:blue" target="_blank" >상세보기</a><br>
              <a href="https://map.kakao.com/link/map/${location},${lat},${lng}" style="color:blue" target="_blank" >큰지도보기</a>
               |
              <a href="https://map.kakao.com/link/to/${location},${lat},${lng}" style="color:blue" target="_blank" >길찾기</a><br>
            </div>
            <div>
              <img src="${formatURL(images[0])}" alt="popupStore image" style="width:100px;height:100px; border-radius:10px;"/>
            </div>
          </div>
        `;

          const infowindow = new window.kakao.maps.InfoWindow({
            position: new window.kakao.maps.LatLng(lat, lng),
            content: iwContent,
            disableAutoPan: true, // 인포윈도우 열릴 때 지도 중심 이동 방지
          });

          marker.setMap(map); // 마커 맵에 표시
          infowindow.open(map, marker); // 인포윈도우 표시
        });
      });
    });
  };

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
