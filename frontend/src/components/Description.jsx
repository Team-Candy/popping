import PropTypes from "prop-types";
import Map from "./Map";

const Description = ({ detail }) => {
  return (
    <div className="p-5 bg-gray-100  rounded-2xl shadow-md space-y-6">
      <div>
        <strong className="text-lg font-semibold text-gray-700 block mb-2">상세 설명</strong>
        <p className="text-gray-600 leading-relaxed">{detail.description}</p>
      </div>

      <div>
        <strong className="text-lg font-semibold text-gray-700 block mb-2">문의</strong>
        <p className="text-gray-600 leading-relaxed">{detail.contact}</p>
      </div>

      <div className="pt-4 rounded-2xl">
        <Map location={detail.location}></Map>
      </div>
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
