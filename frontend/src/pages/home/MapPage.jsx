import { useState, useEffect } from "react";
import Map from "../../components/SearchMap";
import Region from "../../components/Region";

const MapPage = () => {
  const [selectedRegion, setSelectedRegion] = useState("seoul");
  const [location, setLocation] = useState([]);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/categories/whole`);

        if (!response.ok) {
          const data = await response.json();
          console.error("서버 fetch 중 오류 발생: ", data.error);
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
    <div className="mt-10 flex flex-col items-center justify-center">
      <div className="max-w-[1000px] w-4/5">
        <h2 className="mb-6 text-center text-3xl font-semibold text-gray-800">지도</h2>
        <div className="w-full flex justify-center">
          <Region onSelectRegion={setSelectedRegion}></Region>
        </div>
        <Map region={selectedRegion} location={location}></Map>
      </div>
    </div>
  );
};

export default MapPage;
