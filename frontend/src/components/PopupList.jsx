import PropTypes from "prop-types";
import useAuth from "../context/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PropTypes from "prop-types";
import useAuth from "../context/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatURL } from "../utils/util";

function filterByCategory(category) {
  if (!category || category === "whole") {
    return popupData;
  }

  return popupData.filter((item) => item.type === category);
}
import { formatURL } from "../utils/util";

const PopupList = ({ category }) => {
  const [popups, setPopups] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCategoryData = async (category) => {
    setError(null);

    try {
      const response = await fetch(`/api/main/categories/${category}`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      //API
      // const data = response.json();
      //  data = {
      //     categories: [
      //       { id: 100, type: "culture", name: "오징어게임2 팝업스토어 in 강남", imageUrl: "https://i.ibb.co/grpvWqW/list1.jpg", location: "" },
      //       { id: 200, type: "food", name: "바나나맛우유 50주년 팝업스토어", imageUrl: "https://i.ibb.co/vJrZYn3/list2.jpg", location: "" },
      //       { id: 300, type: "characters", name: "카카오프렌즈 춘식이 X 해리포터 팝업스토어", imageUrl: "", location: "서울특별시 서초구 강남대로 429 카카오프렌즈 강남플래그십 스토어" },
      //       { id: 1, type: "culture", name: "카카오프렌즈 춘식이 X 해리포터 팝업스토어", imageUrl: "", location: "서울특별시 서초구 강남대로 429 카카오프렌즈 강남플래그십 스토어" },
      //     ],
      //   };

      // category type
      // whole, food, education, culture, digital, clothing, interior, sports, fashion miscellaneous goods, characters, others
      // popular, scheduled

      const data = await response.json();

      // api
      // if (data.categories) {
      // setPopups(data.categories);

      if (data) {
        setPopups(data);
      } else {
        setPopups([]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (category) {
      fetchCategoryData(category);
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

  return (
    <div className="max-w-[1000px] mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-7 gap-7">
      {error && <p>Error: {error}</p>}
      {popups.length > 0 ? (
        popups.map((popup) => (
          <div className="mb-2 hover:cursor-pointer max-w-[150px] max-h-[200px] justify-self-center" key={popup.id} onClick={() => navigate(`/popup/${popup.id}`)}>
            <div>
              <div className="max-w-[150px] max-h-[150px] aspect-square overflow-hidden rounded-md">
                <img src={formatURL(popup.images[0])} alt={popup.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex w-full justify-between items-center inline-flex">
                <div>
                  <p className="text-xs text-[#808080]">{popup.owner}</p>
                </div>

                {/* 하트 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 클릭 이벤트 방지
                    handleLikeToggle(popup.id); // 하트 상태 토글
                  }}
                >
                  {likedPopups.includes(popup.id) ? "❤️" : "🤍"}
                </button>
              </div>
              <p className="text-[13px] font-bold">{popup.name}</p>
            </div>
          </div>
        ))
      ) : (
        <div>{loading ? <></> : <p>해당 카테고리에 대한 팝업이 없습니다.</p>}</div>
      )}
    </div>
  );
  // return (
  //   <div className="mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-7 gap-7">
  //     {error && <p>Error: {error}</p>}
  //     {popups.length > 0 ? (
  //       popups.map((popup) => (
  //         <div className="mb-2 hover:cursor-pointer max-w-[150px] max-h-[200px]" key={popup.id} onClick={() => navigate(`/popup/${popup.id}`)}>
  //           <div>
  //             <div className="max-w-[150px] max-h-[150px] aspect-square overflow-hidden rounded-md">
  //               <img src={formatURL(popup.images[0])} alt={popup.name} className="w-full h-full object-cover" />
  //             </div>
  //             <div className="flex w-full justify-between items-center inline-flex">
  //               <div>
  //                 <p className="text-xs text-[#808080]">{popup.owner}</p>
  //               </div>

  //               {/* 하트 버튼 */}
  //               <button
  //                 onClick={(e) => {
  //                   e.stopPropagation(); // 부모 클릭 이벤트 방지
  //                   handleLikeToggle(popup.id); // 하트 상태 토글
  //                 }}
  //               >
  //                 {likedPopups.includes(popup.id) ? "❤️" : "🤍"}
  //               </button>
  //             </div>
  //             <p className="text-[13px] font-bold">{popup.name}</p>
  //           </div>
  //         </div>
  //       ))
  //     ) : (
  //       <div>{loading ? <></> : <p>해당 카테고리에 대한 팝업이 없습니다.</p>}</div>
  //     )}
  //   </div>
  // );
};

PopupList.propTypes = {
  category: PropTypes.string.isRequired, // category는 필수로 string이어야 함
};

export default PopupList;
