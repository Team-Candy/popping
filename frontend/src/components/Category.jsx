import { useState } from "react";
import PopupList from "./PopupList";

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState("");

  const category = ["전체", "식품", "교육", "문화", "디지털", "의류", "인테리어", "스포츠", "패션잡화", "캐릭터", "기타"];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div>
      <div>
        {category.map((item) => (
          <button key={item} onClick={() => handleCategoryClick(item)}>
            {item}
          </button>
        ))}
        {/* 선택된 카테고리가 있으면 PopupList 컴포넌트를 렌더링 */}
        {selectedCategory && <PopupList category={selectedCategory}></PopupList>}
      </div>
    </div>
  );
};

export default Category;
