import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

async function fetchData(query, page = 1, limit = 10) {
  // // API 요청
  // try {
  //   const response = await fetch(`/api/search?query=${query}&page=${page}&limit=${limit}`);
  //   if (!response.ok) {
  //     throw new Error("Failed to fetch data");
  //   }
  //   const data = await response.json();

  //   return data;
  // } catch (err) {
  //   console.error(err);
  //   return { results: [], pagination: { currentPage: 1, totalPages: 0, totalItem: 0 } };
  // }

  // 임시 데이터
  const data = {
    results: [
      {
        id: 100,
        name: "오징어게임2 팝업스토어 in 강남",
        location: "서울 서초구 신반포로 176 신세계백화점 강남점 1층 오픈스테이지",
        startDate: "2024.12.20",
        endDate: "2025.01.12",
        images: ["https://i.ibb.co/tPJYqCB/detail2-1.jpg"],
      },
      {
        id: 200,
        name: "바나나맛우유 50주년 팝업스토어",
        location: "서울 종로구 삼일대로28길 28 누디트 익선 B동",
        startDate: "2024.12.21",
        endDate: "2024.12.28",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 1,
        name: "서울 팝업스토어",
        location: "서울 강남구",
        category: "패션",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 2,
        name: "서울 음식 팝업스토어",
        location: "서울 종로구",
        category: "음식",
        startDate: "2024-02-01",
        endDate: "2024-02-28",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 3,
        name: "서울 뷰티 팝업스토어",
        location: "서울 강서구",
        category: "뷰티",
        startDate: "2024-03-01",
        endDate: "2024-03-15",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 4,
        name: "서울 예술 팝업스토어",
        location: "서울 마포구",
        category: "예술",
        startDate: "2024-04-01",
        endDate: "2024-04-30",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 5,
        name: "서울 리빙 팝업스토어",
        location: "서울 송파구",
        category: "리빙",
        startDate: "2024-05-01",
        endDate: "2024-05-15",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 6,
        name: "서울 테크 팝업스토어",
        location: "서울 용산구",
        category: "테크",
        startDate: "2024-06-01",
        endDate: "2024-06-30",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 7,
        name: "서울 패션 팝업스토어",
        location: "서울 동대문구",
        category: "패션",
        startDate: "2024-07-01",
        endDate: "2024-07-15",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 8,
        name: "서울 음식 팝업스토어",
        location: "서울 강북구",
        category: "음식",
        startDate: "2024-08-01",
        endDate: "2024-08-31",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 9,
        name: "서울 스포츠 팝업스토어",
        location: "서울 서초구",
        category: "스포츠",
        startDate: "2024-09-01",
        endDate: "2024-09-30",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 10,
        name: "서울 영화 팝업스토어",
        location: "서울 강동구",
        category: "영화",
        startDate: "2024-10-01",
        endDate: "2024-10-15",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 11,
        name: "서울 패션 팝업스토어",
        location: "서울 관악구",
        category: "패션",
        startDate: "2024-11-01",
        endDate: "2024-11-30",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 12,
        name: "서울 책 팝업스토어",
        location: "서울 성동구",
        category: "도서",
        startDate: "2024-12-01",
        endDate: "2024-12-15",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 13,
        name: "서울 카페 팝업스토어",
        location: "서울 중구",
        category: "음식",
        startDate: "2025-01-01",
        endDate: "2025-01-15",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 14,
        name: "서울 뷰티 팝업스토어",
        location: "서울 은평구",
        category: "뷰티",
        startDate: "2025-02-01",
        endDate: "2025-02-28",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
      {
        id: 15,
        name: "서울 여행 팝업스토어",
        location: "서울 노원구",
        category: "여행",
        startDate: "2025-03-01",
        endDate: "2025-03-15",
        images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
      },
    ],
    pagination: {
      currentPage: 1,
      totalPages: 3,
      totalItems: 15,
    },
  };

  const startIndex = (page - 1) * limit;
  const paginatedResults = data.results.slice(startIndex, startIndex + limit);

  return {
    results: paginatedResults,
    pagination: {
      currentPage: page,
      totalPages: data.pagination.totalPages,
      totalItems: data.pagination.totalItems,
    },
  };
}

const SearchResult = () => {
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 0, currentPage: 1, totalItems: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation(); // URL의 쿼리 파라미터
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");

    if (query) {
      const fetchResults = async () => {
        const data = await fetchData(query, currentPage, 5); // 5개씩 가져옴
        setResults(data.results);
        setPagination(data.pagination);
      };

      fetchResults();
    }
  }, [location.search, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2 style={{ color: "red" }}>검색 결과</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
        {results.length > 0 ? (
          results.map((popup) => (
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
              <p>위치: {popup.location}</p>
              <p>
                기간: {popup.startDate} ~ {popup.endDate}
              </p>
            </div>
          ))
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </div>

      {/* 페이지네이션 */}
      <div style={{ marginTop: "20px" }}>
        {Array.from({ length: pagination.totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            disabled={index + 1 === currentPage}
            style={{
              margin: "0 5px",
              padding: "5px 10px",
              backgroundColor: index + 1 === currentPage ? "gray" : "lightGray",
              cursor: index + 1 === currentPage ? "not-allowed" : "pointer",
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchResult;
