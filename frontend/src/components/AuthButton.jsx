import useAuth from "../context/useAuth";
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
        <div className="px-4 py-2 bg-[#c8a0c8] rounded-full justify-center items-center gap-2 flex  hover:bg-[#a15da1] transition-all duration-300">
          <button className="text-center text-white text-sm font-semibold font-['Pretendard'] leading-normal" onClick={handleLogin}>
            로그인 / 회원가입
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
