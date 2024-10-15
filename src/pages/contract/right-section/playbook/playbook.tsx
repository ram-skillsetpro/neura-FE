import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_CREATE_PLAYBOOK, USER_AUTHORITY } from "src/const";
import { ButtonLoader } from "src/core/components/loader/button-loader";
import { LoaderSection } from "src/core/components/loader/loaderSection.comp";
import RightChevron from "src/core/components/svg/right-chevron";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import { playbookReducer } from "src/pages/playbook/playbook.redux";
import {
  clearPlaybookReviewData,
  fetchPlaybook,
  fetchPlaybookListContractView,
  runPlaybook,
} from "../../contract.redux";
import "./playbook.scss";
import ViewContractPlaybook from "./view-contract-playbook";

interface PlaybookTypes {
  fileId: number;
  teamId?: number;
  folderId?: number;
}

const Playbook: React.FC<PlaybookTypes> = ({ fileId, folderId, teamId }) => {
  /* Hooks */
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [viewPlaybook, setViewPlaybook] = useState(false);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<number | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  /* Redux State */
  const {
    playbookList,
    playbookList_missing,
    playbookList_gap,
    playbookList_ok,
    playbookResult,
    globalPlaybookResult,
    isLoading,
    globalPBReviewResponse,
    PBFilesReviewResponse,
  } = useAppSelector((state) => state.contract);

  const [activeItem, setActiveItem] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPlaybookReview, setShowPlaybookReview] = useState<boolean>(false);
  const isPlaybookCreator = useAuthorityCheck([USER_AUTHORITY.PB_CREATE]);
  const [myPlaybookPage, setMyPlaybookPage] = useState(1);
  const [globalPlaybookPage, setGlobalPlaybookPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [globalTotalPages, setGlobalTotalPages] = useState(1);

  /* Functions */
  const renderPlaybook = (data: any, index: number) => {
    const { status, question, review } = data || {};
    if (status === "OK") {
      return (
        <motion.div
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.01 * index, duration: 1 }}
          key={index}
          className="bg-light p-3 rounded-6 mb-2 text-defaul-color"
        >
          <div className="fs11 font-bold mb-1">
            <span className="dot-g mr-2-5 inline-block"></span>
            {question}
          </div>
          <div className="body-text">
            <p>{review}</p>
          </div>
        </motion.div>
      );
    }

    if (status === "MISSING") {
      return (
        <motion.div
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.01 * index, duration: 1 }}
          className="p-3 bg-dark rounded-6 mb-2  text-defaul-color"
          key={index}
        >
          <div className="fs11 font-bold mb-1">
            <span className="button-red rounded-12 sm-chips uppercase inline-block mr-2-5 font-normal">
              Missing
            </span>
            {question}
          </div>
          <div className="body-text">
            <p>{review}</p>
          </div>
        </motion.div>
      );
    }

    if (status === "GAP") {
      return (
        <motion.div
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.01 * index, duration: 1 }}
          className="p-3 bg-dark rounded-6 mb-2  text-defaul-color"
          key={index}
        >
          <div className="fs11 font-bold mb-1">
            <span className="button-orange rounded-12 sm-chips uppercase inline-block mr-2-5 font-normal">
              Deviation
            </span>
            {question}
          </div>
          <div className="body-text">
            <p>{review}</p>
          </div>
        </motion.div>
      );
    }
  };

  const fetchPlabookList = async (playbookId: number, reviewId: number) => {
    setShowPlaybookReview(true);
    setLoading(true);
    await dispatch(fetchPlaybook({ fileId, playbookId, reviewId }));
    setLoading(false);
  };

  /* Effects */
  // useEffect(() => {
  //   fileId && fetchPlabookList();
  // }, [fileId]);

  useEffect(() => {
    return () => {
      dispatch(clearPlaybookReviewData());
    };
  }, []);

  const playbookResultRef = useRef(playbookResult);
  const globalPlaybookResultRef = useRef(globalPlaybookResult);

  useEffect(() => {
    playbookResultRef.current = playbookResult;
    globalPlaybookResultRef.current = globalPlaybookResult;
  }, [playbookResult, globalPlaybookResult]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchPlaybookListContractView(fileId, 0, myPlaybookPage));
        // await dispatch(fetchPlaybookListContractView(fileId, 1, globalPlaybookPage));
      } catch (error) {
        console.error("Error fetching playbook data:", error);
      }
    };

    fetchData();

    const checkProcessStatus = () => {
      const checkPbProcessStatus = playbookResultRef.current.filter(
        (item) => item.processStatus === 1 || item.processStatus === 2,
      );
      const checkPbProcessStatusGlobalPB = globalPlaybookResultRef.current.filter(
        (item) => item.processStatus === 1 || item.processStatus === 2,
      );
      if (checkPbProcessStatus.length > 0 || checkPbProcessStatusGlobalPB.length > 0) {
        fetchData();
      }
    };

    const intervalId = setInterval(checkProcessStatus, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fileId, , myPlaybookPage, globalPlaybookPage, dispatch]);

  const fetchData = async () => {
    try {
      setMyTotalPages(Math.ceil(PBFilesReviewResponse.totct / PBFilesReviewResponse.perpg));
      setGlobalTotalPages(Math.ceil(globalPBReviewResponse.totct / globalPBReviewResponse.perpg));
    } catch (error) {
      console.error("Error fetching playbook data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fileId, PBFilesReviewResponse, globalPBReviewResponse, dispatch]);

  const [activeTab, setActiveTab] = useState("My Playbook");
  const [activeReviewTab, setActiveReviewTab] = useState("All");

  // const handleTabClick = (tab: React.SetStateAction<string>) => {
  //   setActiveTab(tab);
  // };
  const handleTabReviewClick = (tab: React.SetStateAction<string>) => {
    setActiveReviewTab(tab);
    setActiveItem(-1);
  };
  const runPb = async (playbookId: number) => {
    await dispatch(runPlaybook(fileId, playbookId));
    await dispatch(fetchPlaybookListContractView(fileId, 0, myPlaybookPage));
    // await dispatch(fetchPlaybookListContractView(fileId, 1, globalPlaybookPage));
  };

  const renderPlaybookInfo = (playbook: any) => {
    const { processStatus, isReRun } = playbook || {};
    let buttonText = "Run";
    if (processStatus === 3) {
      buttonText = "Review";
    }

    return (
      <div className="playbook-info-item" key={playbook.id}>
        <div className="flex items-center w-full">
          <div className="fs12 relative">
            <div
              className="playbook-show-name"
              data-fulltext={playbook.playbookName}
              onClick={() => {
                setSelectedPlaybookId(playbook.id);
                setSelectedReviewId(playbook.reviewId);
                setViewPlaybook(true);
              }}
            >
              {playbook.playbookName}
            </div>
          </div>
          <span className="grow"></span>
          <div style={{ display: "flex", alignItems: "center" }}>
            {processStatus === 1 || processStatus === 2 ? (
              <ButtonLoader style={{ marginRight: "10px" }} />
            ) : (
              <button
                className={`${
                  processStatus === 3 ? "button-green" : "button-dark-gray"
                } rounded-12 sm-button tracking-wider font-bold uppercase lh-0 mr-3`}
                onClick={() => {
                  if (processStatus === 3) {
                    fetchPlabookList(playbook.id, playbook.reviewId);
                  } else {
                    runPb(playbook.id);
                  }
                }}
              >
                {buttonText}
              </button>
            )}
            {/* <button
              className="button-red rounded-12 sm-button tracking-wider font-bold uppercase lh-0"
              onClick={() => {
                setSelectedPlaybookId(playbook.id);
                setSelectedReviewId(playbook.reviewId)
                setViewPlaybook(true);
              }}
            >
              Playbook View
            </button> */}
            {isReRun === 1 && (
              <button
                className="button-red rounded-12 sm-button tracking-wider font-bold uppercase lh-0"
                style={{ marginLeft: "5px" }}
                onClick={() => runPb(playbook.id)}
              >
                Re Run
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const currentPlaybookResult = activeTab === "My Playbook" ? playbookResult : globalPlaybookResult;

  const getFilteredPlaybookList = () => {
    switch (activeReviewTab) {
      case "OK":
        return playbookList_ok;
      case "MISSING":
        return playbookList_missing;
      case "GAP":
        return playbookList_gap;
      default:
        return playbookList;
    }
  };

  const filteredPlaybookList = getFilteredPlaybookList();

  const renderPaginationControls = (type: "My Playbook" | "Global Playbook") => {
    const currentPage = type === "My Playbook" ? myPlaybookPage : globalPlaybookPage;
    const setPage = type === "My Playbook" ? setMyPlaybookPage : setGlobalPlaybookPage;
    const isValidNumber = (value: number) => !isNaN(value) && value >= 0;
    const totalPages = isValidNumber(type === "My Playbook" ? myTotalPages : globalTotalPages)
      ? type === "My Playbook"
        ? myTotalPages
        : globalTotalPages
      : 1; // Fallback to default value if invalid

    return (
      <div className="flex justify-between items-center w-full mt-3">
        <button
          className="mr-3 next-contract-btn relative"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="pre-btn"></i> Previous
        </button>

        <div className="mr-4 fs12">
          Page{" "}
          <strong>
            {currentPage} of {totalPages}
          </strong>
        </div>

        <button
          className="next-contract-btn relative"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next <i className="next-btn"></i>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="right-tab-content tab-playbook" style={{ paddingBottom: "12px" }}>
        <div>
          {/* <ul className="app-tab-style">
            <li className={activeTab === "My Playbook" ? "active" : ""}>
              <a onClick={() => handleTabClick("My Playbook")}>My Playbook</a>
            </li>
            {globalPlaybookResult.length > 0 && (
              <li className={activeTab === "Global Playbook" ? "active" : ""}>
                <a onClick={() => handleTabClick("Global Playbook")}>Global Playbook</a>
              </li>
            )}
          </ul> */}

          <div className="playbook-info-card pt-3 pb-3">
            {currentPlaybookResult.length > 0 ? (
              currentPlaybookResult.map((playbook, index) => renderPlaybookInfo(playbook))
            ) : isLoading ? (
              "Loading ..."
            ) : isPlaybookCreator ? (
              <div className="text-center">
                <button
                  onClick={() => {
                    navigate(`/${ROUTE_ADMIN}/${ROUTE_CREATE_PLAYBOOK}`);
                  }}
                  className="button-green rounded-12 sm-button tracking-wider font-bold uppercase lh-0 mr-3"
                >
                  Create Playbook
                </button>
              </div>
            ) : (
              <div className="text-center">
                No playbooks available, please connect your account admin.
              </div>
            )}

            {currentPlaybookResult.length > 0 &&
              PBFilesReviewResponse?.totct > 10 &&
              activeTab === "My Playbook" && <>{renderPaginationControls("My Playbook")}</>}
            {activeTab === "Global Playbook" && <>{renderPaginationControls("Global Playbook")}</>}
          </div>
          {showPlaybookReview && (
            <>
              {playbookList.length > 0 && (
                <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 mt-3">
                  Playbook Review Details
                </h4>
              )}
              <ul className="app-tab-style" style={{ marginTop: "10px" }}>
                {playbookList.length > 0 && (
                  <li className={activeReviewTab === "All" ? "active" : ""}>
                    <a onClick={() => handleTabReviewClick("All")}>All</a>
                  </li>
                )}
                {playbookList_ok.length > 0 && (
                  <li className={activeReviewTab === "OK" ? "active" : ""}>
                    <a onClick={() => handleTabReviewClick("OK")}>OK</a>
                  </li>
                )}
                {playbookList_missing.length > 0 && (
                  <li className={activeReviewTab === "MISSING" ? "active" : ""}>
                    <a onClick={() => handleTabReviewClick("MISSING")}>MISSING</a>
                  </li>
                )}
                {playbookList_gap.length > 0 && (
                  <li className={activeReviewTab === "GAP" ? "active" : ""}>
                    <a onClick={() => handleTabReviewClick("GAP")}>GAP</a>
                  </li>
                )}
              </ul>
            </>
          )}

          {showPlaybookReview ? (
            Array.from(playbookList || []).length ? (
              filteredPlaybookList.map((data, index) => (
                <div
                  className="right-tab-content-inner item-container"
                  key={index}
                  onClick={() => setActiveItem(index)}
                >
                  <div className="flex fs12 text-defaul-color mt-8 mb-4 app-breadcrumbs  playbook-item ">
                    <div
                      className={`item-nav ${
                        index === activeItem || (activeItem === -1 && index === 0)
                          ? "item-nav-active"
                          : ""
                      }`}
                    >
                      <RightChevron />
                    </div>
                    <span className="font-bold playbook-title">{data.key}</span>
                  </div>
                  <div
                    className={`playbook-subitem ${
                      index === activeItem || (activeItem === -1 && index === 0) ? "active" : ""
                    }`}
                  >
                    <AnimatePresence mode="sync">
                      {index === activeItem || (activeItem === -1 && index === 0)
                        ? Array.from(data.value || []).map((obj, index) =>
                            renderPlaybook(obj, index),
                          )
                        : ""}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            ) : loading && !Array.from(playbookList || []).length ? (
              <LoaderSection />
            ) : (
              <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                Review Not Available
              </h4>
            )
          ) : null}
        </div>
      </div>
      {viewPlaybook && selectedPlaybookId !== null && (
        <ViewContractPlaybook
          isOpen={viewPlaybook}
          onClose={() => setViewPlaybook(false)}
          shouldCloseOnOverlayClick={true}
          playbookId={selectedPlaybookId}
          reviewId={selectedReviewId}
          isUniversal={activeTab === "My Playbook" ? 0 : 1}
        />
      )}
    </>
  );
};

export default Playbook;
export const reducer = {
  playbook: playbookReducer,
};
