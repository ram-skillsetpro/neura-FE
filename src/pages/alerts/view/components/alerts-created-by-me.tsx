import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import useModal from "src/core/utils/use-modal.hook";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { AlertsType } from "../../alerts.model";
import { getAlertsCreatedByMe } from "../../alerts.redux";
import { CustomAlert } from "../../components/alert";
import AlertDetailsModal from "./alert-details";

const columns = [
  {
    key: "fileSelector",
    label: (
      <div className="file-item-selector">
        <input type="checkbox" />
      </div>
    ),
    isSorting: false,
  },
  { key: "alertTitle", label: "Title", isSorting: false },
  { key: "alertText", label: "Text", isSorting: false },
  { key: "alertCommMediumName", label: "Medium", isSorting: false },
  { key: "alertPriorityLevelName", label: "Priority", isSorting: false },
  {
    key: "action",
    label: <div className="alerts-by-me action-col">Action</div>,
    isSorting: false,
  },
];

const AlertsCreatedByMe: React.FC = () => {
  const dispatch = useAppDispatch();
  const createdByMe = useAppSelector((state) => state.alerts.createdByMe);
  const { totct: totalItems, pgn: currentPage, perpg: itemsPerPage } = createdByMe;
  const [rows, setRows] = useState<Array<any>>([]);
  const [activeOption, setActiveOption] = useState(-1);
  const [alertId, setAlertId] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<AlertsType>();
  const [, setDeleteAlert] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isShowingModal, toggleModal] = useModal();

  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage],
  );

  useEffect(() => {
    dispatch(getAlertsCreatedByMe());
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (activeOption && event.target instanceof Element) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setActiveOption(-1);
        }
      }
    };

    window.addEventListener("click", closeOnOutsideClick);

    return () => {
      window.removeEventListener("click", closeOnOutsideClick);
    };
  }, [activeOption]);

  const handleDropDown = (alert: AlertsType) => {
    setActiveOption(alert.id);
  };

  useEffect(() => {
    setRows(createdByMe?.result?.map((data) => dataGenerator(data)));
  }, [createdByMe, activeOption]);

  const openAlertDetailsModal = (e: any, alert: AlertsType) => {
    e.stopPropagation();
    setAlertId(alertId);
    setActiveOption(-1);
    toggleModal();
    setSelectedAlert(alert);
  };

  const handleDeleteAlert = (e: any, alert: any) => {
    setActiveOption(-1);
    setDeleteAlert(true);
    setSelectedAlert(alert);
  };

  const getCustomAlert = (alert: AlertsType) => {
    if (alert.alertPriorityLevel === 1) {
      return <CustomAlert message={alert.alertPriorityLevelName} severity={"error"} />;
    } else if (alert.alertPriorityLevel === 2) {
      return <CustomAlert message={alert.alertPriorityLevelName} severity={"warning"} />;
    } else if (alert.alertPriorityLevel === 3) {
      return <CustomAlert message={alert.alertPriorityLevelName} severity={"info"} />;
    }
  };

  const dataGenerator = (data: AlertsType) => {
    return {
      fileSelector: (
        <div className="file-item-selector">
          <input type="checkbox" />
        </div>
      ),
      alertTitle: (
        <div className="team-name">
          <div>{data.alertTitle}</div>
        </div>
      ),
      alertText: data.alertText,
      alertCommMediumName: data.alertCommMediumName,
      alertPriorityLevelName: getCustomAlert(data),
      action: (
        <div className="file-item-controls option-width alerts-by-me">
          <div className="icon control has-dropdown" onClick={() => handleDropDown(data)}>
            {activeOption === data.id && (
              <div className="dropdown-list medium" ref={dropdownRef}>
                <ul>
                  <li onClick={(e) => openAlertDetailsModal(e, data)}>
                    <a>View</a>
                  </li>
                  <li onClick={(e) => handleDeleteAlert(e, data)}>
                    <a>Delete</a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ),
    };
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && currentPage !== newPage) {
      dispatch(getAlertsCreatedByMe(newPage));
    }
  };

  const closeAlertDetailsModal = () => {
    toggleModal();
    setSelectedAlert(undefined);
  };

  return (
    <>
      <DataTable
        className="alerts-table"
        data={rows}
        columns={columns}
        enablePagination={totalItems > 10}
        onPageChange={handlePageChange}
        paginationData={{ totalItems, currentPage, itemsPerPage }}
      />
      {isShowingModal && (
        <AlertDetailsModal
          isOpen={isShowingModal}
          onClose={closeAlertDetailsModal}
          onAfterClose={() => toggleModal()}
          alert={selectedAlert}
        />
      )}
    </>
  );
};

export default AlertsCreatedByMe;
