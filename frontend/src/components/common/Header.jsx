import { Link } from "react-router-dom"; // Link 컴포넌트

import CreatePopup from "../CreatePopup"; // 팝업 올리기
import AuthButton from "../AuthButton"; // 로그인/회원가입

import NavBar from "./NavBar";
import SearchBar from "../SearchBar";

function Header() {
  return (
    <header>
      <div className="mb-5 mx-auto max-w-[1200px] self-stretch px-8 justify-between items-center flex">
        <Link to="/">
          <img className="w-[200px]" src="../../public/popping.svg" alt="POPPING 로고"></img>
        </Link>
        <div className="self-stretch justify-center items-center gap-2 flex">
          <CreatePopup />
          <AuthButton />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] self-stretch px-8 justify-between items-center flex">
        <NavBar />
        <SearchBar />
      </div>
    </header>
  );
}

export default Header;
