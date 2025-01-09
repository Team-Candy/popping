import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      // const response = await fetch(`/api/users/${userId}/stores`);
      // if (!response.ok) {
      //   const data = await response.json();
      //   setPopups([]);
      //   setError("작성된 게시글이 없습니다.");
      //   throw new Error(data.error);
      // }

      // const data = response.json();

      // (수정) MOCK
      const data = {
        posts: [
          {
            id: 100,
            owner: "넷플릭스", // 주최측
            title: "오징어게임2 팝업스토어 in 강남",
            // location: "서울 서초구 신반포로 176 신세계백화점 강남점 1층 오픈스테이지",
            startDate: "2024.12.20",
            endDate: "2025.01.12",
            imgUrl: ["https://i.ibb.co/tPJYqCB/detail2-1.jpg", "https://i.ibb.co/10Xfvwr/detail2-2.jpg", "https://i.ibb.co/mb5c4xj/detail2-3.jpg"],
          },

          {
            id: 200,
            owner: "빙그레",
            title: "바나나맛우유 50주년 팝업스토어",
            // location: "서울 종로구 삼일대로28길 28 누디트 익선 B동",
            startDate: "2024.12.21",
            endDate: "2024.12.28",
            imgUrl: ["https://i.ibb.co/2df8xYG/detail1.jpg", "https://i.ibb.co/HCjsbLj/detail2.jpg", "https://i.ibb.co/GcVdfGF/detail3.jpg", "https://i.ibb.co/FxpmTwp/detail4.jpg"],
          },
        ],
      };

      if (data.error) {
        setPopups([]);
        setError("유저의 게시물이 없습니다.");
        return;
      }

      setPopups(data.posts);
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
      {error && <p>Error: {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
        {popups.length > 0 ? (
          popups.map((popup) => (
            <div key={popup.id} onClick={() => navigate(`/popup/edit/${popup.id}`)} style={{ cursor: "pointer", textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
              <img
                src={popup.imgUrl[0]}
                alt={popup.title}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <p style={{ fontSize: "14px", marginTop: "8px" }}>{popup.title}</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>{popup.owner}</p>
            </div>
          ))
        ) : (
          <p>No Popup available for this category.</p>
        )}
      </div>
    </div>
  );
};

export default PopupList;
