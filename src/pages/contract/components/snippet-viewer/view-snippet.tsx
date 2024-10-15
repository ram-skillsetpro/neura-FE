import "assets/css/V3/_middle-outer.scss";
import "assets/css/V3/app-style3.scss";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Loader } from "src/core/components/loader/loader.comp";
import AppModal from "src/core/components/modals/app-modal";
import WarningIcon from "src/core/components/svg/warning-icon";
import { useAppDispatch } from "src/core/hook";
import { base64toBlob, downloadFileFromBlobUrl } from "src/core/utils";
import ContractViewer from "src/pages/pre-contract/contract-viewer/contract-viewer";
import { fetchContractSnippetPdfData, fetchRedactedContractPdfData, fetchSharedContractPdfData } from "../../contract.redux";
import "./snippet-viewer.scss";

const ViewSnippet: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, action } = location.state || {};
  const [base64String, setBase64String] = useState<string | null>(null);
  const [loader, setLoader] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = () => {
    base64String &&
      base64String !== "" &&
      downloadFileFromBlobUrl(
        base64toBlob(base64String),
        action === "view-redact" ? "redacted-file.pdf" : "excerpts-file.pdf",
      );
  };

  useEffect(() => {
    if (token) {
      setLoader(true);
      const validate = async () => {
        let base64String: string | null = null;
        if (action === "view-redact") {
          base64String = await dispatch(fetchRedactedContractPdfData(token));
        } else if (action === "view-snippet") {
          base64String = await dispatch(fetchContractSnippetPdfData(token));
        } else if (action === "view-shared-contract") {
          base64String = await dispatch(fetchSharedContractPdfData(token));
        }
        setLoader(false);
        if (base64String) {
          setBase64String(base64String);
        } else {
          setError("Failed to load file due to link expiration");
        }
      };
      validate();
    }
  }, [token]);

  return (
    <>
      <header className="header-sec">
        <div className="app-header">
          <div className="app-logo">
            <img
              onClick={() => navigate("/")}
              src="https://simpleo-user-static.s3.us-west-1.amazonaws.com/webassets/images/simpleo-ai-logo.svg"
              alt="SimpleO Logo"
            />
          </div>
        </div>
      </header>
      {loader && <Loader />}
      {error ? (
        <AppModal isOpen={true}>
          <div
            style={{
              alignItems: "center",
              justifyContent: "center",
              color: "#ff6968",
              background: "#fff",
              padding: "8px 16px",
              borderRadius: "50px",
              display: "flex",
              gap: "6px",
              maxWidth: "600px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            <WarningIcon color="#ff6968" width="16px" height="16px" />
            {error}
          </div>
        </AppModal>
      ) : (
        ""
      )}

      {base64String && (
        <>
          <div className="content-sec">
            <div className="left-section relative">
              {base64String && (
                <div style={{ position: "absolute", right: "16px", top: "8px" }}>
                  <button onClick={handleDownload} className="download-pdf-btn">
                    <i className="dw-ic"></i>
                    <div className="tool-tipN">Download PDF</div>
                  </button>
                </div>
              )}
              <div className="pdf-scroll">
                <ContractViewer file={base64String} />
              </div>
            </div>
            <div className="right-section">
              {/* <div className="right-section-inner ">
                <div className="right-tab-content tab-comment">
                  <div className="right-tab-content-inner">
                    <div>
                      <div className="comment-form-sec">
                        <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal cml">
                          Comments
                        </h4>
                        <form>
                          <div className="mb-2">
                            <div id="suggestionPortal">
                              <div>
                                <div>
                                  <textarea placeholder="Add a comment"></textarea>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="ml-2">
                            <button
                              type="button"
                              className="button-red rounded-12 sm-button tracking-wider font-bold uppercase"
                            >
                              Send
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ViewSnippet;
