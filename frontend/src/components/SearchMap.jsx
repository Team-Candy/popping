import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { formatDate, formatURL } from "../utils/util";

const Map = ({ region, location }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infowindowsRef = useRef([]);

  useEffect(() => {
    const scriptId = "kakao-map-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      initializeMap(region, location);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false`;
    script.async = true;
    script.id = scriptId;
    script.onload = () => initializeMap(region, location);
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
      window.kakao.maps.load(() => {
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

        location.forEach(async (item) => {
          const { id, name, location, startDate, endDate, images } = item;

          fetchLatLng(location).then((coords) => {
            const { x: lng, y: lat } = coords;

            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(lat, lng),
            });

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
              disableAutoPan: true,
            });

            marker.setMap(map);
            infowindow.open(map, marker);

            markersRef.current.push(marker);
            infowindowsRef.current.push(infowindow);
          });
        });
      });
    } else {
      console.error("Kakao Maps SDK is not loaded.");
    }
  };

  const fetchLatLng = async (location) => {
    const cachedCoords = JSON.parse(localStorage.getItem("coords")) || {};

    if (cachedCoords && cachedCoords[location]) {
      return cachedCoords[location];
    } else {
      try {
        const REQUEST_DELAY = 1000;
        await delay(REQUEST_DELAY);

        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/map/getLatLng/${encodeURIComponent(location)}`);
        if (!response.ok) {
          const data = await response.json();
          console.error("서버 오류 발생: ", data.error);
          return;
        }
        const data = await response.json();

        cachedCoords[location] = data;
        localStorage.setItem("coords", JSON.stringify(cachedCoords));
        return data;
      } catch (err) {
        console.error("네트워크 오류", err.message);
      }
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
