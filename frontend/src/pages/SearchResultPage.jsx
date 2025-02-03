import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "../context/useAuth";
import { fetchWithAuth, formatDate, formatURL, useCheckToken } from "../utils/util";

async function fetchData(query, limit = 10) {
  try {
    console.log("query: ", query);
    const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/search?value=${encodeURIComponent(query)}&limit=${limit}`);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    console.log("data: ", data);

    return {
      results: data.results,
    };
  } catch (err) {
    console.error(err);
    return { results: [] };
  }
}

const SearchResult = () => {
  const { auth } = useAuth();
  const checkToken = useCheckToken();

  const [likedPopups, setLikedPopups] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");

    if (query) {
      const fetchResults = async () => {
        setIsLoading(true);
        try {
          const data = await fetchData(query, 100);
          setResults(data.results);
        } catch (error) {
          console.error("데이터 로드 중 오류 발생:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchResults();
    }
  }, [location.search]);

  const fetchLikedPopups = async () => {
    if (!auth.isLoggedIn) {
      return;
    }

    const fetchLikesData = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/likes`);
        const data = await response.json();

        if (!response.ok) {
          checkToken(response);
          throw new Error("Failed to fetch liked popups", data.error);
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
    fetchLikedPopups();
  }, [auth.isLoggedIn]);

  const handleLikeToggle = async (popupId) => {
    if (!auth.isLoggedIn) {
      navigate("/login");
      alert("로그인 후 즐겨찾기에 추가 가능합니다.");
      return;
    }

    const isLiked = likedPopups.includes(popupId);
    setLikedPopups((prevLiked) => (isLiked ? prevLiked.filter((id) => id !== popupId) : [...prevLiked, popupId]));

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

      setLikedPopups((prevLiked) => (isLiked ? [...prevLiked, popupId] : prevLiked.filter((id) => id !== popupId)));
    }
  };

  return (
    <div className="py-8">
      <div className="flex flex-col items-center">
        <div className="max-w-4xl w-full text-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-800 py-10">검색 결과</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : results.length > 0 ? (
              results.map((popup) => (
                <div key={popup.id} onClick={() => navigate(`/popup/${popup.id}`)} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105">
                  <div className="relative">
                    <img src={formatURL(popup.images[0])} alt={popup.name} className="w-full h-48 object-cover rounded-t-lg" />
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-lg font-semibold text-gray-800">
                      {popup.name}{" "}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeToggle(popup.id);
                        }}
                        className="absolute top-2 right-2 rounded-full p-2"
                      >
                        {likedPopups.includes(popup.id) ? "❤️" : "🤍"}
                      </button>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">위치: {popup.location}</p>
                    <p className="text-sm text-gray-500">
                      기간: {formatDate(popup.startDate)} ~ {formatDate(popup.endDate)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
