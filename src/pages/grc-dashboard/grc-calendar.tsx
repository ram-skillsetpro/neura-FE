import Calendar from "core/components/calendar/calendar";
import { useAppDispatch, useAppSelector } from "core/hook";
import { stringToColor, truncateString } from "core/utils";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router";
import { ROUTE_ADMIN, ROUTE_OBLIGATION } from "src/const";
import AppModal from "src/core/components/modals/app-modal";
import "./grc-calendar.styles.scss";
import { EscalationInfoType } from "./grc-dashboard.model";

enum CustomViews {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}
interface CustomToolbarProps {
  onNavigate: (navigateAction: (typeof Navigate)[keyof typeof Navigate]) => void;
  label: string;
  onView: (view: string) => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ onNavigate, label, onView }) => {
  return (
    <div className="rbc-toolbar" style={{ display: "flex", justifyContent: "space-between" }}>
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate(Navigate.PREVIOUS)}>
          Back
        </button>
        <button type="button" onClick={() => onNavigate(Navigate.TODAY)}>
          Today
        </button>
        <button type="button" onClick={() => onNavigate(Navigate.NEXT)}>
          Next
        </button>
      </span>
      <span className="rbc-btn-group" style={{ display: "flex", flexDirection: "row" }}>
        {label}
      </span>

      <span
        className="rbc-btn-group"
        style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}
      >
        {/* <button type="button" onClick={() => onView(CustomViews.DAY)}>
          Daily
        </button>
        <button type="button" onClick={() => onView(CustomViews.WEEK)}>
          Weekly
        </button> */}
        <button type="button" onClick={() => onView(CustomViews.MONTH)}>
          Monthly
        </button>
      </span>
    </div>
  );
};


