import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, useCheckToken } from "../utils/util";

const RegisterPopupPage = () => {
  const navigate = useNavigate();
  const checkToken = useCheckToken();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [owner, setOwner] = useState("");
  const [contact, setContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [isDescriptionValid, setIsDescriptionValid] = useState(false);

  const [images, setImages] = useState([null]);
  const [imagesValid, setImagesValid] = useState(false);

  const [isFormValid, setIsFormValid] = useState(false);

  // 이미지 업로드 처리
  const handleImageChange = (e, index) => {
    const newImage = e.target.files[0];
    if (newImage) {
      const updatedImages = [...images];
      updatedImages[index] = newImage; // 현재 필드에 해당하는 이미지 업데이트
      if (index === images.length - 1) {
        // 마지막 이미지 필드에 이미지를 추가했다면 새로운 필드 추가
        updatedImages.push(null);
      }
      setImages(updatedImages); // 상태 업데이트

      // 유효성
      setImagesValid(true);
    }
  };
  //   이미지 삭제 처리 (미리보기와 데이터 삭제)
  const handleImageDelete = (index) => {
    const updatedImages = images.filter((_, i) => i !== index); // 해당 인덱스 이미지와 필드 삭제
    setImages(updatedImages); // 상태 업데이트

    // 유효성
    if (updatedImages.length === 0) {
      setImagesValid(false);
    }
  };

  const categories = [
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
  //   const isFormValid = () => {
  //     return name.trim() !== "" && location.trim() !== "" && startDate !== "" && endDate !== "" && selectedCategory && owner.trim() !== "" && isDescriptionValid && imagesValid;
  //   };
  useEffect(() => {
    const valid = name.trim() !== "" && location.trim() !== "" && startDate !== "" && endDate !== "" && selectedCategory && owner.trim() !== "" && contact.trim() !== "" && isDescriptionValid && imagesValid;
    setIsFormValid(valid);
  }, [name, location, owner, contact, startDate, endDate, selectedCategory, isDescriptionValid, imagesValid]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 디버깅
    // console.log("isFormValid:", isFormValid);

    // API - 서버로 데이터 보내기
    if (isDescriptionValid && selectedCategory && images.length > 0) {
      const formData = new FormData();
      formData.append("s_name", name);
      formData.append("location", location);
      formData.append("s_date", startDate);
      formData.append("e_date", endDate);
      formData.append("business_hours", startTime + "-" + endTime);
      formData.append("category", selectedCategory);
      formData.append("owner", owner);
      formData.append("contact", contact);
      formData.append("description", description);

      // 이미지 추가
      images.forEach((image, index) => {
        formData.append(`image[]`, image);
        console.log(`image[${index}]`, image);
        // formData.append(`image[${index}]`, image);
      });

      // const files = document.querySelector('input[type="file"]').files;
      // for (let i = 0; i < files.length; i++) {
      //   formData.append("image[]", files[i]);
      // }

      // 디버깅
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      try {
        console.log("formData: ", formData);

        // API - 사용자가 팝업 게시물 등록
        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/stores`, {
          method: "POST",
          //   headers 자동설정됨
          body: formData, // FormData 객체 전송
        });

        if (!response.ok) {
          checkToken(response);

          // 서버 오류 처리
          console.error("서버 오류: ", response.status);
          alert("서버 오류가 발생했습니다. 다시 시도해 주세요.");
          return;
        }

        const data = await response.json();
        console.log("응답 데이터: ", data);

        alert("등록 성공했습니다.");
        navigate("/myPopup");
      } catch (err) {
        //네트워크 오류 처리
        console.error("네트워크 오류: ", err);
        alert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    }
  };

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
    backgroundColor: isFormValid ? "#4CAF50" : "#ccc", // 유효할 경우 초록색, 비활성화되면 회색
    color: isFormValid ? "white" : "gray", // 텍스트 색상
    cursor: isFormValid ? "pointer" : "not-allowed", // 클릭 가능 시 포인터, 비활성화 시 불가
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>팝업 등록하기</h2>

        <div>
          <p>카테고리를 선택해주세요.</p>
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryClick(category.value)}
              style={{
                backgroundColor: selectedCategory === category.value ? "lightPink" : "transparent", // 선택된 카테고리 배경색 변경
                color: "black",
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
          <p>팝업스토어 이름</p>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <p>장소</p>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div>
          <p>주최자</p>
          <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>

        <div>
          <p>문의 연락처</p>
          <input type="text" value={contact} placeholder="email, etc ..." onChange={(e) => setContact(e.target.value)} />
        </div>

        <div>
          <p>운영 기간</p>
          <label>시작일자 </label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={dateStyle} />
          <br />
          <label>종료일자 </label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={dateStyle} />
        </div>

        <div>
          <p>운영 시간</p>
          <label>시작시간</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <br />
          <label>종료시간</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <div>
          <p>팝업을 소개해주세요.</p>
          <textarea value={description} onChange={handleDescription} placeholder="20자 이상 작성해주세요." style={descriptionStyle} />
          {descriptionError && <p style={{ color: "red" }}>{descriptionError}</p>}
        </div>

        <div>
          <p>이미지를 업로드해주세요.</p>

          {/* 이미지 업로드 입력란 */}
          {images.map((image, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <p>이미지 {index + 1}</p>
              {image && (
                <div>
                  <img src={URL.createObjectURL(image)} alt={`이미지 ${index + 1}`} style={{ maxWidth: "200px", maxHeight: "200px", marginBottom: "5px" }} />
                  <button type="button" onClick={() => handleImageDelete(index)}>
                    삭제
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, index)} // 업로드된 이미지가 있으면 그 이미지를 업데이트
              />
            </div>
          ))}
          {!imagesValid && <p style={{ color: "red" }}>이미지를 업로드하세요.</p>}
        </div>

        <button type="submit" style={submitStyle} disabled={!isFormValid}>
          등록
        </button>
      </form>
    </div>
  );
};

export default RegisterPopupPage;
