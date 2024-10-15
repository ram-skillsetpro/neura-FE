import React from "react";
import { Loader } from "src/core/components/loader/loader.comp";
import AppModal from "src/core/components/modals/app-modal";
import { AppModalType } from "src/core/components/modals/app-modal.model";
import CrossIcon from "src/core/components/svg/cross-icon";
import DownloadIcon from "src/core/components/svg/download-icon";
import ContractViewer from "src/pages/pre-contract/contract-viewer/contract-viewer";
import "./base64-pdf-viewer.scss";

interface IBase64PdfViewer extends AppModalType {
  base64String: string | null;
  handleDownload?: () => void | null;
}

const Base64PdfViewer: React.FC<IBase64PdfViewer> = ({ base64String, onClose, handleDownload }) => {
  return (
    <AppModal isOpen={true} onClose={onClose}>
      {base64String ? (
        <>
          <div className="cross" onClick={() => onClose && onClose()}>
            <CrossIcon />
          </div>

          <div className="container">
            {handleDownload ? (
              <button
                onClick={handleDownload}
                title="Download Redacted File"
                className="download-icon-btn mr-3"
                style={{
                  position: "fixed",
                  right: "14px",
                  border: "solid 1px #ff9797",
                  width: "48px",
                  height: "48px",
                  padding: "8px 8px",
                  background: "#ff6868",
                }}
              >
                <DownloadIcon color="#ffffff" />
              </button>
            ) : (
              ""
            )}

            <ContractViewer file={base64String} />
          </div>
        </>
      ) : (
        <Loader />
      )}
    </AppModal>
  );
};

export default Base64PdfViewer;
