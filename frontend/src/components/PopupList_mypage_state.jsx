import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PropTypes from "prop-types";

// 임시 데이터
const popupData = [
  {
    id: 100,
    type: "culture",
    owner: "netflix",
    name: "오징어게임2 팝업스토어 in 강남",
    location: "서울 서초구 신반포로 176 신세계백화점 강남점 1층 오픈스테이지",
    startDate: "2024.12.20",
    endDate: "2025.01.12",
    business_hours: "10:30-20:00",
    description: "<오징어 게임> 시즌2 팝업, 참여하시겠습니까?",
    images: ["https://i.ibb.co/tPJYqCB/detail2-1.jpg", "https://i.ibb.co/10Xfvwr/detail2-2.jpg", "https://i.ibb.co/mb5c4xj/detail2-3.jpg"],
    contact: "example@naver.com",
  },
  {
    id: 200,
    type: "food",
    owner: "빙그레",
    name: "바나나맛우유 50주년 팝업스토어",
    location: "서울 종로구 삼일대로28길 28 누디트 익선 B동",
    startDate: "2024.12.21",
    endDate: "2024.12.28",
    business_hours: "10:00 AM - 6:00 PM",
    description: "그대들, 소식 들었소? 바나나맛우유가 벌써 50주년을 맞이 하였소!🎉",
    images: ["https://i.ibb.co/2df8xYG/detail1.jpg", "https://i.ibb.co/HCjsbLj/detail2.jpg", "https://i.ibb.co/GcVdfGF/detail3.jpg", "https://i.ibb.co/FxpmTwp/detail4.jpg"],
    contact: "example@naver.com",
  },

  {
    id: 2,
    type: "culture",
    owner: "예술의 전당",
    name: "불멸의 화가 반 고흐 전시",
    location: "서울특별시 서초구 남부순환로 2406 예술의 전당 한가람미술관 1층",
    startDate: "2024.11.29",
    endDate: "2025.03.16",
    business_hours: "오전 10시 ~ 오후 7시(월요일 휴무)",
    description: "THE GREAT PASSION\n전 세계인이 사랑하는 불멸의 화가 반 고흐의 국내 단독 회고전. 강렬한 색과 붓터치를 느껴보세요.",
    images: ["https://i.ibb.co/kJYKGQ6/2.jpg"],
    contact: "example@naver.com",
  },
];

// 상태에 따른 팝업 분류
function filterByState(data, state) {
  // data
  // { posts: [{ id: 1, title: "First Post", content: "This is the first post content.",
  // createdAt: "2024-01-01T12:00:00Z", startDate: "2024-01-01", endDate: "2024-01-10" }] };

  // 현재 날짜 기준 필터링
  // state - onGoing, scheduled, completed

  return data.filter((item) => item.type === state);
}

const PopupList = ({ state }) => {
  // state: onGoing, scheduled, completed (type: string)

  const [popups, setPopups] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserPopup = async (state) => {
    setError(null);

    // 현재 유저 아이디
    const userId = sessionStorage.getItem("userId");

    try {
      // 유저가 작성한 게시글 조회
      const response = await fetch(`/api/users/${userId}/stores`);
      if (!response.ok) {
        setPopups([]);
        throw new Error("Failed to fetch UserPopup");
      }

      //API
      const data = response.json();
      // 응답 데이터
      //  성공 - { posts: [{ id: 1, title: "First Post", content: "This is the first post content.",
      // createdAt: "2024-01-01T12:00:00Z", startDate: "2024-01-01", endDate: "2024-01-10" }] };
      // 실패 - {"error": "User has no posts"}

      // state에 따른 팝업 필터링
      // (onGoing, scheduled, completed)
      const popups = filterByState(data, state);

      setPopups(popups);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (state) {
      fetchUserPopup(state);
    }
  }, [state]);

  return (
    <div>
      {error && <p>Error: {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
        {popups.length > 0 ? (
          popups.map((popup) => (
            <div key={popup.id} onClick={() => navigate(`/popup/${popup.id}`)} style={{ cursor: "pointer", textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
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

PopupList.propTypes = {
  state: PropTypes.string.isRequired,
};

export default PopupList;
