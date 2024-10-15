import React, { useRef, useState } from "react";
import { getFileIcon, isValidFileSize } from "src/core/utils";
import AppModal from "../../core/components/modals/app-modal";
import "./_record-obligation.scss";
import { ObligationType } from "./grc-dashboard.model";

interface ResolveObligationModalProps {
  isOpen: boolean;
  onClose: () => void;
  obligation?: ObligationType;
  onSuccess?: (payload: any) => void;
}

// eslint-disable-next-line react/prop-types
const ResolveObligationModal: React.FC<ResolveObligationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // const [evidenceType, setEvidenceType] = useState("File");
  const fileRef = useRef<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState({
    fileError: "",
    descError: "",
  });

  // const handleEvidenceTypeChange = (type: string) => {
  //   setEvidenceType(type);
  // };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const validFileTypes = [".pdf", ".jpg", ".png", ".csv", ".xls", ".xlsx"];
      const fileExtension = selectedFile.name.slice(selectedFile.name.lastIndexOf("."));
      if (!validFileTypes.includes(fileExtension)) {
        setErrors((prevState) => ({
          ...prevState,
          fileError: "Invalid file type. Acceptable formats are PDF, JPG, PNG, CSV, XLS, XLSX.",
        }));
        fileRef.current = null;
      } else if (!isValidFileSize(selectedFile)) {
        setErrors((prevState) => ({
          ...prevState,
          fileError: "File size exceeds the maximum limit (10MB).",
        }));
        fileRef.current = null;
      } else {
        setErrors((prevState) => ({
          ...prevState,
          fileError: "",
        }));
        fileRef.current = selectedFile;
      }
    }
  };

  const handleSubmit = () => {
    if (errors.fileError === "" && fileRef) {
      onSuccess?.({ file: fileRef.current });
    } else {
      if (fileRef === null) {
        setErrors((prevState) => ({ ...prevState, fileError: "File is required" }));
      } else {
        // Check file type
        const validFileTypes = [".pdf", ".jpg", ".png", ".csv", ".xls", ".xlsx"];
        const fileExtension = fileRef.current
          ? fileRef.current.name.slice(fileRef.current.name.lastIndexOf(".")).toLowerCase()
          : "";
        if (!validFileTypes.includes(fileExtension)) {
          errors.fileError =
            "Invalid file type. Acceptable formats are PDF, JPG, PNG, CSV, XLS, XLSX.";
        } else if (fileRef.current && !isValidFileSize(fileRef.current)) {
          errors.fileError = "File size exceeds the maximum limit (10MB).";
        }
      }
    }
  };
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={true}
      overlayClassName={"modal-overlay"}
    >
      <div className="obligation-modal-wrap">
        <div className="obligation-modal-heading">
          Resolve Obligation
          <div className="mt-3 error-box">
            Resolving an obligation indicates you have completed the task for the current time
            frequency period
          </div>
        </div>
        <div className="obligation-modal-body">
          <div className="record-obligation modal-body-scroll">
            <div id="resolved-obligation">
              {/* <div className="record-field">
                <label className="font-semibold">Resolution</label>
                <select className="compliance-select w-full p-2">
                  <option>Mark as done</option>
                  <option>Can’t do</option>
                </select>
              </div> */}
              <div className="record-field">
                <label className="font-semibold">Description</label>
                <textarea
                  className="ob-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="record-field">
                <label className="font-semibold">Evidence*</label>
                {/* <div className="flex items-center fs14">
                  <label className="mr-3">
                    <input
                      type="radio"
                      checked={evidenceType === "File"}
                      onChange={() => handleEvidenceTypeChange("File")}
                    />
                    File
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={evidenceType === "Link"}
                      onChange={() => handleEvidenceTypeChange("Link")}
                    />
                    Link
                  </label>
                </div> */}
                {/* {evidenceType === "File" && ( */}
                <div className="mt-3" id="file">
                  <div className="upload-file-box relative">
                    {fileRef.current ? (
                      <>
                        <div className="flex justify-center w-full fs14 font-semibold items-center">
                          <img
                            src={require(
                              `assets/images/icon-${getFileIcon(fileRef?.current?.name ?? "", fileRef?.current?.mimeType)}.svg`,
                            )}
                            className="w-20 h-20 mr-3"
                          />
                          {/* <i className="upload-ic mr-3"></i> */}
                          {fileRef?.current?.name}
                        </div>
                        <div className="file-upload-link">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.png,.csv,.xls,.xlsx"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center w-full fs14 font-semibold">
                          <i className="upload-ic mr-3"></i> Upload File
                        </div>
                        <div className="file-upload-link">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.png,.csv,.xls,.xlsx"
                          />
                        </div>
                        <div className="file-type">
                          Acceptable formats - pdf, jpg, png, csv, excel Max file size 10mb
                        </div>
                      </>
                    )}
                  </div>
                  {errors.fileError && (
                    <div
                      className="error-message"
                      style={{
                        color: "var(--button-red)",
                        fontSize: "14px",
                      }}
                    >
                      {errors.fileError}
                    </div>
                  )}
                </div>
                {/* )} */}
              </div>
              {/* <div className="record-field">
                <label className="font-semibold">Evidence recorded as of</label>
                <input type="date" className="inpt-style" />
              </div> */}
            </div>
          </div>
        </div>
        {/* <div className="obligation-modal-footer mt-3 ">
          <div>
            <button className="button-ob rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
              Cancel
            </button>
            <button className="button-red rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
              Resolve
            </button>
          </div>
        </div> */}
        <div className="obligation-modal-footer mt-3">
          <div>
            <button
              className="button-ob rounded-12 mr-3 sm-button tracking-wider font-bold uppercase"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="button-ob rounded-12 mr-3 sm-button tracking-wider font-bold uppercase"
              onClick={handleSubmit}
            >
              Resolve
            </button>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ResolveObligationModal;
