import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { fetchWithAuth, formatDate, formatURL } from "../../utils/util";

const FavoritePopupPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [likedPopups, setLikedPopups] = useState([]); // 좋아요 상태 저장

  const [loading, setLoading] = useState("false");

  const fetchLikedPopups = async () => {
    const fetchLikesData = async () => {
      try {
        // API - 유저가 좋아요 누른 게시글 조회
        // (수정) (최적화) 매번 요청하지 않고 이걸 context 로 모든 페이지에서 볼 수 있도록?
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/likes`);

        const data = await response.json();

        if (!response.ok) {
          if (data.error === "Likes not found") {
            return;
          }
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
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/stores/${popupId}/likes`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(`Failed to ${isLiked ? "unlike" : "like"} popup: `, data.error);
      }

      window.location.reload();
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
    <div className="max-w-[1000px] container mx-auto px-4 py-6">
      <p className="mt-10 ml-10 text-3xl font-semibold text-gray-800 mb-2">관심 팝업</p>
      <p className="ml-10 text-gray-450 mb-6 text-gray-500">내가 좋아하는 팝업스토어를 확인할 수 있어요.</p>

      <hr className="border-gray-300 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {results.length > 0 ? (
          results.map((popup) => (
            <div key={popup.s_id} onClick={() => navigate(`/popup/${popup.s_id}`)} className="cursor-pointer text-center border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="relative">
                <img src={formatURL(popup.images[0])} alt={popup.s_name} className="w-full h-40 object-cover rounded-lg mb-4" />
                <button
                  className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md hover:shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent click event
                    handleLikeToggle(popup.s_id); // Toggle heart state
                  }}
                >
                  {likedPopups.includes(popup.s_id) ? "❤️" : "🤍"}
                </button>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-2">{popup.s_name}</p>
              <p className="text-sm text-gray-600">{formatDate(popup.s_date)}</p>
              <p className="text-sm text-gray-600 mb-2">~ {formatDate(popup.e_date)}</p>
              <p className="text-sm text-gray-600 ">{popup.location}</p>
            </div>
          ))
        ) : (
          <div>
            {loading && <p>로딩중...</p>}
            {!loading && <p>관심 설정된 팝업이 존재하지 않습니다.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritePopupPage;
