const SearchBar = ({ query, onInputChange, onSearch }) => {
  return (
    <>
      <input type="text" value={query} onChange={(e) => onInputChange(e.target.value)} placeholder="팝업스토어 이름, 지역 검색"></input>
      <button onClick={onSearch}>검색</button>
    </>
  );
};

export default SearchBar;
