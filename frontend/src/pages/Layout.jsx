import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import NavBar from "../components/common/NavBar";

const Layout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* 공통 Header */}
      <header style={{ backgroundColor: "#f8f9fa", padding: "16px 16px 24px", borderBottom: "1px solid #ddd" }}>
        <Header />
      </header>

      <nav aria-label="Main navigation">
        <NavBar />
      </nav>

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

// 로딩 처리
// import { Suspense } from "react";

// <main style={{ flex: 1, padding: "16px" }}>
//   <Suspense fallback={<div>Loading...</div>}>
//     <Outlet />
//   </Suspense>
// </main>
