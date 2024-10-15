import moment from "moment";
import React, { useEffect, useState } from "react";
import { getFileIcon, isValidFileSize } from "src/core/utils";
import AppModal from "../../core/components/modals/app-modal";
import "./_record-obligation.scss";
import { ObligationType } from "./grc-dashboard.model";

interface DeadLineExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  obligation?: ObligationType;
  onSuccess?: (payload: any) => void;
}

const DeadLineExtensionModal: React.FC<DeadLineExtensionModalProps> = ({
  isOpen,
  onClose,
  obligation,
  onSuccess,
}) => {
  // const [evidenceType, setEvidenceType] = useState("File");
  const [file, setFile] = useState<File | null>(null);
  const [deadlineDate, setDeadlineDate] = useState<string>("");
  const [currentDeadline, setCurrentDeadline] = useState<string>("");
  const [dateValue, setDateValue] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({
    deadlineDateError: "",
    fileError: "",
    reasonError: "",
  });

  // const handleEvidenceTypeChange = (type: string) => {
  //   setEvidenceType(type);
  // };

  useEffect(() => {
    const date = moment(obligation?.deadlineDate, "DD/MM/YYYY").format("YYYY-MM-DD");
    setCurrentDeadline(date);
  }, []);

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
        setFile(null);
      } else if (!isValidFileSize(selectedFile)) {
        setErrors((prevState) => ({
          ...prevState,
          fileError: "File size exceeds the maximum limit (10MB).",
        }));
        setFile(null);
      } else {
        setErrors((prevState) => ({
          ...prevState,
          fileError: "",
        }));
        setFile(selectedFile);
      }
    }
  };

  const handleDeadlineDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateValue(e.target.value);
    const newDeadlineTimestamp = new Date(e.target.value).getTime();
    const currentDeadlineTimestamp = new Date(currentDeadline).getTime();
    if (newDeadlineTimestamp <= currentDeadlineTimestamp) {
      setErrors((prevState) => ({
        ...prevState,
        deadlineDateError: "New deadline must be later than the current deadline.",
      }));
      setDateValue("");
    } else {
      setErrors((prevState) => ({
        ...prevState,
        deadlineDateError: "",
      }));
      setDeadlineDate((newDeadlineTimestamp / 1000).toFixed(0));
    }
  };

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    if (!dateValue) errors.deadlineDateError = "Deadline date is required";
    if (!file) {
      errors.fileError = "File is required";
    } else {
      // Check file type
      const validFileTypes = [".pdf", ".jpg", ".png", ".csv", ".xls", ".xlsx"];
      const fileExtension = file?.name.slice(file.name.lastIndexOf("."));
      if (!validFileTypes.includes(fileExtension)) {
        errors.fileError =
          "Invalid file type. Acceptable formats are PDF, JPG, PNG, CSV, XLS, XLSX.";
      } else if (!isValidFileSize(file)) {
        errors.fileError = "File size exceeds the maximum limit (10MB).";
      }
    }
    if (!reason) {
      errors.reasonError = "Reason is required";
    }

    // Check if the new deadline is valid
    const newDeadlineTimestamp = new Date(dateValue).getTime();
    const currentDeadlineTimestamp = new Date(currentDeadline).getTime();
    if (newDeadlineTimestamp <= currentDeadlineTimestamp) {
      errors.deadlineDateError = "New deadline must be later than the current deadline.";
    }

    setErrors(errors);
    if (Object.keys(errors).length === 0) {
      onSuccess?.({ file, reason, deadlineDate });
    }
  };
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={true}
      overlayClassName={"modal-overlay"}
    >
      <div className="flex" style={{ height: "100vh" }}>
        <div className="obligation-modal-wrap">
          <div className="obligation-modal-heading">Request for deadline extension</div>
          <div className="obligation-modal-body">
            <div className="record-obligation modal-body-scroll">
              <div id="resolved-obligation">
                <div className="record-field">
                  <label className="font-semibold">Current deadline </label>
                  <input type="date" className="inpt-style" value={currentDeadline} disabled />
                </div>
                <div className="record-field">
                  <label className="font-semibold">New requested deadline*</label>
                  <input
                    type="date"
                    className="inpt-style"
                    value={dateValue}
                    onChange={handleDeadlineDateChange}
                  />
                  {errors.deadlineDateError && (
                    <div
                      className="error-message"
                      style={{
                        color: "var(--button-red)",
                        fontSize: "14px",
                      }}
                    >
                      {errors.deadlineDateError}
                    </div>
                  )}
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
                      {file ? (
                        <>
                          <div className="flex justify-center w-full fs14 font-semibold items-center">
                            <img
                              src={require(
                                `assets/images/icon-${getFileIcon(file.name, file.mimeType)}.svg`,
                              )}
                              className="w-20 h-20 mr-3"
                            />
                            {/* <i className="upload-ic mr-3"></i> */}
                            {file.name}
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
                <div className="record-field">
                  <label className="font-semibold">Reason* </label>
                  <textarea
                    className="ob-textarea"
                    value={reason}
                    onChange={(e) => {
                      const input = e.target.value;
                      // Validate text input for reason field
                      if (!/^[a-zA-Z0-9\s.,'-]*$/.test(input)) {
                        setErrors((prevState) => ({
                          ...prevState,
                          reasonError: "Only alphanumeric characters and . , ' - are allowed.",
                        }));
                      } else {
                        setErrors((prevState) => ({
                          ...prevState,
                          reasonError: "",
                        }));
                        setReason(input);
                      }
                    }}
                  ></textarea>
                  {errors.reasonError && (
                    <div
                      className="error-message"
                      style={{
                        color: "var(--button-red)",
                        fontSize: "14px",
                      }}
                    >
                      {errors.reasonError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* <div className="obligation-modal-footer mt-3 ">
            <div>
              <button className="button-ob rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
                Cancel
              </button>
              <button className="button-red rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer">
                Submit
              </button>
            </div>
          </div> */}
          <div className="obligation-modal-footer mt-3">
            <div>
              <button
                className="cursor-pointer button-ob rounded-12 mr-3 sm-button tracking-wider font-bold uppercase cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer button-ob rounded-12 mr-3 sm-button tracking-wider font-bold uppercase cursor-pointer"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default DeadLineExtensionModal;
