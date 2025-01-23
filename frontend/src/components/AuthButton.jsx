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
        <div>
          <MyPageButton auth={auth} />
          <button onClick={handleLogout}> 로그아웃</button>
        </div>
      ) : (
        <div className="px-4 py-2 bg-[#c8a0c8] rounded-full justify-center items-center gap-2 flex">
          <button className="text-center text-white text-sm font-semibold font-['Pretendard'] leading-normal" onClick={handleLogin}>
            로그인 / 회원가입하기
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
