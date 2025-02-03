import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const localeSettings = {
  code: "ko",
  buttonText: {
    prev: "이전",
    next: "다음",
    today: "오늘",
    dayGridMonth: "月",
    dayGridDay: "日",
  },
};

async function fetchPopup() {
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

  useEffect(() => {
    const loadEvents = async () => {
      const eventData = await fetchPopup();
      setEvents(eventData);
    };
    loadEvents();
  }, []);

  const handleEventClick = (info) => {
    const eventId = info.event.id;
    navigate(`/popup/${eventId}`);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="w-full min-h-screen bg-white rounded-lg shadow-md">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          eventClassNames="custom-event"
          contentHeight="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridDay",
          }}
          dayCellClassNames="custom-day"
          locale={localeSettings}
        />
      </div>
    </div>
  );
};

export default Calendar;
