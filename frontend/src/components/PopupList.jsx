import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const PopupList = ({ category }) => {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState(null);

  const fetchCategoryData = async (category) => {
    setError(null);

    try {
      const response = await fetch(`/api/main/categories/${category}`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      //API
      // const data = response.json();

      // 임시 데이터
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
    }
  };

  useEffect(() => {
    if (category) {
      fetchCategoryData(category);
    }
  }, [category]);

  return (
    <div>
      {error && <p>Error: {error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
        {stores.length > 0 ? (
          stores.map((store) => (
            <div key={store.id} style={{ textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
              <a href={store.redirectUrl} style={{ textDecoration: "none", color: "black", cursor: "pointer" }}>
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
