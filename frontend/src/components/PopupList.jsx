import { useState, useEffect } from "react";
import useAuth from "../context/useAuth";
import { useNavigate } from "react-router-dom";

import PropTypes from "prop-types";

// 임시 데이터
// const popupData = [
//   {
//     id: 100,
//     type: "culture",
//     owner: "netflix",
//     name: "오징어게임2 팝업스토어 in 강남",
//     location: "서울 서초구 신반포로 176 신세계백화점 강남점 1층 오픈스테이지",
//     startDate: "2024.12.20",
//     endDate: "2025.01.12",
//     business_hours: "10:30-20:00",
//     description: "<오징어 게임> 시즌2 팝업, 참여하시겠습니까?",
//     images: ["https://i.ibb.co/tPJYqCB/detail2-1.jpg", "https://i.ibb.co/10Xfvwr/detail2-2.jpg", "https://i.ibb.co/mb5c4xj/detail2-3.jpg"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 200,
//     type: "food",
//     owner: "빙그레",
//     name: "바나나맛우유 50주년 팝업스토어",
//     location: "서울 종로구 삼일대로28길 28 누디트 익선 B동",
//     startDate: "2024.12.21",
//     endDate: "2024.12.28",
//     business_hours: "10:00 AM - 6:00 PM",
//     description: "그대들, 소식 들었소? 바나나맛우유가 벌써 50주년을 맞이 하였소!🎉",
//     images: ["https://i.ibb.co/2df8xYG/detail1.jpg", "https://i.ibb.co/HCjsbLj/detail2.jpg", "https://i.ibb.co/GcVdfGF/detail3.jpg", "https://i.ibb.co/FxpmTwp/detail4.jpg"],
//     contact: "example@naver.com",
//   },

