import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlogReview from "../components/BlogReview";
import Description from "../components/Description";
import useAuth from "../context/useAuth";
import { fetchWithAuth, useCheckToken, formatURL, formatDate } from "../utils/util";

import ownerIcon from "../assets/icons/owner.svg";
import calendarIcon from "../assets/icons/calendar.svg";
import clockIcon from "../assets/icons/clock.svg";
import locationIcon from "../assets/icons/location.svg";

const PopupDetailPage = () => {
  const { popupId } = useParams(); // URL에서 popupId 가져옴, string type임
  const { auth } = useAuth();
  const navigate = useNavigate();
  const checkToken = useCheckToken();

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
      if (!response.ok) {
        const data = await response.json();
        console.error("서버 에러 발생: ", data.error);
        return;
      }

      if (!response.ok) {
        checkToken(response);

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
        checkToken(response);

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
    <div className="max-w-[1000px] container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {detail.images.map((url, index) => (
          // <img key={index} src={formatURL(url)} alt={`팝업 이미지 ${index + 1}`} className="max-w-[300px] rounded-lg shadow-md" />
          // <a key={index} href={formatURL(url)} target="_blank" rel="noopener noreferrer">
          <img key={index} src={formatURL(url)} alt={`팝업 이미지 ${index + 1}`} className="w-[300px] h-[300px] object-cover rounded-lg shadow-md" />
          // </a>
        ))}
      </div>

      <div key={detail.category} className="mb-4 p-2 rounded-lg border border-[#b3b3b3] justify-center items-center gap-3 inline-flex text-center text-xs font-normal font-['Pretendard'] leading-normal whitespace-nowrap border-[#A15EA1] bg-opacity-30 bg-[#C8A0C8] text-[#A15EA1]">
        {formatCategory(detail.category)}
      </div>

      <div className="flex items-center mb-4">
        <h1 className="text-3xl font-semibold">{detail.s_name}</h1>
        <button
          className="text-2xl"
          onClick={(e) => {
            e.stopPropagation();
            handleLikeToggle(popupId);
          }}
          aria-label={like ? "좋아요 취소" : "좋아요"}
        >
          {like ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="flex mb-3">
        <img src={ownerIcon} alt="Owner Icon" className="w-5 h-5" />
        <p className="ml-2 text-gray-500">{detail.owner}</p>
      </div>

      <div className="flex mb-3">
        <img src={calendarIcon} alt="Calendar Icon" className="w-5 h-5" />

        <p className="ml-2 text-gray-500">
          {formatDate(detail.s_date)} ~ {formatDate(detail.e_date)}
        </p>
      </div>

      <div className="flex opacity-50 mb-3">
        <img src={clockIcon} alt="Clock Icon" className="w-5 h-5" />
        <p className="ml-2">{detail.business_hours}</p>
      </div>

      <div className="flex mb-3">
        <img src={locationIcon} alt="Location Icon" className="w-5 h-5" />

        <p className="ml-2 text-gray-500">{detail.location}</p>
      </div>

      <div className="flex mt-6 mb-4">
        <button className={`mr-2 px-4 py-2 bg-[#c8a0c8] rounded-full justify-center items-center gap-2 flex hover:bg-[#a15da1] transition-all duration-300 ${activeTab === "description" ? "bg-[#a15da1]" : ""} text-center text-white text-sm font-semibold font-['Pretendard'] leading-normal `} onClick={() => setActiveTab("description")}>
          상세 설명
        </button>

        <button className={`px-4 py-2 bg-[#c8a0c8] rounded-full justify-center items-center gap-2 flex hover:bg-[#a15da1] transition-all duration-300 ${activeTab === "reviews" ? "bg-[#a15da1]" : ""} text-center text-white text-sm font-semibold font-['Pretendard'] leading-normal `} onClick={() => setActiveTab("reviews")}>
          블로그 후기
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default PopupDetailPage;
