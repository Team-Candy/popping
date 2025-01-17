export const formatDate = (date) => {
  const parsedDate = new Date(date);

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일`;
};

// 프론트엔드와 백엔드 통신 관련
export const fetchWithAuth = (url, options = {}) => {
  const token = sessionStorage.getItem("authToken");
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

// 이미지 불러오기
export const formatURL = (url) => {
  if (url.startsWith("/upload")) {
    return `${import.meta.env.VITE_BE_PORT}` + url;
  } else {
    return url;
  }
};
