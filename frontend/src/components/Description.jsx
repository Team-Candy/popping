import PropTypes from "prop-types";
// ESLint, react/prop-types 규칙이 활성화,

import Map from "./Map";

const Description = ({ detail }) => {
  return (
    <div>
      <p>
        <strong>운영 기간:</strong> {detail.startDate}~{detail.endDate}
      </p>

      <p>
        <strong>운영 시간:</strong> {detail.business_hours}
      </p>

      <p>
        <strong>상세 설명:</strong> {detail.description}
      </p>

      <p>
        <strong>문의하기:</strong> {detail.contact}
      </p>

      <Map location={detail.location}></Map>
    </div>
  );
};

Description.propTypes = {
  detail: PropTypes.shape({
    location: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    business_hours: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    contact: PropTypes.string.isRequired,
  }).isRequired,
};

export default Description;
