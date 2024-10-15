import pdfIcon from "assets/images/icon-pdf.svg";
import { AnimatePresence, motion } from "framer-motion";
import { alertsReducer } from "pages/alerts/alerts.redux";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ROUTE_ADMIN,
  ROUTE_TEAMS_DRIVE,
  ROUTE_TEAM_FILES,
  ROUTE_USER_DASHBOARD,
  TOAST,
} from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { Toaster } from "src/core/models/toaster.model";
import { base64toBlob, decodeFileKey, downloadFileFromBlobUrl } from "src/core/utils";
import { commentBoxReducer } from "../comment/comment-box.redux";
import "./contract.scss";

import { LS_FILES_FOLDERS_ROUTE, LS_TEAM } from "core/utils/constant";
import RightSection from "pages/contract/right-section/right-section";
import { HttpClientOptions } from "src/core/services/http-client";
import {
  headerSearchdReducer,
  setActiveContractTab,
} from "src/layouts/admin/components/admin-header/header-auth.redux";
import { dataFilterReducer } from "src/layouts/admin/components/data-filter/data-filter.redux";
import {
  clearFileId,
  clearOriginalFile,
  clearRightsSummary,
  clearTableData,
  contractReducer,
  downloadExtractedContractData,
  fetchContractExtractedCoordinates,
  fetchExtracetedDocument,
  fetchExtractedClause,
  fetchFileNavigationData,
  fetchOriginalFile,
  fetchRightCalenderData,
  fetchRightsSummaryData,
  fetchTableData,
  getFileMeta,
  handleFileToOpen,
  setFileId,
  setOriginalFileError,
  setPlaybookList,
  similarFileUpload,
} from "../contract/contract.redux";
import { clearTeamDriveState } from "../manage-team/team-files/team-files.redux";
import { teamReducer } from "../manage-team/team.redux";
import { playbookReducer } from "../playbook/playbook.redux";
import FolderNavigation from "../user-dashboard/components/file-upload/folder-navigation";
import { clearMyDriveState, dashboardReducer } from "../user-dashboard/dashboard.redux";
import ExtractedClause from "./components/extracted-clause";
import ExtractedDocument from "./components/extracted-document";
import PdfViewer from "./components/pdf/pdf-viewer";
import RightsSummary from "./components/rights-summary";
import TableData from "./components/table-data";

