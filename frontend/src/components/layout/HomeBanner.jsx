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
        // MOCK
        // setBanners([
        //   {
        //     id: 1,
        //     imageUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
        //     redirectUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
        //   },
        //   {
        //     id: 2,
        //     imageUrl: "https://i.ibb.co/DtRrWkm/banner2.jpg",
        //     redirectUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
        //   },
        //   {
        //     id: 3,
        //     imageUrl: "https://i.ibb.co/PjsttQ5/banner3.jpg",
        //     redirectUrl: "https://i.ibb.co/vXyFTdR/banner1.jpg",
        //   },
        // ]);

        // API - 메인 페이지 - 배너 (image & image_url)
        const response = await fetch("http://localhost:3000/api/main/banners");
        if (!response.ok) {
          throw new Error("Failed tp fetch banners");
        }
        const data = await response.json();

        console.log(data);

        // const data = {
        //   data: [
        //     {
        //       StoreId: "15",
        //       Owner: "그라운드시소",
        //       StoreName: "<우연히 웨스 앤더슨 2> 전시",
        //       Contact: "example@groundseesaw.com",
        //       StartDate: "2025-01-01",
        //       EndDate: "2025-12-31",
        //       BusinessHours: "10:00-19:00",
        //       // BusinessHours: "9:00 AM - 6:00 PM",
        //       Location: "서울특별시 중구 세종대로 14 그랜드센트럴 3층",
        //       Images: ["https://i.ibb.co/VjGgFCY/19.jpg", "image2.jpg"],
        //     },

        //     {
        //       StoreId: "16",
        //       Owner: "에이치코너",
        //       StoreName: "에이치코너 성수 팝업스토어",
        //       Contact: "example@hcorner.com",
        //       StartDate: "2024.11.07",
        //       EndDate: "2024.11.10",
        //       BusinessHours: "12:00-18:00 (월~수: 휴무)",
        //       Location: "서울특별시 성동구 뚝섬로 403 2층",
        //       Images: ["https://i.ibb.co/5vXT8pQ/20.jpg"],
        //     },
        //     {
        //       StoreId: "17",
        //       Owner: "서울백제어린이박물관",
        //       StoreName: "서울백제어린이박물관 개관기념특별전 <선사시대로의 소소한 탐험>",
        //       Contact: "example@seoulbaekje.com",
        //       StartDate: "2024.11.15",
        //       EndDate: "2025.02.02",
        //       BusinessHours: "09:30-17:30 (월: 휴무)",
        //       Location: "서울 송파구 올림픽로 424 서울백제어린이박물관 다목적실",
        //       Images: ["https://i.ibb.co/jg6tXWZ/21.jpg"],
        //     },
        //   ],
        // };

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

  const aTagStyle = {
    maxWidth: "100%", // 이미지가 부모 요소보다 커지지 않도록 설정
    maxHeight: "100%", // 이미지가 부모 요소보다 커지지 않도록 설정
    objectFit: "contain", // 이미지 크기를 비율에 맞게 조정
    position: "absolute", // 이미지의 위치를 부모 요소의 가운데로 설정
    top: "50%", // 부모 요소의 수직 중앙으로 위치
    left: "50%", // 부모 요소의 수평 중앙으로 위치
    transform: "translate(-50%, -50%)", // 정확한 중앙 배치를 위한 조정
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

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
          <a key={banners[currentIndex].StoreId} href="/" target="_blank" rel="noopener noreferrer">
            {/* noopener: 보안, noreferrer: 프라이버시 */}
            <img style={imgStyle} src={banners[currentIndex].Images[0]} alt={`Banner ${banners[currentIndex].StoreId}`} />
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
//         // const response = await fetch("http://localhost:3000/api/main/banners");
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
