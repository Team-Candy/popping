import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/util";

const PopupList = () => {
  // {state} ->  onGoing, scheduled, completed

  const [popups, setPopups] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserPopup = async () => {
    setError(null);

    // 현재 유저 아이디
    const userId = sessionStorage.getItem("userId");

    try {
      // (수정) API - 유저가 작성한 게시글 조회
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${userId}/stores`);

      if (!response.ok) {
        const data = await response.json();
        setPopups([]);
        setError("작성된 게시글이 없습니다.");
        console.error("서버 fetch 중 에러 발생 : ", data.error);
        return;
      }

      const data = await response.json();

      setPopups(data.stores);
    } catch (err) {
      setError("네트워크 오류 발생");
      console.error("네트워크 오류 발생: ", err.message);
    }
  };

  useEffect(() => {
    fetchUserPopup();
  }, []);

  return (
    <div>
      {error && <p>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
        {popups.length > 0 &&
          popups.map((popup) => (
            <div key={popup.s_id} onClick={() => navigate(`/popup/edit/${popup.s_id}`)} style={{ cursor: "pointer", textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
              <img
                src={`${import.meta.env.VITE_BE_PORT}${popup.images[0]}`}
                alt={popup.s_name}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <p style={{ fontSize: "14px", marginTop: "8px" }}>{popup.s_name}</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>{popup.owner}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PopupList;
