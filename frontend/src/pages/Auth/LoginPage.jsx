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

  // API - 로그인
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비어있으면 로그인 시도 X
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
        alert(data.error); // (수정)
        throw new Error(data.error);
      }

      const data = await response.json();

      // (수정) MOCK
      // const data = { message: "로그인 성공", token: "token1234", user: { u_id: "user.u_id", name: "user.name", email: "user.email" } };

      alert("로그인에 성공했습니다."); // 로그인 성공 메시지

      // 로그인 성공 후 JWT(토큰)를 세션 스토리지에 저장
      login(data.user.name, data.token, data.user.u_id);

      navigate("/");
    } catch (err) {
      console.error("로그인 요청 중 오류 발생:", err.message);
      alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <h2 className="text-center mb-6 text-2xl font-semibold">이메일로 로그인</h2>

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

  // return (
  //   <div>
  //     <h3>이메일 로그인</h3>
  //     <form onSubmit={handleSubmit}>
  //       <div style={{ display: "flex" }}>
  //         <input type="text" name="email" value={email} onChange={handleChange} placeholder="email" autoComplete="current-password" />
  //         <br />
  //         <input type="password" name="password" value={password} onChange={handleChange} placeholder="password" autoComplete="current-password" />
  //         <button type="submit">로그인</button>
  //       </div>
  //     </form>
  //     <br />
  //     <br />
  //     <button style={{ color: "red" }}>카카오 로그인</button>
  //     <br />
  //     <br />
  //     <button onClick={() => signUp()}>회원가입</button>
  //   </div>
  // );
};

export default LoginPage;
