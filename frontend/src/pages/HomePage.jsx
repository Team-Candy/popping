import HomeBanner from "../components/HomeBanner.jsx";
import Category from "../components/Category";
import PopupList from "../components/PopupList";

const Home = () => {
  return (
    <>
      <div>
        <HomeBanner></HomeBanner>
        <br></br>
        <Category></Category>
        <br></br>
        <br></br>
        <div>
          <h3>요즘 인기 있는 팝업은?</h3>
          <PopupList category={"popular"} />
        </div>
        <div>
          <h3>곧 오픈 예정인 팝업은?</h3>
          <PopupList category={"scheduled"} />
        </div>
      </div>
    </>
  );
};

export default Home;
