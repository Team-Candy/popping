import PopupList from "../../components/PopupList_mypage";

const MyPopupPage = () => {
  return (
    <div className="max-w-[1000px] container mx-auto px-4 py-6">
      <p className="ml-10 text-3xl font-semibold text-gray-800 mb-6">나의 팝업</p>
      <hr className="border-gray-300 mb-6" />
      <PopupList />
    </div>
  );
};

export default MyPopupPage;

{
  /* 뷰*/
}
{
  /* <div style={{ display: "flex", justifyContent: "flex-end" }}>
  <button>리스트 뷰</button>
  <button>달력 뷰</button>
</div> */
}
