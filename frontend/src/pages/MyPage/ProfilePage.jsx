import { useState, useEffect } from "react";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../utils/util";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // 이름
  const [name, setName] = useState("");
  const [nameChange, setNameChange] = useState("");
  const [nameEditing, setNameEditing] = useState(false);

  // 이름 유효성 검사
  const [nameError, setNameError] = useState("");
  const [isNameValid, setIsNameValid] = useState(false);

  // 이메일
  const [email, setEmail] = useState("");
  const [emailChange, setEmailChange] = useState("");
  const [emailEditing, setEmailEditing] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailError, setEmailError] = useState("");

  // 이메일 인증
  const [sendNumber, setSendNumber] = useState(false);
  const [authNumber, setAuthNumber] = useState("");
  const [isAuthValid, setIsAuthValid] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });
<<<<<<< HEAD
        // const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/profile`);
=======
>>>>>>> 332d25afe2b0e3fe93e4a9ca1e49217fc4b38ff3

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();
        console.log("data", data);

        if (data && data.user) {
          setName(data.user.name);
          setEmail(data.user.email);
        } else {
          console.error("Invalid data format:", data);
        }
      } catch (err) {
        console.error("에러 발생: ", err.message);
      }
    };
    fetchUserProfile();
  }, []);

  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (reload) {
      window.location.reload();
    }
  }, [reload]);

  const handleDeleteUser = async () => {
    const isConfirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
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

  const handleChange = async () => {
    try {
      if (isNameValid) {
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: nameChange, email: email }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch name change");
        }

        setName(nameChange);
        setNameEditing(false);
        setIsNameValid(false);
        setNameError("");

        sessionStorage.setItem("username", nameChange);
        setReload(true);
      } else if (emailEditing) {
        if (!isEmailValid) {
          alert("이메일 검증 후 다시 시도해주세요.");
          return;
        }

        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: name, email: emailChange }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch name change");
        }

        setEmail(emailChange);
        setEmailEditing(false);
        setIsEmailValid(true);
        setSendNumber(false);
        setEmailError("");
      }
    } catch (err) {
      console.error("에러 발생: ", err.message);
      alert("변경에 실패하였습니다.\n다시시도 해주세요.");
      navigate("/profile");
    }
  };

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

    setEmailChange(inputEmail);

    setSendNumber(false);
    setAuthNumber(false);
    setIsAuthValid(false);
  };

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
        body: JSON.stringify({ email: emailChange }),
      });

      if (!response.ok) {
        const data = await response.json();
        setEmailError(data.error || "오류가 발생했습니다.");
        return;
      }

      setSendNumber(true);
    } catch (err) {
      setEmailError("네트워크 오류가 발생했습니다.");
      console.error(err);
    }
  };

  const handleAuthNumberChange = (e) => {
    const inputNumber = e.target.value;
    setAuthNumber(inputNumber);

    setIsAuthValid(false);
    setAuthError("");
  };

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
        setAuthError("인증번호가 일치하지 않습니다.");
        setIsAuthValid(false);
        throw new Error(data.error);
      }

      setAuthError("");
      setIsAuthValid(true);
    } catch (err) {
      setAuthError("네트워크 오류가 발생했습니다.");
      setIsAuthValid(false);
      console.error("error 발생: ", err);
    }
  };

  const handleNameChange = (e) => {
    const inputName = e.target.value;
    const nameRegex = /^[a-zA-Z가-힣]*$/;

    setNameChange(inputName);

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

  const cancelChangeEmail = () => {
    setEmailEditing(false);
    setIsEmailValid(true);
    setSendNumber(false);
    setEmailError("");
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <h2 className="text-center mb-6 text-2xl font-semibold">프로필</h2>
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div>
          <p className="block mb-1 text-gray-600 font-medium">이름</p>
          <div className="flex justify-between items-center">
            {nameEditing ? (
              <div className="flex-grow">
                <input
                  type="text"
                  value={nameChange}
                  placeholder="이름을 입력하세요."
                  onChange={(e) => {
                    handleNameChange(e);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
            ) : (
              <p className="text-gray-800 p-2">{name}</p>
            )}

            {nameEditing ? (
              <div className="ml-4 space-x-2">
                <button onClick={handleChange} disabled={!isNameValid} className={`px-4 py-2 bg-[#c8a0c8] text-white rounded-md ${!isNameValid ? "bg-gray-300 cursor-not-allowed" : "bg-[#c8a0c8] hover:bg-[#a15da1]"}`}>
                  완료
                </button>
                <button
                  onClick={() => {
                    setNameEditing(false);
                    setNameError("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                className="px-4 py-2 bg-[#c8a0c8] text-white rounded-md hover:bg-[#a15da1]"
                onClick={() => {
                  setNameChange(name);
                  setNameEditing((prev) => !prev);
                }}
              >
                변경
              </button>
            )}
          </div>
          {nameError && <p className="ml-1 mt-1 text-sm text-red-500">{nameError}</p>}
        </div>

        <div>
          <p className="block mb-1 text-gray-600 font-medium">이메일</p>
          <div>
            {emailEditing ? (
              <div>
                <div className="flex justify-between">
                  <div className="flex-grow">
                    <input type="email" placeholder="이메일 주소를 입력해주세요." value={emailChange} onChange={handleEmailChange} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-pink-200"}`} />
                  </div>
                  <div className="ml-4 space-x-2">
                    <button onClick={handleChange} disabled={!isAuthValid} className={`px-4 py-2 bg-[#c8a0c8] text-white rounded-md  ${!isAuthValid ? "bg-gray-300 cursor-not-allowed" : "bg-[#c8a0c8] hover:bg-[#a15da1]"}`}>
                      완료
                    </button>
                    <button onClick={cancelChangeEmail} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                      취소
                    </button>
                  </div>
                </div>
                {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
                {sendNumber && <p className="mt-2 text-sm text-green-500">인증번호가 발송되었습니다.</p>}
                <button type="button" onClick={handleEmailVerification} disabled={sendNumber} className={`mt-2 px-4 py-2 rounded-md text-white font-medium ${sendNumber ? "bg-gray-300 cursor-not-allowed" : "bg-[#c8a0c8] hover:bg-[#a15da1]"}`}>
                  인증번호 발송
                </button>
                {sendNumber && (
                  <div className="mt-4 space-y-2">
                    <input type="number" placeholder="인증번호 입력" value={authNumber} onChange={handleAuthNumberChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200" />
                    <button type="button" onClick={handleAuthSubmit} className="px-4 py-2 rounded-md bg-[#c8a0c8] text-white font-medium hover:bg-[#a15da1]">
                      인증
                    </button>
                    {authError && <p className="mt-1 text-sm text-red-500">{authError}</p>}
                    {isAuthValid && <p className="mt-1 text-sm text-green-500">인증번호가 일치합니다.</p>}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between">
                <p className="p-2">{email}</p>

                <button
                  onClick={() => {
                    setEmailChange(email);
                    setEmailEditing((prev) => !prev);
                  }}
                  className="px-4 py-2 bg-[#c8a0c8] text-white rounded-md hover:bg-[#a15da1]"
                >
                  변경
                </button>
              </div>
            )}

            {emailEditing ? <div></div> : <div></div>}
          </div>
        </div>
      </div>
      <hr />

      <div className="mt-10">
        <div className="px-6 py-2 bg-gray-300 text-white rounded-md hover:bg-gray-400">
          <button onClick={handleDeleteUser}>회원 탈퇴</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
