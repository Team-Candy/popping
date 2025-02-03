import { useState } from "react";
import PopupList from "./PopupList";

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState("whole");

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

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      return setSelectedCategory("");
    }
    setSelectedCategory(category);
  };

  return (
    <div>
      <div className="text-center text-xl font-bold text-gray-800 mb-4">카테고리로 찾기</div>

      <div>
        <div className="p-4 justify-center items-center gap-2 flex flex-wrap">
          {categories.map((item) => (
            <div key={item.value}>
              <div
                key={item.value}
                className={`p-2 rounded-lg border border-[#b3b3b3] justify-center items-center gap-3 flex text-center text-xs font-normal font-['Pretendard'] leading-normal whitespace-nowrap w-full sm:w-auto transition-all hover:cursor-pointer ${selectedCategory === item.value ? "border-[#A15EA1] bg-opacity-30 bg-[#C8A0C8] text-[#A15EA1]" : "text-black"} active:bg-gray-300 active:scale-95`}
                onClick={() => handleCategoryClick(item.value)}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {selectedCategory && <PopupList category={selectedCategory}></PopupList>}
      </div>
    </div>
  );
};

export default Category;
