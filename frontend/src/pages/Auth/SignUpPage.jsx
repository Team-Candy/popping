import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();

  const joinEmail = () => {
    navigate("/join/email");
  };

  return (
    <div>
      <h1>회원가입</h1>
      <button onClick={() => joinEmail()}>이메일로 가입하기</button>
      <br />
      <br />
      <button style={{ color: "red" }}>카카오로 가입하기</button>
    </div>
  );
};

export default SignUpPage;
