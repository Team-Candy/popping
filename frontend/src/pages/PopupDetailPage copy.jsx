import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlogReview from "../components/BlogReview";
import Description from "../components/Description";
import useAuth from "../context/useAuth";

const PopupDetailPage = () => {
  const { popupId } = useParams(); // URL에서 popupId 가져옴, string type임
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null); // 팝업 상세 정보 저장
  const [error, setError] = useState(null); // 에러 메시지 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 저장
  const [activeTab, setActiveTab] = useState("description"); // 기본은 상세 설명 탭

  const [likedPopups, setLikedPopups] = useState([]); // 좋아요 상태 저장

  const fetchPopupDetail = async () => {
    // API - 팝업스토어 상세 정보 조회
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/stores/${popupId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error("Failed to fetch PopupDetail: ", data.error);
      }

      const data = await response.json();
      console.log("디테일페이지 data: ", data);

      //"store: { s_id: store.s_id,
      // owner: store.owner,
      // s_name: store.s_name,
      // contact: store.contact,
      // location: store.location,
      // s_date: store.s_date,
      // e_date: store.e_date,
      // business_hours: store.business_hours,
      // description: store.description },
      // images: [   ,   ,    ,  ] }"

      // 임시 데이터
      // const data = filterById(popupId);

      setDetail(data.store); // 데이터 저장
      setError(null); // 에러 초기화
    } catch (err) {
      setError(err.message); // 에러 메시지 저장
      setDetail(null); // 데이터 초기화
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 로그인 상태일 때만 좋아요 데이터 가져오기
  const fetchLikedPopups = async () => {
    if (!auth.isLoggedIn) {
      return;
    }

    const fetchLikesData = async () => {
      try {
        // API - 유저가 좋아요 누른 게시글 조회
        // (수정) (최적화) 매번 요청하지 않고 이걸 context 로 모든 페이지에서 볼 수 있도록?
        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/likes`);
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
  };

  useEffect(() => {
    fetchPopupDetail();
    fetchLikedPopups();
  }, [popupId, auth.isLoggedIn]);

  // 로딩 중일 때 표시
  if (loading) {
    return <p>로딩 중...</p>;
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
    const isLiked = likedPopups.includes(popupId); // true,false
    setLikedPopups(
      (prevLiked) =>
        isLiked
          ? prevLiked.filter((id) => id !== popupId) // 좋아요 취소
          : [...prevLiked, popupId] // 좋아요 추가
    );

    try {
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/stores/${popupId}/likes`, {
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

    // API - 서버에 요청
    // try {
    //   const response = await fetch(`/api/users/${sessionStorage.getItem("userId")}/stores/${popupId}/likes`, {
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
      <div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {detail.images.map((url, index) => (
            <img key={index} src={url} alt={`팝업 이미지 ${index + 1}`} style={{ width: "300px", borderRadius: "8px" }} />
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
          >
            {likedPopups.includes(popupId) ? "❤️" : "🤍"}
          </button>
        </div>

        <p>
          {/* (수정) 영문 -> 한글 */}
          <strong style={{ color: "red" }}>카테고리:</strong> {detail.category}
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
        <button onClick={() => setActiveTab("reviews")}>실시간 후기</button>
      </div>

      {/* 탭 컨텐츠 */}
      {renderTabContent()}
    </div>
  );
};

export default PopupDetailPage;
