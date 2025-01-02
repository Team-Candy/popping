// Calendar.jsx
import FullCalendar from "@fullcalendar/react"; // FullCalendar React 컴포넌트
import dayGridPlugin from "@fullcalendar/daygrid"; // dayGrid 플러그인
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/calendar.css";

async function fetchPopup() {
  // // API
  // try {
  //   // 우선 존재하는 모든 팝업 정보? => ???
  //   const response = await fetch(`/api/calendar`);
  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch calendar data: ${response.statusText}`);
  //   }
  //   const { results } = await response.json();
  //   // 팝업 id, 이름, 기간

  //   return results.map((popup) => ({
  //     id: popup.id,
  //     title: popup.title,
  //     start: popup.startDate,
  //     end: popup.endDate,
  //   }));
  // } catch (err) {
  //   console.error("", err);
  // }

  // 임시 데이터(개발용)
  const data = {
    results: [
      { id: "18", title: "자주엣홈 SS2025 JAJU적인 집", start: "2025-01-01", end: "2025-01-03" },
      { id: "19", title: "로지텍 팝업스토어", start: "2025-01-07", end: "2025-01-10" },
    ],
  };

  return data.results;
}

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // 컴포넌트가 마운트될 때 fetchPopup 호출
  useEffect(() => {
    const loadEvents = async () => {
      const eventData = await fetchPopup();
      setEvents(eventData);
    };
    loadEvents();
  }, []); // 한 번만 호출

  const handleEventClick = (info) => {
    const eventId = info.event.id;
    navigate(`/popup/${eventId}`);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin]} // 필요한 플러그인 추가
        initialView="dayGridMonth" // 초기 뷰 설정 (월간 뷰)
        events={events} // fetchPopup에서 가져온 데이터
        // events={[
        //   { id: "18", title: "자주엣홈 SS2025 JAJU적인 집", start: "2025-01-01", end: "2025-01-03" },
        //   { id: "19", title: "로지텍 팝업스토어", start: "2025-01-07", end: "2025-01-10" },
        // ]}
        eventClick={handleEventClick} // 클릭 이벤트 핸들러 연결
        eventClassNames="custom-event"
      />
    </div>
  );
};

export default Calendar;
