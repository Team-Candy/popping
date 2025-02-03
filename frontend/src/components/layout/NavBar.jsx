import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const [clicked, setClicked] = useState();

  useEffect(() => {
    const updateClicked = () => {
      const currentURL = window.location.pathname;
      const pathSegment = currentURL.split("/").pop();
      setClicked(pathSegment === "" ? "home" : pathSegment);
    };

    updateClicked();
  }, [window.location.pathname]);

  return (
    <nav aria-label="Main navigation">
      <ul
        id="menu"
        style={{
          display: "flex",
          justifyContent: "space-around",
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        <div className="h-14 justify-center items-end gap-8 flex">
          <button
            className={`text-center text-black text-2s font-medium font-['Pretendard'] leading-9 ${clicked === "home" ? "border-b-2 border-black" : ""}`}
            onClick={() => {
              setClicked("home");
              navigate("/");
            }}
          >
            홈
          </button>
          <button
            className={`text-center text-black text-2s font-medium font-['Pretendard'] leading-9 ${clicked === "calendar" ? "border-b-2 border-black" : ""}`}
            onClick={() => {
              setClicked("calendar");
              navigate("/calendar");
            }}
          >
            달력
          </button>
          <button
            className={`text-center text-black text-2s font-medium font-['Pretendard'] leading-9 ${clicked === "map" ? "border-b-2 border-black" : ""}`}
            onClick={() => {
              setClicked("map");
              navigate("/map");
            }}
          >
            지도
          </button>
        </div>
      </ul>
    </nav>
  );
};

export default NavBar;
