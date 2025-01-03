// import { useState } from "react";
import { Link } from "react-router-dom"; // Link 컴포넌트

import CreatePopup from "./CreatePopup"; // 팝업 올리기
import AuthButton from "./AuthButton"; // 로그인/회원가입
// import MyPageButton from "./MyPageButton";
import SearchBar from "./SearchBar"; // 검색

import "../styles/Header.css";

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
        <Link to="/">
          <img style={{ width: "200px" }} src="../../public/logo.png" alt="POPPING 로고"></img>
        </Link>
        {/* <div className="logo">POPPING</div> */}
        <div className="header-actions">
          <CreatePopup />
          <AuthButton />
          {/* {isLogIn ? <MyPageButton username={username} onLogout={handleLogout} /> : <AuthButton onLoginSuccess={handleLoginSuccess} />} */}
        </div>
      </div>

      {/* 두 번째 줄 */}
      <div className="header-search">
        <SearchBar />
      </div>
    </header>
  );
}

export default Header;
