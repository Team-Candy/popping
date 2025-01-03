import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const navigate = useNavigate();

  const login = () => {
    navigate("/login");
  };

  return (
    <>
      <button onClick={() => login()}>로그인 / 회원가입</button>
    </>
  );
};

export default AuthForm;
