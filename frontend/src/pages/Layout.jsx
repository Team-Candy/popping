import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

const Layout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* 네비게이션 메뉴 */}
      <header style={{ backgroundColor: "#f8f9fa", padding: "16px", borderBottom: "1px solid #ddd" }}>
        <Header></Header>
        <br></br>
        <NavBar></NavBar>
      </header>

      {/* 라우팅된 콘텐츠(페이지별) */}
      <main style={{ flex: 1, padding: "16px" }}>
        <Outlet />
      </main>

      {/* 공통 Footer */}
      <Footer></Footer>
    </div>
  );
};

export default Layout;

// // 공통적으로 보여야 하는 메뉴 부분

// import { Outlet, Link } from "react-router-dom";

// const Layout = () => {
//   return (
//     <section>
//       <nav>
//         <ul id="menu">
//           <li>
//             <Link to="/">홈</Link>
//           </li>
//           <li>
//             <Link to="/calendar">달력</Link>
//           </li>
//           <li>
//             <Link to="/map">지도</Link>
//           </li>
//         </ul>
//       </nav>
//       <Outlet />
//     </section>
//   );
// };

// export default Layout;
