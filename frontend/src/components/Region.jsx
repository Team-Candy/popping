import PropTypes from "prop-types";

const city = {
  전체: "total",
  서울: "seoul",
  부산: "busan",
  제주: "jeju",
  인천: "incheon",
};

const unit = {
  강남구: "Gangnam",
  강동구: "Gangdong",
  강북구: "Gangbuk",
  강서구: "Gangseo",
  관악구: "Gwanak",
  광진구: "Gwangjin",
  구로구: "Guro",
  금천구: "Geumcheon",
  노원구: "Nowon",
  도봉구: "Dobong",
  동대문구: "Dongdaemun",
  동작구: "Dongjak",
  마포구: "Mapo",
  서대문구: "Seodaemun",
  서초구: "Seocho",
  성동구: "Seongdong",
  성북구: "Seongbuk",
  송파구: "Songpa",
  양천구: "Yangcheon",
  영등포구: "Yeongdeungpo",
  용산구: "Yongsan",
  은평구: "Eunpyeong",
  종로구: "Jongno",
  중구: "Jung",
  중랑구: "Jungnang",
};

const Region = ({ onSelectRegion }) => {
  return (
    <div>
      {/* 도시별 */}
      <div>
        {Object.keys(city).map((region) => (
          <button key={region} onClick={() => onSelectRegion(city[region])}>
            {region}
          </button>
        ))}
      </div>
      <br />

      {/* 서울시 지역구별*/}
      <div>
        {Object.keys(unit).map((region) => (
          <button key={region} onClick={() => onSelectRegion(unit[region])}>
            {region}
          </button>
        ))}
      </div>
    </div>
  );
};

Region.propTypes = {
  onSelectRegion: PropTypes.func.isRequired, // 필수 함수
};

export default Region;
