import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import PopupDetailPage from "./pages/PopupDetailPage";
import SearchResult from "./pages/SearchResultPage";

import HomePage from "./pages/home/HomePage";
import CalendarPage from "./pages/home/CalendarPage";
import MapPage from "./pages/home/MapPage";

import SignUpPage from "./pages/auth/SignUpPage";
import JoinEmailPage from "./pages/auth/JoinMailPage";
import LoginPage from "./pages/auth/LoginPage";

import { AuthProvider } from "./context/AuthContext"; // 로그인 전역 상태관리
import NotFoundPage from "./pages/notfound/NotFoundPage";

import FavoritePopupPage from "./pages/mypage/FavoritePopupPage";
import MyPopupPage from "./pages/mypage/MyPopupPage";
import ProfilePage from "./pages/mypage/ProfilePage";

import RegisterPopupPage from "./pages/RegisterPopupPage";
import PopupEditPage from "./pages/mypage/PopupEditPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Route 정의 */}
          {/* 기본 경로 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="popup/:popupId" element={<PopupDetailPage />} />
            <Route path="popup/search" element={<SearchResult />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="join/email" element={<JoinEmailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="myPopup" element={<MyPopupPage />} />
            <Route path="favoritePopup" element={<FavoritePopupPage />} />
            <Route path="registerPopup" element={<RegisterPopupPage />} />
            <Route path="popup/edit/:popupId" element={<PopupEditPage />} />
            <Route path="*" element={<NotFoundPage />} /> {/* 404페이지 - 잘못된 경로로 접근*/}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

// const routes = [
//   { path: "/", element: <Layout /> },
//   { path: "calendar", element: <CalendarPage /> },
//   { path: "map", element: <MapPage /> },
//   { path: "popup/:popupId", element: <PopupDetailPage /> },
//   { path: "popup/search", element: <SearchResult /> },
//   { path: "login", element: <LoginPage /> },
//   { path: "signup", element: <SignUpPage /> },
//   { path: "join/email", element: <JoinEmailPage /> },
//   { path: "mypage", element: <MyPage /> },
//   { path: "*", element: <NotFoundPage /> },
// ];

// <BrowserRouter>
//   <AuthProvider>
//     <Routes>
//       {routes.map((route, index) => (
//         <Route key={index} path={route.path} element={route.element} />
//       ))}
//     </Routes>
//   </AuthProvider>
// </BrowserRouter>
