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
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CalenderPage from "./pages/CalendarPage";
import PopupDetailPage from "./pages/PopupDetailPage";
// import Home from "./pages/Home";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      {/* 공통 header */}
      <Header></Header>
      <br />

      {/* Route 정의 */}
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 기본 경로 */}
          <Route index element={<HomePage />}></Route>
          <Route path="calendar" element={<CalenderPage />}></Route>
          <Route path="map" element={<MapPage />}></Route>
          <Route path="popup/:popupId" element={<PopupDetailPage />} />
        </Route>
      </Routes>

      <br></br>
      {/* 공통 footer */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;
