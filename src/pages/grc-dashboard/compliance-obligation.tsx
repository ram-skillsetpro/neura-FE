import CalendarBlank from "assets/images_compliance/CalendarBlank.svg";
import FileImage from "assets/images_compliance/FileImage.svg";
import Warning from "assets/images_compliance/Warning.svg";
import Wrench from "assets/images_compliance/Wrench.svg";
import payimg from "assets/images_compliance/pay-img.jpg";
import { useAppDispatch, useAppSelector } from "core/hook";
import { convertUtcToIstDate, truncateString } from "core/utils";
import DeadLineExtenstionModal from "pages/grc-dashboard/deadline-extension-modal";
import { OBLIGATION_STATUS, ObligationType } from "pages/grc-dashboard/grc-dashboard.model";
import {
  changeDeadlineObligation,
  dataFetching,
  getObligationEvidence,
  getObligations,
  grcDashboardReducer,
  markAsResolvedObligation,
} from "pages/grc-dashboard/grc-dashboard.redux";
import ObligationModal from "pages/grc-dashboard/obligation-modal";
import ResolveObligationModal from "pages/grc-dashboard/resolve-obligaton-modal";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_DASHBOARD } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import { fetchOriginalFile, handleFileToOpen, setPreviewFile } from "../contract/contract.redux";

