import { useState } from "react";

const JoinEmailPage = () => {
  const [name, setName] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);
  const [nameError, setNameError] = useState("");

  const [email, setEmail] = useState("");
  const [sendNumber, setSendNumber] = useState(false);
  const [authNumber, setAuthNumber] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);

  const handleNameChange = (e) => {
    const inputName = e.target.value;

    // 한글, 알파벳, 숫자만 허용 (특수문자 및 띄어쓰기 제외)
    const nameRegex = /^[a-zA-Z0-9가-힣]*$/;

    if (!nameRegex.test(inputName)) {
      setNameError("이름에는 특수문자나 띄어쓰기가 포함될 수 없습니다.");
      setIsNameValid(false);
    } else if (inputName.length < 2 || inputName.length > 20) {
      setNameError("이름은 2자 이상, 20자 이하로 입력해주세요.");
      setIsNameValid(false);
    } else {
      setNameError("");
      setIsNameValid(true);
    }

    setName(inputName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 추가적인 폼 제출 로직
    // navigate("/welcome");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>이메일로 회원가입하기</h2>

        <p>이름</p>
        <input type="text" placeholder="사용하실 이름을 입력해주세요." value={name} onChange={handleNameChange} style={{ borderColor: isNameValid ? "" : "red" }} />
        {!isNameValid && <p style={{ color: "red" }}>{nameError}</p>}
        {/* 이름은 2자 이상, 20자 이하로 입력하세요. */}

        <p>이메일 주소</p>
        <input type="" placeholder="이메일 주소를 입력해주세요."></input>
        <button onClick={() => setSendNumber(true)}>인증번호 발송</button>
        {/* 이미 존재하는 이메일입니다. || 인증번호가 발송되었습니다. */}
        {sendNumber && (
          <div>
            <input type="number">인증번호 입력</input>
            <button>인증</button>
            {/* 인증번호 재발송 */}
            {/* 인증번호가 일치하지 않습니다. || 인증번호가 일치합니다. */}
          </div>
        )}

        <p>비밀번호</p>
        <input type="password" placeholder="비밀번호를 입력해주세요."></input>
        {/* 비밀번호는 8자 이상, 20자 이하로 입력하세요. */}
        <br />
        <input type="password" placeholder="비밀번호를 확인합니다."></input>
        {/* 비밀번호가 일치합니다. || 비밀번호가 일치하지 않습니다 */}
      </form>
    </div>
  );
};

export default JoinEmailPage;
