import { useState, useEffect } from "react";
import useAuth from "../context/useAuth";
import { useNavigate } from "react-router-dom";

import PropTypes from "prop-types";

const PopupList = ({ category }) => {
  const { auth } = useAuth(); // 로그인 정보
  const navigate = useNavigate();

  const [popups, setPopups] = useState([]);
  const [error, setError] = useState(null);
  const [likedPopups, setLikedPopups] = useState([]);

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
      const response = await fetch(`http://localhost:3000/api/categories/${category}`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      // category type
      // whole, food, education, culture, digital, clothing, interior, sports, fashion miscellaneous goods, characters, others
      // popular, scheduled

      const data = await response.json();

      if (data.categories) {
        setPopups(data.categories);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (category) {
      // API
      setError(null);
      fetch(`http://localhost:3000/api/categories/${category}`)
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
        const response = await fetch(`http://localhost:3000/api/users/${sessionStorage.getItem("userId")}/likes`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error("서버 오류 발생: ", data.error);
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

  // 좋아요 추가
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
      const response = await fetch(`http://localhost:3000/api/users/${sessionStorage.getItem("userId")}/stores/${popupId}/likes`, {
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
      {error && <p>Error: {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
        {popups.length > 0 ? (
          popups.map((popup) => (
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
            </div>
          ))
        ) : (
          <p>No Popup available for this category.</p>
        )}
      </div>
    </div>
  );
};

// category prop의 타입을 string으로 지정
PopupList.propTypes = {
  category: PropTypes.string.isRequired, // category는 필수로 string이어야 함
};

export default PopupList;
