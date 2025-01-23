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

  return (
    <div>
      {/* 검색 */}
      <input
        type="text"
        placeholder="이동할 위치를 입력하세요."
        onChange={(e) => {
          setLocation(e.target.value);
        }}
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          onSelectRegion(location);
        }}
      >
        검색
      </button>

      {/* 도시별 */}
      <div>
        {Object.keys(city).map((region) => (
          <button key={region} onClick={() => onSelectRegion(city[region])}>
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
