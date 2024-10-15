import { useAppDispatch, useAppSelector } from "core/hook";
import { formatDateWithOrdinal } from "core/utils/constant";
import useModal from "core/utils/use-modal.hook";
import { AlertsType } from "pages/alerts/alerts.model";
import { acknowledgeAlert, getAlertsForFile } from "pages/alerts/alerts.redux";
import { CustomAlert } from "pages/alerts/components/alert";
import AlertDetailsModal from "pages/alerts/view/components/alert-details";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import "./alert-listing.styles.scss";
interface AlertsListingInContractType {
  fileId: number;
}

const AlertsListingInContract: React.FC<AlertsListingInContractType> = ({ fileId }) => {
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Array<any>>([]);
  const [activeOption, setActiveOption] = useState(-1);
  const [alertId, setAlertId] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<AlertsType>();
  const [, setDeleteAlert] = useState(false);
  const [isShowingModal, toggleModal] = useModal();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const AlertsForFile = useAppSelector((state) => state.alerts.forFile);
  const { totct: totalItems, pgn: currentPage, perpg: itemsPerPage } = AlertsForFile;
  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage],
  );

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
    { key: "acknowledged", label: "Acknowledged", isSorting: false },
    { key: "acknowledgedOn", label: "Acknowledged On", isSorting: false },

    {
      key: "action",
      label: <div className="alerts-by-me action-col">Action</div>,
      isSorting: false,
    },
  ];

  useEffect(() => {
    dispatch(getAlertsForFile(fileId));
  }, []);

  useEffect(() => {
    setRows(AlertsForFile?.result?.map((data) => dataGenerator(data)));
  }, [AlertsForFile, activeOption]);

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

  const handleDropDown = (alert: AlertsType) => {
    setActiveOption(alert.id);
  };
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
      acknowledged: renderAcknowledgedOption(data),
      acknowledgedOn: data.ack ? formatDateWithOrdinal(new Date(data.ackon * 1000)) : "-",
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

  const renderAcknowledgedOption = (alert: AlertsType) => {
    const onAcknowledge = () => {
      dispatch(acknowledgeAlert(alert.id, fileId));
    };
    if (alert.ack) {
      return (
        <div className="file-item-selector ack-alert">
          <input
            type="checkbox"
            checked={!!alert.ack}
            disabled={!!alert.ack}
            className="ack"
            value={alert.ack}
          />
        </div>
      );
    }
    return (
      <div className="file-item-selector ack-alert">
        <input type="checkbox" onChange={onAcknowledge} className="ack" checked={!!alert.ack} />
      </div>
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && currentPage !== newPage) {
      dispatch(getAlertsForFile(fileId, newPage));
    }
  };

  const closeAlertDetailsModal = () => {
    toggleModal();
    setSelectedAlert(undefined);
  };
  return (
    <>
      {rows && rows.length > 0 ? (
        <DataTable
          data={rows}
          columns={columns}
          enablePagination={totalItems > 10}
          onPageChange={handlePageChange}
          paginationData={{ totalItems, currentPage, itemsPerPage }}
          className="alerts-on-contract"
        />
      ) : (
        <div>
          <br></br>No record found
        </div>
      )}
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

export default AlertsListingInContract;
