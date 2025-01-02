import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate(); // useNavigate 훅
  const location = useLocation();

  useEffect(() => {
    // input box value 유지하기
    const queryParams = new URLSearchParams(location.search);
    const queryFromURL = queryParams.get("query");

    // popup/search 가 아닌 다른 페이지 이동 시 input 값 초기화
    if (!location.pathname.startsWith("/popup/search")) {
      setQuery(""); // 다른 페이지 이동시 초기화
    } else {
      setQuery(queryFromURL || ""); // URL에 query 값이 있으면 설정, 없으면 빈 문자열
    }
  }, [location]);

  const handleSearch = async () => {
    // 검색 후 /search 페이지로 이동
    navigate(`/popup/search?query=${query}`);
  };

  return (
    <>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="팝업스토어 이름, 지역 검색"></input>
      <button onClick={handleSearch}>검색</button>
    </>
  );
};

export default SearchBar;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// // import SearchResult from "../pages/SearchResultPage";

// // async function fetchData(query) {
// //   try {
// //     // const response = await fetch(`/api/search?query=${query}`);
// //     // if (!response.ok) {
// //     //   throw new Error("Failed to fetch data");
// //     // }
// //     // const data = await response.json();

// //     // 임시 데이터
// //     const data = {
// //       results: [
// //         {
// //           id: 100,
// //           name: "오징어게임2 팝업스토어 in 강남",
// //           location: "서울 서초구 신반포로 176 신세계백화점 강남점 1층 오픈스테이지",
// //           startDate: "2024.12.20",
// //           endDate: "2025.01.12",
// //           images: ["https://i.ibb.co/tPJYqCB/detail2-1.jpg"],
// //         },
// //         {
// //           id: 200,
// //           name: "바나나맛우유 50주년 팝업스토어",
// //           location: "서울 종로구 삼일대로28길 28 누디트 익선 B동",
// //           startDate: "2024.12.21",
// //           endDate: "2024.12.28",
// //           images: ["https://i.ibb.co/2df8xYG/detail1.jpg"],
// //         },
// //       ],
// //       pagination: {
// //         currentPage: 1,
// //         totalPages: 2,
// //         totalItems: 15,
// //       },
// //     };

// //     return data.results;
// //   } catch (err) {
// //     console.error(err);
// //   }
// // }

// const SearchBar = () => {
//   const [query, setQuery] = useState("");
//   // const [results, setResults] = useState([]);
//   const navigate = useNavigate(); // useNavigate 훅

//   const handleSearch = async () => {
//     // const data = await fetchData(query);
//     // setResults(data);

//     // 검색 후 /search 페이지로 이동
//     navigate(`/search?query=${query}`);
//   };

//   return (
//     <>
//       <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="팝업스토어 이름, 지역 검색"></input>
//       <button onClick={handleSearch}>검색</button>

//       {/* 검색 결과가 있으면 SearchResults로 전달 */}
//       {/* {results.length > 0 && <SearchResult results={results} />} */}
//     </>
//   );
// };

// export default SearchBar;
