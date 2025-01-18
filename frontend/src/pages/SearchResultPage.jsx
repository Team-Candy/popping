import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../context/useAuth";
import { fetchWithAuth, formatDate, useCheckToken } from "../utils/util";

async function fetchData(query, page = 1, limit = 10) {
  // API 요청
  try {
    console.log("query: ", query);
    const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/search?value=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();

    const startIndex = (page - 1) * limit;
    const paginatedResults = data.results.slice(startIndex, startIndex + limit);

    return {
      results: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems,
      },
    };
  } catch (err) {
    console.error(err);
    return { results: [], pagination: { currentPage: 1, totalPages: 0, totalItem: 0 } };
  }
}

const SearchResult = () => {
  const { auth } = useAuth();
  const checkToken = useCheckToken();

  const [likedPopups, setLikedPopups] = useState([]); // 좋아요 상태 저장

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 0, currentPage: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation(); // URL의 쿼리 파라미터
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");

    if (query) {
      const fetchResults = async () => {
        const data = await fetchData(query, currentPage, 5); // 5개씩 가져옴
        setResults(data.results);
        setPagination(data.pagination);
      };

      fetchResults();
    }
  }, [location.search, currentPage]);

  // 로그인 상태일 때만 좋아요 데이터 가져오기
  const fetchLikedPopups = async () => {
    if (!auth.isLoggedIn) {
      return;
    }

    const fetchLikesData = async () => {
      try {
        // API - 유저가 좋아요 누른 게시글 조회
        // (수정) (최적화) 매번 요청하지 않고 이걸 context 로 모든 페이지에서 볼 수 있도록?
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/likes`);
        const data = await response.json();

        if (!response.ok) {
          checkToken(response);

          if (data.error === "Likes not found") {
            return;
          }
          throw new Error("Failed to fetch liked popups", data.error);
        }

        const likes = data.likes.map((store) => store.s_id);

        setLikedPopups(likes);
      } catch (err) {
        console.log("서버 에러 발생: ", err);
        console.error("Error fetching likes:", err);
      }
    };

    fetchLikesData();
  };

  useEffect(() => {
    fetchLikedPopups(); // 로그인 상태일 때만 호출
  }, [auth.isLoggedIn]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 좋아요 토글 함수
  const handleLikeToggle = async (popupId) => {
    // console.log("type:", typeof popupId);

    if (!auth.isLoggedIn) {
      navigate("/login");
      alert("로그인 후 즐겨찾기에 추가 가능합니다.");
      return;
    }

    // UI 먼저 업데이트
    const isLiked = likedPopups.includes(popupId); // true,false
    setLikedPopups(
      (prevLiked) =>
        isLiked
          ? prevLiked.filter((id) => id !== popupId) // 좋아요 취소
          : [...prevLiked, popupId] // 좋아요 추가
    );

    // API - 서버에 요청
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/stores/${popupId}/likes`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        checkToken(response);

        throw new Error(`Failed to ${isLiked ? "unlike" : "like"} popup`);
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

  return (
    <div>
      <h2 style={{ color: "red" }}>검색 결과</h2>
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
                기간: {formatDate(popup.startDate)} ~ {formatDate(popup.endDate)}
              </p>
            </div>
          ))
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </div>

      {/* 페이지네이션 */}
      <div style={{ marginTop: "20px" }}>
        {Array.from({ length: pagination.totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            disabled={index + 1 === currentPage}
            style={{
              margin: "0 5px",
              padding: "5px 10px",
              backgroundColor: index + 1 === currentPage ? "gray" : "lightGray",
              cursor: index + 1 === currentPage ? "not-allowed" : "pointer",
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchResult;
