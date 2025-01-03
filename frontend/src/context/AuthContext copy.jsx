// 로그인 상태 관리 - 전역
import PropTypes from "prop-types";
import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    username: "",
  });

  // 컴포넌트가 마운트도리 때 세션 스토리지에서 로그인 정보를 불러옴
  useEffect(() => {
    const storedToken = sessionStorage.getItem("authToken");
    const storedUsername = sessionStorage.getItem("username");

    if (storedToken && storedUsername) {
      setAuth({ isLoggedIn: true, username: storedUsername });
    }
  }, []);

  const login = (username, token) => {
    setAuth({ isLoggedIn: true, username });

    sessionStorage.setItem("authToken", token); // JWT 토큰 저장
    sessionStorage.setItem("username", username); // 사용자 이름 저장

    // 디버깅
    console.log("login, authToken: ", sessionStorage.getItem("authToken"));
    console.log("login, username: ", sessionStorage.getItem("username"));
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, username: "" });
    sessionStorage.removeItem("authToken"); // 토큰 제거
    sessionStorage.removeItem("username"); // 사용자 이름 제거

    // 디버깅
    console.log("logout, authToken: ", localStorage.getItem("authToken"));
    console.log("logout, username: ", localStorage.getItem("username"));
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
