import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { auth, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = () => {
    navigate("/signup");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  useEffect(() => {
    if (auth.isLoggedIn) {
      alert("이미 로그인 되어있습니다.\n프로필 페이지로 이동합니다.");
      navigate("/profile");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email == "" || password == "") {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const data = await response.json();

      alert("로그인에 성공했습니다.");

      login(data.user.name, data.token, data.user.u_id);

      navigate("/");
    } catch (err) {
      console.error("로그인 요청 중 오류 발생:", err.message);
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <h2 className="mt-10 text-center mb-6 text-2xl font-semibold">이메일로 로그인</h2>

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-100 p-8 rounded-xl shadow-lg">
        <div className="flex flex-col space-y-4">
          <input type="text" name="email" value={email} onChange={handleChange} placeholder="이메일" autoComplete="current-password" className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200" />
          <input type="password" name="password" value={password} onChange={handleChange} placeholder="비밀번호" autoComplete="current-password" className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200" />
        </div>
        <button type="submit" className="w-full py-2 mt-6 bg-[#c8a0c8] text-white font-semibold rounded-md hover:bg-[#a15da1]">
          로그인
        </button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={() => signUp()} className="text-gray-500 hover:text-gray-800 font-medium">
          회원가입
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
