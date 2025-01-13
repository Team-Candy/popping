import PropTypes from "prop-types";
import { useEffect } from "react";

// 지역에 따른 좌표 데이터
const regionCoordinates = {
  total: { lat: 37.5665, lng: 126.9788 }, // 서울의 중심 좌표
  seoul: { lat: 37.5665, lng: 126.9788 },
  busan: { lat: 35.1796, lng: 129.0756 },
  jeju: { lat: 33.4996, lng: 126.5312 },
  incheon: { lat: 37.4563, lng: 126.7052 },
  Gangnam: { lat: 37.4979, lng: 127.0276 }, // 강남구
  Gangdong: { lat: 37.5301, lng: 127.1238 }, // 강동구
  Gangbuk: { lat: 37.6386, lng: 127.0256 }, // 강북구
  Gangseo: { lat: 37.5512, lng: 126.8496 }, // 강서구
  Gwanak: { lat: 37.478, lng: 126.9516 }, // 관악구
  Gwangjin: { lat: 37.5415, lng: 127.0828 }, // 광진구
  Guro: { lat: 37.4951, lng: 126.8852 }, // 구로구
  Geumcheon: { lat: 37.4538, lng: 126.8984 }, // 금천구
  Nowon: { lat: 37.6542, lng: 127.0473 }, // 노원구
  Dobong: { lat: 37.6545, lng: 127.0435 }, // 도봉구
  Dongdaemun: { lat: 37.5737, lng: 127.0246 }, // 동대문구
  Dongjak: { lat: 37.5047, lng: 126.9394 }, // 동작구
  Mapo: { lat: 37.5662, lng: 126.9017 }, // 마포구
  Seodaemun: { lat: 37.5774, lng: 126.9368 }, // 서대문구
  Seocho: { lat: 37.4836, lng: 127.032 }, // 서초구
  Seongdong: { lat: 37.5637, lng: 127.0351 }, // 성동구
  Seongbuk: { lat: 37.602, lng: 127.0251 }, // 성북구
  Songpa: { lat: 37.5113, lng: 127.1052 }, // 송파구
  Yangcheon: { lat: 37.5187, lng: 126.8647 }, // 양천구
  Yeongdeungpo: { lat: 37.5268, lng: 126.8972 }, // 영등포구
  Yongsan: { lat: 37.5326, lng: 126.9909 }, // 용산구
  Eunpyeong: { lat: 37.6106, lng: 126.9277 }, // 은평구
  Jongno: { lat: 37.5707, lng: 126.9853 }, // 종로구
  Jung: { lat: 37.561, lng: 126.9979 }, // 중구
  Jungnang: { lat: 37.6111, lng: 127.0851 }, // 중랑구
};

const Map = ({ region, location }) => {
  // 만약 region이 regionCoordinates의 key 중 있다면 => 그에 해당하는 lat, lng 값
  // 없다면 그걸로 fetchLatLng(region)으로 찾기
  // region의 lat, lng으로 맵 focus

  // location은 []으로 받는데
  // 모두 map에 마커, 인포위도우 표시.

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
  }, [region, location]);

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

// lat,lng 찾기 함수 (지역 좌표 찾을 때 사용)
const getCoordinates = async (region) => {
  // regionCoordinates에 좌표가 없으면 fetchLatLng로 좌표를 찾음
  // return regionCoordinates[region] || (await fetchLatLng(region));
  const coordinates = regionCoordinates[region];
  if (coordinates) {
    return coordinates;
  } else {
    const data = await fetchLatLng(region);
    return data;
  }

  // 값에 따른 레벨 변경
  // if (regionCoordinates[region]) {
  //   const data = { coordinate: regionCoordinates[region], level: 3 };
  //   return data;
  // } else {
  //   const data = { coordinate: fetchLatLng(region), level: 6 };
  //   return data;
  // }
};

// 맵 초기화 함수
const initializeMap = async (region, location) => {
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

    // location 배열 -> 마커 추가
    // location.forEach((item) => {
    //   const { name, lat: locLat, lng: locLng } = item;

    //   const markerPosition = new window.kakao.maps.LatLng(locLat, locLng);
    //   const marker = new window.kakao.maps.Marker({
    //     position: markerPosition,
    //   });

    //   // 마커가 지도 위에 표시되도록 설정
    //   marker.setMap(map);

    //   const iwContent = `
    //     <div style="padding:5px;">
    //       ${name}<br>
    //       <a href="https://map.kakao.com/link/map/${name},${locLat},${locLng}" style="color:blue" target="_blank">큰지도보기</a>
    //       <a href="https://map.kakao.com/link/to/${name},${locLat},${locLng}" style="color:blue" target="_blank">길찾기</a>
    //     </div>
    //   `;

    //   // 인포윈도우 생성
    //   const infowindow = new window.kakao.maps.InfoWindow({
    //     position: markerPosition,
    //     content: iwContent,
    //   });

    //   // 마커 위에 인포위도우 표시, marker를 넣어야 마커 위에 표시.
    //   infowindow.open(map, marker);
    // });
    //
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
              ${startDate}~${endDate}<br>
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

        // document.getElementById("popupDiv").addEventListener("click", function () {
        //   window.location.href = `/popup/${id}`;
        // });

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
