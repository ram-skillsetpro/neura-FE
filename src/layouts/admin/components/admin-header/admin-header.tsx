// import LeftArrow from "assets/images/icon-left-arrow.svg";
// import userImageIcon from "assets/images/user.png";
import { alertsClose, getAlertsForMe } from "pages/alerts/alerts.redux";
// import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import { ROUTE_CONTRACT_VIEW } from "src/const";
// import { useAppDispatch, useAppSelector } from "src/core/hook";
// import { AlertsPopup } from "../alerts-popup/alerts-popup";
// import IconAvatar from "assets/images/harry.jpg";
import IconSearch from "assets/images/search-icon.svg";
// import SimpleOLogo from "assets/images/simpleo-ai-logo.svg";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { ROUTE_USER_DASHBOARD, USER_AUTHORITY } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import {
  getAuth,
  getFileIcon,
  getShortUsername,
  getUsernameColor,
  removeHtmlTags,
} from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import SignLater from "src/layouts/admin/components/admin-header/sign-later.component";
import { handleFileToOpen } from "src/pages/contract/contract.redux";
import { AlertsPopup } from "../alerts-popup/alerts-popup";
import { AdminHeaderPreContractTabs } from "./admin-header-pre-contract-tabs";
import "./admin-header-style.scss";
import {
  clearAutoCompleteSearchResult,
  clearSearch,
  fetchAutoCompleteSearchResults,
  logoutUser,
  saveSearchedText,
  searchContract,
  searchContractSuccesss,
  setActiveContractTab,
  setAutoCompleteSearchList,
} from "./header-auth.redux";

