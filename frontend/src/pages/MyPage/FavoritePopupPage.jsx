import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const FavoritePopupPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [likedPopups, setLikedPopups] = useState([]); // 좋아요 상태 저장
  const [view, setView] = useState("list");
  const [error, setError] = useState(null);

  // 로그인 상태일 때만 좋아요 데이터 가져오기
  const fetchLikedPopups = async () => {
    // (수정) API
    // try {
    //   const response = await fetch(`/api/users/${auth.userId}/likes`);
    //   const data = await response.json();
    //   if (!response.ok) {
    //     setError(data.error);
    //     throw new Error("Failed to fetch liked popups");
    //   }
    //   const likedIds = data.likes.map((store) => store.s_id); // 좋아요 상태 아이디 목록
    //   setLikedPopups(likedIds); // 좋아요 리스트
    //   setResults(data.likes); // 결과
    //   //   /api/users/:{u_id}/likes
    //   // get
    //   // 유저가 좋아요 누른 게시글 조회
    //   // u_id 필수, limit & page 선택
    //   // likes: results.map(store => ({
    //   // s_id: store.s_id,
    //   // owner: store.owner,
    //   // s_name: store.s_name,
    //   // contact: store.contact,
    //   // location: store.location,
    //   // s_date: store.s_date,
    //   // e_date: store.e_date,
    //   // business_hours: store.business_hours,
    //   // description: store.description,
    //   // images: JSON.parse(store.images) || [], // JSON 배열로 파싱}))
    //   // { error: "Likes not found" }
    // } catch (err) {
    //   console.error("Error fetching liked popups:", err);
    // }
    // (수정) MOCK
    const data = {
      likes: [
        {
          id: 100,
          name: "오징어게임2 팝업스토어 in 강남",
          location: "서울 서초구 신반포로 176 신세계백화점 강남점 1층 오픈스테이지",
          startDate: "2024.12.20",
          endDate: "2025.01.12",
          images: ["https://i.ibb.co/tPJYqCB/detail2-1.jpg"],
        },
        {
          id: 200,
          name: "바나나맛우유 50주년 팝업스토어",
          location: "서울 종로구 삼일대로28길 28 누디트 익선 B동",
          startDate: "2024.12.21",
          endDate: "2024.12.28",
          images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
        },
        {
          id: 1,
          name: "서울 팝업스토어",
          location: "서울 강남구",
          category: "패션",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
        },
        {
          id: 2,
          name: "서울 음식 팝업스토어",
          location: "서울 종로구",
          category: "음식",
          startDate: "2024-02-01",
          endDate: "2024-02-28",
          images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
        },
        {
          id: 3,
          name: "서울 뷰티 팝업스토어",
          location: "서울 강서구",
          category: "뷰티",
          startDate: "2024-03-01",
          endDate: "2024-03-15",
          images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
        },
        {
          id: 4,
          name: "서울 예술 팝업스토어",
          location: "서울 마포구",
          category: "예술",
          startDate: "2024-04-01",
          endDate: "2024-04-30",
          images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
        },
        {
          id: 5,
          name: "서울 리빙 팝업스토어",
          location: "서울 송파구",
          category: "리빙",
          startDate: "2024-05-01",
          endDate: "2024-05-15",
          images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
        },
        {
          id: 6,
          name: "서울 테크 팝업스토어",
          location: "서울 용산구",
          category: "테크",
          startDate: "2024-06-01",
          endDate: "2024-06-30",
          images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
        },
        {
          id: 7,
          name: "서울 패션 팝업스토어",
          location: "서울 동대문구",
          category: "패션",
          startDate: "2024-07-01",
          endDate: "2024-07-15",
          images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
        },
        {
          id: 8,
          name: "서울 음식 팝업스토어",
          location: "서울 강북구",
          category: "음식",
          startDate: "2024-08-01",
          endDate: "2024-08-31",
          images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
        },
      ],
    };
    setResults(data.likes);
    const likes = data.likes.map((store) => store.id);
    // const likes = data.likes.map((store) => store.s_id);
    setLikedPopups(likes);
  };

  useEffect(() => {
    if (!auth.isLoggedIn) {
      alert("로그인 후 이용해주세요");
      navigate("/login");
      return;
    }

    fetchLikedPopups();
  }, []);

  // 좋아요 토글 함수
  const handleLikeToggle = async (popupId) => {
    // UI 먼저 업데이트
    const isLiked = likedPopups.includes(popupId); // true,false
    setLikedPopups(
      (prevLiked) =>
        isLiked
          ? prevLiked.filter((id) => id !== popupId) // 좋아요 취소
          : [...prevLiked, popupId] // 좋아요 추가
    );

    // API - 서버에 요청
    // try {
    //   const response = await fetch(`/api/users/${auth.userId}/stores/${popupId}/likes`, {
    //     method: isLiked ? "DELETE" : "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });

    //   if (!response.ok) {
    //     throw new Error(`Failed to ${isLiked ? "unlike" : "like"} popup`);
    //   }
    // } catch (error) {
    //   console.error(error.message);

    //   // 요청 실패 시 상태 복구
    //   setLikedPopups(
    //     (prevLiked) =>
    //       isLiked
    //         ? [...prevLiked, popupId] // 좋아요 복구
    //         : prevLiked.filter((id) => id !== popupId) // 제거 복구
    //   );
    // }
  };

  const heartStyle = {
    position: "absolute",
    bottom: "8px", // 이미지 하단 여백
    right: "8px", // 이미지 오른쪽 여백
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "24px", // 하트 크기
    zIndex: 10, // 이미지 위에 표시
  };
  return (
    <div>
      <h2>관심 팝업</h2>
      <hr />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setView("list")}>리스트 뷰</button>
        <button style={{ color: "red" }} onClick={() => setView("calendar")}>
          달력 뷰
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {view === "list" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
          {results.length > 0 ? (
            results.map((popup) => (
              <div key={popup.id} onClick={() => navigate(`/popup/${popup.id}`)} style={{ cursor: "pointer", textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
                <div
                  style={{
                    position: "relative", // 이미지 컨테이너를 기준으로 버튼 배치
                  }}
                >
                  <img
                    src={popup.images[0]}
                    alt={popup.name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <button
                    style={heartStyle}
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 클릭 이벤트 방지
                      handleLikeToggle(popup.id); // 하트 상태 토글
                    }}
                  >
                    {likedPopups.includes(popup.id) ? "❤️" : "🤍"}
                  </button>
                </div>
                <p style={{ fontSize: "14px", marginTop: "8px" }}>{popup.name}</p>
                <p>위치: {popup.location}</p>
                <p>
                  기간: {popup.startDate} ~ {popup.endDate}
                </p>
              </div>
            ))
          ) : (
            <p>No liked popups found.</p>
          )}
        </div>
      ) : (
        <div>Calendar view coming soon...</div>
      )}
    </div>
  );
};

export default FavoritePopupPage;
