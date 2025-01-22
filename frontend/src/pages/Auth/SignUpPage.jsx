import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const navigate = useNavigate();

  const joinEmail = () => {
    navigate("/join/email");
  };

  return (
    <div className="flex flex-col items-center h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">회원가입</h1>
      <button className="w-64 py-3 mb-4 bg-[#c8a0c8] text-white font-semibold rounded-lg shadow-md hover:bg-[#a15da1] transition duration-300" onClick={() => joinEmail()}>
        이메일로 가입하기
      </button>

      {/* <button style={{ color: "red" }}>카카오로 가입하기</button> */}
    </div>
  );
};

export default SignUpPage;
