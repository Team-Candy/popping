import { Link } from "react-router-dom";

import CreatePopup from "../CreatePopup";
import AuthButton from "../AuthButton";

import NavBar from "./NavBar";
import SearchBar from "../SearchBar";

function Header() {
  return (
    <header>
      <div className="mb-5 mx-auto max-w-[1200px] self-stretch px-8 justify-between items-center flex">
        <Link to="/">
          <img className="min-w-[100px] w-[200px]" src="../../public/popping.svg" alt="POPPING 로고"></img>
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
