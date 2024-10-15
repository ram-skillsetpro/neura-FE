import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import React, { useEffect, useState } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css";
import { useAppDispatch } from "src/core/hook";
import {
  clearDateRangeFilter,
  setDateRangeFilter,
} from "src/layouts/admin/components/data-filter/data-filter.redux";

interface DateRangeModalType extends AppModalType {}

const DateRangeModal: React.FC<DateRangeModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
}) => {
  const dispatch = useAppDispatch();

  const [isClear, setIsClear] = useState<boolean>(false);
  const [isSelected, setSelected] = useState<boolean>(false);

  const [dateRange, setDateRange] = useState<Array<any>>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const saveDateRange = () => {
    const { startDate, endDate } = dateRange[0] || {};

    !isClear &&
      dispatch(
        setDateRangeFilter({
          fromDate: startDate.getTime(),
          toDate: endDate.getTime(),
        }),
      );

    onClose && onClose();
  };

  const handleClear = () => {
    setIsClear(true);
    dispatch(clearDateRangeFilter());
    setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    // onClose && onClose();
  };

  useEffect(() => {
    if (isClear) {
      setSelected(false);
    }
  }, [isClear]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      <div className="date-range-box">
        <DateRangePicker
          onChange={(item) => {
            setIsClear(false);
            setSelected(true);
            setDateRange([item.selection]);
          }}
          moveRangeOnFirstSelection={false}
          months={2}
          ranges={dateRange}
          direction="horizontal"
          preventSnapRefocus={true}
          calendarFocus="backwards"
          inputRanges={[]}
          rangeColors={["#ff6968"]}
          className="date-range-container"
          // minDate={new Date()} // Set minDate to disable past date
          maxDate={new Date()} // Set maxDate to the current date and disable the future date
        />
        <div className="date-range-footer">
          <button className="remove-button uppercase tracking-wider mr-3" onClick={onClose}>
            Cancel
          </button>
          <button
            style={{ background: `${isSelected ? "#ff6968" : ""}` }}
            className="remove-button uppercase tracking-wider mr-3"
            onClick={handleClear}
          >
            Clear
          </button>

          <button className="green-button uppercase tracking-wider" onClick={saveDateRange}>
            Done
          </button>
        </div>
      </div>
    </AppModal>
  );
};

export default DateRangeModal;