//   {
//     id: 2,
//     type: "culture",
//     owner: "예술의 전당",
//     name: "불멸의 화가 반 고흐 전시",
//     location: "서울특별시 서초구 남부순환로 2406 예술의 전당 한가람미술관 1층",
//     startDate: "2024.11.29",
//     endDate: "2025.03.16",
//     business_hours: "오전 10시 ~ 오후 7시(월요일 휴무)",
//     description: "THE GREAT PASSION\n전 세계인이 사랑하는 불멸의 화가 반 고흐의 국내 단독 회고전. 강렬한 색과 붓터치를 느껴보세요.",
//     images: ["https://i.ibb.co/kJYKGQ6/2.jpg"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 3,
//     type: "clothing",
//     owner: "HUNTER",
//     name: "헌터 팝업스토어 Holiday Trip with HUNTER",
//     location: "서울특별시 성동구 아차산로 104 무신사 테라스 성수",
//     startDate: "2024.12.13",
//     endDate: "2025.01.07",
//     business_hours: "오후 12시 ~ 오후 8시",
//     description: "Holiday Trip with HUNTER\n설레는 여행 감성을 담은 특별한 팝업 스토어! 100% 럭키드로우 이벤트와 특별 할인 혜택도 놓치지 마세요!",
//     images: ["https://i.ibb.co/fSv5MqZ/3.jpg"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 4,
//     type: "characters",
//     owner: "카카오프렌즈",
//     name: "카카오프렌즈 춘식이 X 해리포터 팝업스토어",
//     location: "서울특별시 서초구 강남대로 429 카카오프렌즈 강남플래그십 스토어",
//     startDate: "2024.12.13",
//     endDate: "2025.01.31",
//     business_hours: "오전 10시 30분 ~ 오후 10시",
//     description: "HarryPotter X KakaoFriends\n빗자루와 지팡이를 들고 영국으로 떠나볼까요? 특별한 협업 상품과 이벤트를 만나보세요.",
//     images: ["https://i.ibb.co/XsVw9Vz/4.jpg"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 5,
//     type: "characters",
//     owner: "체로프 몽모",
//     name: "산타가 된 몽모 팝업스토어",
//     location: "서울특별시 마포구 동교로 38안길 17",
//     startDate: "2024.12.18",
//     endDate: "2024.12.22",
//     business_hours: "평일: 오후 1시 ~ 오후 8시, 주말: 오전 11시 ~ 오후 8시",
//     description: "몽모... 신입 산타가 되다! 크리스마스 분위기로 물든 작은 몽모 마을로 초대합니다. 다양한 사은품과 이벤트를 놓치지 마세요!",
//     images: ["https://i.ibb.co/hVPSz6R/5.jpg"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 6,
//     type: "food",
//     owner: "취미로 요리하는 남자",
//     name: "취요남 X 흑백요리사 남영탁 셰프 <닭다리 팝업스토어>",
//     location: "서울특별시 송파구 올림픽로 300 롯데월드몰 앞 광장",
//     startDate: "2024.11.20",
//     endDate: "2025.01.05",
//     business_hours: "오전 10시 30분 ~ 오후 8시 30분",
//     description: "츄요남과 남영탁 셰프의 특별한 닭다리 팝업! 수비드 닭다리와 특제 소스를 맛볼 수 있는 기회를 놓치지 마세요.",
//     images: ["https://i.ibb.co/wYbJL7J/6.jpg"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 7,
//     type: "food",
//     owner: "컬리",
//     name: "2024 컬리푸드 페스타",
//     location: "서울특별시 강서구 마곡중앙로 143 코엑스마곡 1층 전시장",
//     startDate: "2024.12.19",
//     endDate: "2024.12.22",
//     business_hours: "월~수: 휴무, 목~일: 오전 11시 ~ 오후 6시",
//     description: "230개의 브랜드와 함께하는 미식의 향연. 한정판 굿즈와 웰컴 기프트를 즐겨보세요. Merry Kurlysmas for All!",
//     images: ["https://i.ibb.co/dJkCWhg/8.jpg"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 8,
//     type: "characters",
//     owner: "포켓몬스터",
//     name: "포켓몬 팝업스토어 in 잠실",
//     location: "서울 송파구 올림픽로 300 롯데월드몰 지하1층",
//     startDate: "2024.12.13",
//     endDate: "2025.01.06",
//     business_hours: "월~일: 오전 10시 30분 ~ 오후 10시",
//     description: "포켓몬 팝업스토어 in 잠실, Coming Soon! 놀라운 이벤트와 상품을 기대해 주세요.",
//     images: ["https://i.ibb.co/4NvgFYz/9.png"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 9,
//     type: "others",
//     owner: "스트레이키즈",
//     name: "스트레이키즈 合(HOP) 팝업스토어",
//     location: "서울 종로구 북촌로 46-3 휘겸재",
//     startDate: "2024.12.14",
//     endDate: "2024.12.22",
//     business_hours: "월~일: 오전 10시 30분 ~ 오후 8시",
//     description: "스트레이키즈와 함께하는 특별한 팝업 스토어! 독점 상품과 팬들을 위한 다양한 이벤트를 만나보세요.",
//     images: ["https://i.ibb.co/JCVR56G/10.jpg"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 10,
//     type: "sports",
//     owner: "샤넬",
//     name: "샤넬 아이스링크 WINTER TALE HOLIDAY ICE RINK",
//     location: "서울 송파구 올림픽로 300 롯데 월드타워 아레나 파크",
//     startDate: "2024.11.21",
//     endDate: "2025.01.12",
//     business_hours: "12:00-21:00 (Break Time 16:00-17:00, Last entry at 20:00)",
//     description: "샤넬의 홀리데이 시즌을 기념하는 특별한 아이스링크에서 스케이팅을 즐겨보세요. 이용 방법 및 자세한 사항은 현장에서 확인 가능합니다.",
//     images: ["https://i.ibb.co/dfyKZXM/14.jpg"],
//     contact: "example@chanel.com",
//   },
//   {
//     id: 11,
//     type: "sports",
//     owner: "아디다스",
//     name: "아디다스 그라운드 성수 팝업스토어",
//     location: "서울특별시 성동구 아차산로 100 성수역 성수동 일대",
//     startDate: "2024.10.03",
//     endDate: "2024.10.06",
//     business_hours: "목~일: 11:00-20:00 (월~수: 휴무)",
//     description: "아디다스 그라운드 성수에서 한정판 키링 증정 이벤트를 만나보세요! 전기자전거와 함께 공간을 탐험하며 특별한 경험을 즐길 수 있습니다.",
//     images: ["https://i.ibb.co/0GcN6Cg/15.jpg"],
//     contact: "example@adidas.com",
//   },
//   {
//     id: 12,
//     type: "education",
//     owner: "네이버커넥트재단",
//     name: "네이버 커넥트 재단 SEF2024 성수 팝업",
//     location: "서울특별시 성동구 연무장7길 16 한서빌딩 1층",
//     startDate: "2024.09.06",
//     endDate: "2024.09.07",
//     business_hours: "금~토: 10:00-20:00 (월~목, 일: 휴무)",
//     description: "SEF2024 성수 팝업에서는 AI 교육과 놀이 체험 프로그램을 제공합니다. 미션 수행을 통해 굿즈를 받을 수 있는 특별한 기회를 놓치지 마세요!",
//     images: ["https://i.ibb.co/CvT8Mbn/16.png"],
//     contact: "example@naver.com",
//   },
//   {
//     id: 13,
//     type: "miscellaneous",
//     owner: "인아워맨션",
//     name: "인아워맨션 팝업스토어",
//     location: "서울특별시 종로구 계동길 23 북쪽방향 두 번째 가게 공공룸",
//     startDate: "2024.07.11",
//     endDate: "2024.08.04",
//     business_hours: "12:00-19:00",
//     description: "여름과 어울리는 다양한 제품과 브랜드를 만나볼 수 있는 팝업스토어. <Summer Breeze>에 많은 관심 부탁드립니다!",
//     images: ["https://i.ibb.co/j3Bj32j/17.jpg"],
//     contact: "example@inourmansion.com",
//   },
//   {
//     id: 14,
//     type: "miscellaneous",
//     owner: "논논(NONENON)",
//     name: "NONENON 팝업스토어",
//     location: "서울특별시 마포구 양화로 188 애경타워 AK PLAZA 홍대 1F",
//     startDate: "2024.01.16",
//     endDate: "2024.02.08",
//     business_hours: "11:00-22:00",
//     description: "논논의 특별한 팝업스토어에서 다양한 오브제와 함께 특별 프로모션을 즐겨보세요. 10만원 이상 구매 시 특별 패키지 증정 이벤트도 진행됩니다.",
//     images: ["https://i.ibb.co/Dwr8Rhj/18.jpg"],
//     contact: "example@nonenon.com",
//   },
//   {
//     id: 15,
//     type: "culture",
//     owner: "그라운드시소",
//     name: "<우연히 웨스 앤더슨 2> 전시",
//     location: "서울특별시 중구 세종대로 14 그랜드센트럴 3층",
//     startDate: "2024.10.18",
//     endDate: "2025.04.13",
//     business_hours: "10:00-19:00",
//     description: "웨스 앤더슨의 세계를 탐험하며 낯선 풍경 속 모험을 경험해보세요. 예비 모험가 여러분을 환영합니다!",
//     images: ["https://i.ibb.co/VjGgFCY/19.jpg"],
//     contact: "example@groundseesaw.com",
//   },
//   {
//     id: 16,
//     type: "interior",
//     owner: "에이치코너",
//     name: "에이치코너 성수 팝업스토어",
//     location: "서울특별시 성동구 뚝섬로 403 2층",
//     startDate: "2024.11.07",
//     endDate: "2024.11.10",
//     business_hours: "12:00-18:00 (월~수: 휴무)",
//     description: "다양한 디자이너 체어와 인테리어 제품을 만나볼 수 있는 팝업스토어입니다. 주차는 불가능하니 참고 바랍니다.",
//     images: ["https://i.ibb.co/5vXT8pQ/20.jpg"],
//     contact: "example@hcorner.com",
//   },
//   {
//     id: 17,
//     type: "culture",
//     owner: "서울백제어린이박물관",
//     name: "서울백제어린이박물관 개관기념특별전 <선사시대로의 소소한 탐험>",
//     location: "서울 송파구 올림픽로 424 서울백제어린이박물관 다목적실",
//     startDate: "2024.11.15",
//     endDate: "2025.02.02",
//     business_hours: "09:30-17:30 (월: 휴무)",
//     description: "어린이들이 선사시대의 삶을 체험하며 배울 수 있는 전시. 모형과 다양한 콘텐츠로 흥미로운 탐험을 즐겨보세요.",
//     images: ["https://i.ibb.co/jg6tXWZ/21.jpg"],
//     contact: "example@seoulbaekje.com",
//   },
//   {
//     id: 18,
//     type: "popular",
//     // (수정) type: "interior",
//     owner: "자주",
//     name: "자주엣홈 SS2025 JAJU적인 집",
//     location: "서울 종로구 북촌로 53",
//     startDate: "24.12.12",
//     endDate: "24.12.14",
//     business_hours: "11:00 - 16:00",
//     // (수정) 월~목, 금~일
//     description: "신세계 자주가 선보이는 새로운 공간에 당신을 초대합니다.",
//     images: ["https://i.ibb.co/CH2ZCM3/13.jpg"],
//     contact: "example@jaju.com",
//   },
//   {
//     id: 19,
//     type: "scheduled",
//     // (수정) type: "digital",
//     owner: "로지텍",
//     name: "로지텍 팝업스토어",
//     location: "서울특별시 강남구 강남대로 426 진우빌딩 일상비일상의틈byU+ 일상비일상의틈byU+",
//     startDate: "24.10.16",
//     endDate: "24.10.27",
//     business_hours: "10:30 - 20:00",
//     // (수정) 주중, 주말 따로
//     description: "디지털에 예쁨까지 곁들인 역대급 로지텍 팝업 Coming Soon!",
//     images: ["https://i.ibb.co/ZzJ92K7/12.jpg"],
//     contact: "example@logitec.com",
//   },
// ];

