import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import "../../styles/PopupEditPage.css";
import { fetchWithAuth, useCheckToken } from "../../utils/util";

const PopupEditPage = () => {
  const navigate = useNavigate();
  const { popupId } = useParams();
  const checkToken = useCheckToken();

  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null); // 에러 메시지 저장
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 저장
  const [editing, setEditing] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // 미리보기 URL 관리
  const [images, setImages] = useState([]);

  // 삭제된 이미지
  const [deleteImages, setDeleteImages] = useState([]);

  const [formData, setFormData] = useState({
    s_name: "",
    category: "",
    owner: "",
    location: "",
    s_date: "",
    e_date: "",
    business_hours: "",
    description: "",
    contact: "",
    images: [],
  });

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

  const formatDate = (dateString) => {
    const date = new Date(dateString); // 입력된 날짜 문자열을 Date 객체로 변환
    const year = date.getFullYear(); // 연도
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월 (0부터 시작하므로 +1을 해줌) 그리고 두 자릿수로 포맷
    const day = String(date.getDate()).padStart(2, "0"); // 일, 두 자릿수로 포맷

    return `${year}-${month}-${day}`; // "yyyy-MM-dd" 형식으로 반환
  };

  const handleCategoryClick = (category) => {
    setFormData((prev) => ({ ...prev, category: category }));
  };

  // (수정) 보안 2가지 방식
  // 권한 - 로컬 캐시나 상태 관리를 통해 재사용하는 방법

  // 권한 확인
  const auth = async () => {
    const userId = sessionStorage.getItem("userId");

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${userId}/stores/${popupId}/check-popup-permission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // 권한 있음
        setHasPermission(data.hasPermission);
      } else {
        checkToken(response);

        // 권한 없음
        setHasPermission(false);
        console.log("서버 에러: ", data.message);
        alert("해당 팝업에 대한 수정 권한이 없습니다.");
        navigate("/myPopup");
      }
    } catch (err) {
      console.error("권한 확인 중 오류 발생", err);
      setHasPermission(false);
      alert("권한 확인 중 오류 발생가 발생하였습니다.");
      navigate("/myPopup");
    }
  };

  // 팝업 데이터 가져오기
  const fetchPopupDetail = async () => {
    try {
      // (수정) API
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/stores/${popupId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch PopupDetail");
      }
      const data = await response.json();

      // 확인용 데이터 상태 저장
      setDetail(data.store);

      const splitTimeRange = async (timeRange) => {
        const [sTime, eTime] = timeRange.split("-");
        setStartTime(sTime);
        setEndTime(eTime);
      };

      splitTimeRange(data.store.business_hours);

      // 수정용 데이터 상태 저장
      setFormData({
        s_name: data.store.s_name,
        category: data.store.category,
        owner: data.store.owner,
        location: data.store.location,
        s_date: formatDate(data.store.s_date),
        e_date: formatDate(data.store.e_date),
        business_hours: data.store.business_hours,
        description: data.store.description,
        images: data.store.images,
        contact: data.store.contact,
      });

      // 미리보기 데이터 저장 - 기존에 있던 거 '/upload/
      setImages(data.store.images.map((i) => `${import.meta.env.VITE_BE_PORT}${i}`));

      setError(null);
    } catch (err) {
      setError(err.message);
      setDetail(null);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 권한 확인
  useEffect(() => {
    auth();
  }, [popupId]);

  useEffect(() => {
    if (hasPermission === true) {
      fetchPopupDetail();
    }
  }, [hasPermission, editing]);

  // 값 변경 시
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // }
  };

  // 빈칸 확인
  const validateForm = () => {
    console.log("formData.images: ", formData.images);
    if (formData.s_name && formData.category && formData.owner && formData.business_hours && formData.location && formData.s_date && formData.e_date && formData.images.some((image) => image !== null) && formData.contact) {
      return true;
    } else {
      alert("빈 항목을 확인해주세요.");
      return false;
    }
  };

  // 수정된 데이터 서버로 전송
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        formData.images.forEach((image) => {
          // 새로 업로드된 파일은 "image[]"로 보냄
          if (image instanceof File) {
            formDataToSend.append("image[]", image);
          } else {
            // 기존 URL은 "uploadedImage"로 보냄
            formDataToSend.append("uploadedImage", image);
          }
        });
      } else if (key === "s_date" || key === "e_date") {
        formDataToSend.append(key, formData[key] + ` 00:00:00`);
      } else if (key === "business_hours") {
        formDataToSend.append(key, startTime + "-" + endTime);
      } else {
        // 나머지는 그대로
        formDataToSend.append(key, formData[key]);
      }
    });

    formDataToSend.append("deleteImages", JSON.stringify(deleteImages));

    // FormData의 내용 출력
    for (const [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      // API - 수정 정보 전달 (저장하기)
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/stores/${popupId}`, {
        method: "PUT",
        body: formDataToSend,
      });

      // 200 - {"message": "Store updated successfully"}
      // 400~500 -  {"error": "Store not found"}

      if (!response.ok) {
        checkToken(response);

        const errorData = await response.json();
        alert("서버로 데이터 전송 중 오류가 발생했습니다.");
        console.error("서버 오류 발생: ", errorData.error);
        return;
      }

      const data = await response.json();
      console.log(data.message); // 성공 메시지 출력
      alert("팝업 스토어의 정보를 성공적으로 수정하였습니다.");

      setEditing(false); // 수정 모드 종료
      navigate(`/popup/edit/${popupId}`);
    } catch (err) {
      console.error("네트워크 오류 발생: ", err);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return <p></p>;
    // return <p>로딩 중...</p>;
  }

  if (error) {
    return <p>오류가 발생하였습니다: {error}</p>;
  }

  // 권한이 없을 때
  if (hasPermission === false) {
    return <p>해당 팝업에 대한 수정 권한이 없습니다.</p>;
  }

  // 받아온 데이터가 없을 때
  if (!detail) {
    return <p>팝업 정보를 불러올 수 없습니다.</p>;
  }

  // 팝업 삭제
  const handleDelete = async () => {
    const isConfirmed = window.confirm("정말 삭제하시겠습니까?");

    if (!isConfirmed) {
      return;
    }

    try {
      // API - 유저가 작성한 게시글 삭제
      const response = await fetchWithAuth(`${import.meta.env.VITE_BE_PORT}/api/users/${sessionStorage.getItem("userId")}/stores/${popupId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        checkToken(response);

        alert("삭제 중 오류가 발생했습니다.\n다시 시도해 주세요");
        return;
      }

      alert("삭제를 성공했습니다.");
      navigate("/myPopup");
    } catch (err) {
      //
      console.error("네트워크 오류 발생", err.message);
      alert("네트워크 오류가 발생했습니다.\n다시 시도해 주세요.");
    }
  };

  // 이미지 업로드
  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      //   const newImages = Array.from(files).map(
      //     (file) => URL.createObjectURL(file) // 선택된 이미지의 URL을 생성하여 미리보기
      //   );

      const newFiles = Array.from(files); // 선택된 파일들을 배열로 변환
      const newImageUrls = newFiles.map((file) => URL.createObjectURL(file)); // 파일의 미리보기 URL 생성

      // 실제 파일 객체는 formData.images에 저장
      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, ...newFiles], // 기존 이미지와 추가된 이미지를 합쳐서 상태에 저장
      }));

      // 미리보기 URL은 setImages에 저장
      setImages((prevImages) => [...prevImages, ...newImageUrls]); // 기존 미리보기 URL과 새로 추가된 URL을 합침
    }
  };

  // 이미지 삭제
  const handleDeleteImage = (index) => {
    // 기존 이미지 중 삭제된 url 관리
    if (String(formData.images[index]).startsWith("/upload")) {
      setDeleteImages([...deleteImages, formData.images[index]]);
    }

    // formData에서 이미지 파일 삭제
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });

    // setImages에서 미리보기 URL 삭제
    const newImageUrls = images.filter((_, i) => i !== index);
    setImages(newImageUrls);
  };
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <button onClick={() => setEditing((prev) => !prev)} className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4">
        {editing ? "취소" : "수정하기"}
      </button>
      {!editing && (
        <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg ml-4 mb-4">
          삭제하기
        </button>
      )}

      {editing ? (
        <div>
          {/* 제목 */}
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">제목:</label>
            <input type="text" name="s_name" value={formData.s_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* 카테고리 */}
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">카테고리:</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button key={category.value} onClick={() => handleCategoryClick(category.value)} className={`px-4 py-2 rounded-lg border ${formData.category === category.value ? "bg-pink-500 text-white" : "bg-transparent text-black"}`}>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* 주최 */}
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">주최:</label>
            <input type="text" name="owner" value={formData.owner} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* 장소 */}
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">장소:</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* 운영 일자 */}
          <div className="mb-4">
            <p className="text-lg font-semibold">운영 일자</p>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">시작일자:</label>
                <input type="date" name="s_date" value={formData.s_date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">종료일자:</label>
                <input type="date" name="e_date" value={formData.e_date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          {/* 운영 시간 */}
          <div className="mb-4">
            <p className="text-lg font-semibold">운영 시간</p>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">시작시간:</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">종료시간:</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          {/* 상세 설명 */}
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">상세 설명:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* 문의하기 */}
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">문의하기:</label>
            <input type="email" name="contact" value={formData.contact} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          {/* 이미지 업로드 */}
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">이미지</label>
            <div className="flex gap-4 mb-4">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt={`이미지 ${index + 1}`} className="w-32 h-32 object-cover rounded-lg shadow-md" />
                  <button onClick={() => handleDeleteImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-2">
                    X
                  </button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-white rounded-lg mt-4">
            저장
          </button>
        </div>
      ) : (
        <div>
          {/* 이미지 */}
          <div className="flex gap-4 mb-4 overflow-x-auto">
            {detail.images.map((url, index) => (
              <img key={index} src={`${import.meta.env.VITE_BE_PORT}${url}`} alt={`이미지 ${index + 1}`} className="w-32 h-32 object-cover rounded-lg shadow-md" />
            ))}
          </div>

          {/* 글 내용 */}
          <h1 className="text-3xl font-bold mb-4">{detail.s_name}</h1>
          <div className="mb-4">
            <p className="text-lg font-semibold">카테고리: {detail.category}</p>
            <p className="text-lg font-semibold">주최: {detail.owner}</p>
            <p className="text-lg font-semibold">장소: {detail.location}</p>
            <p className="text-lg font-semibold">시작일자: {formatDate(detail.s_date)}</p>
            <p className="text-lg font-semibold">종료일자: {formatDate(detail.e_date)}</p>
            <p className="text-lg font-semibold">운영 시간: {detail.business_hours}</p>
            <p className="text-lg font-semibold">상세 설명: {detail.description}</p>
            <p className="text-lg font-semibold">문의하기: {detail.contact}</p>
          </div>
        </div>
      )}
    </div>
  );

  // return (
  //   <div className="flex justify-center items-center min-h-screen bg-gray-50 py-6 px-4">
  //     <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8 space-y-6">
  //       <div className="flex justify-between items-center mb-6">
  //         <button onClick={() => setEditing((prev) => !prev)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
  //           {editing ? "취소" : "수정하기"}
  //         </button>
  //         {!editing && (
  //           <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
  //             삭제하기
  //           </button>
  //         )}
  //       </div>

  //       {editing ? (
  //         <div className="space-y-6">
  //           <div className="space-y-2">
  //             <label className="block text-gray-700 font-semibold">제목:</label>
  //             <input type="text" name="s_name" value={formData.s_name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  //           </div>

  //           <div className="space-y-2">
  //             <label className="block text-gray-700 font-semibold">카테고리</label>
  //             <div className="flex flex-wrap gap-3">
  //               {categories.map((category) => (
  //                 <button key={category.value} onClick={() => handleCategoryClick(category.value)} className={`px-4 py-2 rounded-lg border ${formData.category === category.value ? "bg-pink-200" : "bg-transparent"} border-gray-300 hover:bg-pink-100 transition`}>
  //                   {category.label}
  //                 </button>
  //               ))}
  //             </div>
  //           </div>

  //           <div className="space-y-2">
  //             <label className="block text-gray-700 font-semibold">주최:</label>
  //             <input type="text" name="owner" value={formData.owner} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  //           </div>

  //           <div className="space-y-2">
  //             <label className="block text-gray-700 font-semibold">장소:</label>
  //             <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  //           </div>

  //           <div className="space-y-2">
  //             <p className="text-gray-700 font-semibold">운영 일자</p>
  //             <label className="block text-gray-700">시작일자:</label>
  //             <input type="date" name="s_date" value={formData.s_date} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  //             <label className="block text-gray-700">종료일자:</label>
  //             <input type="date" name="e_date" value={formData.e_date} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  //           </div>

  //           <div className="space-y-2">
  //             <p className="text-gray-700 font-semibold">운영 시간</p>
  //             <label className="block text-gray-700">시작시간:</label>
  //             <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  //             <label className="block text-gray-700">종료시간:</label>
  //             <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  //           </div>

  //           <div className="space-y-2">
  //             <label className="block text-gray-700 font-semibold">상세 설명:</label>
  //             <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  //           </div>

  //           <div className="space-y-2">
  //             <label className="block text-gray-700 font-semibold">문의하기:</label>
  //             <input type="email" name="contact" value={formData.contact} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
  //           </div>

  //           <div className="space-y-2">
  //             <label className="block text-gray-700 font-semibold">이미지</label>
  //             <div className="flex overflow-x-auto gap-3 mb-6">
  //               {images.map((url, index) => (
  //                 <div key={index} className="relative">
  //                   <img src={url} alt={`팝업 이미지 ${index + 1}`} className="w-48 h-48 object-cover rounded-lg" />
  //                   <button onClick={() => handleDeleteImage(index)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition">
  //                     X
  //                   </button>
  //                 </div>
  //               ))}
  //             </div>
  //             <input type="file" accept="image/*" onChange={handleImageChange} className="p-3 border border-gray-300 rounded-lg" />
  //           </div>

  //           <button onClick={handleSave} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
  //             저장
  //           </button>
  //         </div>
  //       ) : (
  //         <div className="space-y-6">
  //           <div className="flex overflow-x-auto gap-3 mb-6">
  //             {detail.images.map((url, index) => (
  //               <img key={index} src={`${import.meta.env.VITE_BE_PORT}${url}`} alt={`팝업 이미지 ${index + 1}`} className="w-48 h-48 object-cover rounded-lg" />
  //             ))}
  //           </div>

  //           <div className="space-y-2">
  //             <h1 className="text-2xl font-semibold text-gray-800">{detail.s_name}</h1>
  //             <p className="text-gray-700">
  //               <strong>카테고리:</strong> {detail.category}
  //             </p>
  //             <p className="text-gray-700">
  //               <strong>주최:</strong> {detail.owner}
  //             </p>
  //             <p className="text-gray-700">
  //               <strong>장소:</strong> {detail.location}
  //             </p>
  //             <p className="text-gray-700">
  //               <strong>시작일자:</strong> {formatDate(detail.s_date)}
  //             </p>
  //             <p className="text-gray-700">
  //               <strong>종료일자:</strong> {formatDate(detail.e_date)}
  //             </p>
  //             <p className="text-gray-700">
  //               <strong>운영 시간:</strong> {detail.business_hours}
  //             </p>
  //             <p className="text-gray-700">
  //               <strong>상세 설명:</strong> {detail.description}
  //             </p>
  //             <p className="text-gray-700">
  //               <strong>문의하기:</strong> {detail.contact}
  //             </p>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );

  // return (
  //   <div className="form-group">
  //     <button onClick={() => setEditing((prev) => !prev)}>{editing ? "취소" : "수정하기"}</button>
  //     {!editing && <button onClick={handleDelete}>삭제하기</button>}
  //     {editing ? (
  //       <div>
  //         <div>
  //           <label>제목: </label>
  //           <input type="text" name="s_name" value={formData.s_name} onChange={handleChange} />
  //         </div>

  //         <div>
  //           <label>카테고리 </label>
  //           {categories.map((category) => (
  //             <button
  //               key={category.value}
  //               onClick={() => handleCategoryClick(category.value)}
  //               style={{
  //                 backgroundColor: formData.category === category.value ? "lightPink" : "transparent", // 선택된 카테고리 배경색 변경
  //                 color: "black",
  //                 border: "1px solid #ccc",
  //                 borderRadius: "8px",
  //                 padding: "10px 20px",
  //                 margin: "5px",
  //                 cursor: "pointer",
  //               }}
  //             >
  //               {category.label}
  //             </button>
  //           ))}
  //         </div>

  //         <div>
  //           <label>주최:</label>
  //           <input type="text" name="owner" value={formData.owner} onChange={handleChange} />
  //         </div>

  //         <div>
  //           <label>장소:</label>
  //           <input type="text" name="location" value={formData.location} onChange={handleChange} />
  //         </div>

  //         <div>
  //           <p>운영 일자</p>
  //           <label>시작일자:</label>
  //           <input type="date" name="s_date" value={formData.s_date} onChange={handleChange} />
  //           <br />
  //           <label>종료일자:</label>

  //           <input type="date" name="e_date" value={formData.e_date} onChange={handleChange} />
  //         </div>

  //         <div>
  //           <p>운영 시간</p>
  //           <label>시작시간</label>
  //           <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
  //           <br />
  //           <label>종료시간</label>
  //           <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
  //         </div>

  //         <div>
  //           <label>상세 설명:</label>
  //           <textarea name="description" value={formData.description} onChange={handleChange} />
  //         </div>

  //         <div>
  //           <label>문의하기:</label>
  //           <input type="email" name="contact" value={formData.contact} onChange={handleChange} />
  //         </div>

  //         <div>
  //           <label>이미지</label>
  //           {/* 이미지 목록 표시 */}
  //           <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
  //             {images.map((url, index) => (
  //               <div key={index} style={{ position: "relative" }}>
  //                 <img src={url} alt={`팝업 이미지 ${index + 1}`} style={{ width: "300px", borderRadius: "8px" }} />
  //                 <button
  //                   onClick={() => handleDeleteImage(index)}
  //                   style={{
  //                     position: "absolute",
  //                     top: "5px",
  //                     right: "5px",
  //                     backgroundColor: "red",
  //                     color: "white",
  //                     border: "none",
  //                     borderRadius: "50%",
  //                     cursor: "pointer",
  //                   }}
  //                 >
  //                   X
  //                 </button>
  //               </div>
  //             ))}
  //           </div>

  //           {/* 이미지 업로드 */}
  //           <input type="file" accept="image/*" onChange={handleImageChange} />
  //         </div>

  //         <button onClick={handleSave}>저장</button>
  //       </div>
  //     ) : (
  //       <div>
  //         <div>
  //           {/* 이미지 */}
  //           <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
  //             {detail.images.map((url, index) => (
  //               <img key={index} src={`${import.meta.env.VITE_BE_PORT}${url}`} alt={`팝업 이미지 ${index + 1}`} style={{ width: "300px", borderRadius: "8px" }} />
  //             ))}
  //           </div>
  //         </div>

  //         <div>
  //           {/* 글 */}
  //           <h1>제목: {detail.s_name}</h1>

  //           <p>
  //             <strong>카테고리:</strong> {detail.category}
  //           </p>

  //           <p>
  //             <strong>주최:</strong> {detail.owner}
  //           </p>

  //           <p>
  //             <strong>장소:</strong> {detail.location}
  //           </p>

  //           <p>
  //             <strong>시작일자:</strong> {formatDate(detail.s_date)}
  //           </p>
  //           <p>
  //             <strong>종료일자:</strong> {formatDate(detail.e_date)}
  //           </p>

  //           <p>
  //             <strong>운영 시간:</strong> {detail.business_hours}
  //           </p>

  //           <p>
  //             <strong>상세 설명:</strong> {detail.description}
  //           </p>

  //           <p>
  //             <strong>문의하기:</strong> {detail.contact}
  //           </p>

  //           <p></p>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );
};

export default PopupEditPage;
