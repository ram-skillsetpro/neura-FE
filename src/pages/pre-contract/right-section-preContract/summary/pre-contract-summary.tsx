import { useAppDispatch, useAppSelector } from "core/hook";
import {
  clearSideBarContent,
  readPreContractSummaryContent,
  readUploadAndSignSummaryContent,
} from "pages/pre-contract/pre-contract.redux";
import React, { useEffect, useRef, useState } from "react";
import { UPLOAD_AND_SIGN } from "src/const";

interface IPreContractSummary {
  fileId: number;
  teamId: number;
  folderId?: number;
  sourceType?: string | null;
}

const PreContractSummary: React.FC<IPreContractSummary> = ({
  fileId,
  folderId,
  teamId,
  sourceType = null,
}) => {
  const dispatch = useAppDispatch();
  const { summaryProcessStatus, sideBarData, sideBarSummary, isLoading } = useAppSelector(
    (state) => state.preContract,
  );

  const { processStatus, message } = summaryProcessStatus || {};

  useEffect(() => {
    if (fileId) {
      if (sourceType === UPLOAD_AND_SIGN) {
        dispatch(readUploadAndSignSummaryContent({ fileId }));
        return;
      }
      dispatch(readPreContractSummaryContent({ fileId, teamId, folderId }));
    }

    return () => {
      dispatch(clearSideBarContent());
    };
  }, [fileId]);

  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    if (openSection === index) {
      setOpenSection(null);
    } else {
      setOpenSection(index);
    }
  };

  const formatString = (content: any) => {
    if (typeof content === "string") {
      const result = content.replaceAll("\n", "<br />");
      return result;
    }
    return content;
  };

  const interval: any = useRef(null);

  useEffect(() => {
    if (sourceType === UPLOAD_AND_SIGN) {
      if (fileId && [1, 2].includes(processStatus)) {
        interval.current = setInterval(() => {
          dispatch(readUploadAndSignSummaryContent({ fileId }));
        }, 60000);
      }
    }

    return () => {
      interval.current && clearInterval(interval.current);
      interval.current = null;
    };
  }, [fileId, processStatus]);

  return (
    <div className="right-tab-content tab-sharing active">
      <div className="right-tab-content-inner">
        {sideBarSummary && (
          <div className="app-summary-info border-b">
            <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal">Summary</h4>
            <br />
            <p dangerouslySetInnerHTML={{ __html: sideBarSummary }}></p>
          </div>
        )}
        <div className="app-summary-tab-section">
          <ul>
            {sideBarData?.length ? (
              sideBarData.map((section, index) => (
                <li
                  className={`tab-icon ${openSection === index ? "open" : ""}`}
                  key={index}
                  onClick={() => toggleSection(index)}
                >
                  <h4>{section.key}</h4>
                  <ul style={{ display: openSection === index ? "block" : "none" }}>
                    {Array.isArray(section.value) ? (
                      section.value.map((item, subIndex) => (
                        <li key={subIndex}>
                          {Array.isArray(item.value) && <div className="subkey">{item.key} -</div>}
                          {Array.isArray(item.value) ? (
                            item.value.map((subItem, subSubIndex) => (
                              <div className="info-row" key={subSubIndex}>
                                <div className="info-row-left font-bold">
                                  <span className="block">{subItem.key}</span>
                                </div>
                                <div className="info-row-right">
                                  <p
                                    className="block"
                                    dangerouslySetInnerHTML={{
                                      __html: formatString(subItem.value),
                                    }}
                                  ></p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="info-row">
                              <div className="info-row-left font-bold">
                                <span className="block">{item.key}</span>
                              </div>
                              <div className="info-row-right">
                                <p
                                  className="block"
                                  dangerouslySetInnerHTML={{ __html: formatString(item.value) }}
                                ></p>
                              </div>
                            </div>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>
                        <div className="info-row">
                          <div className="info-row-left font-bold">
                            <span className="block">{section.key}</span>
                          </div>
                          <div className="info-row-right">
                            <p
                              className="block"
                              dangerouslySetInnerHTML={{ __html: section.value }}
                            ></p>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </li>
              ))
            ) : isLoading && ![1, 2, 4].includes(processStatus) ? (
              <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                Loading...
              </h4>
            ) : (
              <h4
                className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {[1, 2, 4].includes(processStatus) ? (
                  <>
                    {[1, 2].includes(processStatus) ? (
                      <div
                        className="status-loader"
                        title="Processing"
                        style={{ width: "18px", height: "18px" }}
                      >
                        <div className="loader-insideBtn"></div>
                      </div>
                    ) : (
                      ""
                    )}
                    {message}
                  </>
                ) : (
                  "Summary Not Available"
                )}
              </h4>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PreContractSummary;
