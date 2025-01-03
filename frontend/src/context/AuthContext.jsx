// 로그인 상태 관리 - 전역
import PropTypes from "prop-types";
import { createContext, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    username: "",
  });

  const login = (username) => {
    setAuth({ isLoggedIn: true, username });
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, username: "" });
    localStorage.removeItem("authToken"); // 토큰 제거
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
