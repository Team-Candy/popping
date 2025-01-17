import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { formatDate, formatURL } from "../../utils/util";

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

      {error && <p style={{ color: "red" }}>{error}</p>}

      {view === "list" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
          {results.length > 0 ? (
            results.map((popup) => (
              <div key={popup.s_id} onClick={() => navigate(`/popup/${popup.s_id}`)} style={{ cursor: "pointer", textAlign: "center", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
                <div
                  style={{
                    position: "relative", // 이미지 컨테이너를 기준으로 버튼 배치
                  }}
                >
                  <img
                    src={formatURL(popup.images[0])}
                    alt={popup.s_name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <button
                    style={heartStyle}
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 클릭 이벤트 방지
                      handleLikeToggle(popup.s_id); // 하트 상태 토글
                    }}
                  >
                    {likedPopups.includes(popup.s_id) ? "❤️" : "🤍"}
                  </button>
                </div>
                <p style={{ fontSize: "14px", marginTop: "8px" }}>{popup.name}</p>
                <h3>{popup.s_name}</h3>
                <p>위치: {popup.location}</p>
                <p>
                  {formatDate(popup.s_date)} ~ {formatDate(popup.e_date)}
                </p>
              </div>
            ))
          ) : (
            <p>No liked popups found.</p>
          )}
        </div>
      ) : (
        <div>Calendar view coming soon...</div>
      )}
    </div>
  );
};

export default FavoritePopupPage;
