import { useState, useEffect } from "react";
import useAuth from "../../context/useAuth"; // 로그인 상태;
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, useCheckToken } from "../../utils/util";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const checkToken = useCheckToken();

  // 이름
  const [name, setName] = useState("");
  const [nameChange, setNameChange] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  // (수정) 이름 유효성 검사

  // 이메일
  const [email, setEmail] = useState(""); // 기존 이메일
  const [emailChange, setEmailChange] = useState(""); // 변경된 이메일
  const [emailEditing, setEmailEditing] = useState(false); // 이메일 수정 상태 T/F
  const [isEmailValid, setIsEmailValid] = useState(true); // 유효성
  const [emailError, setEmailError] = useState("");

  // 이메일 인증
  const [sendNumber, setSendNumber] = useState(false); // 인증번호 전송 T/F
  const [authNumber, setAuthNumber] = useState("");
  const [isAuthValid, setIsAuthValid] = useState(false);
  const [authError, setAuthError] = useState("");

  // 비밀번호
  // const [password, setPassword] = useState("");
  // const [passwordEditing, setPasswordEditing] = useState(false);

  // 개인정보 기본값 설정
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        //  API - 유저의 프로필 정보 조회
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          checkToken(response);

          throw new Error("Failed to fetch");
        }

        const data = await response.json();
        console.log("data", data);

        if (data && data.user) {
          setName(data.user.name);
          setEmail(data.user.email);
          // setPassword(data.user.password);
        } else {
          console.error("Invalid data format:", data);
        }
      } catch (err) {
        console.error("에러 발생: ", err.message);
      }
    };
    fetchUserProfile();
  }, []);

  // 회원 탈퇴
  const handleDeleteUser = async () => {
    const isConfirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (!isConfirmed) {
      return;
    }

    try {
      // API - 유저 정보 삭제
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        checkToken(response);

        throw new Error("Failed to fetch delete user");
      }

      alert("회원 탈퇴에 성공하였습니다.");
      logout();
      navigate("/");
    } catch (err) {
      console.error("오류가 발생했습니다.", err.message);
      alert("회원 탈퇴에 실패하였습니다.\n다시시도해주세요.");
    }
  };

  // API - 유저의 정보 수정
  const handleChange = async () => {
    try {
      if (nameEditing) {
        // 이름 수정
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: nameChange, email: email }),
        });

        if (!response.ok) {
          checkToken(response);

          throw new Error("Failed to fetch name change");
        }

        setName(nameChange);
        setNameEditing(false);
        sessionStorage.setItem("username", name);
      } else if (emailEditing) {
        if (!isEmailValid) {
          alert("이메일 검증 후 다시 시도해주세요.");
          return;
        }

        // 이메일 수정
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name, email: emailChange }),
        });

        if (!response.ok) {
          checkToken(response);

          throw new Error("Failed to fetch name change");
        }

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

    // 이메일 상태 업데이트
    setEmailChange(inputEmail);

    // 메일이 수정되면
    setSendNumber(false); // 인증메일 발송상태 초기화
    setAuthNumber(false);
    setIsAuthValid(false); // 인증상태 초기화
  };

  const handleEmailVerification = async () => {
    setEmailError("");

    if (!isEmailValid) {
      setEmailError("유효한 이메일을 입력해주세요.");
      return;
    }

    try {
      setSendNumber(true);

      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/signup/email-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailChange }),
      });

      if (!response.ok) {
        const data = await response.json();
        setEmailError("인증번호 발송 실패. 다시 시도해 주세요.");
        throw new Error(data.error);
      }

      // setSendNumber(true); // 인증번호 발송 성공
      // alert("인증번호가 발송되었습니다.");
    } catch (err) {
      setEmailError(err);
      console.error(err);
    }
  };

  // 인증번호 입력
  const handleAuthNumberChange = (e) => {
    const inputNumber = e.target.value;
    setAuthNumber(inputNumber);

    // input값 변경시
    setIsAuthValid(false); // 인증 초기화
    setAuthError("");
  };

  // API - 이메일 인증코드 확인
  const handleAuthSubmit = async () => {
    if (authNumber == "") {
      setAuthError("인증번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/signup/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailChange,
          code: authNumber,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // 실패시 {"error": "Invalid verification code"}
        // setAuthError("인증번호가 일치하지 않습니다.");
        setIsAuthValid(false);
        throw new Error(data.error);
      }

      setAuthError("");
      setIsAuthValid(true);
    } catch (err) {
      setAuthError(err.message);
      setIsAuthValid(false);
      console.error("error 발생: ", err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen =py-8 px-4">
      <h2 className="text-2xl font-semibold text-center mb-6">프로필 관리</h2>
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
        {/* 이름 섹션 */}
        <div className="mb-4 w-full">
          <p className="text-sm font-medium text-gray-700 mb-2">이름</p>
          <div className="flex items-center justify-between">
            {nameEditing ? (
              <div className="flex-1">
                <input
                  type="text"
                  value={nameChange}
                  placeholder="이름을 입력하세요."
                  onChange={(e) => {
                    if (e.target.value == "") {
                      setIsNameValid(false);
                    } else {
                      setIsNameValid(true);
                    }
                    setNameChange(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <p className="flex-1 text-gray-800">{name}</p>
            )}
            <div className="ml-4">
              {nameEditing ? (
                <div className="flex space-x-2">
                  <button onClick={handleChange} disabled={!isNameValid} className={`px-3 py-1 ${isNameValid ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 text-gray-500"} rounded-md`}>
                    완료
                  </button>
                  <button
                    onClick={async () => {
                      setNameEditing((prev) => !prev);
                      setIsNameValid(true);
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNameChange(name);
                    setNameEditing((prev) => !prev);
                  }}
                  className="px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-900"
                >
                  변경
                </button>
              )}
            </div>
          </div>
        </div>
        <hr className="mb-4 w-full border-gray-300" />

        {/* 이메일 섹션 */}

        <div className="mb-6">
          <p className="text-lg font-medium text-gray-700">이메일</p>
          <div className="flex justify-between items-center mt-2">
            {emailEditing ? (
              <div className="flex flex-col w-full space-y-2">
                <input type="email" placeholder="이메일 주소를 입력해주세요." value={emailChange} onChange={handleEmailChange} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
                <div className="flex space-x-2">
                  <button type="button" onClick={handleEmailVerification} disabled={sendNumber} className="w-full h-[35px] bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300">
                    인증번호 발송
                  </button>
                  <button
                    onClick={() => {
                      setEmailEditing((prev) => !prev);
                      setIsEmailValid(true);
                      setSendNumber(false);
                      setEmailError("");
                      setAuthError("");
                    }}
                    className="w-[65px] h-[35px] bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>

                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                {sendNumber && <p className="text-green-500 text-sm">인증번호가 발송되었습니다.</p>}

                {sendNumber && (
                  <div className="flex flex-col space-y-2">
                    <input type="number" placeholder="인증번호 입력" value={authNumber} onChange={handleAuthNumberChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    <button type="button" onClick={handleAuthSubmit} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                      인증
                    </button>
                    {authError && <p className="text-red-500 text-sm">{authError}</p>}
                    {isAuthValid && <p className="text-green-500 text-sm">인증번호가 일치합니다.</p>}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between w-full items-center">
                <p className="text-gray-700">{email}</p>
                <button
                  onClick={() => {
                    setEmailChange(email);
                    setIsEmailValid(false);
                    setEmailEditing(true);
                  }}
                  className="px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-900"
                >
                  변경
                </button>
              </div>
            )}
          </div>
        </div>

        <hr className="mb-4 w-full border-gray-300" />

        {/* 회원 탈퇴 */}
        <div className="w-full flex justify-end">
          <button onClick={handleDeleteUser} className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-900">
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
