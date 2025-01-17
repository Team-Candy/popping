import PopupList from "../../components/PopupList_mypage";

const MyPopupPage = () => {
  return (
    <div>
      <p className="ml-10 text-2xl font-bold text-gray-800 mb-4">나의 팝업</p>

      <hr />

      {/* 뷰*/}
      {/* <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button>리스트 뷰</button>
        <button>달력 뷰</button>
      </div> */}

      <PopupList />
    </div>
  );
};

export default MyPopupPage;
