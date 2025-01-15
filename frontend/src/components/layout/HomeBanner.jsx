import { useState, useEffect } from "react";
import { formatURL } from "../../utils/util";
// import "../../styles/HomeBanner.css";

const HomeBanner = () => {
  const [banners, setBanners] = useState([]); // 배너 데이터 저장
  // const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 배너 인덱스

  // (수정) 배너 로딩 느림, 부자연스러움

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // 서버가 연결되지 않으면 임시 데이터 사용
        setBanners([
          {
            id: 1,
            // imageUrl: "https://example.com/banner1.jpg",
            // redirectUrl: "https://example.com/store/1",
            imageUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
            redirectUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
          },
          {
            id: 2,
            imageUrl: "https://i.ibb.co/DtRrWkm/banner2.jpg",
            redirectUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
          },
          {
            id: 3,
            imageUrl: "https://i.ibb.co/PjsttQ5/banner3.jpg",
            redirectUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
          },
        ]);

        // API
        // const response = await fetch("/api/main/banners");
        // if (!response.ok) {
        //   throw new Error("Failed tp fetch banners");
        // }
        // const data = await response.json();
        // setBanners(data.banners); // 배너 데이터 저장
        // {"banners": [{"id": 1, "imageUrl": "https://example.com/banner1.jpg", "redirectUrl": "https://example.com/store/1"},
        // {"id": 2,"imageUrl": "https://example.com/banner2.jpg","redirectUrl": "https://example.com/store/2"}]}
      } catch (err) {
        setError(err.message); // 에러 상태 저장
      }
      // finally {
      //   setLoading(false); // 로딩 완료
      // }
    };

    fetchBanners();
  }, []);

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
        <div className="flex flex-col justify-center items-center mt-8">
          <a className="text-center" key={banners[currentIndex].StoreId} href={`/popup/${banners[currentIndex].StoreId}`} target="_blank" rel="noopener noreferrer">
            <img className="mb-4 " style={imgStyle} src={formatURL(banners[currentIndex].Images[0])} alt={`Banner ${banners[currentIndex].StoreId}`} />
            <p className="font-semibold">{banners[currentIndex].StoreName}</p>
            <p>
              {formatDate(banners[currentIndex].StartDate)} - {formatDate(banners[currentIndex].EndDate)}
            </p>
          </a>
          <div className="flex gap-4 mt-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={goToPrevBanner}>
              Prev
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={goToNextBanner}>
              Next
            </button>
          </div>
        </div>

        // <div>
        //   <a key={banners[currentIndex].StoreId} href={`/popup/${banners[currentIndex].StoreId}`} target="_blank" rel="noopener noreferrer">
        //     <img style={imgStyle} src={banners[currentIndex].Images[0]} alt={`Banner ${banners[currentIndex].StoreId}`} />
        //     <p>{banners[currentIndex].StoreName}</p>
        //     <p>
        //       {formatDate(banners[currentIndex].StartDate)} - {formatDate(banners[currentIndex].EndDate)}
        //     </p>
        //   </a>
        //   <div>
        //     <button onClick={goToPrevBanner}>Prev</button>
        //     <button onClick={goToNextBanner}>Next</button>
        //   </div>
        // </div>
      )}
    </div>
  );
};

export default HomeBanner;
