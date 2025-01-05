import PopupList from "../../components/PopupList_mypage";

const MyPopupPage = () => {
  return (
    <div>
      <h2>나의 팝업</h2>
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
