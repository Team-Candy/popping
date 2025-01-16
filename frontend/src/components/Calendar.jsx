// Calendar.jsx
import FullCalendar from "@fullcalendar/react"; // FullCalendar React 컴포넌트
import dayGridPlugin from "@fullcalendar/daygrid"; // dayGrid 플러그인
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/calendar.css";

async function fetchPopup() {
  // API - 팝업 스토어 정보 가져와 캘린더에 넣기
  try {
    const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/calendar`);
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar data: ${response.statusText}`);
    }

    const data = await response.json();

    return data.results.map((popup) => ({
      id: popup.id,
      title: popup.title,
      start: popup.start,
      end: popup.end,
    }));
  } catch (err) {
    console.error("", err);
  }
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
        eventClick={handleEventClick} // 클릭 이벤트 핸들러 연결
        eventClassNames="custom-event"
      />
    </div>
  );
};

export default Calendar;
