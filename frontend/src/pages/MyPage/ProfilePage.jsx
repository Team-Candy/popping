import { useState, useEffect } from "react";
import useAuth from "../../context/useAuth"; // 로그인 상태;
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate;
  const { logout } = useAuth();

  const [name, setName] = useState("");
  const [nameChange, setNameChange] = useState("");
  const [nameEditing, setNameEditing] = useState(false);

  const [email, setEmail] = useState("");
  const [emailChange, setEmailChange] = useState("");
  const [emailEditing, setEmailEditing] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [sendNumber, setSendNumber] = useState(false);

  // 이메일 인증
  const [authNumber, setAuthNumber] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthValid, setIsAuthValid] = useState(false);

  // MOCK
  const [mockAuthCode, setMockAuthCode] = useState("");

  const [password, setPassword] = useState("");
  const [passwordEditing, setPasswordEditing] = useState(false);

  useEffect(() => {
    //  API - 유저 프로필 요청
    const fetchUserProfile = async () => {
      try {
        // (수정) API
        // const response = await fetch(`/api/users/${sessionStorage.getItem("userId")}/profile`);

        // if (!response.ok) {
        //   throw new Error("Failed to fetch");
        // }

        // const data = await response.json();

        // (수정) MOCK
        const data = {
          user: {
            // u_id: "1234",
            name: "홍길동",
            email: "hong@naver.com",
            password: "12345",
            // nickname: user.nickname,
            // profileImage: user.profileImage,
            // introduction: user.introduction,
            // created_at: user.created_at,
          },
        };

        if (data && data.user) {
          setName(data.user.name);
          setNameChange(data.user.name);
          setEmail(data.user.email);
          setPassword(data.user.password);
        } else {
          console.error("Invalid data format:", data);
        }
      } catch (err) {
        console.error("에러 발생: ", err.message);
      }
    };
    fetchUserProfile();
  }, []);

  // (수정)
  // handle
  // API 요청
  // 이름 변경 요청(유효성검사 필요)
  // 이메일 변경 요청(유효성검사, 인증 필요)
  //비밀번호(유효성검사, 재확인 필요)
  // 회원탈퇴

  const titleStyle = { fontWeight: "bold", fontSize: 19 };

  const handleDeleteUser = async () => {
    const isConfirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${sessionStorage.getItem("userId")}`, {
        method: "DELETE",
        header: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      alert("회원 탈퇴에 성공하였습니다.");
      logout();
      navigate("/");
    } catch (err) {
      console.error("오류가 발생했습니다.", err.message);
      alert("회원 탈퇴에 실패하였습니다.\n다시시도해주세요.");
    }
  };

  const handleChange = async () => {
    try {
      if (nameEditing) {
        // 이름 수정
        // (수정) API
        // const response = await fetch(`/api/users/${sessionStorage.getItem("userId")}/profile`, {
        //   method: "PUT",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ name: nameChange, email: email }),
        // });

        // if (!response.ok) {
        //   throw new Error("Failed to fetch name change");
        // }

        setName(nameChange);
        setNameEditing(false);
      } else if (emailEditing) {
        // 이메일 수정
        if (!isEmailValid) {
          alert("이메일 검증 후 다시 시도해주세요.");
          return;
        }

        // API
        // const response = await fetch(`/api/users/${sessionStorage.getItem("userId")}/profile`, {
        //   method: "PUT",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ name: name, email: emailChange }),
        // });

        // if (!response.ok) {
        //   throw new Error("Failed to fetch name change");
        // }

        setEmail(emailChange);
        setEmailEditing(false);

        setIsEmailValid(false);
        setSendNumber(false);
        setEmailError("");
      }
    } catch (err) {
      console.error("에러 발생: ", err.message);
      alert("변경에 실패하였습니다.\n다시시도 해주세요.");
      navigate("/profile");
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

    setEmailChange(inputEmail); // 이메일 상태 업데이트

    // 메일이 수정되면
    setSendNumber(false); // 인증메일 발송상태 초기화
    setAuthNumber(false);
    setIsAuthValid(false); // 인증상태 초기화
  };

  // API - 인증번호 발송
  // const handleEmailVerification = async () => {
  //   if (!isEmailValid) {
  //     setEmailError("유효한 이메일을 입력해주세요.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch("/api/signup/email-code", {
  //       method: "POST",
  //       headers: {
  //         "Content-Types": "application/json",
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     if (!response.ok) {
  //       const data = await response.json();
  //       setEmailError(data.message || "오류가 발생했습니다.");
  //       return;
  //     }

  //     setSendNumber(true); // 인증번호 발송 성공
  //     // alert("인증번호가 발송되었습니다.");
  //   } catch (err) {
  //     setEmailError("네트워크 오류가 발생했습니다.");
  //     console.error(err);
  //   }
  // };

  // MOCK - 이메일 인증번호 발송
  const handleEmailVerification = () => {
    if (!isEmailValid) return;

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 랜덤 숫자
    setMockAuthCode(generatedCode);
    setSendNumber(true);
    setEmailError("");
    alert(`인증번호: ${generatedCode}`); // 인증번호를 사용자에게 표시 (실제 환경에서는 이메일 발송)
  };

  // 인증번호 입력
  const handleAuthNumberChange = (e) => {
    const inputNumber = e.target.value;
    setAuthNumber(inputNumber);

    // input값 변경시
    setIsAuthValid(false); // 인증 초기화
    setAuthError("");
  };

  // API - 인증번호 확인
  // const handleAuthSubmit = async () => {
  //   if (authNumber == "") {
  //     setAuthError("인증번호를 입력해주세요.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch("/api/signup/verify-code", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email,
  //         code: authNumber,
  //       }),
  //     });
  //     // query {"email":"user@example.com","code": "123456"}

  //     if (!response.ok) {
  //       const data = await response.json();
  //       // 실패시 {"error": "Invalid verification code"}
  //       setAuthError(data.error || "인증번호가 일치하지 않습니다.");
  //       setIsAuthValid(false);
  //       return;
  //     }

  //     const data = await response.json();
  //     // 성공시{"message": "Email verified successfully"}
  //     setAuthError("");
  //     setIsAuthValid(true);
  //   } catch (err) {
  //     setAuthError("네트워크 오류가 발생했습니다.");
  //     setIsAuthValid(false);
  //     console.error(err);
  //   }
  // };

  // MOCK - 인증번호 검증
  const handleAuthSubmit = () => {
    if (!authNumber) {
      setAuthError("인증번호를 입력해주세요.");
      return;
    }

    if (authNumber && authNumber === mockAuthCode) {
      setAuthError("");
      setIsAuthValid(true);
      // alert("인증이 완료되었습니다.");
    } else {
      setAuthError("인증번호가 일치하지 않습니다.");
      setIsAuthValid(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: "red" }}>프로필</h2>
      <hr />
      <div>
        <p style={titleStyle}>이름</p>
        <div style={{ display: "flex", width: 250, justifyContent: "space-between" }}>
          {nameEditing ? (
            <div>
              <input type="text" value={nameChange} placeholder="이름을 입력하세요." onChange={(e) => setNameChange(e.target.value)} />
            </div>
          ) : (
            <p>{name}</p>
          )}

          {nameEditing ? (
            <div>
              <button onClick={handleChange}>완료</button>
              <button onClick={() => setNameEditing((prev) => !prev)}>취소</button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNameChange(name);
                setNameEditing((prev) => !prev);
              }}
            >
              변경
            </button>
          )}
        </div>
      </div>
      <hr />
      <div>
        <p style={titleStyle}>이메일</p>
        <div style={{ display: "flex", width: 250, justifyContent: "space-between" }}>
          {emailEditing ? (
            <div>
              <input type="email" placeholder="이메일 주소를 입력해주세요." value={emailChange} onChange={handleEmailChange} style={{ borderColor: emailError ? "red" : "" }} />
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
            </div>
          ) : (
            <p>{email}</p>
          )}

          {emailEditing ? (
            <div>
              <button onClick={handleChange}>완료</button>
              <button onClick={() => setEmailEditing((prev) => !prev)}>취소</button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEmailChange(email);
                setEmailEditing((prev) => !prev);
              }}
            >
              변경
            </button>
          )}
        </div>
      </div>
      <hr />
      <div>
        <div style={{ display: "flex", width: 250, justifyContent: "space-between" }}>
          <p style={titleStyle}>비밀번호</p>
          {/* {passwordEditing ? (
            <div>
              <button onClick={handlePasswordChange}>완료</button>
              <button onClick={() => setPasswordEditing((prev) => !prev)}>취소</button>
            </div>
          ) : (
            <button onClick={() => setPasswordEditing((prev) => !prev)}>변경</button>
          )} */}
        </div>
      </div>
      <hr />
      <div>
        <div style={{ display: "flex", width: 250, justifyContent: "space-between" }}>
          <button onClick={handleDeleteUser}>회원 탈퇴</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
