import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

async function fetchLatLng(location) {
  try {
    console.log("요청중");
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

    const iwContent = `
  <div style="width:220px; padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #444;">
    <div style="font-size: 12px; font-weight: bold; color: #2c3e50; margin-bottom: 12px;">${location}</div>
    <div style="display: flex; gap: 15px; justify-content: center; margin-top: 15px;">
      <a href="https://map.kakao.com/link/map/${location},${lat},${lng}" 
         style="background-color: #c8a0c8; color: white; padding: 8px 15px; border-radius: 5px; text-decoration: none; font-weight: 600; transition: background-color 0.3s ease;"
         target="_blank">큰 지도</a>
      <a href="https://map.kakao.com/link/to/${location},${lat},${lng}" 
         style="background-color: #c8a0c8; color: white; padding: 8px 15px; border-radius: 5px; text-decoration: none; font-weight: 600; transition: background-color 0.3s ease;"
         target="_blank">길찾기</a>
    </div>
  </div>
`;

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