const AdminHeader: React.FC = () => {
  const activeContractTab = useAppSelector((state) => state.headerSearchContract.activeContractTab);
  const { expandEditor } = useAppSelector((state) => state.preContract);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const pathName = location.pathname;

  const hasRolePromptChat = useAuthorityCheck([USER_AUTHORITY.ROLE_PROMPT_CHAT]);

  const handleContractTabChange = (tab: string) => {
    dispatch(setActiveContractTab(tab));
  };
  const navigate = useNavigate();
  const searchParam = new URLSearchParams(location.search);
  const initialSearchTerm = searchParam.get("search") || "";
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isDashboardRedirect, setIsDashboardRedirect] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isUserSettingOpen, setIsUserSettingOpen] = useState(false);
  const alertsCount = useAppSelector((state) => state.alerts.forMe.unrdct) || 0;
  const userLogo = useAppSelector((state) => state.auth.user?.userLogo) ?? getAuth().userLogo;
  const { autoCompleteSearchList } = useAppSelector((state) => state.headerSearchContract);
  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const username = authData?.username ? authData.username : "";
  const emailId = authData?.emailId ? authData?.emailId : "";
  // const { contractId } = useAppSelector((state) => state.preContract);
  const openAlertView = useAppSelector((state) => state.alerts.openAlertView);
  const preSignedUrl = useAppSelector((state) => state.docusign.preSignedUrl);
  const fileMetaData = useAppSelector((state) => state.contract.fileMeta);
  const { fileUploadState } = useAppSelector((state) => state.preContract);
  const snippetPermission = useAuthorityCheck([USER_AUTHORITY.SNPT_SHR]);
  const redactPermission = useAuthorityCheck([USER_AUTHORITY.RDT_SHR]);
  const Pb_review = useAuthorityCheck([USER_AUTHORITY.PB_REVIEW]);

  const controller = useRef<any>();

  const paths = [
    "/search-result",
    "/admin/file",
    "admin/pre-contract",
    "admin/pre-template",
    "/admin/upload-and-sign",
  ];
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(saveSearchedText(e.target.value));
    if (e.target.value === "") {
      clearSearchResult();
    }
    setIsDashboardRedirect(false);
    setSearchTerm(e.target.value);
    if (pathName === "/admin/search-result") {
      navigate(`/admin/search-result${e.target.value !== "" ? `?search=${e.target.value}` : ``}`);
    }
    // debouncedSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm) {
      try {
        controller.current.abort();
      } catch (error) {}
      dispatch(clearAutoCompleteSearchResult());
      fetchData(searchTerm);
      navigate("/admin/search-result?search=" + encodeURIComponent(searchTerm));
    } else {
      if (searchTerm === "") {
        dispatch(searchContractSuccesss([]));
      }
    }
  };

  useEffect(() => {
    if (searchTerm === "") {
      clearSearchResult();
    }
  }, [searchTerm]);

  const handleClick = () => {
    dispatch(clearAutoCompleteSearchResult());
    fetchData(searchTerm);
    navigate("/admin/search-result?search=" + encodeURIComponent(searchTerm));
  };

  const handleDropdown = () => {
    setIsActive(!isActive);
    if (!location.pathname.includes("/search-result")) {
      fetchAutocompleSearchList(searchTerm);
    }
  };

  const closeDropdown = () => {
    setIsActive(false);
  };

  const fetchData = async (searchTerm: string) => {
    dispatch(clearAutoCompleteSearchResult());
    const obj = {
      keyword: searchTerm,
    };
    dispatch(searchContract(obj));
    navigate("/admin/search-result?search=" + encodeURIComponent(searchTerm));
  };

  const clearSearchResult = () => {
    setSearchTerm("");
    dispatch(clearSearch());
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  const fetchUnreadAlertCountUpdate = async () => {
    try {
      await dispatch(getAlertsForMe());
    } catch (error) {
      console.error("Error while fetching alert count:", error);
    }
  };

  useEffect(() => {
    const intervalUnreadAlertCountUpdate = setInterval(fetchUnreadAlertCountUpdate, 600000);
    return () => {
      clearInterval(intervalUnreadAlertCountUpdate);
    };
  }, []);

  useEffect(() => {
    fetchUnreadAlertCountUpdate();
  }, []);

  const toggleAlertsPopup = async (e: any) => {
    e.stopPropagation();
    setIsAlertsOpen((prevState) => !prevState);
    if (isUserSettingOpen) {
      setIsUserSettingOpen(false);
    }
  };
  const toggleUserSettingsPopup = async (e?: any) => {
    e?.stopPropagation();
    if (isAlertsOpen) {
      setIsAlertsOpen(false);
    }
    setIsUserSettingOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target instanceof HTMLElement &&
        !event.target.classList.contains("specific-component")
      ) {
        dispatch(alertsClose());
        setIsAlertsOpen(false);
        setIsUserSettingOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const adminSettingPage = (showData: boolean) => {
    navigate("/admin/settings", { state: { showData, buttonAction: true } });
  };

  const renderUserSettingsPopup = () => {
    return (
      <>
        <div className="menu-card rounded-6 alert-menu-card">
          <ul>
            {/* <li>
            <a href="#" className="forward-arrow">
              My Account
            </a>
          </li> */}
            <li>
              <div className="fs12 mb-1 max-w-200">
                <div className="font-semibold">{username}</div>
                <div className="truncate-line1">{emailId}</div>
              </div>
            </li>
            <li onClick={() => adminSettingPage(true)}>
              <a className="forward-arrow">My Account</a>
            </li>
            <li>
              <a href="#" className="forward-arrow" onClick={handleLogout}>
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      </>
    );
  };

  const fetchAutocompleSearchList = (searchTerm: string) => {
    const obj = {
      keyword: searchTerm,
    };

    if (searchTerm.length > 2) {
      controller.current = new AbortController();
      dispatch(fetchAutoCompleteSearchResults(obj, controller.current));
    } else {
      try {
        controller.current.abort();
      } catch (error) {}
      dispatch(setAutoCompleteSearchList([]));
    }
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm.length > 2 || searchTerm.length === 0) {
        fetchAutocompleSearchList(searchTerm);
      } else {
        dispatch(clearAutoCompleteSearchResult());
      }
    }, 400);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    window.addEventListener("click", () => {
      dispatch(clearAutoCompleteSearchResult());
    });
    dispatch(clearAutoCompleteSearchResult());
  }, []);

  useEffect(() => {
    if (isDashboardRedirect) {
      setSearchTerm("");
    }
  }, [isDashboardRedirect]);

  // const signContractLater = () => {
  //   if (location?.pathname === `/${ROUTE_ADMIN}/${UPLOAD_AND_SIGN}`) {
  //     dispatch(signLater(contractId, true));
  //   } else {
  //     dispatch(signLater(contractId));
  //   }
  // };

  function getSharedWithUser(logoUrl: string) {
    return (
      <div
        className="ic-member tool-tip-wrap w-full h-full flex items-center justify-center rounded-full"
        style={{
          backgroundColor: logoUrl === "" ? getUsernameColor(username) || "" : "initial",
        }}
      >
        {logoUrl !== "" ? <img src={logoUrl} /> : `${getShortUsername(username)}`}
      </div>
    );
  }

  return (
    <>
      {fileUploadState && <Loader />}
      {!expandEditor && (
        <header className="header-sec">
          <div className="app-header">
            <div className="app-left-sec">
              <div className="app-left-inner">
                <div className="app-logo">
                  <Link to={ROUTE_USER_DASHBOARD} onClick={() => setIsDashboardRedirect(true)}>
                    <img
                      src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/simpleo-ai-logo.svg"
                      alt="SimpleO Logo"
                    />
                  </Link>
                </div>
                <div className="app-search">
                  <div
                    className="app-search-inner"
                    style={
                      location.pathname.includes("upload-and-sign-list")
                        ? {
                            margin: location.pathname.includes("upload-and-sign-list")
                              ? "unset"
                              : "auto",
                          }
                        : {
                            margin: paths.some((path) => location?.pathname?.includes(path))
                              ? "auto"
                              : "unset",
                          }
                    }
                  >
                    {/* <form> */}
                    <input
                      tabIndex={1}
                      type="search"
                      value={!isDashboardRedirect ? searchTerm : ""}
                      onFocus={handleDropdown}
                      onBlur={closeDropdown}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Search for anything and we will figure it out"
                    />
                    <button onClick={handleClick} className="src-btn">
                      <img src={IconSearch} />
                    </button>
                    {/* </form> */}
                    {autoCompleteSearchList.length ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="search-suggestion-list"
                        >
                          <AnimatePresence mode="wait">
                            <ul>
                              {autoCompleteSearchList.map((data, index) => (
                                <motion.li
                                  key={index}
                                  exit={{ opacity: 0 }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.01 * index, duration: 1 }}
                                >
                                  <a
                                    onClick={() => {
                                      dispatch(clearAutoCompleteSearchResult());
                                      localStorage.removeItem("previousPath");
                                      dispatch(
                                        handleFileToOpen({
                                          id: data.fileId,
                                          teamId: data.teamId,
                                          folderId: data.folderId,
                                          fileName: removeHtmlTags(data.filename),
                                          createdBy: data.createdById,
                                          mimeType: data.mimeType,
                                        }),
                                      );
                                    }}
                                    className="flex items-center"
                                  >
                                    <div className="mr-3 fs12 font-bold flex items-center">
                                      <i className="icon-s20">
                                        <img
                                          src={require(
                                            // eslint-disable-next-line max-len
                                            `assets/images/icon-${getFileIcon(removeHtmlTags(data.filename), data.mimeType)}.svg`,
                                          )}
                                        />
                                      </i>
                                      <div>
                                        {removeHtmlTags(data.filename)}
                                        <div style={{ fontWeight: "100" }}>
                                          {data.teamName}
                                          {`${data.folderName === "" || !data.folderName ? "" : `/.../${data.folderName}`}`}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="grow"></span>
                                    {/* <button className="rounded-12 sm-button tracking-wider font-bold uppercase p-3 button-compare">
                                  Compare
                                </button> */}
                                  </a>
                                </motion.li>
                              ))}
                            </ul>
                          </AnimatePresence>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="app-right-sec">
              <div className="app-right-inner">
                <div className="app-icon-sec">
                  {/* file icons */}
                  {pathName === "/admin/file" && (
                    <>
                      <div
                        className={`app-icon-w app-icon-tab icon-tool-tip ${
                          activeContractTab === "summary" ? "active" : ""
                        }`}
                        data-toggle-target=".tab-sharing"
                        onClick={() => handleContractTabChange("summary")}
                      >
                        {/* <span className="alert-message" style={{ color: "transparent" }}>
                      1
                    </span> */}
                        <i className="sharing-ic any-ic"></i>
                        <div className="icon-info">Summary</div>
                      </div>
                      <div
                        className={`app-icon-w app-icon-tab icon-tool-tip ${
                          activeContractTab === "comments" ? "active" : ""
                        }`}
                        data-toggle-target=".tab-comment"
                        onClick={() => handleContractTabChange("comments")}
                      >
                        <span className="alert-message" style={{ display: "none" }}>
                          2
                        </span>
                        <i className="comment-ic any-ic"></i>
                        <div className="icon-info">Comment</div>
                      </div>
                      <div
                        className={`app-icon-w app-icon-tab icon-tool-tip ${
                          activeContractTab === "calender" ? "active" : ""
                        }`}
                        data-toggle-target=".tab-calender"
                        onClick={() => handleContractTabChange("calendar")}
                      >
                        <i className="calender-ic any-ic"></i>
                        <div className="icon-info">Related Files</div>
                      </div>
                      {Pb_review &&
                        (fileMetaData?.showPlaybook || activeContractTab === "playbook") && (
                          <div
                            className={`app-icon-w app-icon-tab icon-tool-tip ${
                              activeContractTab === "playbook" ? "active" : ""
                            }`}
                            data-toggle-target=".tab-playbook"
                            onClick={() => handleContractTabChange("playbook")}
                          >
                            <span className="alert-message" style={{ display: "none" }}>
                              4
                            </span>
                            <i className="playbook-ic any-ic"></i>
                            <div className="icon-info">Contract Review</div>
                          </div>
                        )}
                      {snippetPermission || redactPermission ? (
                        <div
                          className={`app-icon-w app-icon-tab icon-tool-tip ${
                            activeContractTab === "snippets" || activeContractTab === "redact"
                              ? "active"
                              : ""
                          }`}
                          data-toggle-target=".tab-playbook"
                          onClick={() => handleContractTabChange("snippets")}
                        >
                          <span className="alert-message" style={{ display: "none" }}>
                            4
                          </span>
                          <i className="snippets-ic any-ic"></i>
                          <div className="icon-info">Contract Excerpts</div>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  )}
                  {pathName === "/admin/pre-contract" && preSignedUrl === "" && (
                    <AdminHeaderPreContractTabs />
                  )}
                  {pathName === "/admin/upload-and-sign" && (
                    <div
                      className={`app-icon-w app-icon-tab icon-tool-tip ${
                        activeContractTab === "summary" ? "active" : ""
                      }`}
                      data-toggle-target=".tab-sharing"
                      onClick={() => handleContractTabChange("summary")}
                    >
                      {/* <span className="alert-message" style={{ color: "transparent" }}>
                      1
                    </span> */}
                      <i className="sharing-ic any-ic"></i>
                      <div className="icon-info">Summary</div>
                    </div>
                  )}
                  {(pathName === "/admin/pre-contract" || pathName === "/admin/upload-and-sign") &&
                    preSignedUrl !== "" && <SignLater />}
                </div>
                {/* user settings */}
                <div className="app-user-sec">
                  {/* {pathName === "/admin/file" &&
                  hasRolePromptChat &&
                  fileMetaData?.processStatus === 3 &&
                  fileMetaData.parseFlag === 1 && ( */}
                  {pathName === "/admin/file" && hasRolePromptChat && (
                    <div
                      className={`prompt-icon-sec ${activeContractTab === "prompt" ? "selected" : ""}`}
                      onClick={() => handleContractTabChange("prompt")}
                    >
                      <i className="prompt-icon icon-img"></i>
                    </div>
                  )}
                  <div
                    className="app-alert drop-down-modal alert-card-container cursor-pointer"
                    onClick={toggleAlertsPopup}
                  >
                    {alertsCount > 0 ? <span className="alert-text">{alertsCount}</span> : ""}
                    <i className="app-bell-icon icon-img"></i>
                    {/* <i className="app-bell-icon" onClick={toggleAlertsPopup}>
                  <img src={IconNoAlert} />
                </i> */}
                    {(isAlertsOpen || openAlertView) && (
                      <AlertsPopup handleOpen={setIsAlertsOpen} />
                    )}
                  </div>
                  <div className="app-user relative drop-down-modal alert-card-container">
                    <i
                      className="user-profile cursor-pointer"
                      style={{ color: "#fff" }}
                      onClick={toggleUserSettingsPopup}
                    >
                      {/* <img src={userLogo || userIcon} /> */}
                      {getSharedWithUser(userLogo)}
                    </i>
                    {isUserSettingOpen && renderUserSettingsPopup()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
};

export default AdminHeader;
