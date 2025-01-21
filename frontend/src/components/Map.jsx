import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

async function fetchLatLng(location) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/map/getLatLng/${encodeURIComponent(location)}`);
    if (!response.ok) {
      throw new Error("Failed to fetch LatLng data");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching data: ", err.message);
  }
}

const Map = ({ location }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infowindowRef = useRef(null);

  useEffect(() => {
    if (document.getElementById("kakao-map-script")) {
      loadKakaoMaps();
      return;
    }

    // 스크립트 추가
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
    script.async = true;
    script.onload = loadKakaoMaps;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (mapRef.current) mapRef.current = null;
      if (markerRef.current) markerRef.current.setMap(null);
      if (infowindowRef.current) infowindowRef.current.close();
    };
  }, [location]);

  const loadKakaoMaps = async () => {
    // Kakao Maps SDK가 로드된 후 실행
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(async () => {
      const coordinates = await fetchLatLng(location);
      if (!coordinates) return;

      const { x: lng, y: lat } = coordinates;

      // 지도 초기화
      if (!mapRef.current) {
        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(lat, lng),
          level: 3,
        };
        mapRef.current = new window.kakao.maps.Map(container, options);
      } else {
        // 지도 중심 업데이트
        mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
      }

      // 마커와 인포윈도우 업데이트
      updateMarkerAndInfoWindow(mapRef.current, lat, lng, location);
    });
  };

  const updateMarkerAndInfoWindow = (map, lat, lng, location) => {
    const position = new window.kakao.maps.LatLng(lat, lng);

    // 마커 업데이트 또는 생성
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new window.kakao.maps.Marker({
        position,
        map,
      });
    }

    // 인포윈도우 업데이트 또는 생성
    const iwContent = `<div style="padding:5px;">${location}<br><a href="https://map.kakao.com/link/map/${location},${lat},${lng}" style="color:blue" target="_blank">큰지도보기</a> <a href="https://map.kakao.com/link/to/${location},${lat},${lng}" style="color:blue" target="_blank">길찾기</a></div>`;

    //     const iwContent = `
    //   <div style="padding: 15px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
    //     <h4 style="margin: 0; font-size: 16px; color: #333; font-weight: bold;">${location}</h4>
    //     <p style="margin: 10px 0; font-size: 14px; color: #555;">여기에서 확인해보세요.</p>
    //     <div style="display: flex; gap: 10px;">
    //       <a href="https://map.kakao.com/link/map/${location},${lat},${lng}" style="color: #0078FF; font-size: 14px; text-decoration: none; padding: 8px 12px; border: 1px solid #0078FF; border-radius: 4px; transition: background-color 0.3s;">
    //         큰 지도 보기
    //       </a>
    //       <a href="https://map.kakao.com/link/to/${location},${lat},${lng}" style="color: #0078FF; font-size: 14px; text-decoration: none; padding: 8px 12px; border: 1px solid #0078FF; border-radius: 4px; transition: background-color 0.3s;">
    //         길 찾기
    //       </a>
    //     </div>
    //   </div>
    // `;

    if (infowindowRef.current) {
      infowindowRef.current.setContent(iwContent);
      infowindowRef.current.setPosition(position);
    } else {
      infowindowRef.current = new window.kakao.maps.InfoWindow({
        content: iwContent,
        position,
      });
      infowindowRef.current.open(map, markerRef.current);
    }
  };

  return <div id="map" style={{ width: "100%", height: "500px" }}></div>;
};

Map.propTypes = {
  location: PropTypes.string.isRequired,
};

export default Map;
