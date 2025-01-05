import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const CreatePopup = () => {
  const { auth } = useAuth(); // 로그인 상태 가져오기
  const navigate = useNavigate();

  const handleClick = () => {
    if (!auth.isLoggedIn) {
      alert("로그인된 사용자만 팝업을 올릴 수 있습니다.\n로그인 페이지로 이동합니다.");
      navigate("login");
      return;
    }

    navigate("registerPopup");
  };

  return (
    <>
      <button onClick={handleClick}>팝업 올리기</button>
    </>
  );
};

export default CreatePopup;
