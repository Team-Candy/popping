import PropTypes from "prop-types";
import useAuth from "../context/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, formatURL } from "../utils/util";

const PopupList = ({ category }) => {
  const { auth } = useAuth(); // 로그인 정보
  const navigate = useNavigate();

  const [popups, setPopups] = useState([]);
  const [error, setError] = useState(null);
  const [likedPopups, setLikedPopups] = useState([]);
  const [loading, setLoading] = useState(true);

  // API - 팝업 데이터 가져오기
  useEffect(() => {
    if (category) {
      fetchCategoryData(category);
    }
  }, [category]);

  const fetchCategoryData = async (category) => {
    setError(null);

    try {
      // API - 메인 페이지 - 카테고리별 팝업 스토어 그리드 정보
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/categories/${category}`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      // category type
      // whole, food, education, culture, digital, clothing, interior, sports, fashion miscellaneous goods, characters, others
      // popular, scheduled

      const data = await response.json();
      console.log(data);

      if (data.categories) {
        setPopups(data.categories);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  useEffect(() => {
    if (category) {
      setError(null);
      fetch(`${import.meta.env.VITE_BE_PORT}/api/categories/${category}`)
        .then((res) => res.json())
        .then((data) => setPopups(data.categories))
        .catch((err) => {
          console.error("Error fetching popups:", err);
          setError(err.message);
        });
    }
  }, [category]);

  // 로그인 상태일 때만 좋아요 데이터 가져오기
  useEffect(() => {
    // 로그인 되지 않은 경우 무시
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
  }, [auth.isLoggedIn]);

  // 좋아요 추가 함수
  const handleLikeToggle = async (popupId) => {
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
    <div>
      {error && <p>Error: {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
        {popups.length > 0 ? (
          popups.map((popup) => (
            <div key={popup.id} onClick={() => navigate(`/popup/${popup.id}`)} style={{ cursor: "pointer", textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
              <div className="h-[252px] flex-col justify-center items-start gap-2 inline-flex">
                <img src={formatURL(popup.images[0])} alt={popup.name} className="self-stretch h-[180px] rounded-2xl" />

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 클릭 이벤트 방지
                    handleLikeToggle(popup.id); // 하트 상태 토글
                  }}
                >
                  {likedPopups.includes(popup.id) ? "❤️" : "🤍"}
                </button>

                <div className="w-[162px] justify-between items-center inline-flex">
                  <div className="text-center text-black text-xs font-light font-['Pretendard'] leading-normal">{popup.owner}</div>
                </div>

                <p className="text-center text-black text-xs font-bold font-['Pretendard'] leading-loose">{popup.name}</p>
              </div>
            </div>
          ))
        ) : (
          <div>{loading ? <></> : <p>해당 카테고리에 대한 팝업이 없습니다.</p>}</div>
        )}
      </div>
    </div>
  );
};

{
  /* <div key={popup.id} onClick={() => navigate(`/popup/${popup.id}`)} style={{ cursor: "pointer", textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
<div
  style={{
    position: "relative", // 이미지 컨테이너를 기준으로 버튼 배치
  }}
>
  <img
    src={urlConvert(popup.images[0])}
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
</div> */
}

PopupList.propTypes = {
  category: PropTypes.string.isRequired,
};

export default PopupList;
