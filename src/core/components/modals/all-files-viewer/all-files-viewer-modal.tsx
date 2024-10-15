import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { base64toBlob, downloadFileFromBlobUrl } from "src/core/utils";
import { fetchOriginalFile, setPreviewFile } from "src/pages/contract/contract.redux";
import ContractViewer from "src/pages/pre-contract/contract-viewer/contract-viewer";
import { LoaderSection } from "../../loader/loaderSection.comp";
import AppModal from "../app-modal";
import { AppModalType } from "../app-modal.model";
import "./all-files-viewer.scss";

interface AllFilesViewerModalType extends AppModalType {
  data: any;
}

const AllFilesViewerComponent: React.FC<AllFilesViewerModalType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  data,
}) => {
  const dispatch = useAppDispatch();
  const { id: fileId, folderId, teamId, mimeType = [], fileName, trackingId } = data;
  const { previewFile: file } = useAppSelector((state) => state.contract);

  useEffect(() => {
    if (fileId && !trackingId) {
      dispatch(fetchOriginalFile({ fileId, folderId, teamId, previewFileFlag: true }));
    }

    return () => {
      dispatch(setPreviewFile(""));
    };
  }, [fileId, trackingId]);

  // console.log(doc);

  const renderImage = (data: any) => {
    return <img src={`${base64toBlob(data, mimeType)}`} />;
  };

  const renderText = (data: any) => {
    return <textarea readOnly={true} className="custom-text-area" defaultValue={atob(data)} />;
  };

  const renderCsv = (data: any) => {
    return <textarea readOnly={true} className="custom-text-area" defaultValue={atob(data)} />;
  };

  const renderModalBody = () => {
    if (mimeType.includes("image")) {
      return <div className="fileImage">{file !== "" ? renderImage(file) : <LoaderSection />}</div>;
    }

    if (mimeType.includes("text/plain")) {
      return <>{file !== "" ? renderText(file) : <LoaderSection />}</>;
    }

    if (mimeType.includes("text/csv")) {
      return <>{file !== "" ? renderCsv(file) : <LoaderSection />}</>;
    }
    if (mimeType.includes("application/pdf") && trackingId && file) {
      return <>{<ContractViewer file={file} />}</>;
    }

    if (file !== "") {
      downloadFileFromBlobUrl(base64toBlob(file, mimeType), fileName);
      if (onClose) {
        dispatch(setPreviewFile(""));
        onClose();
      }
    }
    return <LoaderSection loaderLabel="Downloading" />;
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => {
        dispatch(setPreviewFile(""));
        return onClose && onClose();
      }}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      <div className="all-files-viewer-modal overflow-y">{renderModalBody()}</div>
    </AppModal>
  );
};

export default AllFilesViewerComponent;
