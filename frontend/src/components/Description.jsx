import PropTypes from "prop-types";
import Map from "./Map";
import { formatDate } from "../utils/util";

const Description = ({ detail }) => {
  return (
    <div>
      <strong>운영 기간</strong>
      <p className="mb-3">
        {formatDate(detail.s_date)} ~ {formatDate(detail.e_date)}
      </p>

      <strong>운영 시간</strong>
      <p className="mb-3">{detail.business_hours}</p>

      <strong>상세 설명</strong>
      <p className="mb-3">{detail.description}</p>

      <strong>문의하기</strong>
      <p className="mb-3">{detail.contact}</p>

      <Map location={detail.location}></Map>
    </div>
  );
};

Description.propTypes = {
  detail: PropTypes.shape({
    location: PropTypes.string.isRequired,
    s_date: PropTypes.string.isRequired,
    e_date: PropTypes.string.isRequired,
    business_hours: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    contact: PropTypes.string.isRequired,
  }).isRequired,
};

export default Description;
