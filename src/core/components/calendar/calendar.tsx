import moment from "moment";
import { Calendar as BigCalendar, CalendarProps, momentLocalizer } from "react-big-calendar";

const localizer = momentLocalizer(moment);

export default function Calendar(props: Omit<CalendarProps, "localizer">) {
  return <BigCalendar {...props} localizer={localizer} />;
}
