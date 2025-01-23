import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, useCheckToken } from "../utils/util";

const PopupList = () => {
  // {state} ->  onGoing, scheduled, completed
  const checkToken = useCheckToken();

  const [popups, setPopups] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchUserPopup = async () => {
    setError(null);

    // 현재 유저 아이디
    const userId = sessionStorage.getItem("userId");

    try {
      // (수정) API - 유저가 작성한 게시글 조회
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${userId}/stores`);

      if (!response.ok) {
        checkToken(response);

        const data = await response.json();
        setPopups([]);
        setError("작성된 게시글이 없습니다.");
        setLoading(false);
        console.error("서버 fetch 중 에러 발생 : ", data.error);
        return;
      }

      const data = await response.json();

      setPopups(data.stores);
    } catch (err) {
      setError("네트워크 오류 발생");
      console.error("네트워크 오류 발생: ", err.message);
    }
  };

  useEffect(() => {
    fetchUserPopup();
  }, []);

  return (
    <div>
      {error && <p className="text-center mt-20">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {popups.length > 0 ? (
          popups.map((popup) => (
            <div key={popup.s_id} onClick={() => navigate(`/popup/edit/${popup.s_id}`)} className="cursor-pointer text-center border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
              <img src={`${import.meta.env.VITE_BE_PORT}${popup.images[0]}`} alt={popup.s_name} className="w-full h-40 object-cover rounded-lg mb-4" />
              <p className="text-sm font-semibold text-gray-800">{popup.s_name}</p>
              <p className="text-sm text-gray-600">{popup.owner}</p>
            </div>
          ))
        ) : (
          <div>
            {loading && <p>로딩중...</p>}
            {!loading && <p>업로드한 팝업 스토어가 존재하지 않습니다.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupList;
