import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlogReview from "../components/BlogReview";
import Description from "../components/Description";
import useAuth from "../context/useAuth";
import { fetchWithAuth, formatURL } from "../utils/util";

const PopupDetailPage = () => {
  const { popupId } = useParams(); // URL에서 popupId 가져옴, string type임
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null); // 팝업 상세 정보 저장
  const [error, setError] = useState(null); // 에러 메시지 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 저장
  const [activeTab, setActiveTab] = useState("description"); // 기본은 상세 설명 탭

  const [like, setLike] = useState(false);

  const fetchLikeData = async () => {
    if (!auth.isLoggedIn) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/stores/${popupId}/likes`);
      if (response.statusText === "Unauthorized") {
        alert("로그인 후 이용해주세요.");
        logout();
        navigate("/login");
      } else if (!response.ok) {
        const data = await response.json();
        console.error("서버 에러 발생: ", data.error);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        console.error("서버 에러 발생: ", data.error);
        return;
      }

      const data = await response.json();

      setLike(data.liked);
    } catch (err) {
      console.error("네트워크 에러 발생: ", err.message);
    }
  };

  const fetchPopupDetail = async () => {
    // API - 팝업스토어 상세 정보 조회
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/stores/${popupId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error("Failed to fetch PopupDetail: ", data.error);
      }

      const data = await response.json();

      setDetail(data.store); // 데이터 저장
      setError(null); // 에러 초기화
    } catch (err) {
      setError(err.message); // 에러 메시지 저장
      setDetail(null); // 데이터 초기화
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0); // 페이지 이동 시 맨 위로 스크롤 이동
  }, []);

  useEffect(() => {
    fetchLikeData();
    fetchPopupDetail();
  }, []);

  // 로딩 중일 때 표시
  if (loading) {
    return <p></p>;
    // return <p>로딩 중...</p>;
  }

  // 에러 발생 시 표시
  if (error) {
    return <p>에러: {error}</p>;
  }

  // 받아온 데이터가 없을 때 표시
  if (!detail) {
    return <p>팝업 정보를 불러올 수 없습니다.</p>;
  }

  // 조건부 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return <Description detail={detail}></Description>;

      case "reviews":
        return <BlogReview name={detail.s_name}></BlogReview>;

      default:
        return null;
    }
  };

  const handleLikeToggle = async (popupId) => {
    // console.log("type:", typeof popupId);

    if (!auth.isLoggedIn) {
      navigate("/login");
      alert("로그인 후 즐겨찾기에 추가 가능합니다.");
      return;
    }

    // UI 먼저 업데이트
    const isLiked = like; // true,false

    setLike(
      () =>
        isLiked
          ? false // 좋아요 복구
          : true // 제거 복구
    );

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
      setLike(
        () =>
          isLiked
            ? true // 좋아요 복구
            : false // 제거 복구
      );
    }
  };

  const heartStyle = {
    bottom: "8px", // 이미지 하단 여백
    right: "8px", // 이미지 오른쪽 여백
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "24px", // 하트 크기
    zIndex: 10, // 이미지 위에 표시
  };

  function formatCategory(category) {
    const korean = [
      { label: "전체", value: "whole" },
      { label: "식품", value: "food" },
      { label: "교육", value: "education" },
      { label: "문화", value: "culture" },
      { label: "디지털", value: "digital" },
      { label: "의류", value: "clothing" },
      { label: "인테리어", value: "interior" },
      { label: "스포츠", value: "sports" },
      { label: "패션잡화", value: "miscellaneous" },
      { label: "캐릭터", value: "characters" },
      { label: "기타", value: "others" },
    ];

    const foundCategory = korean.find((item) => item.value === category);
    return foundCategory ? foundCategory.label : "Unknown";
  }

  return (
    <div>
      <div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {detail.images.map((url, index) => (
            <img key={index} src={formatURL(url)} alt={`팝업 이미지 ${index + 1}`} style={{ width: "300px", borderRadius: "8px" }} />
          ))}
        </div>
      </div>

      <div>
        {/* 제목 */}
        <div style={{ display: "flex" }}>
          <h1>{detail.s_name}</h1>

          <button
            style={heartStyle}
            onClick={(e) => {
              e.stopPropagation(); // 부모 클릭 이벤트 방지
              handleLikeToggle(popupId); // 하트 상태 토글
            }}
            aria-label={like ? "좋아요 취소" : "좋아요"} // ARIA 레이블 추가
          >
            {like ? "❤️" : "🤍"}
          </button>
        </div>

        <p>
          {/* (수정) 영문 -> 한글 */}
          <strong>카테고리:</strong> {formatCategory(detail.category)}
        </p>

        <p>
          <strong>주최:</strong> {detail.owner}
        </p>

        <p>
          <strong>장소:</strong> {detail.location}
        </p>
      </div>

      {/* 버튼, 탭 */}
      <div>
        <button onClick={() => setActiveTab("description")}>상세 설명</button>
        <button onClick={() => setActiveTab("reviews")}>블로그 후기</button>
      </div>

      {/* 탭 컨텐츠 */}
      {renderTabContent()}
    </div>
  );
};

export default PopupDetailPage;
