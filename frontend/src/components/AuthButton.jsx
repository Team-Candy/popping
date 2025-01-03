import useAuth from "../context/useAuth"; // 로그인 상태;
import { useNavigate } from "react-router-dom";

const AuthButton = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    alert("로그아웃되었습니다.");
  };

  return (
    <div>
      {auth.isLoggedIn ? (
        <>
          <button>{auth.username}님</button>
          <button onClick={handleLogout}> 로그아웃</button>
        </>
      ) : (
        <button onClick={handleLogin}>로그인 / 회원가입하기</button>
      )}
    </div>
  );
};

export default AuthButton;
