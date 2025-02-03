import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const MyPageButton = ({ auth }) => {
  const { logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();

  const handleMyPage = () => {
    setMenuVisible((prevState) => !prevState);
  };

  const handleClick = (e) => {
    navigate(`${e.target.name}`);
    setMenuVisible(false);
  };

  const handleLogout = () => {
    logout();
    alert("로그아웃되었습니다.");
    navigate("/");
  };

  return (
    <div className="relative">
      <div className="px-4 py-2 bg-[#c8a0c8] rounded-full justify-center items-center gap-2 flex hover:bg-[#a15da1] transition-all duration-300">
        <button className="text-center text-white text-sm font-semibold font-['Pretendard'] leading-normal" onClick={handleMyPage}>
          {auth.username}님
        </button>
      </div>

      {menuVisible && (
        // <div>
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
          <button onClick={handleClick} name="profile" className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left rounded-t-lg">
            프로필
          </button>
          <button onClick={handleClick} name="favoritePopup" className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left rounded-t-lg">
            관심 팝업 ❤️
          </button>
          <button onClick={handleClick} name="myPopup" className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left rounded-t-lg">
            나의 팝업 ✏️
          </button>
          <button onClick={handleLogout} className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left rounded-t-lg">
            로그아웃
          </button>
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
