import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { clearSideBarContent, setClipboardText } from "../contract.redux";
interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

const LeftSidebar: React.FC = () => {
  const dispatch = useAppDispatch();

  const [activeMenuItem, setActiveMenuItem] = useState(-1);
  const { sideBarData } = useAppSelector((state) => state.contract);

  const toggleItem = (index: number) => {
    setActiveMenuItem(activeMenuItem === index ? -1 : index);
  };

  const setClipboard = (e: any, text: string) => {
    e.stopPropagation();
    dispatch(setClipboardText(text));
  };

  useEffect(() => {
    return () => {
      dispatch(clearSideBarContent());
    };
  }, []);

  const calculateDateDifference = (dateStr: string) => {
    const currentDate = new Date().getTime();
    const terminationDate = new Date(dateStr).getTime();
    const differenceInDays = Math.floor((terminationDate - currentDate) / (24 * 60 * 60 * 1000));
    return differenceInDays;
  };

  const generateICS = (event: CalendarEvent) => {
    const { summary, description, start, end } = event;
    const formattedStart = formatICSDateTime(start.dateTime);
    const formattedEnd = formatICSDateTime(end.dateTime);

    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${summary}
DESCRIPTION:${description || ""}
DTSTART:${formattedStart}
DTEND:${formattedEnd}
END:VEVENT
END:VCALENDAR`;
  };

  const formatICSDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  const downloadICSFile = (icsContent: string) => {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "event.ics";
    a.click();
  };

  const handleAddAlertToCalendar = (date: string) => {
    const terminationDate = new Date(date);
    const event: CalendarEvent = {
      summary: "Contract Termination Alert",
      description: "This is a reminder for termination of your contract.",
      start: {
        dateTime: new Date().toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: terminationDate.toISOString(),
        timeZone: "Asia/Kolkata",
      },
    };

    const icsContent = generateICS(event);

    downloadICSFile(icsContent);
  };

  return (
    <div className="dashboard-control">
      <div className="dashboard-control-wrapper">
        <ul>
          {sideBarData?.length
            ? sideBarData.map((section, index) => (
                <li
                  key={index}
                  className={activeMenuItem === index ? "open" : ""}
                  onClick={() => toggleItem(index)}
                >
                  {section?.key && <h4>{section.key}</h4>}
                  <div className={activeMenuItem === index ? "item-open" : "item-close"}>
                    <ul>
                      {Array.isArray(section?.value) &&
                        section.value.map((item, subIndex) => (
                          <li key={subIndex}>
                            <a title="Jump to parsed reference">
                              {item?.key && <p className="control-key">{item.key}</p>}
                              {Array.isArray(item.value) ? (
                                <ul>
                                  {item.value.map((subItem, subSubIndex) => (
                                    <li key={subSubIndex}>
                                      {subItem?.key && <p className="control-key">{subItem.key}</p>}
                                      {subItem?.key === "Termination Date"
                                        ? subItem?.value && (
                                            <p
                                              className="control-value"
                                              onClick={(e) => setClipboard(e, subItem.value)}
                                            >
                                              {subItem.value}
                                              {calculateDateDifference(subItem.value) <= 7 && (
                                                <span
                                                  onClick={() =>
                                                    handleAddAlertToCalendar(subItem.value)
                                                  }
                                                >
                                                  {" "}
                                                  Add Alert to Calendar
                                                </span>
                                              )}
                                            </p>
                                          )
                                        : subItem?.value && (
                                            <p
                                              onClick={(e) => setClipboard(e, subItem.value)}
                                              className="control-value"
                                            >
                                              {subItem.value}
                                            </p>
                                          )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                item?.value && (
                                  <p
                                    className="control-value"
                                    onClick={(e) => setClipboard(e, item.value as string)}
                                  >
                                    {item.value}
                                    {item?.key === "Termination Date" && (
                                      <p className="control-value">
                                        {calculateDateDifference(item.value as string) <= 7 && (
                                          <>
                                            <br></br>
                                            <button
                                              onClick={() =>
                                                handleAddAlertToCalendar(item.value as string)
                                              }
                                              className="calendar-button"
                                            >
                                              Add Alert to Calendar
                                            </button>
                                          </>
                                        )}
                                      </p>
                                    )}
                                  </p>
                                )
                              )}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                </li>
              ))
            : null}
        </ul>
      </div>
    </div>
  );
};

export default LeftSidebar;
