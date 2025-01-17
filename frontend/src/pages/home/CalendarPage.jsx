import Calendar from "../../components/Calendar";

const CalenderPage = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="max-w-[1000px] w-4/5 justify-center">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">이달의 팝업스토어</h2>
          <p className="text-gray-500">자세한 내용은 이벤트 클릭하여 확인하세요.</p>
        </div>
        <Calendar></Calendar>
      </div>
    </div>
  );
};

export default CalenderPage;
