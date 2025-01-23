import { useState, useEffect } from "react";
import Map from "../../components/SearchMap";
import Region from "../../components/Region";

const MapPage = () => {
  const [selectedRegion, setSelectedRegion] = useState("seoul");
  const [location, setLocation] = useState([]);

  useEffect(() => {
    // 현재 활성화된 전체 팝업 정보 요청
    const fetchLocationData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/categories/whole`);
<<<<<<< HEAD
        if (!response.ok) {
          throw new Error("");
        }
        const data = await response.json();
=======

        if (!response.ok) {
          const data = await response.json();
          console.error("서버 fetch 중 오류 발생: ", data.error);
        }

        const data = await response.json();
        // 팝업고유 id, 팝업 이름, 주소, startDate, endDate, 이미지 url
        // console.log("categories: ", data.categories);
>>>>>>> 332d25afe2b0e3fe93e4a9ca1e49217fc4b38ff3

        setLocation(data.categories);
      } catch (err) {
        console.error("Error fetching location data: ", err);
      }
    };

    fetchLocationData();
  }, []);

  return (
    <div>
      <h2>지도</h2>
      <Region onSelectRegion={setSelectedRegion}></Region>
      <Map region={selectedRegion} location={location}></Map>
    </div>
  );
};

export default MapPage;
