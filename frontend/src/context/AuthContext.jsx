import PropTypes from "prop-types";
import { createContext, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const storedToken = sessionStorage.getItem("authToken");
  const storedUsername = sessionStorage.getItem("username");

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
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthProvider };
export default AuthContext;
