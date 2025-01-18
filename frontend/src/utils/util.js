import useAuth from "../context/useAuth";

export const formatDate = (date) => {
  const parsedDate = new Date(date);

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일`;
};

// 프론트엔드와 백엔드 통신 관련
export const fetchWithAuth = (url, options = {}) => {
  // (수정) 쿠키로 변경하기
  const token = sessionStorage.getItem("authToken");

  if (!token) {
    alert("로그인 후 이용 바랍니다.");
    window.location.href = "/login";
    return;
  }
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

// export const checkToken = (response) => {
//   const { logout } = useAuth();
// useAuth와 같은 React Hook은 React 컴포넌트나 사용자 정의 Hook 내부에서만 호출 가능
//   if (response.status === 403) {
//     // if (response.statusText === "Unauthorized") {
//     alert("로그인 후 이용해주세요.");
//     logout();
//     window.location.href = "/login";
//     return;
//   }
//   return;
// };

export const useCheckToken = () => {
  const { logout } = useAuth();

  const checkToken = (response) => {
    if (response.status === 403) {
      // if (response.statusText === "Unauthorized") {
      alert("로그인 후 이용해주세요.");
      logout();
      window.location.href = "/login";
      return;
    }
    return;
  };

  return checkToken;
};

// 이미지 불러오기
export const formatURL = (url) => {
  if (url.startsWith("/uploads")) {
    return `${import.meta.env.VITE_BE_PORT}` + url;
  } else {
    return url;
  }
};
