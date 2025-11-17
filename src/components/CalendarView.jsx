import React, { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getAppointmentTypeLabel } from "../utils/labels";

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

function CalendarView({ appointments = [], courtSessions = [], clients = [], onSelectEvent, onSelectSlot }) {
  // Transform appointments and court sessions to calendar events
  const events = useMemo(() => {
    const appointmentEvents = appointments.map((appointment) => {
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
        id: `appointment-${appointment.id}`,
        title: appointment.title,
        start: startDate,
        end: endDate,
        type: 'appointment',
        resource: {
          ...appointment,
          clientName,
        },
      };
    });

    const courtSessionEvents = courtSessions.map((session) => {
      const startDate = new Date(session.sessionDate);
      const endDate = new Date(startDate.getTime() + 60 * 60000); // Default 1 hour duration

      // Get client name from case
      let clientName = "";
      if (session.case?.client) {
        const client = session.case.client;
        clientName =
          client.type === "company"
            ? client.companyName
            : `${client.firstName} ${client.lastName}`;
      }

      return {
        id: `session-${session.id}`,
        title: `جلسة: ${session.case?.title || 'غير محدد'}`,
        start: startDate,
        end: endDate,
        type: 'courtSession',
        resource: {
          ...session,
          clientName,
        },
      };
    });

    return [...appointmentEvents, ...courtSessionEvents];
  }, [appointments, courtSessions, clients]);

  // Custom event style based on type and status
  const eventStyleGetter = (event) => {
    let backgroundColor = "#2c5f2d"; // Default green

    const resource = event.resource;

    // Different colors for court sessions vs appointments
    if (event.type === 'courtSession') {
      backgroundColor = "#dc2626"; // Red for court sessions

      // Adjust opacity based on status
      if (resource.status === "completed" || resource.status === "مكتملة") {
        backgroundColor += "80"; // 50% opacity
      } else if (resource.status === "cancelled" || resource.status === "ملغاة") {
        backgroundColor = "#6b7280"; // Gray
      } else if (resource.status === "postponed" || resource.status === "مؤجلة") {
        backgroundColor += "cc"; // 80% opacity
      }
    } else {
      // Color based on appointment type
      switch (resource.appointmentType) {
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
      if (resource.status === "completed") {
        backgroundColor += "80"; // 50% opacity
      } else if (resource.status === "cancelled") {
        backgroundColor = "#6b7280"; // Gray
      } else if (resource.status === "rescheduled") {
        backgroundColor += "cc"; // 80% opacity
      }
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
                background: "#dc2626",
                borderRadius: "3px",
                display: "inline-block",
              }}
            ></span>
            <span>جلسات المحكمة</span>
          </div>
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
            <span>{getAppointmentTypeLabel("consultation")}</span>
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
            <span>{getAppointmentTypeLabel("meeting")}</span>
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
            <span>{getAppointmentTypeLabel("other")}</span>
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
