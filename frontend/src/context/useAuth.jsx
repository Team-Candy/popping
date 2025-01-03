import { useContext } from "react";
import AuthContext from "./AuthContext";

const useAuth = () => useContext(AuthContext);

export default useAuth;

// 별도 파일 분리
// useAuth와 같은 훅(또는 비-컴포넌트 함수)을 컴포넌트 파일에서 함께 내보내면, Fast Refresh가 변경 사항을 올바르게 처리하지 못할 가능성
// react-refresh/only-export-components 규칙이 경고를 발생
