// Calendar.jsx
import FullCalendar from "@fullcalendar/react"; // FullCalendar React 컴포넌트
import dayGridPlugin from "@fullcalendar/daygrid"; // dayGrid 플러그인
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const localeSettings = {
  code: "ko", // 한국어 설정
  buttonText: {
    prev: "이전",
    next: "다음",
    today: "오늘",
    dayGridMonth: "月",
    dayGridDay: "日",
    // dayGridWeek: "주",
  },
};

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
    <div className="container mx-auto p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="w-full min-h-screen bg-white rounded-lg shadow-md">
        <FullCalendar
          plugins={[dayGridPlugin]} // 필요한 플러그인 추가
          initialView="dayGridMonth" // 초기 뷰 설정 (월간 뷰)
          events={events} // fetchPopup에서 가져온 데이터
          eventClick={handleEventClick} // 클릭 이벤트 핸들러 연결
          eventClassNames="custom-event"
          // FullCalendar의 스타일을 오버라이드하여 스크롤을 없앰
          contentHeight="auto" // 화면 크기에 맞춰 자동 높이 조정
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridDay",
            // right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          dayCellClassNames="custom-day"
          locale={localeSettings}
        />
      </div>
    </div>
  );
};

export default Calendar;
