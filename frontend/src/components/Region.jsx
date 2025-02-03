import PropTypes from "prop-types";
import { useState } from "react";

const city = {
  서울: "seoul",
  부산: "busan",
  제주: "jeju",
  인천: "incheon",
};

const Region = ({ onSelectRegion }) => {
  const [location, setLocation] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  return (
    <div>
      <div className="mb-5 h-9 px-5 bg-[#f0f0f0] rounded-full justify-between items-center inline-flex">
        <div className="text-sm w-[200px]">
          <input
            className="bg-[#f0f0f0] font-['Pretendard'] leading-normal w-full outline-none"
            placeholder="주소를 입력해주세요."
            type="text"
            onChange={(e) => {
              setLocation(e.target.value);
            }}
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSelectRegion(location);
              }
            }}
          />
        </div>

        <div className="hover:scale-105 transition-all duration-300 w-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              onSelectRegion(location);
            }}
          >
            검색
          </button>
        </div>
      </div>

      <div className="p-4 justify-center items-center gap-2 flex flex-wrap">
        {Object.keys(city).map((region) => (
          <button
            className={`p-2 rounded-lg border border-[#b3b3b3] justify-center items-center gap-3 flex text-center text-xs font-normal font-['Pretendard'] leading-normal whitespace-nowrap w-full sm:w-auto transition-all hover:cursor-pointer ${selectedRegion === region ? "border-[#A15EA1] bg-opacity-30 bg-[#C8A0C8] text-[#A15EA1]" : "text-black"} active:bg-gray-300 active:scale-95`}
            key={region}
            onClick={() => {
              setSelectedRegion(region);
              onSelectRegion(city[region]);
            }}
          >
            {region}
          </button>
        ))}
      </div>
      <br />
    </div>
  );
};

Region.propTypes = {
  onSelectRegion: PropTypes.func.isRequired,
};

export default Region;
