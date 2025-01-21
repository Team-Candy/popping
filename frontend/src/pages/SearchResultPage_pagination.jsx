import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../context/useAuth";
import { fetchWithAuth, formatDate, formatURL, useCheckToken } from "../utils/util";

async function fetchData(query, page = 1, limit = 10) {
  // API 요청
  try {
    console.log("query: ", query);
    const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/search?value=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    console.log("data: ", data);

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
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation(); // URL의 쿼리 파라미터
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");

    if (query) {
      const fetchResults = async () => {
        setIsLoading(true); // 데이터 로딩 시작
        try {
          const data = await fetchData(query, currentPage, 8);
          setResults(data.results); // 결과 업데이트
          setPagination(data.pagination); // 페이지네이션 업데이트
        } catch (error) {
          console.error("데이터 로드 중 오류 발생:", error);
        } finally {
          setIsLoading(false); // 데이터 로딩 종료
        }
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

  return (
    <div className="py-8">
      <div className="flex flex-col items-center">
        <div className="max-w-4xl w-full text-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-800 py-10">검색 결과</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4">
            {isLoading ? (
              <p></p>
            ) : results.length > 0 ? (
              results.map((popup) => (
                <div key={popup.id} onClick={() => navigate(`/popup/${popup.id}`)} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105">
                  <div className="relative">
                    <img src={formatURL(popup.images[0])} alt={popup.name} className="w-full h-48 object-cover rounded-t-lg" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(popup.id);
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                    >
                      {likedPopups.includes(popup.id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-lg font-semibold text-gray-800">{popup.name}</p>
                    <p className="text-sm text-gray-500 mt-2">위치: {popup.location}</p>
                    <p className="text-sm text-gray-500">
                      기간: {formatDate(popup.startDate)} ~ {formatDate(popup.endDate)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
            )}
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center mt-8">
            {Array.from({ length: pagination.totalPages }, (_, index) => (
              <button key={index + 1} onClick={() => handlePageChange(index + 1)} disabled={index + 1 === currentPage} className={`px-4 py-2 mx-2 text-lg font-semibold rounded-full transition-colors ${index + 1 === currentPage ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
