import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyPageButton.css";

const MyPageButton = ({ auth }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();

  // (수정) div 이외의 클릭 감지 - 메뉴 닫기

  const handleMyPage = () => {
    setMenuVisible((prevState) => !prevState);
  };

  const handleClick = (e) => {
    navigate(`${e.target.name}`);
    setMenuVisible(false);
  };

  return (
    <div className="my-page-container">
      <button onClick={handleMyPage} className="my-page-button">
        {auth.username}님
      </button>
      {menuVisible && (
        <div className="menu">
          <ul>
            <li>
              <button onClick={handleClick} name="profile">
                프로필
              </button>
            </li>
            <li>
              <button onClick={handleClick} name="myPopup">
                나의 팝업
              </button>
            </li>
            <li>
              <button onClick={handleClick} name="favoritePopup">
                관심 팝업
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

MyPageButton.propTypes = {
  auth: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
};

export default MyPageButton;
