import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { fetchWithAuth, formatDate } from "../../utils/util";

const FavoritePopupPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [likedPopups, setLikedPopups] = useState([]); // 좋아요 상태 저장
  const [view, setView] = useState("list");
  const [error, setError] = useState(null);

  const fetchLikedPopups = async () => {
    const fetchLikesData = async () => {
      try {
        // API - 유저가 좋아요 누른 게시글 조회
        // (수정) (최적화) 매번 요청하지 않고 이걸 context 로 모든 페이지에서 볼 수 있도록?
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/likes`);

        const data = await response.json();

        if (!response.ok) {
          setError("좋아요된 팝업이 존재하지 않습니다.");
          throw new Error("Failed to fetch liked popups", data.error);
        }

        setResults(data.likes);
        // console.log(data.likes);

        const likes = data.likes.map((store) => store.s_id);
        setLikedPopups(likes);
      } catch (err) {
        console.log("서버 에러 발생: ", err);
        console.error("Error fetching likes:", err);
      }
    };

    fetchLikesData();
  };

  // 로그인 상태일 때만 좋아요 데이터 가져오기
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
    const isLiked = likedPopups.includes(popupId); // 기존에 있는지(T), 없는지(F)
    setLikedPopups(
      // UI 먼저 업데이트
      (prevLiked) =>
        isLiked
          ? prevLiked.filter((id) => id !== popupId) // 좋아요 취소
          : [...prevLiked, popupId] // 좋아요 추가
    );

    // API - 팝업 스토어 좋아요 추가 / 삭제
    try {
      const response = await fetchWithAuth(`/api/users/${sessionStorage.getItem("userId")}/stores/${popupId}/likes`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Failed to ${isLiked ? "unlike" : "like"} popup: `, data.error);
      }
    } catch (error) {
      console.error(error.message);

      // 요청 실패 시 상태 복구
      setLikedPopups(
        (prevLiked) =>
          isLiked
            ? [...prevLiked, popupId] // 좋아요 복구
            : prevLiked.filter((id) => id !== popupId) // 제거 복구
      );
    }
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

  function urlConvert(url) {
    if (url.startsWith("/upload")) {
      return `${import.meta.env.VITE_BE_PORT}` + url;
    } else {
      return url;
    }
  }

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
              <div key={popup.s_id} onClick={() => navigate(`/popup/${popup.s_id}`)} style={{ cursor: "pointer", textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
                <div
                  style={{
                    position: "relative", // 이미지 컨테이너를 기준으로 버튼 배치
                  }}
                >
                  <img
                    src={urlConvert(popup.images[0])}
                    alt={popup.s_name}
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
                      handleLikeToggle(popup.s_id); // 하트 상태 토글
                    }}
                  >
                    {likedPopups.includes(popup.s_id) ? "❤️" : "🤍"}
                  </button>
                </div>
                <p style={{ fontSize: "14px", marginTop: "8px" }}>{popup.name}</p>
                <h3>{popup.s_name}</h3>
                <p>위치: {popup.location}</p>
                <p>
                  {formatDate(popup.s_date)} ~ {formatDate(popup.e_date)}
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
