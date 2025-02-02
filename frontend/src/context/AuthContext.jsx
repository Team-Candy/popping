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

    sessionStorage.setItem("username", username);
    sessionStorage.setItem("authToken", token);
    sessionStorage.setItem("userId", userId);
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, username: "" });
    sessionStorage.clear();
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
