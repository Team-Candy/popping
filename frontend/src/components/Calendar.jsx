// Calendar.jsx
import FullCalendar from "@fullcalendar/react"; // FullCalendar React 컴포넌트
import dayGridPlugin from "@fullcalendar/daygrid"; // dayGrid 플러그인
import { useNavigate } from "react-router-dom";
import "../../public/index.css";

// async function fetchPopup() {
//   // API
//   try {
//     // 우선 존재하는 모든 팝업 정보? => ???
//     const response = await fetch(`/api/calendar`);
//     if (!response.ok) {
//       //
//     }
//     const data = await response.json();
//     // 팝업 id, 이름, 기간
//     // navigate "/popup/:id"

//     return data;
//   } catch (err) {
//     console.error("", err);
//   }

//   // 임시 데이터
// }

const Calendar = () => {
  const navigate = useNavigate();

  const handleEventClick = (info) => {
    const eventId = info.event.id;
    navigate(`/popup/${eventId}`);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin]} // 필요한 플러그인 추가
        initialView="dayGridMonth" // 초기 뷰 설정 (월간 뷰)
        events={[
          { id: "18", title: "자주엣홈 SS2025 JAJU적인 집", start: "2025-01-01", end: "2025-01-03" },
          { id: "19", title: "로지텍 팝업스토어", start: "2025-01-07", end: "2025-01-10" },
        ]}
        eventClick={handleEventClick} // 클릭 이벤트 핸들러 연결
        eventClassNames="custom-event"
      />
    </div>
  );
};

export default Calendar;

// --------

// import { Calendar } from "@fullcalendar/core";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import listPlugin from "@fullcalendar/list";

// let calendarEl = document.getElementById("calendar");
// let calendar = new Calendar(calendarEl, {
//   plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
//   initialView: "dayGridMonth",
//   headerToolbar: {
//     left: "prev,next today",
//     center: "title",
//     right: "dayGridMonth,timeGridWeek,listWeek",
//   },
// });
// calendar.render();

// ---
// import { useState } from "react";
// import { formatDate } from "@fullcalendar/core";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import { INITIAL_EVENTS, createEventId } from "./event-utils";

// import PropTypes from "prop-types";

// export default function DemoApp() {
//   const [weekendsVisible, setWeekendsVisible] = useState(true);
//   const [currentEvents, setCurrentEvents] = useState([]);

//   function handleWeekendsToggle() {
//     setWeekendsVisible(!weekendsVisible);
//   }

//   function handleDateSelect(selectInfo) {
//     let title = prompt("Please enter a new title for your event");
//     let calendarApi = selectInfo.view.calendar;

//     calendarApi.unselect(); // clear date selection

//     if (title) {
//       calendarApi.addEvent({
//         id: createEventId(),
//         title,
//         start: selectInfo.startStr,
//         end: selectInfo.endStr,
//         allDay: selectInfo.allDay,
//       });
//     }
//   }

//   function handleEventClick(clickInfo) {
//     if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
//       clickInfo.event.remove();
//     }
//   }

//   function handleEvents(events) {
//     setCurrentEvents(events);
//   }

//   return (
//     <div className="demo-app">
//       <Sidebar weekendsVisible={weekendsVisible} handleWeekendsToggle={handleWeekendsToggle} currentEvents={currentEvents} />
//       <div className="demo-app-main">
//         <FullCalendar
//           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//           headerToolbar={{
//             left: "prev,next today",
//             center: "title",
//             right: "dayGridMonth,timeGridWeek,timeGridDay",
//           }}
//           initialView="dayGridMonth"
//           editable={true}
//           selectable={true}
//           selectMirror={true}
//           dayMaxEvents={true}
//           weekends={weekendsVisible}
//           initialEvents={INITIAL_EVENTS} // alternatively, use the `events` setting to fetch from a feed
//           select={handleDateSelect}
//           eventContent={renderEventContent} // custom render function
//           eventClick={handleEventClick}
//           eventsSet={handleEvents} // called after events are initialized/added/changed/removed
//           /* you can update a remote database when these fire:
//           eventAdd={function(){}}
//           eventChange={function(){}}
//           eventRemove={function(){}}
//           */
//         />
//       </div>
//     </div>
//   );
// }

// function renderEventContent(eventInfo) {
//   return (
//     <>
//       <b>{eventInfo.timeText}</b>
//       <i>{eventInfo.event.title}</i>
//     </>
//   );
// }

// function Sidebar({ weekendsVisible, handleWeekendsToggle, currentEvents }) {
//   return (
//     <div className="demo-app-sidebar">
//       <div className="demo-app-sidebar-section">
//         <h2>Instructions</h2>
//         <ul>
//           <li>Select dates and you will be prompted to create a new event</li>
//           <li>Drag, drop, and resize events</li>
//           <li>Click an event to delete it</li>
//         </ul>
//       </div>
//       <div className="demo-app-sidebar-section">
//         <label>
//           <input type="checkbox" checked={weekendsVisible} onChange={handleWeekendsToggle}></input>
//           toggle weekends
//         </label>
//       </div>
//       <div className="demo-app-sidebar-section">
//         <h2>All Events ({currentEvents.length})</h2>
//         <ul>
//           {currentEvents.map((event) => (
//             <SidebarEvent key={event.id} event={event} />
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// Sidebar.propTypes = {
//   weekendsVisible: PropTypes.bool.isRequired,
//   handleWeekendsToggle: PropTypes.func.isRequired,
//   currentEvents: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//       start: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]).isRequired,
//       title: PropTypes.string.isRequired,
//     })
//   ).isRequired,
// };

// function SidebarEvent({ event }) {
//   return (
//     <li key={event.id}>
//       <b>{formatDate(event.start, { year: "numeric", month: "short", day: "numeric" })}</b>
//       <i>{event.title}</i>
//     </li>
//   );
// }

// SidebarEvent.propTypes = {
//   event: PropTypes.shape({
//     id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//     start: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]).isRequired,
//     title: PropTypes.string.isRequired,
//   }).isRequired,
// };
