import useAuth from "../context/useAuth";

export const formatDate = (date) => {
  const parsedDate = new Date(date);

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일`;
};

export const fetchWithAuth = (url, options = {}) => {
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
<<<<<<< HEAD
=======

export const useCheckToken = () => {
  const { logout } = useAuth();

  const checkToken = (response) => {
    if (response.status === 403) {
      alert("로그인 후 이용해주세요.");
      logout();
      window.location.href = "/login";
      return;
    }
    return;
  };

  return checkToken;
};

export const formatURL = (url) => {
  if (url.startsWith("/uploads")) {
    return `${import.meta.env.VITE_BE_PORT}` + url;
  } else {
    return url;
  }
};
>>>>>>> 332d25afe2b0e3fe93e4a9ca1e49217fc4b38ff3
