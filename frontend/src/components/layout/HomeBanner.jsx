import { useState, useEffect } from "react";
import "../../styles/HomeBanner.css";

const HomeBanner = () => {
  const [banners, setBanners] = useState([]); // 배너 데이터 저장
  // const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 배너 인덱스

  // (수정) 배너 로딩 느림, 부자연스러움

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // API - 메인 페이지 - 배너 (image & image_url)
        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/main/banners`);
        if (!response.ok) {
          throw new Error("Failed tp fetch banners");
        }
        const data = await response.json();
        // StoreId
        // StoreName
        // StartDate:"2024-11-28T15:00:00.000Z"
        // EndDate:"2024-11-28T15:00:00.000Z"

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

  const imgStyle = {
    height: "400px",
    objectFit: "cover",
  };

  function formatDate(date) {
    // Convert the input date string to a JavaScript Date object
    const parsedDate = new Date(date);

    // Format the date in the desired format, e.g., YYYY-MM-DD
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(parsedDate.getDate()).padStart(2, "0");

    // Return the formatted date
    return `${year}년 ${month}월 ${day}일`;
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
        <div>
          <a key={banners[currentIndex].StoreId} href={`/popup/${banners[currentIndex].StoreId}`} target="_blank" rel="noopener noreferrer">
            <img style={imgStyle} src={banners[currentIndex].Images[0]} alt={`Banner ${banners[currentIndex].StoreId}`} />
            <p>{banners[currentIndex].StoreName}</p>
            <p>
              {formatDate(banners[currentIndex].StartDate)} - {formatDate(banners[currentIndex].EndDate)}
            </p>
          </a>
          <div>
            <button onClick={goToPrevBanner}>Prev</button>
            <button onClick={goToNextBanner}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeBanner;

// 이전 버전
// import { useState, useEffect } from "react";
// import "../../styles/HomeBanner.css";

// const HomeBanner = () => {
//   const [banners, setBanners] = useState([]); // 배너 데이터 저장
//   // const [loading, setLoading] = useState(true); // 로딩 상태
//   const [error, setError] = useState(null); // 에러 상태
//   const [currentIndex, setCurrentIndex] = useState(0); // 현재 배너 인덱스

//   // (수정) 배너 로딩 느림, 부자연스러움

//   useEffect(() => {
//     const fetchBanners = async () => {
//       try {
//         // 서버가 연결되지 않으면 임시 데이터 사용
//         setBanners([
//           {
//             id: 1,
//             // imageUrl: "https://example.com/banner1.jpg",
//             // redirectUrl: "https://example.com/store/1",
//             imageUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
//             redirectUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
//           },
//           {
//             id: 2,
//             imageUrl: "https://i.ibb.co/DtRrWkm/banner2.jpg",
//             redirectUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
//           },
//           {
//             id: 3,
//             imageUrl: "https://i.ibb.co/PjsttQ5/banner3.jpg",
//             redirectUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
//           },
//         ]);

//         // API - 메인 페이지 - 배너 (image & image_url)
//         // const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/main/banners`);
//         // if (!response.ok) {
//         //   throw new Error("Failed tp fetch banners");
//         // }
//         // const data = await response.json();
//         // setBanners(data.banners); // 배너 데이터 저장
//         // {"banners": [{"id": 1, "imageUrl": "https://example.com/banner1.jpg", "redirectUrl": "https://example.com/store/1"},
//         // {"id": 2,"imageUrl": "https://example.com/banner2.jpg","redirectUrl": "https://example.com/store/2"}]}
//       } catch (err) {
//         setError(err.message); // 에러 상태 저장
//       }
//       // finally {
//       //   setLoading(false); // 로딩 완료
//       // }
//     };

//     fetchBanners();
//   }, []);

//   // 배너 이동
//   const goToNextBanner = () => {
//     setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
//   };

//   const goToPrevBanner = () => {
//     setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
//   };

//   // if (loading) {
//   //   return <div>Loading...</div>;
//   // }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div>
//       {banners.length === 0 ? (
//         // <div>No banners available</div> // 배너가 없으면
//         <div
//           style={{
//             width: "500px", // 고정 너비
//             height: "300px", // 고정 높이
//             backgroundColor: "white", // 배경색 (테스트용)
//           }}
//         ></div>
//       ) : (
//         <div>
//           <a key={banners[currentIndex].id} href={banners[currentIndex].redirectUrl} target="_blank" rel="noopener noreferrer">
//             {/* noopener: 보안, noreferrer: 프라이버시 */}
//             <img src={banners[currentIndex].imageUrl} alt={`Banner ${banners[currentIndex].id}`} />
//             {/* alt: 배너 설명 */}
//           </a>
//           <div>
//             <button onClick={goToPrevBanner}>Prev</button>
//             <button onClick={goToNextBanner}>Next</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomeBanner;
