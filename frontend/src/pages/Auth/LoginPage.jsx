import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const navigate = useNavigate();

  const signUp = () => {
    navigate("/signup");
  };

  return (
    <div>
      <h3>이메일 로그인</h3>
      <div style={{ display: "flex" }}>
        <form>
          <input type="text" placeholder="mail" /> <br />
          <input type="password" placeholder="password" />
        </form>
        <button>로그인</button>
      </div>
      <br />
      <br />
      <button style={{ color: "red" }}>카카오 로그인</button>
      <br />
      <br />
      <button onClick={() => signUp()}>회원가입</button>
    </div>
  );
};

export default AuthPage;
