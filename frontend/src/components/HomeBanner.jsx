import { useState, useEffect } from "react";
import { formatDate, formatURL } from "../utils/util";

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/main/banners`);
        if (!response.ok) {
          throw new Error("Failed tp fetch banners");
        }
        const data = await response.json();

        setBanners(data.banners);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToNextBanner = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const goToPrevBanner = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {banners.length === 0 ? (
        <div
          style={{
            width: "500px",
            height: "300px",
            backgroundColor: "white",
          }}
        ></div>
      ) : (
        <div className="flex flex-col items-center space-y-3 max-w-full m-10">
          <a className="w-full max-w-[1000px] block text-center rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300" key={banners[currentIndex].StoreId} href={`/popup/${banners[currentIndex].StoreId}`} rel="noopener noreferrer">
            <div className="relative w-full h-[250px] overflow-hidden">
              <img className="absolute inset-0 w-full h-full object-cover filter blur-md scale-110 transition-all duration-1000 ease-in-out" src={formatURL(banners[currentIndex].Images[0])} alt={`Banner Background ${banners[currentIndex].StoreId}`} aria-hidden="true" />

              <img className="relative h-full z-10 object-contain mx-auto" src={formatURL(banners[currentIndex].Images[0])} alt={`Banner ${banners[currentIndex].StoreId}`} />
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
              이전
            </button>
            <button className="px-6 py-2 bg-[#c8a0c8] text-white text-sm font-medium rounded-full shadow-md hover:bg-[#a15da1] hover:shadow-lg transition-all duration-300" onClick={goToNextBanner}>
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeBanner;
