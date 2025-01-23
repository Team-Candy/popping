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
        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/categories/whole`);
        if (!response.ok) {
          throw new Error("");
        }
        const data = await response.json();

        setLocation(data.categories);
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
