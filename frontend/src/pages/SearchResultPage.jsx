import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

async function fetchData(query) {
  try {
    // const response = await fetch(`/api/search?query=${query}&page=${page}&limit=${limit}`);
    // if (!response.ok) {
    //   throw new Error("Failed to fetch data");
    // }
    // const data = await response.json();

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
      ],
      pagination: {
        currentPage: 1,
        totalPages: 2,
        totalItems: 15,
      },
    };

    return data.results;
  } catch (err) {
    console.error(err);
  }
}

const SearchResult = () => {
  const [results, setResults] = useState([]);
  const location = useLocation(); // URL의 쿼리 파라미터

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");

    if (query) {
      const fetchResults = async () => {
        const data = await fetchData(query);
        console.log("data: ", data);

        setResults(data);
      };

      fetchResults();
    }
  }, [location.search]);

  const navigate = useNavigate();

  return (
    <div>
      <h2>검색 결과</h2>

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
            </div>
          ))
        ) : (
          <p>No Popup available.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResult;
