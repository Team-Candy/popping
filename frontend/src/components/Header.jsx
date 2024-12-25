import AuthForm from "./AuthForm";
import CreatePopup from "./CreatePopup";
import SearchBar from "./SearchBar";

import "./Header.css";

function Header() {
  return (
    <header className="header">
      {/* 첫 번째 줄 */}
      <div className="header-top">
        <div className="logo">POPPING</div>
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
      <nav className="header-nav">
        <a href="/">홈</a>
        <a href="/">달력</a>
        <a href="/">지도</a>
      </nav>
    </header>
  );
}

export default Header;
