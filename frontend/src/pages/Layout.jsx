import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
// import NavBar from "../components/common/NavBar";
// import SearchBar from "../components/SearchBar"; // 검색

const Layout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div className="p-8 pb-0 fixed w-full top-0 left-0 z-50 bg-white border-b-2 border-gray-300 shadow-lg">
        <Header />
      </div>

      {/* 라우팅된 콘텐츠*/}
      <div className="pt-[150px]">
        <main>
          <Outlet />
        </main>
      </div>

      <div className="w-full flex justify-center items-center py-1 mt-20">
        <Footer></Footer>
      </div>
    </div>
  );
};

export default Layout;