const ContractView: React.FC = () => {
  /* Hooks */
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  /* Constants */
  const key: any = searchParams.get("key");
  const tabList: any = [];

  /* Local State */
  const currentPageRef = useRef<HTMLElement | null>(null);
  const totalPageRef = useRef<HTMLElement | null>(null);
  const [isParentFile, setIsParentFile] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [downloadDropdown, setDownloadDropdown] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("ORIGINAL");
  const [isNewTab, setIsNewTab] = useState(false);
  const previousPath = localStorage.getItem("previousPath");

  /* Redux State */
  const { fileId, folderId, teamId, fileName, source = null, other } = decodeFileKey(key || "");

  const {
    file,
    extractedClause,
    tableData,
    errorMessage,
    originalFileError,
    rightsSummary,
    extractedDocument,
    fileMeta,
    fileNavigationStack,
  } = useAppSelector((state) => state.contract);

  const { request, next, prev } = fileNavigationStack || {};

  const { parseFlag } = fileMeta || {};

  /* controls */
  tabList.push({ name: "Original", key: "ORIGINAL" });

  if (extractedDocument && extractedDocument !== "") {
    tabList.push({ name: "Extracted Document", key: "EXTRACTED_DOCUMENT" });
  }

  if (extractedClause && Array.isArray(extractedClause) && extractedClause.length > 0) {
    tabList.push({ name: "Clauses", key: "CLAUSES" });
  }

  if (tableData && Array.isArray(tableData) && tableData.length > 0) {
    tabList.push({ name: "Table Data", key: "TABLE_DATA" });
  }

  if (rightsSummary && rightsSummary !== "") {
    tabList.push({ name: "Rights Summary", key: "RIGHTS_SUMMARY" });
  }

  /* Functions */
  const handlePageNumber = (totalPages: number, currentPage: number) => {
    if (totalPageRef.current) {
      totalPageRef.current.innerText = String(totalPages);
    }
    if (currentPageRef.current) {
      currentPageRef.current.innerText = String(currentPage);
    }
  };

  const handleDownload = () => {
    file && file !== "" && downloadFileFromBlobUrl(base64toBlob(file), fileName);
  };

  const handleExtractedSummaryDownload = () => {
    file &&
      file !== "" &&
      parseFlag === 1 &&
      dispatch(downloadExtractedContractData({ fileId, folderId, teamId }));
  };

  const handleFileChange = async (e: any, parseFlag: number) => {
    const options: HttpClientOptions = {
      onUploadProgress: (progressEvent: ProgressEvent) => {
        const { loaded, total } = progressEvent;
        const percent = Math.floor((loaded * 100) / total);
        console.log(percent);
      },
    };

    const obj = {
      file: e.target.files[0],
      folderId,
      parseFlag,
      teamId,
      fileId,
    };

    isParentFile && (await dispatch(similarFileUpload(obj, options)));
  };

  const checkParentContract = async () => {
    const calenderData: any = teamId
      ? (await dispatch(fetchRightCalenderData({ fileId, folderId, teamId }))) || []
      : [];
    const result = calenderData.filter((d: any) => d.key === "PARENT CONTRACT").length;
    setIsParentFile(!result);
  };

  const toggleDropdown = (e: any) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const generatePayload = (pointer: any) => {
    const { id, fileName, teamId, folderId } = pointer || {};
    const {
      source,
      contractTypeId,
      teamUserId,
      sIndexHash,
      pgn,
      keyword,
      notContractIds,
      fromDate,
      toDate,
    } = request || {};

    if (id && fileName && teamId) {
      const payload = {
        id,
        teamId,
        folderId,
        fileName,
        mimeType: "application/pdf",
        source,
        other: {
          contractTypeId,
          teamUserId,
          sIndexHash,
          pgn,
          keyword,
          notContractIds,
          fromDate,
          toDate,
        },
      };

      return payload;
    }

    return null;
  };

  const handlePrevContract = () => {
    const payload = generatePayload(prev);
    if (payload) {
      dispatch(handleFileToOpen(payload));
    }
  };

  const handleNextContract = () => {
    const payload = generatePayload(next);
    if (payload) {
      dispatch(handleFileToOpen(payload));
    }
  };

  /* Effects */
  useEffect(() => {
    if (fileId) {
      dispatch(fetchExtractedClause({ fileId, folderId, teamId }));
      dispatch(fetchTableData({ fileId, folderId, teamId }));
      dispatch(fetchRightsSummaryData({ fileId, teamId, folderId }));
      dispatch(fetchExtracetedDocument({ fileId, teamId, folderId }));
      dispatch(getFileMeta({ fileId, folderId, teamId }));
      dispatch(fetchContractExtractedCoordinates({ fileId, folderId, teamId }));

      const {
        contractTypeId,
        teamUserId,
        sIndexHash,
        pgn,
        keyword,
        notContractIds,
        fromDate,
        toDate,
      } = other || {};
      dispatch(
        fetchFileNavigationData({
          contractTypeId,
          fileId,
          folderId,
          pgn,
          source,
          teamId,
          teamUserId,
          sIndexHash,
          keyword,
          notContractIds,
          fromDate: fromDate / 1000,
          toDate: toDate / 1000,
        }),
      );
    }

    return () => {
      dispatch(clearTableData());
      dispatch(clearRightsSummary());
      dispatch(clearFileId());
      dispatch(setPlaybookList([]));
      dispatch(setPlaybookList([]));
      dispatch(setActiveContractTab("summary"));
    };
  }, [fileId]);

  useEffect(() => {
    const controller = new AbortController();
    if (fileId) {
      dispatch(fetchOriginalFile({ fileId, folderId, teamId, controller }));
    }
    return () => {
      controller.abort();
      dispatch(clearOriginalFile());
      setOriginalFileError("");
    };
  }, [fileId]);

  useEffect(() => {
    if (errorMessage && errorMessage !== "") {
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "error",
            message: errorMessage,
          },
        }),
      );
    }
  }, [errorMessage]);

  useEffect(() => {
    if (originalFileError && originalFileError !== "") {
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "error",
            message: originalFileError,
          },
        }),
      );
    }
  }, [originalFileError]);

  useEffect(() => {
    dispatch(setFileId(fileId));
  }, [fileId]);

  useEffect(() => {
    window.addEventListener("click", () => {
      setDropdownOpen(false);
      setDownloadDropdown(false);
    });
  }, []);

  useEffect(() => {
    checkParentContract();
  }, [fileId]);

  useEffect(() => {
    setIsNewTab(!window.opener);
    // set new tab
  }, []);

  const goToMyDrive = () => {
    localStorage.removeItem(LS_FILES_FOLDERS_ROUTE);
    localStorage.removeItem(LS_TEAM);
    if (previousPath?.includes(ROUTE_USER_DASHBOARD)) {
      navigate(`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}`, { state: {} });
    } else if (previousPath?.includes(ROUTE_TEAM_FILES)) {
      navigate(`/${ROUTE_ADMIN}/${ROUTE_TEAMS_DRIVE}`, {
        state: {},
      });
    }
    localStorage.removeItem("previousPath");
  };
  const location = useLocation();

  const routeDataMap = useMemo(
    () => location.state?.routeDataMap ?? {},
    [location.state?.routeDataMap],
  );

  const handleGoBack = (folder: any) => {
    let targetUuid = null;
    for (const [uuid, folders] of Object.entries(routeDataMap)) {
      if (Array.isArray(folders) && folders[folders.length - 1].id === folder.id) {
        targetUuid = uuid;
        break;
      }
    }
    if (targetUuid) {
      clearOldState();
      if (previousPath?.includes(ROUTE_USER_DASHBOARD)) {
        navigate(`/${ROUTE_ADMIN}/${ROUTE_USER_DASHBOARD}?folders=${targetUuid}`, {
          state: {
            routeDataMap,
          },
        });
      } else if (previousPath?.includes(ROUTE_TEAM_FILES)) {
        navigate(`/${ROUTE_ADMIN}/${ROUTE_TEAM_FILES}?folders=${targetUuid}`, {
          state: {
            routeDataMap,
          },
        });
      }
    } else {
      console.error("UUID not found for the given folder id");
    }
  };

  const gobackToPreviousPath = () => {
    let targetUuid = null;
    let lastFolderId = null;

    for (const [uuid, folders] of Object.entries(routeDataMap)) {
      if (Array.isArray(folders) && folders.length > 0) {
        targetUuid = uuid;
        lastFolderId = folders[folders.length - 1].id;
      }
    }

    if (targetUuid && lastFolderId) {
      navigate(`${previousPath}?folders=${targetUuid}`, {
        state: {
          routeDataMap,
        },
      });
    } else {
      navigate(`${previousPath}`);
    }
  };
  const clearOldState = () => {
    dispatch(clearMyDriveState());
    dispatch(clearTeamDriveState());
  };

  return (
    <>
      {/* {isLoading && <Loader /> */}
      <div className="left-section">
        <div
          className={`${
            activeTab === "ORIGINAL"
              ? "left-section-inner disable-body-scroll"
              : "left-section-inner"
          }`}
        >
          <div className="app-tabs-sec">
            <div className="left-inner-sticky">
              <FolderNavigation
                label={
                  previousPath?.includes(ROUTE_USER_DASHBOARD)
                    ? "My Drive"
                    : previousPath?.includes(ROUTE_TEAM_FILES)
                      ? "Team Drive"
                      : ""
                }
                goBack={goToMyDrive}
                handleGoBack={handleGoBack}
              />
              <div className="app-breadcrumbs">
                {isNewTab && (
                  <button
                    className="back-btn"
                    onClick={() => {
                      clearOldState();
                      previousPath ? gobackToPreviousPath() : navigate(-1);
                    }}
                  >
                    <i className="icon-img"></i>
                  </button>
                )}
                <i className="breadcrumb-ic">
                  <img src={pdfIcon} />
                </i>
                <span className="fs12 font-bold truncate-line1 contract-n-w">{fileName}</span>
                <span className="grow"></span>
                <div className="contract-change-wrap">
                  <button
                    onClick={handlePrevContract}
                    className="mr-3 next-contract-btn relative"
                    disabled={!prev}
                  >
                    <i className="pre-btn"></i> Previous Contract
                    <div className="tool-tipN">{prev?.fileName}</div>
                  </button>
                  <button
                    onClick={handleNextContract}
                    className="next-contract-btn relative"
                    disabled={!next}
                  >
                    Next Contract <i className="next-btn"></i>
                    <div className="tool-tipN">{next?.fileName}</div>
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <ul className="app-tab-style" id="tabs-nav">
                  {tabList.map((data: any, index: number) => {
                    return (
                      <li key={index} className={`${data.key === activeTab ? "active" : ""}`}>
                        <AnimatePresence mode="wait" key={index}>
                          <motion.div
                            key={index}
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                          >
                            <a onClick={() => setActiveTab(data.key)}>{data.name}</a>
                          </motion.div>
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
                {/* END tabs-nav */}
                <span className="grow" />

                <div className="relative drop-down-modal">
                  <button
                    disabled={!(file && file !== "")}
                    className="download-icon-btn mr-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDownloadDropdown(!downloadDropdown);
                    }}
                  >
                    <i className="dw-ic"></i>
                  </button>
                  <div
                    className="menu-card w-auto rounded-6"
                    style={{ display: `${downloadDropdown ? "block" : "none"}` }}
                  >
                    <ul>
                      <li>
                        <a
                          className="download-file mr-2"
                          title="Download Contract"
                          onClick={handleDownload}
                        >
                          Original Contract
                        </a>
                      </li>
                      <li>
                        {parseFlag === 1 ? (
                          <a
                            className="download-file mr-2"
                            title="Download Contract Summary"
                            onClick={handleExtractedSummaryDownload}
                          >
                            Contract Data
                          </a>
                        ) : (
                          <a
                            style={{ opacity: "0.5", cursor: "not-allowed" }}
                            className=" download-file mr-2"
                            title="Download Contract Summary"
                          >
                            Contract Data
                          </a>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="relative drop-down-modal" onClick={toggleDropdown}>
                  <button
                    disabled={!(file && file !== "")}
                    className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                  >
                    Related Documents
                  </button>

                  <div
                    className="menu-card rounded-6 card-z-index"
                    style={{ display: dropdownOpen ? "block" : "none" }}
                  >
                    <ul>
                      <li className="upload-icon cursor-pointer">
                        Upload <strong>Contracts</strong>
                        <div className="file-upload-link">
                          <input
                            disabled={!isParentFile}
                            onChange={(e) => handleFileChange(e, 1)}
                            accept="application/pdf"
                            type="file"
                          />
                        </div>
                      </li>
                      <li className="upload-icon cursor-pointer">
                        Upload <strong>Attachments</strong>
                        <div className="file-upload-link">
                          <input
                            disabled={!isParentFile}
                            onChange={(e) => handleFileChange(e, 0)}
                            accept="application/pdf"
                            type="file"
                          />
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div id="tabs-content">
              <div
                className="app-content-wrap"
                style={{ display: `${activeTab === "EXTRACTED_DOCUMENT" ? "block" : "none"}` }}
              >
                <div className="app-content-inner" style={{ minHeight: "95vh" }}>
                  <AnimatePresence mode="wait">
                    {activeTab === "EXTRACTED_DOCUMENT" && (
                      <motion.div
                        key={activeTab}
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <ExtractedDocument content={extractedDocument} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div
                className="app-content-wrap"
                style={{ display: `${activeTab === "CLAUSES" ? "block" : "none"}` }}
              >
                <AnimatePresence mode="wait">
                  {activeTab === "CLAUSES" && (
                    <motion.div
                      key={activeTab}
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ExtractedClause extractedClause={extractedClause} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div
                className="app-content-wrap"
                style={{ display: `${activeTab === "TABLE_DATA" ? "block" : "none"}` }}
              >
                <div className="app-content-inner">
                  <AnimatePresence mode="wait">
                    {activeTab === "TABLE_DATA" && (
                      <motion.div
                        key={activeTab}
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <TableData tableData={tableData} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div
                className="app-content-wrap original-pdf-container"
                style={{ display: `${activeTab === "ORIGINAL" ? "block" : "none"}` }}
              >
                <AnimatePresence mode="wait">
                  {activeTab === "ORIGINAL" && (
                    <motion.div
                      key={activeTab}
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        className="original"
                        style={{
                          height: "calc(100vh - 214px)",
                          position: "relative",
                          marginTop: "10px",
                        }}
                      >
                        <PdfViewer
                          file={file}
                          handlePageNumber={handlePageNumber}
                          fileId={fileId}
                          teamId={teamId}
                          folderId={folderId}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div
                className="app-content-wrap"
                style={{ display: `${activeTab === "RIGHTS_SUMMARY" ? "block" : "none"}` }}
              >
                <div className="app-content-inner">
                  <AnimatePresence mode="wait">
                    {activeTab === "RIGHTS_SUMMARY" && (
                      <motion.div
                        key={activeTab}
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <RightsSummary
                          content={rightsSummary}
                          fileId={fileId}
                          folderId={folderId}
                          teamId={teamId}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            {/* END tabs-content */}
          </div>
          {/* END tabs */}
        </div>
      </div>
      <RightSection />
    </>
  );
};

export default ContractView;

export const reducer = {
  contract: contractReducer,
  commentBox: commentBoxReducer,
  team: teamReducer,
  alerts: alertsReducer,
  headerSearchContract: headerSearchdReducer,
  dashboard: dashboardReducer,
  playbook: playbookReducer,
  dataFilter: dataFilterReducer,
};