const ComplianceObligation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const escalatedContract = useAppSelector((state) => state.grcDashboard.obligations);
  const isLoading = useAppSelector((state) => state.grcDashboard.isLoading);
  const [isOpenObligation, setIsOpenObligation] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState<ObligationType>();
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [searchInput, setSearchInput] = useState<string>("");
  const [filteredObligations, setFilteredObligations] = useState<ObligationType[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "Comments" | "Notes">("All");
  const [isResolveObligation, setResolveObligation] = useState(false);
  const [isDeadLineObligation, setDeadLineObligation] = useState(false);
  const escalationState = location.state || {};
  console.log("Escalations details", escalationState);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [selectedEvidence, setSelectedEvidence] = useState<any>();
  const [isNew, setIsNew] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    if (escalationState?.escalation?.contractId) {
      dispatch(
        getObligations({
          contractId: escalationState?.escalation?.contractId,
          obligationId: escalationState?.obligation?.mappingId,
        }),
      );
    }
    return () => {};
  }, [escalationState]);

  useEffect(() => {
    if (escalatedContract?.obligations && escalatedContract?.obligations?.length > 0) {
      setSelectedObligation(escalatedContract?.obligations[0]);
      setFilteredObligations(escalatedContract?.obligations);
      setSelectedIndex(0);
    }
  }, [escalatedContract]);

  useEffect(() => {
    dispatch(setPreviewFile(""));
    if (selectedEvidence?.trackingId) {
      (async () => {
        await dispatch(getObligationEvidence({ trackingId: selectedEvidence.trackingId }));
        dispatch(
          handleFileToOpen({
            id: selectedEvidence.trackingId,
            fileName: selectedEvidence.evidence,
            trackingId: selectedEvidence.trackingId,
            teamId: 0,
            mimeType: selectedEvidence.mimeType,
          }),
        );
      })();
    }
    return () => {
      setSelectedEvidence(undefined);
      // dispatch(handleFileToOpen(null));
    };
  }, [selectedEvidence?.trackingId]);

  const handleOnSearchObligation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value.trimStart());
    const filteredObligations = escalatedContract?.obligations?.filter((obligation) =>
      obligation.name.toLowerCase().includes(e.target.value.trimStart().toLowerCase()),
    );
    setSelectedIndex(0);
    setSelectedObligation(filteredObligations[0]);
    setFilteredObligations(filteredObligations);
  };

  const handleExtendedDeadline = async (data: any) => {
    const payload = {
      ...data,
      mappingId: selectedObligation?.mappingId,
      contractId: escalationState?.escalation?.contractId,
    };
    const response = await dispatch(changeDeadlineObligation(payload));
    if (response) {
      setDeadLineObligation(false);
      dispatch(
        getObligations({
          contractId: escalationState?.escalation?.contractId,
          obligationId: escalationState?.obligation?.mappingId,
        }),
      );
    }
  };
  const handleResolve = async (data: any) => {
    const payload = {
      ...data,
      mappingId: selectedObligation?.mappingId,
      contractId: escalationState?.escalation?.contractId,
    };
    const response = await dispatch(markAsResolvedObligation(payload));
    if (response) {
      setResolveObligation(false);
      dispatch(
        getObligations({
          contractId: escalationState?.escalation?.contractId,
          obligationId: escalationState?.obligation?.mappingId,
        }),
      );
    }
  };

  const viewObligationEvidence = (data: any) => {
    setSelectedEvidence(data);
  };

  const handleAddObligation = (type: string) => {
    setIsOpenObligation(true);
    if (type === "edit") {
      setIsNew(false);
    } else {
      setIsNew(true);
    }
  };

  const handleContractView = async () => {
    dispatch(dataFetching(true));
    await dispatch(
      fetchOriginalFile({
        fileId: Number(escalationState?.escalation?.contractId),
        teamId: Number(escalationState?.escalation?.contractTeamId),
        folderId: Number(escalationState?.escalation?.contractFolderId),
        previewFileFlag: true,
      }),
    );
    dispatch(
      handleFileToOpen({
        id: Number(escalationState?.escalation?.contractId),
        fileName: escalationState?.escalation?.contractName,
        trackingId: 1,
        teamId: Number(escalationState?.escalation?.contractTeamId),
        folderId: Number(escalationState?.escalation?.contractFolderId),
        mimeType: "application/pdf",
      }),
    );
    dispatch(dataFetching(false));
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="left-section" style={{ padding: "0" }}>
        <div className="compliance-section-inner">
          <div className="flex justify-between items-center mb-8 left-inner-sticky">
            <div>
              <h2 className="flex items-center">
                <button
                  className="pageBack-btn mr-3"
                  onClick={() =>
                    navigate(`/${ROUTE_ADMIN}/${ROUTE_DASHBOARD}`, {
                      state: escalationState?.escalation,
                    })
                  }
                >
                  <i className="icon-img"></i>
                </button>
                Obligation
              </h2>
              <div className="relative mt-2 mb-2">
                <div
                  className="fs14 font-bold obligation-name lh1 rounded-6"
                  data-fulltext={escalationState?.escalation?.contractName}
                  role="tooltip"
                  aria-label={escalationState?.escalation?.contractName}
                >
                  {truncateString(escalationState?.escalation?.contractName, 30, 15)}
                </div>
              </div>
            </div>
          </div>

          <section className="relative obligation-inner-sec mb-6">
            {/* <div className="mb-6 flex">
                <button
                  className="clear-btn flex font-bold"
                  onClick={() => {
                    handleAddObligation("add");
                  }}
                >
                  <i className="plush-ic"></i>Add Obligation
                </button>
              </div> */}

            <div className="obligation-left card-bg h-screen overflow-hidden">
              {filteredObligations?.length > 1 && (
                <div className="mb-3">
                  <form>
                    <input
                      tabIndex={1}
                      type="search"
                      value={searchInput}
                      placeholder="Search Obligations"
                      onChange={handleOnSearchObligation}
                    />
                  </form>
                </div>
              )}
              <div className="obligation-scroll">
                {searchInput.length > 0
                  ? filteredObligations?.map((obligation, index) => (
                      <div
                        className={`obligation-raised-box cursor-pointer fs14 ${selectedIndex === index ? "active" : "inactive"}`}
                        key={index}
                        onClick={() => {
                          setSelectedIndex(index);
                          setSelectedObligation(obligation);
                        }}
                      >
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            <i className="ob-issue-ic flex mr-3">
                              <img src={Wrench} alt="Wrench" />
                            </i>
                            {obligation.identifier}
                          </div>
                          <span className="grow"></span>
                          <div>
                            <div
                              className={`ob-btn-size ${obligation.isActive === OBLIGATION_STATUS.ACTIVE ? "ob-active" : obligation.isActive === OBLIGATION_STATUS.RESOLVED ? "ob-resolved" : obligation.isActive === OBLIGATION_STATUS.INCOMPLETE ? "ob-Inactive" : "ob-Inactive"}`}
                            >
                              {obligation.isActive === OBLIGATION_STATUS.ACTIVE
                                ? "Active"
                                : obligation.isActive === OBLIGATION_STATUS.RESOLVED
                                  ? "Resolved"
                                  : obligation.isActive === OBLIGATION_STATUS.INCOMPLETE
                                    ? "Incomplete"
                                    : "Inactive"}
                            </div>
                          </div>
                        </div>
                        <div className="obligation-short-info">
                          <p>{obligation?.description}</p>
                        </div>
                        <div className="flex items-center">
                          <div className="ob-name-btn">{obligation.name}</div>
                          <span className="grow"></span>
                          <div>
                            <i className="ob-issue-ic flex">
                              <img src={Warning} alt="Warning" />
                            </i>
                          </div>
                        </div>
                      </div>
                    ))
                  : escalatedContract.obligations.map((obligation, index) => (
                      <div
                        className={`obligation-raised-box cursor-pointer fs14 ${selectedObligation?.name === obligation.name ? "active" : "ianctive"}`}
                        key={index}
                        onClick={() => {
                          setSelectedIndex(index);
                          setSelectedObligation(obligation);
                        }}
                      >
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            <i className="ob-issue-ic flex mr-3">
                              <img src={Wrench} alt="Wrench" />
                            </i>
                            {obligation.identifier}
                          </div>
                          <span className="grow"></span>
                          <div>
                            <div
                              className={`ob-btn-size ${obligation.isActive === OBLIGATION_STATUS.ACTIVE ? "ob-active" : obligation.isActive === OBLIGATION_STATUS.RESOLVED ? "ob-resolved" : obligation.isActive === OBLIGATION_STATUS.INCOMPLETE ? "ob-Inactive" : "ob-Inactive"}`}
                            >
                              {obligation.isActive === OBLIGATION_STATUS.ACTIVE
                                ? "Active"
                                : obligation.isActive === OBLIGATION_STATUS.RESOLVED
                                  ? "Resolved"
                                  : obligation.isActive === OBLIGATION_STATUS.INCOMPLETE
                                    ? "Incomplete"
                                    : "Inactive"}
                            </div>
                          </div>
                        </div>
                        <div className="obligation-short-info">
                          <p>{obligation?.description}</p>
                        </div>
                        <div className="flex items-center">
                          <div className="ob-name-btn">{obligation.name}</div>
                          <span className="grow"></span>
                          <div>
                            <i className="ob-issue-ic flex">
                              <img src={Warning} alt="Warning" />
                            </i>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Other obligation cards */}
            {searchInput.length > 0 && filteredObligations.length === 0 ? (
              <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3 pb-1">
                No Obligations found!
              </h4>
            ) : (
              <div className="obligation-right">
                <div className="obligation-info-card mb-6">
                  <div className="card-t flex items-center">
                    {selectedObligation?.name}
                    <div className="alert-btn-size moderate-bg ml-3">
                      {selectedObligation?.type.split(" ")[0]}
                    </div>
                    <span className="grow"></span>
                    <div>
                      <div className="flex items-star">
                        <button
                          className="icon-btn px-3 fs14 font-semibold text-body mr-3"
                          onClick={() => {
                            handleAddObligation("edit");
                          }}
                        >
                          <i className="note-pencil-ic mr-2"></i> Edit
                        </button>
                        <div className="obligation-menu-modal relative flex-inline">
                          <button
                            className="icon-btn px-3 fs14 font-semibold text-body"
                            onClick={toggleMenu}
                            disabled={["2", "3"].includes(selectedObligation?.isActive ?? "")}
                            aria-disabled={["2", "3"].includes(selectedObligation?.isActive ?? "")}
                          >
                            Open <i className="drop-pencil-ic ml-2"></i>
                          </button>
                          {isMenuOpen && (
                            <div
                              className="obligation-menu-card rounded-6 font-normal"
                              style={{ cursor: "pointer" }}
                              ref={menuRef}
                            >
                              <ul>
                                <li
                                  onClick={() => {
                                    setResolveObligation(true);
                                    closeMenu();
                                  }}
                                >
                                  <div className="truncate-line1">Mark as resolved</div>
                                </li>
                                <li
                                  onClick={() => {
                                    setDeadLineObligation(true);
                                    closeMenu();
                                  }}
                                >
                                  <div className="truncate-line1">
                                    Request for deadline extension
                                  </div>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-middle">
                    <div className="obligation-status-sec">
                      <div className="obligation-status-card">
                        <div className="flex items-center">
                          <div className="obligation-status-ic mr-3">
                            <img src={CalendarBlank} />
                          </div>
                          <div className="fs14">
                            <div className="text-light-color1 mb-1">Tracking Frequency</div>
                            <div className="text-body font-semibold">
                              {selectedObligation?.trackingFrequency}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="obligation-status-card">
                        <div className="flex items-center">
                          <div className="obligation-status-ic mr-3">
                            <img src={CalendarBlank} />
                          </div>
                          <div className="fs14">
                            <div className="text-light-color1 mb-1">Deadline</div>
                            <div className="text-body font-semibold">
                              {selectedObligation?.deadlineDate === "0"
                                ? "N/A"
                                : selectedObligation?.deadlineDate}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="obligation-status-card">
                        <div className="flex items-center">
                          <div className="obligation-status-ic mr-3">
                            <img src={FileImage} />
                          </div>
                          <div className="fs14">
                            <div className="text-light-color1 ">Evidence Uploaded</div>
                            <div className="text-body font-semibold">
                              <button className="clear-btn font-semibold">View</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="obligation-group-card">
                    <div className="obligation-group-left">
                      {/* <!--Detail card--> */}
                      <div className="obligation-info-card mb-6">
                        <div className="card-t flex items-center">Detail</div>
                        <div className="card-middle">
                          <div className="ob-card-type-sec">
                            {/* <!--Card 1 start here--> */}
                            <div className="ob-detail-card">
                              {/* <div className="detail-card-row">
                                <div className="text-light-color1 col-heading">Priority</div>
                                <div className="text-body col-status">
                                  <div className="flex items-center justify-end font-semibold">
                                    <i className="periorty-icon mr-2">
                                      <img
                                        src={
                                          selectedObligation?.details.priority === "Highest"
                                            ? Highest
                                            : selectedObligation?.details.priority === "High"
                                              ? High
                                              : selectedObligation?.details.priority === "Medium"
                                                ? Medium
                                                : selectedObligation?.details.priority === "Low"
                                                  ? Low
                                                  : selectedObligation?.details.priority ===
                                                    "Lowest"
                                                    ? Lowest
                                                    : selectedObligation?.details.priority ===
                                                      "Moderate"
                                                      ? Medium
                                                      : Low
                                        }
                                      />
                                    </i>
                                    {selectedObligation?.details.priority}
                                  </div>
                                </div>
                              </div> */}
                              <div className="detail-card-row">
                                <div className="text-light-color1 col-heading">Impact</div>
                                <div className="text-body col-status">
                                  <div className="flex items-center justify-end justify-end">
                                    <div
                                      className={`alert-btn-size ${selectedObligation?.details.impact === "High" ? "high-bg" : selectedObligation?.details.impact === "Moderate" ? "moderate-bg" : selectedObligation?.details.impact === "Low" ? "low-bg" : selectedObligation?.details.impact === "Medium" ? "medium-bg" : ""}`}
                                    >
                                      {selectedObligation?.details.impact}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="detail-card-row">
                                <div className="text-light-color1 col-heading">Likelihood</div>
                                <div className="text-body col-status">
                                  <div className="flex items-center justify-end">
                                    <div
                                      className={`alert-btn-size ${selectedObligation?.details.likelihood === "High" ? "lighter-high-bg" : selectedObligation?.details.likelihood === "Moderate" ? "lighter-moderate-bg" : selectedObligation?.details.likelihood === "Low" ? "lighter-low-bg" : selectedObligation?.details.likelihood === "Medium" ? "lighter-medium-bg" : ""}`}
                                    >
                                      {selectedObligation?.details.likelihood}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* <!--card 2 start here--> */}
                            <div className="ob-detail-card">
                              <div className="detail-card-row">
                                <div className="text-light-color1 col-heading">
                                  Risk Obligation Type
                                </div>
                                <div className="text-body col-status">
                                  <div className="flex items-center justify-end font-semibold">
                                    {selectedObligation?.details.type}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <!--Description card--> */}
                      <div className="obligation-info-card mb-6">
                        <div className="card-t flex items-center">Description</div>
                        <div className="card-middle">
                          <div className="w-full obligation-description">
                            <p>{selectedObligation?.description}</p>
                          </div>
                        </div>
                      </div>
                      {/* Comment card */}
                      <div className="obligation-info-card mb-6">
                        <div className="card-t flex items-center">
                          <ul className="ob-acc">
                            <li
                              className={activeTab === "All" ? "active" : ""}
                              onClick={() => setActiveTab("All")}
                            >
                              All
                            </li>
                            <li
                              className={activeTab === "Comments" ? "active" : ""}
                              onClick={() => setActiveTab("Comments")}
                            >
                              Comments
                            </li>
                            <li
                              className={activeTab === "Notes" ? "active" : ""}
                              onClick={() => setActiveTab("Notes")}
                            >
                              Notes
                            </li>
                          </ul>
                        </div>
                        <div className="card-middle">
                          {activeTab === "Comments" && (
                            <div className="w-full" id="comment">
                              <div className="text-light-color1 fs14 mb-6 mt-3">
                                There are no comments yet on this obligation.
                              </div>
                              <div>
                                <button className="clear-btn flex font-bold">
                                  <i className="plush-ic"></i>Add Comment
                                </button>
                              </div>
                            </div>
                          )}
                          {/* All tab */}
                          {activeTab === "All" && (
                            <div className="w-full" id="All">
                              {selectedObligation && selectedObligation?.audits.length > 0 ? (
                                selectedObligation?.audits.map((item) => (
                                  <div
                                    className="commnet-inner-card mb-2"
                                    key={convertUtcToIstDate(item.createdOn)}
                                  >
                                    <div className="commnet-inner-row fs12">
                                      <div className="mr-3">
                                        <div className="flex items-center font-semibold text-color-primary">
                                          <i className="pay-img mr-3">
                                            <img src={payimg} />
                                          </i>
                                          {item.createdBy}
                                        </div>
                                      </div>
                                      <div className="text-light-color1 fs14">
                                        {convertUtcToIstDate(item.createdOn)}
                                      </div>
                                    </div>
                                    <div className="commnet-inner-row justify-between fs12">
                                      <div className="text-light-color1 font-semibold">Status</div>
                                      <div className="text-light-color1 flex">
                                        <div>
                                          <span className="text-body font-semibold">
                                            {item.status}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {item.isEvidence === 1 ? (
                                      <div className="commnet-inner-row justify-between fs12">
                                        <div className="text-light-color1 font-semibold">
                                          Evidence
                                        </div>
                                        <div className="text-light-color1 flex">
                                          <div>
                                            <span
                                              className="text-body font-semibold cursor-pointer"
                                              onClick={() => viewObligationEvidence(item)}
                                            >
                                              {item.attachment}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : null}
                                    {item.isEvidence === 0 && (
                                      <>
                                        <div className="commnet-inner-row justify-between fs12">
                                          <div className="text-light-color1 font-semibold">
                                            Action
                                          </div>
                                          <div className="text-light-color1 flex">
                                            <div>
                                              <span className="text-body font-semibold">
                                                {item.action}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="commnet-inner-row justify-between fs12">
                                          <div className="text-light-color1 font-semibold">
                                            Acted By
                                          </div>
                                          <div className="text-light-color1 flex">
                                            <div>
                                              <span className="text-body font-semibold">
                                                {item.actedBy}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-light-color1 fs14 mb-6 mt-3">
                                  No Audits Log found
                                </div>
                              )}
                            </div>
                          )}
                          {activeTab === "Notes" && (
                            <div className="w-full" id="notes">
                              <div className="text-light-color1 fs14 mb-6 mt-3">Notes content</div>
                              <div>
                                <button className="clear-btn flex font-bold">
                                  <i className="plush-ic"></i>Add Notes
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Attachments card */}
                      <div className="obligation-info-card mb-6">
                        <div className="card-t flex items-center">Attachments</div>
                        <div className="card-middle">
                          <div className="w-full">
                            {selectedObligation && selectedObligation?.attachments.length > 0 ? (
                              selectedObligation?.attachments.map((item) => (
                                <div className="commnet-inner-card mb-2" key={item.createdOn}>
                                  <div className="commnet-inner-row fs12">
                                    <div className="mr-3">
                                      <div className="flex items-center font-semibold text-color-primary">
                                        <i className="pay-img mr-3">
                                          <img src={payimg} />
                                        </i>
                                        {item.createdBy}
                                      </div>
                                    </div>
                                    <div className="text-light-color1 fs14">{item.createdOn}</div>
                                  </div>
                                  <div className="commnet-inner-row justify-between fs12">
                                    <div className="text-light-color1 font-semibold">Status</div>
                                    <div className="text-light-color1 flex">
                                      <div>
                                        <span className="text-body font-semibold">
                                          {item.status}
                                        </span>
                                        {/* Done [ 1000 ] */}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="commnet-inner-row justify-between fs12">
                                    <div className="text-light-color1 font-semibold">Evidence</div>
                                    <div className="text-light-color1 flex">
                                      <div>
                                        <span
                                          className="text-body font-semibold cursor-pointer"
                                          onClick={() => viewObligationEvidence(item)}
                                        >
                                          {item.attachment}
                                        </span>
                                        {/* [ 12 ] */}
                                      </div>
                                    </div>
                                  </div>{" "}
                                </div>
                              ))
                            ) : (
                              <div className="text-light-color1 fs14 mb-6 mt-3">
                                No Attachments found
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="obligation-group-right">
                      <div style={{ position: "sticky", top: "58px" }}>
                        <div className="obligation-info-card mb-6">
                          <div className="card-t flex items-center">People</div>
                          <div className="card-middle">
                            <div className="w-full">
                              <div className="flex justify-between people-info-deail">
                                <div className=" text-light-color1">Created By</div>
                                <div>
                                  <div className="flex items-center font-semibold">
                                    <i className="pay-img mr-3">
                                      <img src={payimg} />
                                    </i>
                                    {selectedObligation?.people.createdBy}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between people-info-deail">
                                <div className=" text-light-color1">SPOC</div>
                                <div>
                                  <div className="flex items-center font-semibold">
                                    <i className="pay-img mr-3">
                                      <img src={payimg} />
                                    </i>
                                    {selectedObligation?.ownerName}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between people-info-deail">
                                <div className=" text-light-color1">Department</div>
                                <div>
                                  <div className="flex items-center font-semibold">
                                    {selectedObligation?.details.department}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="obligation-info-card mb-6">
                          <div className="card-t flex items-center">Contract Details</div>
                          <div className="card-middle">
                            <div className="w-full">
                              <div className="people-info-deail">
                                <div
                                  className="truncate-line1 w-full cursor-pointer"
                                  style={{ color: "#488FCE" }}
                                  onClick={async () => {
                                    handleContractView();
                                  }}
                                >
                                  {escalationState?.escalation?.contractName}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="obligation-info-card mb-6">
                          <div className="card-t flex items-center">Dates</div>
                          <div className="card-middle">
                            <div className="w-full">
                              <div className="flex justify-between people-info-deail">
                                <div className=" text-light-color1">Created On</div>
                                <div>
                                  <div className="flex items-center font-semibold">
                                    {selectedObligation?.dates.createdOn}
                                    {/* {formatDateWithOrdinal(
                                  new Date(selectedObligation?.dates.createdOn * 1000),
                                )} */}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between people-info-deail">
                                <div className=" text-light-color1">Updated On</div>
                                <div>
                                  <div className="flex items-center font-semibold">
                                    {selectedObligation?.dates.updatedOn}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="obligation-info-card mb-6">
                          <div className="card-t flex items-center">Tags</div>
                          <div className="card-middle">
                            <div className="w-full">
                              <div className="obligation-tag-sec">
                                {selectedObligation?.tags.map((tag) => (
                                  <div className="tag-chips-box" key={tag}>
                                    {tag}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      {isOpenObligation && (
        <ObligationModal
          isOpen={isOpenObligation}
          onClose={() => setIsOpenObligation(false)}
          obligationByID={isNew === true ? undefined : selectedObligation}
          contractID={escalationState?.escalation?.contractId}
          obligationId={escalationState?.escalation?.mappingId}
          isEdit={!isNew}
        />
      )}
      {isResolveObligation && (
        <ResolveObligationModal
          isOpen={isResolveObligation}
          onClose={() => setResolveObligation(false)}
          obligation={selectedObligation}
          onSuccess={handleResolve}
        />
      )}
      {isDeadLineObligation && (
        <DeadLineExtenstionModal
          isOpen={isDeadLineObligation}
          onClose={() => setDeadLineObligation(false)}
          obligation={selectedObligation}
          onSuccess={handleExtendedDeadline}
        />
      )}
    </>
  );
};

export default ComplianceObligation;

export const reducer = {
  grcDashboard: grcDashboardReducer,
};
