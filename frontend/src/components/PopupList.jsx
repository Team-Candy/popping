import PropTypes from "prop-types";
import useAuth from "../context/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, useCheckToken, formatURL } from "../utils/util";

const PopupList = ({ category }) => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const checkToken = useCheckToken();

  const [popups, setPopups] = useState([]);
  const [error, setError] = useState(null);
  const [likedPopups, setLikedPopups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) {
      fetchCategoryData(category);
    }
  }, [category]);

  const fetchCategoryData = async (category) => {
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/categories/${category}`);

      if (!response.ok) {
        setPopups([]);

        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      if (data.categories) {
        setPopups(data.categories);
      }
    } catch (err) {
      // setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (category) {
  //     setError(null);
  //     fetch(`${import.meta.env.VITE_BE_PORT}/api/categories/${category}`)
  //       .then((res) => res.json())
  //       .then((data) => setPopups(data.categories))
  //       .catch((err) => {
  //         console.error("Error fetching popups:", err);
  //         setError(err.message);
  //       });
  //   }
  // }, [category]);

  useEffect(() => {
    if (!auth.isLoggedIn) {
      return;
    }

    const fetchLikesData = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/likes`);
        const data = await response.json();

        if (!response.ok) {
          checkToken(response);

          if (data.error === "Likes not found") {
            return;
          }
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
                  <p className="mt-2 text-xs text-[#808080]">{popup.owner}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeToggle(popup.id);
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
};

PopupList.propTypes = {
  category: PropTypes.string.isRequired,
};

export default PopupList;
