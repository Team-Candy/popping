// 공통적으로 보여야 하는 메뉴 부분

import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <section>
      <nav>
        <ul id="menu">
          <li>
            <Link to="/">홈</Link>
          </li>
          <li>
            <Link to="/calendar">달력</Link>
          </li>
          <li>
            <Link to="/map">지도</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </section>
  );
};

export default Layout;
