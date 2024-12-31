import { Link } from "react-router-dom"; // Link 컴포넌트
import CreatePopup from "./CreatePopup"; // 팝업 올리기
import AuthForm from "./AuthForm"; // 로그인/회원가입
import SearchBar from "./SearchBar"; // 검색

import "../styles/Header.css";

function Header() {
  return (
    <header className="header">
      <div className="header-top">
        <Link to="/">
          <img style={{ width: "200px" }} src="../../public/logo.png" alt="POPPING 로고"></img>
        </Link>
        {/* <div className="logo">POPPING</div> */}
        <div className="header-actions">
          <CreatePopup />
          <AuthForm />
        </div>
      </div>

      {/* 두 번째 줄 */}
      <div className="header-search">
        <SearchBar />
      </div>

      {/* 세 번째 줄 */}
      {/* <nav className="header-nav">
        <a href="/">홈</a>
        <a href="/">달력</a>
        <a href="/">지도</a>
      </nav> */}
    </header>
  );
}

export default Header;
