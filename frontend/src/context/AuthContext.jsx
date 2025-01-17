// 로그인 상태 관리 - 전역
import PropTypes from "prop-types";
import { createContext, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // 렌더링이 완료되기 전 로그인 상태 불러오기
  const storedToken = sessionStorage.getItem("authToken");
  const storedUsername = sessionStorage.getItem("username");

  // 세션 스토리지에 로그인 정보가 있으면 바로 상태 설정
  const [auth, setAuth] = useState({
    isLoggedIn: storedToken && storedUsername ? true : false,
    username: storedUsername || "",
  });

  const login = (username, token, userId) => {
    setAuth({ isLoggedIn: true, username });

    sessionStorage.setItem("username", username); // 사용자 이름 저장
    sessionStorage.setItem("authToken", token); // JWT 토큰 저장
    sessionStorage.setItem("userId", userId); // 사용자 고유 ID 저장

    // 디버깅
    console.log("login, auth.isLoggedIn: ", auth.isLoggedIn);
    console.log("login, authToken: ", sessionStorage.getItem("authToken"));
    console.log("login, username: ", sessionStorage.getItem("username"));
    console.log("login, userId: ", sessionStorage.getItem("userId"));
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, username: "" });
    sessionStorage.clear(); // sessionStorage 비우기
    // sessionStorage.removeItem("authToken"); // 토큰 제거
    // sessionStorage.removeItem("username"); // 사용자 이름 제거

    // 디버깅
    // console.log("logout, authToken: ", localStorage.getItem("authToken"));
    // console.log("logout, username: ", localStorage.getItem("username"));
  };
  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
  // children으로 감싼 컴포넌트들에게 로그인 상태를 전달하는 역할
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Default Export (하나의 기본값) import AuthProvider
export { AuthProvider };
export default AuthContext;

// Named Export(여러값) import {AuthProvider}
// export const AuthProvider =

// <AuthProvider>
// <App /> {/* 이 App 컴포넌트는 AuthProvider의 children으로 전달됨 */}
// </AuthProvider>
