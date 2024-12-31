import { useState } from "react";
import PopupList from "./PopupList";
// PopupList 컴포넌트를 가져옴.

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    { label: "전체", value: "whole" },
    { label: "식품", value: "food" },
    { label: "교육", value: "education" },
    { label: "문화", value: "culture" },
    { label: "디지털", value: "digital" },
    { label: "의류", value: "clothing" },
    { label: "인테리어", value: "interior" },
    { label: "스포츠", value: "sports" },
    { label: "패션잡화", value: "miscellaneous" },
    { label: "캐릭터", value: "characters" },
    { label: "기타", value: "others" },
  ];

  //  whole, food, education, culture, digital, clothing, interior, sports, miscellaneous, characters, others
  // const category = ["전체", "식품", "교육", "문화", "디지털", "의류", "인테리어", "스포츠", "패션잡화", "캐릭터", "기타"];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div>
      {/* 카테고리 버튼 목록 */}
      <div>
        {categories.map((item) => (
          <button key={item.value} onClick={() => handleCategoryClick(item.value)}>
            {item.label}
          </button>
        ))}
        {/* 선택된 카테고리가 있으면 PopupList 컴포넌트를 렌더링 */}
        {selectedCategory && <PopupList category={selectedCategory}></PopupList>}
      </div>
    </div>
  );
};

export default Category;
