import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { USER_AUTHORITY } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { decodeFileKey, getAuth } from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import {
  clearSideBarContent,
  computeObligation,
  getFileMeta,
  raiseAlertOnSummary,
  readSideBarContent,
} from "../contract.redux";
import SummaryItem from "./contract-summary/summary-item";
import ShareFile from "./share-file";

interface Item {
  key: string;
  value: string | ItemValue[];
}

interface ItemValue {
  key: string;
  value: string;
}

const RightSidebar: React.FC = () => {
  /* Hooks */
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  /* Constants */
  const key = searchParams.get("key");
  const { fileId, folderId, teamId } = decodeFileKey(key || "");
  const { profileId } = getAuth();

  /* Refs */
  const runButtonRef = useRef<HTMLButtonElement | null>(null);

  /* Redux State */
  const {
    summary: { raisedAlertflag, createdBy: fileOwnerId },
    sideBarData,
    sideBarSummary,
    fileMeta,
  } = useAppSelector((state) => state.contract);

  const { createdBy = 0 } = fileMeta || {};

  const grcAuthority = useAuthorityCheck([USER_AUTHORITY.GRC]);

  const {
    fileSize = 0,
    pageCount = 0,
    contractTypeName = "",
    obligationComputed = false,
    processDataStatus = false,
    grcProcessStatus = 0,
  } = fileMeta || {};

  /* Local State */
  const [comment, setComment] = useState<string>("");
  const [toggleRaiseAlert, setToggleRaiseAlert] = useState<boolean>(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [rules, setRules] = useState([{ key: "", value: "" }]); // Initialize with an empty rule

  /* Functions */
  const handleRaiseAlert = () => {
    if (fileId && comment !== "") {
      dispatch(raiseAlertOnSummary({ fileId, comment }));
      setToggleRaiseAlert(false);
      setComment("");
    }
  };

  const computeFileMeta = async () => {
    if (runButtonRef.current) {
      runButtonRef.current.disabled = true;
    }
    fileId && (await dispatch(computeObligation({ fileId, folderId, teamId })));
    if (runButtonRef.current) {
      runButtonRef.current.disabled = false;
    }
  };

  /* Effects */
  useEffect(() => {
    fileId && dispatch(readSideBarContent({ fileId, teamId, folderId }));
    return () => {
      dispatch(clearSideBarContent());
    };
  }, [fileId]);

  useEffect(() => {
    window.addEventListener("click", () => {
      setToggleRaiseAlert(false);
    });
  }, []);

  useEffect(() => {
    let interval: any;
    if (fileId && [1, 2].includes(grcProcessStatus)) {
      interval = setInterval(() => {
        dispatch(getFileMeta({ fileId, folderId, teamId }));
      }, 60000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [fileId, grcProcessStatus]);

  // const mergeNewValue = (originalArray, targetKey, newValue) => {
  //   // @ts-ignore
  //   return originalArray.map(item => {
  //     if (item.key === targetKey) {
  //       const existingValues = Array.isArray(item.value) ? item.value : [];
  //       // @ts-ignore
  //       const mergedValues = existingValues.map(subItem => {
  //         if (subItem.key === targetKey) {
  //           return { ...subItem, value: newValue };
  //         }
  //         return subItem;
  //       });
  //       return { ...item, value: [...mergedValues, ...newValue] };
  //     } else if (Array.isArray(item.value)) {
  //       return { ...item, value: mergeNewValue(item.value, targetKey, newValue) };
  //     } else {
  //       return item;
  //     }
  //   });
  // };

  // Update the key "Is Stamped" to the new value

  const selectKeys = (e: any) => {
    setSelectedKey(e.target.value);
    sideBarData.forEach((item) => {
      if (item.key === e.target.value) {
        const existingValues = Array.isArray(item.value) ? item.value : [];
        const formattedValues = existingValues.map((val) => {
          if (typeof val === "string") {
            return { key: item.key, value: val };
          } else {
            return { key: val.key || "", value: typeof val.value === "string" ? val.value : "" };
          }
        });
        setRules(formattedValues);
      }
      // else if (Array.isArray(item.value)) {
      //   selectKeys(e);
      // }
    });
  };

  return (
    <div className="right-tab-content tab-sharing active">
      <div className="right-tab-content-inner">
        <ShareFile fileId={fileId} createdBy={createdBy} />

        <div className="app-summary-info">
          <>
            <div className="grc-container app-summary-tab-section">
              <div className="info-row mb-2">
                <div className="info-row-left font-bold">
                  <span className="block">File Size</span>
                </div>
                <div className="info-row-right">{fileSize}MB</div>
              </div>
              <div className="info-row mb-2">
                <div className="info-row-left font-bold">
                  <span className="block">No of Pages</span>
                </div>
                <div className="info-row-right">{pageCount}</div>
              </div>
              <div className="info-row mb-2">
                <div className="info-row-left font-bold">
                  <span className="block">Contract Type</span>
                </div>
                <div className="info-row-right">{contractTypeName}</div>
              </div>
              {grcAuthority && processDataStatus && (
                <div className="info-row mb-2">
                  <div className="info-row-left font-bold">
                    <span className="block">Include in GRC</span>
                  </div>
                  <div className="info-row-right">
                    <p className="block">
                      {" "}
                      {[0, 4].includes(grcProcessStatus) ? (
                        <button
                          ref={runButtonRef}
                          onClick={computeFileMeta}
                          className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                        >
                          Run
                        </button>
                      ) : (
                        <div className="obligation-control-container">
                          <button className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase">
                            Yes
                          </button>
                          {[1, 2].includes(grcProcessStatus) && (
                            <div className="status-loader" title="Processing">
                              <div className="loader-insideBtn"></div>
                            </div>
                          )}
                        </div>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
          {sideBarSummary && (
            <>
              <div className="flex items-center ml-3">
                <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal">
                  Summary
                </h4>
                <span className="grow" />

                {fileOwnerId === profileId ? (
                  <>
                    <div className="raise-wrap relative" onClick={(e) => e.stopPropagation()}>
                      <i
                        className="raise-btn cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setToggleRaiseAlert(!toggleRaiseAlert);
                        }}
                      />
                      <div
                        className={`${raisedAlertflag ? "raised" : ""} raised-help-sec rounded-6`}
                        style={{ display: toggleRaiseAlert ? "" : "none" }}
                      >
                        <div className="flex fs12 font-semibold mb-2">
                          <div>Flag this content!</div>
                          <span className="grow" />
                          <div>How it work?</div>
                        </div>
                        <p>
                          SimpleO help you to extract clause information from your contracts. If you
                          are not satisfied with the data. you can click so that our legal expert
                          review the same and get you the best output from our contract.
                        </p>
                        <div className="mt-3">
                          <div className="mb-2">
                            <textarea
                              placeholder="Add a comment"
                              className="text-area rounded-6"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                          </div>
                          <div>
                            <button
                              onClick={handleRaiseAlert}
                              className="button-red rounded-12 sm-button tracking-wider font-bold uppercase"
                            >
                              Send
                            </button>
                            {raisedAlertflag && (
                              <span className="ml-3" style={{ color: "#c0c0cd" }}>
                                Already Raised
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  ""
                )}
              </div>
              <br />
              <p className="ml-3" dangerouslySetInnerHTML={{ __html: sideBarSummary }}></p>
            </>
          )}
        </div>

        <div className="app-summary-tab-section">
          <SummaryItem
            data={sideBarData}
            summary={sideBarSummary}
            folderId={folderId}
            fileId={fileId}
            teamId={teamId}
          />
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
