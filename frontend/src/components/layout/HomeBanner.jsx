import { useState, useEffect, useRef } from "react";
import { formatDate, formatURL } from "../../utils/util";
// import "../../styles/HomeBanner.css";

const HomeBanner = () => {
  const [banners, setBanners] = useState([]); // 배너 데이터 저장
  // const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 배너 인덱스

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // API - 메인 페이지 - 배너 (image & image_url)
        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/main/banners`);
        if (!response.ok) {
          throw new Error("Failed tp fetch banners");
        }
        const data = await response.json();

        setBanners(data.banners); // 배너 데이터 저장
      } catch (err) {
        setError(err.message); // 에러 상태 저장
      }
      // finally {
      //   setLoading(false); // 로딩 완료
      // }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
    }, 5000);

    // cleanup: 컴포넌트가 언마운트될 때 인터벌 제거
    return () => clearInterval(interval);
  }, [banners.length]);

  // 배너 이동
  const goToNextBanner = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const goToPrevBanner = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {banners.length === 0 ? (
        // <div>No banners available</div> // 배너가 없으면
        <div
          style={{
            width: "500px", // 고정 너비
            height: "300px", // 고정 높이
            backgroundColor: "white", // 배경색 (테스트용)
          }}
        ></div>
      ) : (
        <div className="flex flex-col items-center space-y-3 max-w-full">
          <a className="block text-center rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300" key={banners[currentIndex].StoreId} href={`/popup/${banners[currentIndex].StoreId}`} target="_blank" rel="noopener noreferrer">
            <div className="relative w-[1000px] h-[250px] overflow-hidden">
              {/* 배경 이미지 */}
              <img
                className="absolute inset-0 w-full h-full object-cover filter blur-md scale-110 transition-all duration-1000 ease-in-out"
                src={formatURL(banners[currentIndex].Images[0])}
                alt={`Banner Background ${banners[currentIndex].StoreId}`}
                aria-hidden="true" // 접근성 향상: 장식용 이미지로 설정
              />

              {/* 중앙 이미지 */}
              <img className="relative h-[250px] z-10 object-contain mx-auto" src={formatURL(banners[currentIndex].Images[0])} alt={`Banner ${banners[currentIndex].StoreId}`} />
            </div>
            <div className="bg-white p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{banners[currentIndex].StoreName}</h3>
              <p className="text-gray-600 text-sm">
                {formatDate(banners[currentIndex].StartDate)} - {formatDate(banners[currentIndex].EndDate)}
              </p>
            </div>
          </a>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-[#c8a0c8] text-white text-sm font-medium rounded-full shadow-md hover:bg-[#a15da1] hover:shadow-lg transition-all duration-300" onClick={goToPrevBanner}>
              Prev
            </button>
            <button className="px-6 py-2 bg-[#c8a0c8] text-white text-sm font-medium rounded-full shadow-md hover:bg-[#a15da1] hover:shadow-lg transition-all duration-300" onClick={goToNextBanner}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeBanner;
