import PopupList from "../../components/PopupList_mypage";

const MyPopupPage = () => {
  return (
    <div className="mt-10 max-w-[1000px] container mx-auto px-4 py-6">
      <p className="ml-10 text-3xl font-semibold text-gray-800 mb-2">나의 팝업</p>
      <p className="ml-10 text-gray-450 mb-6 text-gray-500">내가 작성한 팝업스토어를 확인하고 수정할 수 있어요.</p>

      <hr className="border-gray-300 mb-6" />

      <PopupList />
    </div>
  );
};

export default MyPopupPage;
