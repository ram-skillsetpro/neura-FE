import ForwardIcon from "assets/images/forward-icon.svg";
import PDFIcon from "assets/images/icon-pdf.svg";

import { getFileIcon, getSummaryAlertColor } from "core/utils";
import { Fragment, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { updateSelfSetting } from "src/pages/admin-setting/settings-auth.redux";
import { FileType } from "src/pages/trash/trash.model";
import { RightsCalendarPayloadType } from "../contract.model";
import { fetchRightCalenderData, handleFileToOpen } from "../contract.redux";

interface ContractDataItem {
  key: string;
  value: any;
}
const CalenderComponent = (props: RightsCalendarPayloadType) => {
  /* Hooks */
  const dispatch = useAppDispatch();

  /* Constants */
  const { fileId, folderId, teamId } = props;
  const payload = {
    fileId,
    folderId,
    teamId,
  };

  /* Redux State */
  const calenderData: ContractDataItem[] =
    useAppSelector((state) => state.contract.calenderData) || [];

  /* Local State */
  const [isPhoneActive, setIsPhoneActive] = useState(false);
  const [isEmailActive, setIsEmailActive] = useState(false);

  /* Functions */
  const handleButtonClicked = (key: string, isActive: boolean) => {
    const phoneButton = document.querySelector(".calender-status.in-app");
    const emailButton = document.querySelector(".calender-status.in-email");

    const phoneButtonTooltip = document.querySelector(".error-tool-tip.sm.in-app-tooltip");
    const emailButtonTooltip = document.querySelector(".error-tool-tip.sm.in-email-tooltip");

    if (phoneButton) {
      if (key === "1") {
        phoneButton?.classList.toggle("disable");
        setIsPhoneActive((prev) => !prev);
      } else if (key === "2") {
        emailButton?.classList.toggle("disable");
        setIsEmailActive((prev) => !prev);
      }
    }
    if (phoneButtonTooltip) {
      if (key === "1") {
        phoneButtonTooltip?.classList.toggle("enable-tip");
      } else if (key === "2") {
        emailButtonTooltip?.classList.toggle("enable-tip");
      }
    }
    const payload = {
      fieldId: key,
      value: isActive ? 1 : 0,
    };
    dispatch(updateSelfSetting(payload));
  };

  /* Effect */
  useEffect(() => {
    const alertArray =
      (calenderData.length > 0 &&
        calenderData?.find((item: any) => item?.key === "Alerts")?.value) ||
      [];

    setIsPhoneActive(
      alertArray.length > 0 && alertArray.find((item: any) => item.key === "inapp")?.status,
    );
    setIsEmailActive(
      alertArray.length > 0 && alertArray.find((item: any) => item.key === "email")?.status,
    );
  }, [calenderData]);

  useEffect(() => {
    fileId && dispatch(fetchRightCalenderData(payload));
  }, [fileId]);

  /* Constants */
  const phoneClassNames = `calender-status mr-2-5 in-app ${!isPhoneActive ? "disable" : ""}`;
  const emailClassNames = `calender-status in-email ${!isEmailActive ? "disable" : ""}`;
  const phoneClassNamestool = `error-tool-tip sm in-app-tooltip ${
    isPhoneActive ? "enable-tip" : ""
  }`;
  const emailClassNamestool = `error-tool-tip sm in-email-tooltip ${
    isEmailActive ? "enable-tip" : ""
  }`;

  return (
    <div className="right-tab-content tab-calender">
      <div className="right-tab-content-inner">
        <div className="calender-top-space">
          {Array.from(calenderData || []).map((item, index) => {
            const { key, value } = item;
            if (key === "UpComing") {
              return (
                <div key={index}>
                  <h4 className="fs10 uppercase text-default-color tracking-wider font-normal mb-3 ml-3">
                    {key}
                  </h4>
                  <div className="data-card rounded-6">
                    {value.map((payment: any, paymentIndex: number) => {
                      return (
                        <div
                          key={paymentIndex}
                          className="bg-light1 p-3 rounded-6 mb-4 text-default-color"
                        >
                          <span>
                            <div className="fs11 font-bold mb-1">
                              <span
                                className={`${getSummaryAlertColor(
                                  payment.status,
                                )} mr-2-5 inline-block`}
                              ></span>
                              {payment.title}
                            </div>
                            <div className="body-text">
                              <p>{payment.text}</p>
                            </div>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            } else if (key === "DATES IN CALENDAR") {
              return (
                <div key={index}>
                  <div className="flex items-center mb-3">
                    <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-0 ml-3">
                      {key}
                    </h4>
                    <span className="grow"></span>
                    <div className="icons-sec">
                      <div className="relative error-tip-wrap inline-block">
                        <button
                          className={phoneClassNames}
                          onClick={() => handleButtonClicked("1", !isPhoneActive)}
                        >
                          <i className="phoneIcon"></i>
                        </button>
                        <div className={phoneClassNamestool}>
                          <div className="block font-bold">
                            {isPhoneActive ? "Enable" : "Disable"}
                          </div>
                          Phone Alert
                        </div>
                      </div>
                      <div className="relative error-tip-wrap inline-block">
                        <button
                          className={emailClassNames}
                          onClick={() => handleButtonClicked("2", !isEmailActive)}
                        >
                          <i className="emailIcon"></i>
                        </button>
                        <div className={emailClassNamestool}>
                          <div className="block font-bold">
                            {isEmailActive ? "Enable" : "Disable"}
                          </div>
                          Email Alert
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="data-card rounded-6">
                    <ul>
                      {value.map((dateItem: any, dateIndex: number) => (
                        <li key={dateIndex}>
                          <div className="data-row">
                            <div className="data-row-left font-bold">{dateItem.key}</div>
                            <div className="data-row-right">{dateItem.value}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            } else if (key === "PREVIOUS CONTRACTS") {
              return (
                <div key={index}>
                  <h4 className="fs10 uppercase text-default-color tracking-wider font-normal mb-3 ml-3">
                    {key}
                  </h4>
                  <div className="data-card rounded-6">
                    <ul>
                      {value.map((contract: any, contractIndex: number) => (
                        <li key={contractIndex}>
                          <a href="#" className="flex items-center">
                            <i className="w-20 h-20 mr-5">
                              <img src={PDFIcon} alt="PDF" />
                            </i>
                            <span className="fs11 truncate-line1">{contract?.fileName}</span>
                            <span className="grow"></span>
                            <button className="forward-btn">
                              <img src={ForwardIcon} alt="Forward" />
                            </button>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            } else if (key === "SUBSEQUENT CONTRACTS") {
              return (
                <div key={index}>
                  <h4 className="fs10 uppercase text-default-color tracking-wider font-normal mb-3 ml-3">
                    {key}
                  </h4>
                  <div className="data-card rounded-6">
                    <ul>
                      {value.map((contract: any, contractIndex: number) => (
                        <li key={contractIndex}>
                          <a href="#" className="flex items-center">
                            <i className="w-20 h-20 mr-5">
                              <img src={PDFIcon} alt="PDF" />
                            </i>
                            <span className="fs11 truncate-line1">{contract?.fileName}</span>
                            <span className="grow"></span>
                            <button className="forward-btn">
                              <img src={ForwardIcon} alt="Forward" />
                            </button>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            } else if (key === "PARENT CONTRACT") {
              return (
                <Fragment key={index}>
                  <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal ml-3 mb-3">
                    {key}
                  </h4>
                  <div className="data-card rounded-6">
                    <ul>
                      <li
                        key={index}
                        onClick={() =>
                          dispatch(
                            handleFileToOpen({
                              id: value.id,
                              teamId: value.teamId,
                              folderId: (value as FileType).folderId,
                              status: (value as FileType).processStatus,
                              fileName: (value as FileType).fileName,
                              createdBy: (value as FileType).createdBy,
                              mimeType: value.mimeType,
                            }),
                          )
                        }
                      >
                        <a className="flex items-center">
                          <i className="w-20 h-20 mr-5">
                            <img
                              src={require(
                                `assets/images/icon-${getFileIcon(value.fileName, value.mimeType)}.svg`,
                              )}
                            />
                          </i>
                          <span className="fs11 truncate-line1">{value.fileName}</span>
                          <span className="grow" />
                          <button className="forward-btn">
                            <img src={ForwardIcon} className="forward-btn" />
                          </button>
                        </a>
                      </li>
                    </ul>
                  </div>
                </Fragment>
              );
            } else if (key === "RELATED ATTACHMENTS") {
              return (
                <Fragment key={index}>
                  <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal ml-3 mb-3">
                    {key}
                  </h4>
                  <div key={index} className="data-card rounded-6">
                    <ul>
                      {value.map((file: FileType, index: number) => (
                        <li
                          key={index}
                          onClick={() =>
                            dispatch(
                              handleFileToOpen({
                                id: file.id,
                                teamId: file.teamId,
                                folderId: (file as FileType).folderId,
                                status: (file as FileType).processStatus,
                                fileName: (file as FileType).fileName,
                                createdBy: (file as FileType).createdBy,
                                mimeType: (file as FileType).mimeType || "",
                              }),
                            )
                          }
                        >
                          <a className="flex items-center">
                            <i className="w-20 h-20 mr-5">
                              <img
                                src={require(
                                  `assets/images/icon-${getFileIcon(file.fileName, file.mimeType)}.svg`,
                                )}
                              />
                            </i>

                            <span className="fs11 truncate-line1">
                              {file.processStatus === 4 && (
                                <span className="new-file-upload">Error -</span>
                              )}{" "}
                              {file.fileName}
                            </span>
                            {(file as FileType).processStatus === 2 && (
                              <div className="file-processing file-processing-wrap">
                                <i className="icon-pro processing"></i>
                                <div className="tool-file-error rounded-6">
                                  File is being processed
                                </div>
                              </div>
                            )}
                            {(file as FileType).processStatus === 4 && (
                              <div className="file-processing file-processing-wrap">
                                <i className="icon-pro"></i>
                                <div className="tool-file-error rounded-6">File not uploaded</div>
                              </div>
                            )}
                            <span className="grow" />
                            <button className="forward-btn">
                              <img src={ForwardIcon} />
                            </button>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Fragment>
              );
            } else if (key === "RELATED CONTRACTS") {
              return (
                <Fragment key={index}>
                  <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal ml-3 mb-3">
                    {key}
                  </h4>
                  <div key={index} className="data-card rounded-6">
                    <ul>
                      {value.map((file: FileType, index: number) => (
                        <li
                          key={index}
                          onClick={() =>
                            dispatch(
                              handleFileToOpen({
                                id: file.id,
                                teamId: file.teamId,
                                folderId: (file as FileType).folderId,
                                status: (file as FileType).processStatus,
                                fileName: (file as FileType).fileName,
                                createdBy: (file as FileType).createdBy,
                                mimeType: (file as FileType).mimeType || "",
                              }),
                            )
                          }
                        >
                          <a className="flex items-center">
                            <i className="w-20 h-20 mr-5">
                              <img
                                src={require(
                                  `assets/images/icon-${getFileIcon(file.fileName, file.mimeType)}.svg`,
                                )}
                              />
                            </i>

                            <span className="fs11 truncate-line1">
                              {file.processStatus === 4 && (
                                <span className="new-file-upload">Error -</span>
                              )}{" "}
                              {file.fileName}
                            </span>
                            {(file as FileType).processStatus === 2 && (
                              <div className="file-processing file-processing-wrap">
                                <i className="icon-pro processing"></i>
                                <div className="tool-file-error rounded-6">
                                  File is being processed
                                </div>
                              </div>
                            )}
                            {(file as FileType).processStatus === 4 && (
                              <div className="file-processing file-processing-wrap">
                                <i className="icon-pro"></i>
                                <div className="tool-file-error rounded-6">File not uploaded</div>
                              </div>
                            )}
                            <span className="grow" />
                            <button className="forward-btn">
                              <img src={ForwardIcon} />
                            </button>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Fragment>
              );
            } else {
              return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default CalenderComponent;
