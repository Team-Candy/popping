// 이미지 추가 전!!

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPopupPage = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [owner, setOwner] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [isDescriptionValid, setIsDescriptionValid] = useState(false);

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
    setSelectedCategory(category);
  };

  const handleDescription = (e) => {
    const input = e.target.value;
    setDescription(input);

    // 최소 20자 이상 확인
    if (input.length >= 20) {
      setIsDescriptionValid(true);
      setDescriptionError("");
    } else {
      setIsDescriptionValid(false);
      setDescriptionError("20자 이상 입력해주세요.");
    }
  };

  // 모든 필드가 유효한지 검사
  const isFormValid = () => {
    return name.trim() !== "" && location.trim() !== "" && startDate !== "" && endDate !== "" && selectedCategory && owner.trim() !== "" && isDescriptionValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // API - 서버로 데이터 보내기
    if (isDescriptionValid && selectedCategory) {
      const formData = {
        name,
        location,
        startDate,
        endDate,
        category: selectedCategory,
        owner,
        description,
        // image: selectedImage,
      };

      try {
        // API - 사용자가 팝업 게시물 등록
        const response = await fetch(`http://localhost:3000/api/users/${sessionStorage.getItem("userId")}/stores`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          // 서버 오류 처리
          console.error("서버 오류: ", response.status);
          alert("서버 오류가 발생했습니다. 다시 시도해 주세요.");
          return;
        }

        const data = await response.json();
        console.log("응답 데이터: ", data);

        alert("제출에 성공했습니다.");
        navigate("/");
      } catch (err) {
        //네트워크 오류 처리
        console.error("네트워크 오류: ", err);
        alert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } else {
      alert("모든 필드를 올바르게 입력해주세요.");
    }
  };

  const style = { fontSize: 20, fontWeight: "bold", padding: 0, marginBottom: 5 };
  const dateStyle = { padding: "8px", fontSize: "14px", borderRadius: "4px", border: "1px solid #ccc" };
  const descriptionStyle = {
    width: "100%",
    //   maxWidth: "400px", // 최대 너비를 설정하여 너무 넓어지지 않도록 함
    height: "350px",
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box", // 패딩을 포함하여 요소 크기가 계산되도록 함
    outline: "none",
    resize: "none", // 사이즈조절 불가
    overflowY: "auto", // 텍스트가 넘칠 경우 스크롤이 생기도록 설정
    whiteSpace: "pre-wrap", // 텍스트가 자동으로 줄 바꿈 되도록 설정
  };
  const submitStyle = {
    backgroundColor: isFormValid() ? "#4CAF50" : "#ccc", // 유효할 경우 초록색, 비활성화되면 회색
    color: isFormValid() ? "white" : "gray", // 텍스트 색상
    cursor: isFormValid() ? "pointer" : "not-allowed", // 클릭 가능 시 포인터, 비활성화 시 불가
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>팝업 등록하기</h2>
        {/* <p style={{ fontSize: 20, fontWeight: "bold" }}>어떤 팝업을 올리고 싶나요?</p> */}

        <div>
          <p style={style}>카테고리를 선택해주세요.</p>
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryClick(category.value)}
              style={{
                backgroundColor: selectedCategory === category.value ? "lightPink" : "transparent", // 선택된 카테고리 배경색 변경
                color: "black",
                // color: selectedCategory === category.value ? "white" : "black", // 선택된 카테고리 텍스트 색 변경
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px 20px",
                margin: "5px",
                cursor: "pointer",
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div>
          <p style={style} value={name}>
            팝업스토어 이름
          </p>
          <input type="text" onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <p style={style} value={location}>
            장소
          </p>
          <input type="text" onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div>
          <p style={style} value={owner}>
            주최자
          </p>
          <input type="text" onChange={(e) => setOwner(e.target.value)} />
        </div>

        <div>
          <p style={style}>운영 기간</p>
          <label>시작일자 </label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={dateStyle} />
          <br />
          <label>종료일자 </label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={dateStyle} />
        </div>

        <div>
          <p style={style}>팝업을 소개해주세요.</p>
          <textarea value={description} onChange={handleDescription} placeholder="20자 이상 작성해주세요." style={descriptionStyle} />
          {descriptionError && <p style={{ color: "red" }}>{descriptionError}</p>}
        </div>

        <button type="submit" style={submitStyle} disabled={!isFormValid}>
          제출
        </button>
      </form>
    </div>
  );
};

export default RegisterPopupPage;
