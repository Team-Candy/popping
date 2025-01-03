import { useState, useEffect } from "react";
const ProfilePage = () => {
  const [user, setUser] = useState({});

  // // API - 유저 정보 요청(이름, 이메일)

  useEffect(() => {
    const data = { name: "홍길동", email: "hong@naver.com" };
    setUser(data);
  }, []);

  // // handle
  // // API 요청
  // // 이름 변경 요청(유효성검사 필요)
  // // 이메일 변경 요청(유효성검사, 인증 필요)
  // //비밀번호(유효성검사, 재확인 필요)
  // // 회원탈퇴

  const titleStyle = { fontWeight: "bold", fontSize: 19 };

  return (
    <div>
      <h2 style={{ color: "red" }}>프로필</h2>
      <hr />
      <div>
        <p style={titleStyle}>이름</p>
        <div style={{ display: "flex", width: 250, justifyContent: "space-between" }}>
          <p>{user.name}</p>
          <button>변경</button>
        </div>
      </div>
      <hr />
      <div>
        <p style={titleStyle}>이메일</p>
        <div style={{ display: "flex", width: 250, justifyContent: "space-between" }}>
          <p>{user.email}</p>
          <button>변경</button>
        </div>
      </div>
      <hr />
      <div>
        <div style={{ display: "flex", width: 250, justifyContent: "space-between" }}>
          <p style={titleStyle}>비밀번호</p>
          <button>변경</button>
        </div>
      </div>
      <hr />
      <div>
        <div style={{ display: "flex", width: 250, justifyContent: "space-between" }}>
          <p style={titleStyle}>회원탈퇴</p>
          <button>변경</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
