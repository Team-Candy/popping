import { useNavigate } from "react-router-dom";

const CreatePopup = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("registerPopup");
  };

  return (
    <>
      <button onClick={handleClick}>팝업 올리기</button>
    </>
  );
};

export default CreatePopup;
