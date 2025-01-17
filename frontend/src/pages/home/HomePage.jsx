import HomeBanner from "../../components/HomeBanner.jsx";
import Category from "../../components/Category.jsx";
import PopupList from "../../components/PopupList.jsx";

const Home = () => {
  return (
    <>
      <div className="flex flex-col items-center min-h-screen">
        <div className="w-full">
          <HomeBanner></HomeBanner>
        </div>

        {/* 카테고리 섹션 */}
        <div className="mt-12 w-4/5 justify-center">
          <Category></Category>
        </div>

        {/* 인기 팝업 섹션 */}
        <div className="max-w-[1000px] mt-12 w-4/5 justify-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">요즘 인기 있는 팝업은?</h3>
          <PopupList category={"popular"} />
        </div>

        {/* 오픈 예정 팝업 섹션 */}
        <div className="max-w-[1000px] mt-12 w-4/5 justify-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">곧 오픈 예정인 팝업은?</h3>
          <PopupList category={"scheduled"} />
        </div>
      </div>
    </>
  );

  // css 적용전
  // return (
  //   <>
  //     <div>
  //       <HomeBanner></HomeBanner>
  //       <br></br>
  //       <Category></Category>
  //       <br></br>
  //       <br></br>
  //       <div>
  //         <h3>요즘 인기 있는 팝업은?</h3>
  //         <PopupList category={"popular"} />
  //       </div>
  //       <div>
  //         <h3>곧 오픈 예정인 팝업은?</h3>
  //         <PopupList category={"scheduled"} />
  //       </div>
  //     </div>
  //   </>
  // );
};

export default Home;
