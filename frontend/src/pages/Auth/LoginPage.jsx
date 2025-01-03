import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // login 함수 가져옴

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

  // API
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (email == "" || password == "") {
  //     return;
  //   }

  //   try {
  //     const response = await fetch("/api/auth/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email,
  //         password,
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       alert(errorData.error || "로그인 실패");
  //       return;
  //     }

  //     const data = await response.json();

  //     alert("로그인에 성공했습니다."); // 로그인 성공 메시지

  //     // 로그인 성공 후 JWT(토큰)를 세션 스토리지에 저장
  //     // 서버에서 반환한 JWT
  //     login(data.username, data.token);

  //     navigate("/");
  //   } catch (err) {
  //     console.error("로그인 요청 중 오류 발생:", err.message);
  //     alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
  //   }
  // };

  // MOCK
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email == "" || password == "") {
      return;
    }

    try {
      // 로그인 후 상태 갱신 (AuthContext의 login 호출)
      const mockUsername = "홍길동";
      login(mockUsername, "mock-token");

      alert("로그인에 성공했습니다.");

      navigate("/");
    } catch (err) {
      console.error("로그인 요청 중 오류 발생:", err.message);
      alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div>
      <h3>이메일 로그인</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex" }}>
          <input type="text" name="email" value={email} onChange={handleChange} placeholder="email" autoComplete="current-password" />
          <br />
          <input type="password" name="password" value={password} onChange={handleChange} placeholder="password" autoComplete="current-password" />
          <button type="submit">로그인</button>
        </div>
      </form>
      <br />
      <br />
      <button style={{ color: "red" }}>카카오 로그인</button>
      <br />
      <br />
      <button onClick={() => signUp()}>회원가입</button>
    </div>
  );
};

export default LoginPage;
