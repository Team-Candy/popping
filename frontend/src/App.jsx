import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import CalenderPage from "./pages/CalendarPage";
import PopupDetailPage from "./pages/PopupDetailPage";
import SearchResult from "./pages/SearchResultPage";

import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      {/* 공통 header */}
      {/* <Header></Header> */}

      {/* Route 정의 */}
      <Routes>
        {/* 기본 경로 */}
        <Route path="/" element={<Layout />}>
          {/* 홈 페이지 */}
          <Route index element={<HomePage />}></Route>
          {/* 캘린더 페이지 */}
          <Route path="calendar" element={<CalenderPage />}></Route>
          {/* 지도 페이지 */}
          <Route path="map" element={<MapPage />}></Route>
          {/* 팝업 상세 페이지 */}
          <Route path="popup/:popupId" element={<PopupDetailPage />} />
          {/* 검색 결과 페이지 */}
          <Route path="popup/search" element={<SearchResult />} />
        </Route>
      </Routes>

      {/* 공통 footer */}
      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;

// import Header from "./components/Header";
// import Footer from "./components/Footer";
// import Home from "./pages/Home";
// // import { useState } from "react";

// function App() {
//   // const [count, setCount] = useState(0);

//   return (
//     <>
//       <Header></Header>
//       <br></br>
//       <Home></Home>
//       <br></br>
//       <Footer></Footer>
//     </>
//   );
// }

// export default App;