export const GRCDashboadCalendar: React.FC = () => {
  const [currentView, setCurrentView] = useState("month"); // Manage current view state
  const [isCalendarModal, setCalendarModal] = useState(false); // Manage current view state
  const [dataToRenderFromCalendar, setDataToRenderFromCalendar] = useState<any>(); // Manage current view state
  const [filteredContracts, setFilteredContracts] = useState<any>();
  const [filteredObligation, setFilteredObligation] = useState<any>([]);
  const riskDeadlines = useAppSelector((state) => state.grcDashboard.riskDeadlines);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCalendarModal === false) {
      setFilteredContracts([]);
      setFilteredObligation([]);
    }
  }, [isCalendarModal])

  const uniqueRiskDeadlines: any[] = [];
  const seen = new Map();
  riskDeadlines.forEach(item => {
    if (item.deadlineDate === 0) return;
    const key = `${item.riskTypeId}-${new Date(item.deadlineDate * 1000).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })}`;
    if (!seen.has(key)) {
      seen.set(key, true);
      uniqueRiskDeadlines.push(item);
    }
  });

  const formattedRiskDeadlines = uniqueRiskDeadlines.map(item => {
    const deadlineDate = new Date(item.deadlineDate * 1000).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }); // Convert Unix timestamp to milliseconds
    return {
      ...item,
      start: deadlineDate,
      deadlineDate: deadlineDate,
      end: deadlineDate, // Assuming the event lasts for only one moment
      allDay: false,
      title: item?.riskType
    };
  });

  const eventStyleGetter = (event: any) => {
    const backgroundColor = stringToColor(event.riskType); // Assuming event has a riskType property that is a string

    if (currentView !== "month") {
      // Apply custom styling only for month view
      return {
        style: {
          backgroundColor,
        },
      };
    }
    return {
      style: {
        backgroundColor,
        borderRadius: "50%",
        display: "inline-block",
        marginBottom: "5px",
        width: "16px",
        height: "16px",
      },
    };
  };

  const handleSelectEvent = (calevent: any) => {
    const filteredWithDeadlines = riskDeadlines?.filter(riskDeadline =>
      riskDeadline?.riskTypeId === calevent?.riskTypeId &&
      new Date(riskDeadline?.deadlineDate * 1000).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }) === calevent?.deadlineDate
    )

    const uniqueRiskDeadlines = Array.from(
      new Set(filteredWithDeadlines?.map(item => item.contractId) ?? [])
    ).map(id => {
      const contract = filteredWithDeadlines?.find(item => item.contractId === id);
      return contract ? { contractId: contract.contractId, contractName: contract.contractName } : null;
    }).filter(item => item !== null);

    setFilteredContracts(uniqueRiskDeadlines);
    setDataToRenderFromCalendar(calevent);
    setCalendarModal(true);
  };

  const handleSelectKeys = (e: any) => {
    // Filter obligations based on selected contract ID
    const filteredWithDeadlines = riskDeadlines?.filter(riskDeadline =>
      riskDeadline?.riskTypeId === dataToRenderFromCalendar?.riskTypeId &&
      new Date(riskDeadline?.deadlineDate * 1000).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }) === dataToRenderFromCalendar?.deadlineDate &&
      Number(riskDeadline?.contractId) === Number(e?.target?.value),
    )
    setFilteredObligation(filteredWithDeadlines);
  }

  const handleObligationClick = (escalation: EscalationInfoType) => {
    const obligation: any = escalation
    navigate(`/${ROUTE_ADMIN}/${ROUTE_OBLIGATION}`, { state: { escalation, obligation } });
  }

  return (
    <>
      <Calendar
        defaultDate={new Date()}
        events={formattedRiskDeadlines}
        startAccessor="start"
        // titleAccessor={ }
        // tooltipAccessor="title"
        endAccessor="end"
        style={{ height: 700, backgroundColor: "#fff", padding: "16px", borderRadius: "12px" }}
        views={["month"]}
        toolbar={true}
        components={{
          toolbar: (props) => (
            <>
              <CustomToolbar
                {...props}
                onView={(view: string) => {
                  props.onView(view);
                  setCurrentView(view);
                }}
              />
              <Legend />
            </>
          ),
        }}
        selectable
        scrollToTime={new Date(1970, 1, 1, 6)}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(e) => handleSelectEvent(e)}
        popup
      />

      <AppModal
        onClose={() => { setCalendarModal(false) }}
        isOpen={isCalendarModal}
        shouldCloseOnOverlayClick={true}
      >

        <div className="share-outer-wrap" style={{ minHeight: "250px" }}>
          <div className="mb-3">
            {filteredContracts?.length > 0 && (
              <select
                id="keys"
                onChange={(e) => handleSelectKeys(e)}
                className="custom-select edit-select w-full p-2 mb-2 truncate-line1"
              >
                <option value={0}>Please select contract</option>
                {filteredContracts?.map((item: any) => (
                  <option key={item.contractId} value={item?.contractId}>
                    {truncateString(item.contractName, 30, 15)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="px-1">
            <ul className="shared-user-list-scroll mb-5" style={{ display: "block" }}>
              {filteredObligation?.map((escalation, index) => {
                //  escalation?.obligations?.map((obligation) => (
                return (<li key={index} className="mb-3">
                  <div className="flex items-center">
                    <div className="fs14">
                      {escalation?.riskName}
                    </div>
                    <div className="grow">
                    </div>
                    <button className="button-red rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer" onClick={() => handleObligationClick(escalation)}>View</button>
                  </div>
                </li>)
                // ))
              }
              )}
            </ul>
          </div>
        </div>
      </AppModal>
    </>
  );
};

const Legend: React.FC = () => {
  const riskTypes = useAppSelector((state) => state.grcDashboard.riskDeadlines);
  const uniqueRiskTypes = Array.from(
    new Map(riskTypes.map((item) => [item.riskTypeId, item])).values(),
  );
  return (
    <div className="calendar-legend">
      {uniqueRiskTypes.map((eventType) => (
        <div className="legend-items" key={eventType.riskTypeId}>
          <span
            className="legend-dot"
            style={{ backgroundColor: stringToColor(eventType.riskType) }}
          ></span>
          <span className="legend-label">{eventType.riskType}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
