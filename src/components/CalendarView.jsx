import React, { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Import Arabic locale
require('moment/locale/ar');

// Set global locale to Arabic
moment.locale("ar");

// Create localizer with Arabic locale
const localizer = momentLocalizer(moment);

// Arabic day and month names
const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

// Custom formats for Arabic calendar
const formats = {
  dateFormat: 'D',
  dayFormat: (date) => arabicDays[date.getDay()],
  weekdayFormat: (date) => arabicDays[date.getDay()],
  monthHeaderFormat: (date) => `${arabicMonths[date.getMonth()]} ${date.getFullYear()}`,
  dayHeaderFormat: (date) => `${arabicDays[date.getDay()]}، ${date.getDate()} ${arabicMonths[date.getMonth()]} ${date.getFullYear()}`,
  dayRangeHeaderFormat: ({ start, end }) =>
    `${start.getDate()} ${arabicMonths[start.getMonth()]} - ${end.getDate()} ${arabicMonths[end.getMonth()]} ${end.getFullYear()}`,
  agendaHeaderFormat: ({ start, end }) =>
    `${start.getDate()} ${arabicMonths[start.getMonth()]} - ${end.getDate()} ${arabicMonths[end.getMonth()]} ${end.getFullYear()}`,
  agendaDateFormat: (date) => `${arabicDays[date.getDay()]} ${date.getDate()} ${arabicMonths[date.getMonth()]}`,
  agendaTimeFormat: (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },
  agendaTimeRangeFormat: ({ start, end }) => {
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  },
  timeGutterFormat: (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },
  eventTimeRangeFormat: ({ start, end }) => {
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  },
  selectRangeFormat: ({ start, end }) => {
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  },
};

// Arabic messages for the calendar
const messages = {
  allDay: "طوال اليوم",
  previous: "السابق",
  next: "التالي",
  today: "اليوم",
  month: "شهر",
  week: "أسبوع",
  day: "يوم",
  agenda: "جدول الأعمال",
  date: "التاريخ",
  time: "الوقت",
  event: "موعد",
  noEventsInRange: "لا توجد مواعيد في هذا النطاق الزمني",
  showMore: (total) => `+ ${total} موعد آخر`,
};

function CalendarView({ appointments, clients, onSelectEvent, onSelectSlot }) {
  // Transform appointments to calendar events
  const events = useMemo(() => {
    return appointments.map((appointment) => {
      const startDate = new Date(appointment.appointmentDate);
      const endDate = new Date(
        startDate.getTime() + appointment.duration * 60000
      );

      // Get client name
      let clientName = "";
      if (appointment.clientId && clients) {
        const client = clients.find((c) => c.id === appointment.clientId);
        if (client) {
          clientName =
            client.type === "company"
              ? client.companyName
              : `${client.firstName} ${client.lastName}`;
        }
      }

      return {
        id: appointment.id,
        title: appointment.title,
        start: startDate,
        end: endDate,
        resource: {
          ...appointment,
          clientName,
        },
      };
    });
  }, [appointments, clients]);

  // Custom event style based on appointment type and status
  const eventStyleGetter = (event) => {
    let backgroundColor = "#2c5f2d"; // Default green

    const appointment = event.resource;

    // Color based on appointment type
    switch (appointment.appointmentType) {
      case "consultation":
        backgroundColor = "#3b82f6"; // Blue
        break;
      case "meeting":
        backgroundColor = "#2c5f2d"; // Green
        break;
      case "court_session":
        backgroundColor = "#dc2626"; // Red
        break;
      case "other":
        backgroundColor = "#9333ea"; // Purple
        break;
    }

    // Adjust opacity based on status
    if (appointment.status === "completed") {
      backgroundColor += "80"; // 50% opacity
    } else if (appointment.status === "cancelled") {
      backgroundColor = "#6b7280"; // Gray
    } else if (appointment.status === "rescheduled") {
      backgroundColor += "cc"; // 80% opacity
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 1,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  // Handle event selection (click on appointment)
  const handleSelectEvent = (event) => {
    if (onSelectEvent) {
      onSelectEvent(event.resource);
    }
  };

  // Handle slot selection (click on empty calendar space)
  const handleSelectSlot = (slotInfo) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  };

  return (
    <div className="calendar-container">
      <div
        className="calendar-legend"
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          background: "#f9f9f9",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <strong>دليل الألوان:</strong>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: "20px",
                height: "20px",
                background: "#3b82f6",
                borderRadius: "3px",
                display: "inline-block",
              }}
            ></span>
            <span>استشارة</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: "20px",
                height: "20px",
                background: "#2c5f2d",
                borderRadius: "3px",
                display: "inline-block",
              }}
            ></span>
            <span>اجتماع</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: "20px",
                height: "20px",
                background: "#dc2626",
                borderRadius: "3px",
                display: "inline-block",
              }}
            ></span>
            <span>جلسة محكمة</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: "20px",
                height: "20px",
                background: "#9333ea",
                borderRadius: "3px",
                display: "inline-block",
              }}
            ></span>
            <span>أخرى</span>
          </div>
        </div>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "700px" }}
        messages={messages}
        formats={formats}
        rtl={true}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        views={["month", "week", "day", "agenda"]}
        defaultView="week"
        step={15}
        showMultiDayTimes
        popup
      />
    </div>
  );
}

export default CalendarView;
