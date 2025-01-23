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
<<<<<<< HEAD

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
=======
  return (
    <div>
      {/* 검색 */}
      <div>
        <input
          placeholder="주소를 입력해주세요."
          type="text"
          onChange={(e) => {
            setLocation(e.target.value);
          }}
          tabIndex="0" // 키보드 포커스를 받을 수 있도록 설정
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSelectRegion(location);
              // document.getElementById("search-button").click();
            }
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
      </div>
>>>>>>> 332d25afe2b0e3fe93e4a9ca1e49217fc4b38ff3

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
