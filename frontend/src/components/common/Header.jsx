// import { useState } from "react";
import { Link } from "react-router-dom"; // Link 컴포넌트

import CreatePopup from "../CreatePopup"; // 팝업 올리기
import AuthButton from "../AuthButton"; // 로그인/회원가입
// import MyPageButton from "./MyPageButton";
import SearchBar from "../SearchBar"; // 검색

// import "../../styles/common/Header.css";

function Header() {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [username, setUsername] = useState("");

  // const handleLoginSuccess = (user) => {
  //   setIsLoggedIn(true);
  //   setUsername(user.username); // 로그인 후 받은 사용자명
  // };

  // const handleLogout = () => {
  //   setIsLoggedIn(false);
  //   setUsername("");
  // };

  return (
    <header className="header">
      <div className="header-top">
        <div className="w-[1280px] h-14 px-8 py-2 justify-between items-center inline-flex">
          <div className="justify-center items-center gap-3 flex">
            <Link to="/">
              <img style={{ width: "140px" }} src="../../public/popping.svg" alt="POPPING 로고"></img>
            </Link>
          </div>
          <div className="self-stretch justify-center items-center gap-4 flex">
            <CreatePopup />
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