// function filterByCategory(category) {
//   if (!category || category === "whole") {
//     return popupData;
//   }

//   return popupData.filter((item) => item.type === category);
// }

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
      // API
      const response = await fetch(`http://localhost:3000/api/categories/${category}`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      console.log("카테고리 response: ", response);

      // category type
      // whole, food, education, culture, digital, clothing, interior, sports, fashion miscellaneous goods, characters, others
      // popular, scheduled

      //API
      const data = await response.json();
      console.log("카테고리 데이터: ", data);
      //  data = {
      //     categories: [
      //       { id: 100, type: "culture", name: "오징어게임2 팝업스토어 in 강남", imageUrl: "https://i.ibb.co/grpvWqW/list1.jpg", location: "" },
      //       { id: 200, type: "food", name: "바나나맛우유 50주년 팝업스토어", imageUrl: "https://i.ibb.co/vJrZYn3/list2.jpg", location: "" },
      //       { id: 300, type: "characters", name: "카카오프렌즈 춘식이 X 해리포터 팝업스토어", imageUrl: "", location: "서울특별시 서초구 강남대로 429 카카오프렌즈 강남플래그십 스토어" },
      //       { id: 1, type: "culture", name: "카카오프렌즈 춘식이 X 해리포터 팝업스토어", imageUrl: "", location: "서울특별시 서초구 강남대로 429 카카오프렌즈 강남플래그십 스토어" },
      //     ],
      //   };

      if (data.categories) {
        setPopups(data.categories);
        // setPopups(data);

        // (수정) MOCK
        // const data = filterByCategory(category);
        // if (data) {
        //   setPopups(data);
        // } else {
        //   setPopups([]);
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

      // (수정) MOCK
      // const data = filterByCategory(category);
      // if (data) {
      //   setPopups(data);
      // } else {
      //   setPopups([]);
      // }
    }
  }, [category]);

  // 로그인 상태일 때만 좋아요 데이터 가져오기
  useEffect(() => {
    // 로그인 되지 않은 경우 무시
    if (!auth.isLoggedIn) {
      return;
    }

    // fetch(`/api/users/${sessionStorage.getItem("userId")}/likes`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     const likes = data.likes.map((store) => store.s_id);
    //     setLikedPopups(likes);
    //   })
    //   .catch((err) => console.error("Error fetching likes:", err));

    // (수정) MOCK
    const data = {
      likes: [{ s_id: "18" }, { s_id: "19" }, { s_id: "200" }, { s_id: "6" }, { s_id: "10" }, { s_id: "11" }],
    };
    const likes = data.likes.map((store) => parseInt(store.s_id));
    setLikedPopups(likes);
  }, [auth.isLoggedIn]);

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
