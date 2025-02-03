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

  const handleImageChange = (e, index) => {
    const newImage = e.target.files[0];
    if (newImage) {
      const updatedImages = [...images];
      updatedImages[index] = newImage;
      if (index === images.length - 1) {
        updatedImages.push(null);
      }
      setImages(updatedImages);

      setImagesValid(true);
    }
  };

  const handleImageDelete = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);

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

  useEffect(() => {
    const valid = name.trim() !== "" && location.trim() !== "" && startDate !== "" && endDate !== "" && selectedCategory && owner.trim() !== "" && contact.trim() !== "" && isDescriptionValid && imagesValid;
    setIsFormValid(valid);
  }, [name, location, owner, contact, startDate, endDate, selectedCategory, isDescriptionValid, imagesValid]);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      });

      try {
        console.log("formData: ", formData);

        const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/stores`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          checkToken(response);

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

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">팝업 등록하기</h2>

        {/* 카테고리 선택 */}
        <div className="mb-6">
          <p className="text-lg font-semibold mb-3 text-gray-700">카테고리를 선택해주세요.</p>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button key={category.value} onClick={() => handleCategoryClick(category.value)} type="button" className={`px-4 py-2 rounded-lg border ${selectedCategory === category.value ? "bg-pink-200 border-pink-400" : "bg-gray-100 border-gray-300"} hover:bg-pink-100 hover:border-pink-300`}>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 팝업스토어 이름 */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">팝업스토어 이름</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-pink-200" />
        </div>

        {/* 장소 */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">장소</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-pink-200" />
        </div>

        {/* 주최자 */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">주최자</label>
          <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-pink-200" />
        </div>

        {/* 문의 연락처 */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">문의 연락처</label>
          <input type="text" value={contact} placeholder="email, etc ..." onChange={(e) => setContact(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-pink-200" />
        </div>

        {/* 운영 기간 */}
        <div className="mb-6">
          <p className="text-lg font-semibold mb-3 text-gray-700">운영 기간</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">시작일자</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-pink-200" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">종료일자</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-pink-200" />
            </div>
          </div>
        </div>

        {/* 운영 시간 */}
        <div className="mb-6">
          <p className="text-lg font-semibold mb-3 text-gray-700">운영 시간</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">시작시간</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-pink-200" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">종료시간</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-pink-200" />
            </div>
          </div>
        </div>

        {/* 팝업 소개 */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">팝업을 소개해주세요.</label>
          <textarea value={description} onChange={handleDescription} placeholder="20자 이상 작성해주세요." className="w-full p-3 border border-gray-300 rounded-lg h-28 focus:outline-none focus:ring focus:ring-pink-200" />
          {descriptionError && <p className="text-red-500 mt-1">{descriptionError}</p>}
        </div>

        {/* 이미지 업로드 */}
        <div className="mb-6">
          <p className="text-lg font-semibold mb-3 text-gray-700">이미지를 업로드해주세요.</p>
          {images.map((image, index) => (
            <div key={index} className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-1">이미지 {index + 1}</p>
              {image && (
                <div className="relative">
                  <img src={URL.createObjectURL(image)} alt={`이미지 ${index + 1}`} className="w-full max-w-xs h-auto rounded-lg shadow-md mb-2" />
                  <button type="button" onClick={() => handleImageDelete(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg">
                    삭제
                  </button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, index)} className="block w-full mt-2 text-sm text-gray-600" />
            </div>
          ))}
          {!imagesValid && <p className="text-red-500">이미지를 업로드하세요.</p>}
        </div>

        {/* 등록 버튼 */}
        <button type="submit" disabled={!isFormValid} className="w-full py-3 bg-[#c8a0c8] text-white font-semibold rounded-lg shadow-lg hover:bg-[#a15da1] focus:ring focus:ring-pink-300">
          등록
        </button>
      </form>
    </div>
  );
};

export default RegisterPopupPage;
