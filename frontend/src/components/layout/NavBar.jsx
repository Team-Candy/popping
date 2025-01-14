import { Link } from "react-router-dom";

const NavBar = () => {
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
        <li>
          <Link to="/" style={linkStyle}>
            홈
          </Link>
        </li>
        <li>
          <Link to="/calendar" style={linkStyle}>
            달력
          </Link>
        </li>
        <li>
          <Link to="/map" style={linkStyle}>
            지도
          </Link>
        </li>
      </ul>
    </nav>
  );
};

// 링크 스타일
const linkStyle = {
  textDecoration: "none",
  color: "#007bff",
  fontWeight: "bold",
};

export default NavBar;
