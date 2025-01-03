const FavoritePopupPage = () => {
  const titleStyle = { fontWeight: "bold", fontSize: 19 };
  return (
    <div>
      <h2 style={{ color: "red" }}>관심 팝업</h2>
      <hr />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button>리스트 뷰</button>
        <button>달력 뷰</button>
      </div>
      <div>
        <p style={titleStyle}>진행 중인 팝업</p>
      </div>
      <hr />
      <div>
        <p style={titleStyle}>예정된 팝업</p>
      </div>
      <hr />
      <div>
        <p style={titleStyle}>종료된 팝업</p>
      </div>
    </div>
  );
};

export default FavoritePopupPage;
