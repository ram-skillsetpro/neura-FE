import { AnimatePresence, motion } from "framer-motion";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Loader } from "src/core/components/loader/loader.comp";
import ShareSnippetModal from "src/core/components/modals/share-snippet-modal/share-snippet-modal";
import DownChevronIcon from "src/core/components/svg/down-chevron-icon";
import RightChevron from "src/core/components/svg/right-chevron";
import UpChevronIcon from "src/core/components/svg/up-chevron-icon";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { base64toBlob, downloadFileFromBlobUrl, fetchBlobFromUrl } from "src/core/utils";
import Base64PdfViewer from "src/pages/contract/components/base64-pdf-viewer/base64-pdf-viewer";
import {
  fetchRedactedContractList,
  fetchRedactedPdfReadData,
  fetchRedactPreSignedUrl,
  saveOriginalFile,
  saveRedactedContract,
  setOriginalPDFContent,
  setSnippets,
  uploadPresignedRedactFile,
} from "../../../contract.redux";
import "./redact-pdf.scss";

interface IRedactPDF {
  fileId: number;
  folderId?: number;
  teamId: number;
  fileName: string;
}

const RedactPDF: React.FC<IRedactPDF> = ({ fileId, folderId, teamId, fileName }) => {
  const dispatch = useAppDispatch();
  const {
    redactedContractListInfo,
    redactedContractList,
    originalPDFContent,
    redactedContractBlob,
  } = useAppSelector((state) => state.contract);

  const { pgn, totct, perpg } = redactedContractListInfo;

  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<number>(-1);
  const [redactedPdf, setRedactedPdf] = useState<string | null>(null);
  const [loader, setLoader] = useState<boolean>(false);

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const onUserSelected = (selectedUsers: any, setSelectedUsers: any, timePeriod: number) => {
    (async () => {
      setLoader(true);
      const preSignedData = await dispatch(fetchRedactPreSignedUrl({ fileId, folderId, teamId }));

      const { redactId, presignedUrl } = preSignedData;

      const blob = await fetchBlobFromUrl(redactedContractBlob);

      const file = new File([blob], `file-${fileId}.pdf`, {
        type: "application/pdf",
        lastModified: new Date().getTime(),
      });

      const fileUploadStatus = await dispatch(
        uploadPresignedRedactFile({
          file,
          url: presignedUrl,
        }),
      );

      if (fileUploadStatus) {
        const payload = {
          redactId,
          fileId,
          teamId,
          folderId,
          emailcsv: selectedUsers.map((data: any) => data.emailId).join(","),
          timePeriod,
        };

        const status = await dispatch(saveRedactedContract(payload));
        if (status) {
          setSelectedUsers([]);
          dispatch(setSnippets([]));
          setShareModalOpen(false);
          handleDiscardRedaction();
          setActiveItem(-1);
        }
        setLoader(false);
      }
    })();
  };

  const handlePrev = () => {
    if (pgn > 0) {
      dispatch(fetchRedactedContractList({ contractId: fileId, pageno: pgn - 1 }));
    }
  };
  const handleNext = () => {
    if (totct / perpg > pgn) {
      dispatch(fetchRedactedContractList({ contractId: fileId, pageno: pgn + 1 }));
    }
  };

  const handleDiscardRedaction = () => {
    dispatch(saveOriginalFile(originalPDFContent));
    dispatch(setOriginalPDFContent(null));
  };

  const [openViewer, setOpenViewer] = useState<boolean>(false);

  const handleFileOpen = async (file: any) => {
    setOpenViewer(true);
    const { id: redactId } = file;
    const pdfString = await dispatch(fetchRedactedPdfReadData({ redactId }));

    if (pdfString) {
      setRedactedPdf(pdfString);
    } else {
      setOpenViewer(false);
    }
  };

  const handleRedactedDownload = () => {
    redactedContractBlob &&
      fileId &&
      downloadFileFromBlobUrl(
        redactedContractBlob,
        `${fileName.replace(".pdf", "")}-redacted-file-[${moment().format("DD-MM-YYYY")}].pdf`,
      );
  };

  const handleDownload = () => {
    redactedPdf &&
      downloadFileFromBlobUrl(
        base64toBlob(redactedPdf),
        `${fileName.replace(".pdf", "")}-redacted-file-[${moment().format("DD-MM-YYYY")}].pdf`,
      );
  };

  useEffect(() => {
    dispatch(fetchRedactedContractList({ contractId: fileId, pageno: 1 }));
  }, [fileId]);

  return (
    <>
      {loader && <Loader />}
      {originalPDFContent ? (
        <div className="right-tab-content-inner item-container mb-8">
          <div className="flex fs12 text-defaul-color mt-8 mb-4 app-breadcrumbs  playbook-item ">
            <span className="font-bold playbook-title">Share Redacted PDF</span>
          </div>
          <div className="flex justify-end">
            <button
              title="Download Redacted File"
              disabled={false}
              className="download-icon-btn mr-3"
              onClick={handleRedactedDownload}
            >
              <i className="dw-ic"></i>
            </button>
            <button
              className="remove-button rounded-12 sm-button tracking-wider font-bold uppercase mr-2"
              onClick={handleDiscardRedaction}
            >
              Undo Redaction
            </button>
            <button
              className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
              onClick={handleShare}
            >
              Share
            </button>
          </div>
        </div>
      ) : (
        ""
      )}

      {Array.from(redactedContractList || []).length ? (
        <>
          <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mt-3 ml-1">
            Redacted & Shared History
          </h4>
          {redactedContractList.map((snippetItem, index) => (
            <div
              onClick={() => setActiveItem(index)}
              className="right-tab-content-inner item-container"
              key={index}
            >
              <div className="flex fs12 text-defaul-color mt-8 mb-4 app-breadcrumbs  playbook-item ">
                <div className={`item-nav ${index === activeItem ? "item-nav-active" : ""}`}>
                  <RightChevron />
                </div>
                <span className="font-bold playbook-title lh2">{snippetItem.name}</span>
              </div>

              <div className={`playbook-subitem ${index === activeItem ? "active" : ""}`}>
                {Array.from(snippetItem.emailIdCSV) && (
                  <div className="snippet-share">
                    <div className="shared-with">Shared with:</div>
                    <div className="shared-chips-sec mb-3 " style={{ marginLeft: 0 }}>
                      {snippetItem.emailIdCSV.map((email: string, index: number) => (
                        <div key={index} className="shared-chips">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <AnimatePresence mode="wait">
                  {index === activeItem ? (
                    <motion.div
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.01 * index, duration: 1 }}
                      className="bg-light p-3 rounded-6 mb-2 text-defaul-color"
                      style={{ opacity: 1 }}
                      key={index}
                    >
                      <div className="fs11 font-bold mb-1 flex">
                        <span
                          onClick={() => handleFileOpen(snippetItem)}
                          className="button-red rounded-12 sm-chips uppercase inline-block mr-2-5 font-normal"
                        >
                          View Redacted PDF
                        </span>
                        <span className="grow"></span>
                      </div>

                      {/* <div className="body-text">
                        <p>Test</p>
                      </div> */}
                    </motion.div>
                  ) : (
                    ""
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
          {totct / perpg > 1 && (
            <div className="flex justify-end">
              <div title="Prev">
                <button
                  onClick={handlePrev}
                  disabled={pgn < 2}
                  className={`button-red msg-delete-btn 
                        pdf-rotate-btn next-prev-btn page-prev-btn`}
                >
                  <UpChevronIcon />
                </button>
              </div>
              <div className="page-number-container">{pgn}</div>
              <div title="Next">
                <button
                  onClick={handleNext}
                  disabled={totct / perpg <= pgn}
                  className={`button-red msg-delete-btn 
                        pdf-rotate-btn next-prev-btn page-next-btn`}
                >
                  <DownChevronIcon />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 mt-3 ml-1">
          The redacted files shared will be shown here
        </h4>
      )}

      {shareModalOpen && (
        <ShareSnippetModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          onSuccess={onUserSelected}
        />
      )}

      {openViewer && (
        <Base64PdfViewer
          isOpen={openViewer}
          base64String={redactedPdf}
          onClose={() => {
            setRedactedPdf(null);
            setOpenViewer(false);
          }}
          handleDownload={handleDownload}
        />
      )}
    </>
  );
};

export default RedactPDF;
