import useAuth from "../context/useAuth"; // 로그인 상태;
import { useNavigate } from "react-router-dom";
import MyPageButton from "./MyPageButton";

const AuthButton = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    alert("로그아웃되었습니다.");
    navigate("/");
  };

  return (
    <div>
      {auth.isLoggedIn ? (
        <>
          <MyPageButton auth={auth} />
          <button onClick={handleLogout}> 로그아웃</button>
        </>
      ) : (
        <button onClick={handleLogin}>로그인 / 회원가입하기</button>
      )}
    </div>
  );
};

export default AuthButton;
