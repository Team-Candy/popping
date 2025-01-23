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
    if (selectedCategory === category) {
      return setSelectedCategory("");
    }
    setSelectedCategory(category);
  };

  return (
    <div>
      <div className="text-center text-xl font-bold text-gray-800 mb-4">카테고리로 찾기</div>

      <div>
        {/* 카테고리 버튼 */}
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

        {/* 선택된 카테고리가 있으면 PopupList 컴포넌트를 렌더링 */}

        {selectedCategory && <PopupList category={selectedCategory}></PopupList>}
      </div>
    </div>
  );
};

export default Category;
