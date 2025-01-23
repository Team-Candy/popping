import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinEmailPage = () => {
  const navigate = useNavigate();

  // 이름
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isNameValid, setIsNameValid] = useState(false);

  // 이메일
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [sendNumber, setSendNumber] = useState(false);

  // 이메일 인증
  const [authNumber, setAuthNumber] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthValid, setIsAuthValid] = useState(false);

  // 패스워드
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // 패스워드 확인
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);

  // 이용약관
  const [allChecked, setAllChecked] = useState(false);
  const [isOver14, setIsOver14] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  // MOCK
  // const [mockAuthCode, setMockAuthCode] = useState("");

  // CSS
  const buttonStyle = {
    enabled: {
      backgroundColor: "#007bff", // 활성화된 버튼 색상
      color: "#fff", // 활성화된 버튼 텍스트 색상
      cursor: "pointer",
      border: "1px solid #007bff",
    },
    disabled: {
      backgroundColor: "#ccc", // 비활성화된 버튼 색상
      color: "#666", // 비활성화된 버튼 텍스트 색상
      cursor: "not-allowed",
      border: "1px solid #aaa",
    },
  };

  // 이름
  const handleNameChange = (e) => {
    const inputName = e.target.value;
    const nameRegex = /^[a-zA-Z가-힣]*$/; // 한글, 알파벳만 허용

    setName(inputName);

    // 지연처리 필요
    if (!nameRegex.test(inputName)) {
      setNameError("한글, 알파벳만 허용합니다.");
      setIsNameValid(false);
    } else if (inputName.length < 2 || inputName.length > 20) {
      setNameError("이름은 2자 이상, 20자 이하로 입력해주세요.");
      setIsNameValid(false);
    } else {
      setNameError("");
      setIsNameValid(true);
    }
  };

  // 이메일
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(inputEmail)) {
      setEmailError("유효한 이메일 주소를 입력해주세요.");
      setIsEmailValid(false);
    } else {
      setEmailError("");
      setIsEmailValid(true);
    }

    setEmail(inputEmail); // 이메일 상태 업데이트

    // 메일이 수정되면
    setSendNumber(false); // 인증메일 발송상태 초기화
    setAuthNumber(false);
    setIsAuthValid(false); // 인증상태 초기화
  };

  // API - 이메일 인증코드 발송
  const handleEmailVerification = async () => {
    if (!isEmailValid) {
      setEmailError("유효한 이메일을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/signup/email-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setEmailError(data.error || "오류가 발생했습니다.");
        return;
      }

      setSendNumber(true); // 인증번호 발송 성공
      // alert("인증번호가 발송되었습니다.");
    } catch (err) {
      setEmailError("네트워크 오류가 발생했습니다.");
      console.error(err);
    }
  };

  // 사용자 인증번호 입력
  const handleAuthNumberChange = (e) => {
    const inputNumber = e.target.value;
    setAuthNumber(inputNumber);

    // input값 변경시 인증 초기화
    setIsAuthValid(false);
    setAuthError("");
  };

  // API - 이메일 인증코드 확인
  const handleAuthSubmit = async () => {
    if (authNumber == "") {
      setAuthError("인증번호를 입력해주세요.");
      return;
    }

    try {
      console.log("email: ", email);
      console.log("code: ", authNumber);

      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/signup/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: authNumber,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // setAuthError("인증번호가 일치하지 않습니다.");
        setAuthError(data.error);
        setIsAuthValid(false);
        return;
      }

      setAuthError("");
      setIsAuthValid(true);
    } catch (err) {
      setAuthError("네트워크 오류가 발생했습니다.");
      setIsAuthValid(false);
      console.error(err);
    }
  };

  // 비밀번호
  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;

    setPassword(inputPassword);

    const passwordRegex = /^[A-Za-z\d!@#$%^&*()]{8,}$/;

    if (!passwordRegex.test(inputPassword)) {
      setPasswordError("비밀번호는 8자 이상이어야 하며, 대문자, 소문자, 숫자, 특수문자(!@#$%^&*())를 포함할 수 있습니다.");
      setIsPasswordValid(false);
    } else {
      setPasswordError("");
      setIsPasswordValid(true);
    }
  };

  // 비밀번호 확인
  const handleConfirmPasswordChange = (e) => {
    const inputPassword = e.target.value;
    setConfirmPassword(inputPassword);

    if (inputPassword === password) {
      setConfirmPasswordError("");
      setIsConfirmPasswordValid(true);
    } else {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      setIsConfirmPasswordValid(false);
    }
  };

  const handleAllCheck = () => {
    const newState = !allChecked;
    setAllChecked(newState);
    setIsOver14(newState);
    setTermsChecked(newState);
  };

  // API - 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("회원가입정보");
    console.log("name:", name, "isNameValid:", isNameValid, "email:", email, "isEmailValid:", isEmailValid);
    console.log("isAuthValid:", isAuthValid);
    console.log("password:", password, "isPasswordValid:", isPasswordValid);
    console.log("confirmPassword:", confirmPassword, "isConfirmPasswordValid:", isConfirmPasswordValid);

    // if (!isNameValid || !isEmailValid || !isAuthValid || !isPasswordValid || !isConfirmPasswordValid) {
    //   alert("모든 필드를 올바르게 입력해주세요.");
    //   return;
    // }

    // API - 회원가입 후 사용자 DB 등록
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/signup/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      if (!response.ok) {
        // const data = await response.json();
        // console.error("Error: ", data.error);
        alert("회원가입에 실패했습니다.");
        alert(data.error);
        navigate("/join/email");
        return;
      }

      const data = await response.json();
      console.log("Success:", data.message);

      alert("회원가입이 성공적으로 완료되었습니다!\n로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (err) {
      console.error("네트워크 또는 서버 오류: ", err);
      alert("서버 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>이메일로 회원가입하기</h2>
        {/* -------------------------------------------------------- */}
        <h3>이름</h3>
        <input type="text" placeholder="사용하실 이름을 입력해주세요." value={name} onChange={handleNameChange} style={{ borderColor: nameError ? "red" : "" }} />
        {nameError && <p style={{ color: "red" }}>{nameError}</p>}
        {/* -------------------------------------------------------- */}
        <h3>이메일 주소</h3>
        <input type="email" placeholder="이메일 주소를 입력해주세요." value={email} onChange={handleEmailChange} style={{ borderColor: emailError ? "red" : "" }} />
        <button type="button" onClick={handleEmailVerification} disabled={sendNumber}>
          인증번호 발송
        </button>
        {emailError && <p style={{ color: "red" }}>{emailError}</p>} {/* 이미 존재하는 이메일입니다.*/}
        {sendNumber && <p style={{ color: "green" }}>인증번호가 발송되었습니다.</p>}
        {sendNumber && (
          <div>
            <input type="number" placeholder="인증번호 입력" value={authNumber} onChange={handleAuthNumberChange} />
            <button type="button" onClick={handleAuthSubmit}>
              인증
            </button>
            {authError && <p style={{ color: "red" }}>{authError}</p>} {/* 인증 오류 메시지 */}
            {isAuthValid && <p style={{ color: "green" }}>인증번호가 일치합니다.</p>} {/* 인증 성공 메시지 */}
          </div>
        )}
        {/* -------------------------------------------------------- */}
        <h3>비밀번호</h3>
        <input type="password" value={password} onChange={handlePasswordChange} style={{ borderColor: passwordError ? "red" : "" }} placeholder="비밀번호를 입력해주세요."></input>
        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
        <br />
        <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} style={{ borderColor: confirmPasswordError ? "red" : "" }} placeholder="비밀번호를 확인합니다."></input>
        {confirmPasswordError && <p style={{ color: "red" }}>{confirmPasswordError}</p>}
        {/* -------------------------------------------------------- */}
        <h3>이용 약관</h3>
        <div>
          <label>
            <input type="checkbox" checked={allChecked} onChange={handleAllCheck} />
            전체동의
          </label>
        </div>
        <div>
          <input type="checkbox" checked={isOver14} onChange={(e) => setIsOver14(e.target.checked)} />
          [필수] 만 14세 이상입니다.
        </div>
        <div>
          <input type="checkbox" checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />
          [필수] 이용약관 동의보기
        </div>
        {/* -------------------------------------------------------- */}
        <button type="submit" disabled={!isAuthValid || !isConfirmPasswordValid || !isOver14 || !termsChecked} style={!isAuthValid || !isConfirmPasswordValid || !isOver14 || !termsChecked ? buttonStyle.disabled : buttonStyle.enabled}>
          가입하기
        </button>
      </form>
    </div>
  );
};

export default JoinEmailPage;
