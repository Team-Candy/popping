import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <nav>
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
        <div className="justify-center items-end gap-8 flex">
          {/* <div className="w-9 h-14 px-4 pb-4 border-b-2 border-black flex-col justify-start items-center inline-flex"> */}
          <button className="text-center text-black text-2s font-medium font-['Pretendard'] leading-9" onClick={() => navigate("/")}>
            홈
          </button>
          {/* </div> */}
          {/* <div className="w-9 h-14 px-4 pb-4 flex-col justify-start items-center inline-flex"> */}
          <button className="text-center text-black text-2s font-medium font-['Pretendard'] leading-9" onClick={() => navigate("/calendar")}>
            달력
          </button>
          {/* </div> */}
          {/* <div className="w-9 h-14 px-4 pb-4 flex-col justify-start items-center inline-flex"> */}
          <button className="text-center text-black text-2s font-medium font-['Pretendard'] leading-9" onClick={() => navigate("/map")}>
            지도
          </button>
          {/* </div> */}
        </div>
      </ul>
    </nav>
  );
};

export default NavBar;
