import { useState } from "react";

const Category = () => {
  const [stores, setStores] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const category = ["전체", "식품", "교육", "문화", "디지털", "의류", "인테리어", "스포츠", "패션잡화", "캐릭터", "기타"];
  // const [selectedCategory, setSelectedCategory] = useState("");

  // const categoryData = {
  //   전체: [
  //     { id: 1, name: "오징어게임2 팝업스토어 in 강남", imageUrl: "https://i.ibb.co/grpvWqW/list1.jpg", location: "" },
  //     { id: 2, name: "바나나맛우유 50주년 팝업스토어", imageUrl: "https://i.ibb.co/vJrZYn3/list2.jpg", location: ""},
  //   ],
  //   식품: [
  //     { id: 3, name: "김치 팝업스토어", imageUrl: "https://example.com/store3.png", location: "서울 종로구", likeCount: 320 },
  //     { id: 4, name: "떡볶이 맛집", imageUrl: "https://example.com/store4.png", location: "서울 강동구", likeCount: 210 },
  //   ],
  //   교육: [
  //     { id: 5, name: "온라인 교육 플랫폼", imageUrl: "https://example.com/store5.png", location: "서울 강남구", likeCount: 80 },
  //     { id: 6, name: "AI 교육 스튜디오", imageUrl: "https://example.com/store6.png", location: "서울 마포구", likeCount: 120 },
  //   ],
  //   문화: [
  //     { id: 7, name: "문화 예술 전시회", imageUrl: "https://example.com/store7.png", location: "서울 종로구", likeCount: 450 },
  //     { id: 8, name: "뮤지컬 공연", imageUrl: "https://example.com/store8.png", location: "서울 동대문구", likeCount: 350 },
  //   ],
  //   디지털: [
  //     { id: 9, name: "디지털 제품 쇼핑몰", imageUrl: "https://example.com/store9.png", location: "서울 송파구", likeCount: 220 },
  //     { id: 10, name: "IT 기기 팝업스토어", imageUrl: "https://example.com/store10.png", location: "서울 강서구", likeCount: 500 },
  //   ],
  //   의류: [
  //     { id: 11, name: "여성 의류 쇼핑몰", imageUrl: "https://example.com/store11.png", location: "서울 강남구", likeCount: 700 },
  //     { id: 12, name: "남성 의류 매장", imageUrl: "https://example.com/store12.png", location: "서울 서초구", likeCount: 320 },
  //   ],
  //   인테리어: [
  //     { id: 13, name: "모던 인테리어 매장", imageUrl: "https://example.com/store13.png", location: "서울 강동구", likeCount: 150 },
  //     { id: 14, name: "홈 인테리어 팝업", imageUrl: "https://example.com/store14.png", location: "서울 용산구", likeCount: 190 },
  //   ],
  //   스포츠: [
  //     { id: 15, name: "스포츠 용품 쇼핑몰", imageUrl: "https://example.com/store15.png", location: "서울 노원구", likeCount: 110 },
  //     { id: 16, name: "헬스케어 매장", imageUrl: "https://example.com/store16.png", location: "서울 중구", likeCount: 80 },
  //   ],
  //   패션잡화: [
  //     { id: 17, name: "액세서리 매장", imageUrl: "https://example.com/store17.png", location: "서울 마포구", likeCount: 300 },
  //     { id: 18, name: "시계 팝업스토어", imageUrl: "https://example.com/store18.png", location: "서울 용산구", likeCount: 220 },
  //   ],
  //   캐릭터: [
  //     { id: 19, name: "애니메이션 캐릭터 매장", imageUrl: "https://example.com/store19.png", location: "서울 강남구", likeCount: 420 },
  //     { id: 20, name: "캐릭터 굿즈 팝업", imageUrl: "https://example.com/store20.png", location: "서울 동대문구", likeCount: 330 },
  //   ],
  //   기타: [
  //     { id: 21, name: "기타 잡화 매장", imageUrl: "https://example.com/store21.png", location: "서울 종로구", likeCount: 180 },
  //     { id: 22, name: "수공예품 팝업", imageUrl: "https://example.com/store22.png", location: "서울 서대문구", likeCount: 150 },
  //   ],
  // };

  // 카테고리 클릭 시 해당 카테고리 데이터를 가져옴.

  const fetchCategoryData = async (category) => {
    // setLoading(true); // 데이터 로딩 시작
    setError(null); // 이전 오류 상태 초기화

    try {
      const response = await fetch(`/api/main/categories/${category}`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      // const data = await response.json();

      // 각 카테고리별 임시 데이터
      const data = {
        categories: [
          { redirectUrl: "https://www.popply.co.kr/popup/2947", id: 1, name: "오징어게임2 팝업스토어 in 강남", imageUrl: "https://i.ibb.co/grpvWqW/list1.jpg", location: "" },
          { redirectUrl: "https://www.popply.co.kr/popup/2956", id: 2, name: "바나나맛우유 50주년 팝업스토어", imageUrl: "https://i.ibb.co/vJrZYn3/list2.jpg", location: "" },
        ],
      };

      if (data.categories) {
        setStores(data.categories);
      } else {
        setStores([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      // setLoading(false); // 데이터 로딩 완료
    }
  };

  // 카테고리 클릭시 fetch 호출
  const handleCategoryClick = (category) => {
    fetchCategoryData(category);
  };

  return (
    <div>
      <div>
        {category.map((item) => (
          <button key={item} onClick={() => handleCategoryClick(item)}>
            {item}
          </button>
        ))}
      </div>

      {/* {loading && <p>Loading...</p>} */}
      {error && <p>Error: {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
        {stores.length > 0 ? (
          stores.map((store) => (
            <div key={store.id} style={{ textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
              <a href={store.redirectUrl} style={{ textDecoration: "none", color: "black", cursor: "pointer" }}>
                {/* 팝업 상세페이지 이동 링크 */}
                <img
                  src={store.imageUrl}
                  alt={store.name}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <p style={{ fontSize: "14px", marginTop: "8px" }}>{store.name}</p>
              </a>
              {/* 좋아요 버튼 */}
            </div>
          ))
        ) : (
          <p>No Popup available for this category.</p>
        )}
      </div>
    </div>
  );
};

export default Category;
