import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryFromURL = queryParams.get("query");

    if (!location.pathname.startsWith("/popup/search")) {
      setQuery("");
    } else {
      setQuery(queryFromURL || "");
    }
  }, [location]);

  const handleSearch = async () => {
    navigate(`/popup/search?query=${query}`);
  };

  return (
    <>
      <div className="w-[300px] flex-col justify-center items-center inline-flex">
        <div className="self-stretch h-9 px-5 bg-[#f0f0f0] rounded-full justify-between items-center inline-flex overflow-hidden">
          <div className="w-[272px] self-stretch justify-start items-center flex">
            <input
              className="text-sm bg-[#f0f0f0] font-['Pretendard'] leading-normal w-full outline-none"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="팝업스토어 이름, 지역"
            ></input>
          </div>
          <div className="text-sm hover:scale-105 transition-all duration-300 w-10 justify-center flex">
            <button className="" onClick={handleSearch}>
              검색
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
