import useAuth from "../context/useAuth"; // 로그인 상태;
import { useNavigate } from "react-router-dom";
import MyPageButton from "./MyPageButton";

const AuthButton = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div>
      {auth.isLoggedIn ? (
        <div>
          <MyPageButton auth={auth} />
        </div>
      ) : (
        <div className="px-2 py-1 bg-[#c8a0c8] rounded-full justify-center items-center gap-2 flex  hover:scale-105 hover:shadow-sm transition-all">
          <button className="text-center text-white text-xs font-semibold font-['Pretendard'] leading-normal" onClick={handleLogin}>
            로그인 / 회원가입하기
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
