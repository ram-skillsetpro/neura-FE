import { Loader } from "core/components/loader/loader.comp";
import { hasSpecificString } from "core/functions/has-specific-string";
import { useAppDispatch, useAppSelector } from "core/hook";
import { getTeamId, handleInvalidFile } from "core/utils";
import { LS_FILES_FOLDERS_ROUTE, LS_TEAM, acceptedFileTypes } from "core/utils/constant";
import { AnimatePresence, motion } from "framer-motion";
import { getTeamFilesPerPage } from "pages/manage-team/team-files/team-files.redux";
import { FolderType } from "pages/user-dashboard/dashboard.model";
import {
  fileListLoading,
  fileUpload,
  getFilePerPage,
  getRecentFilesList,
  renderUploadContainer,
} from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ROUTE_USER_DASHBOARD, USER_AUTHORITY } from "src/const";
import { CommonService } from "src/core/services/common.service";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import useLocalStorage from "src/core/utils/use-local-storage";
import { TeamListType } from "src/pages/manage-team/team.model";
import "./single-file-upload.scss";

interface ICreateFile {
  focusMove?: () => void;
}

const SingleFileUpload: React.FC<ICreateFile> = ({ focusMove }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const store = window.location.pathname.includes(ROUTE_USER_DASHBOARD)
    ? "dashboard"
    : "teamDashboard";
  const fileList = useAppSelector((state) => state[store]?.fileList) || [];
  const isLoading = useAppSelector((state) => state.dashboard.isLoading);
  const [isCheckboxChecked, setCheckboxChecked] = useState({
    parseFlag: true,
    grcParseFlag: false,
  });
  const renderUpload = useAppSelector((state) => state.dashboard.createNew);
  const routeData = localStorage.getItem(LS_FILES_FOLDERS_ROUTE);
  const [teamData] = useLocalStorage<TeamListType>(LS_TEAM);
  const isFUProcess = useAuthorityCheck([USER_AUTHORITY.FU_PROCESS]);
  const isGRCRole = useAuthorityCheck([USER_AUTHORITY.GRC]);

  const [canProcess, setCanProcess] = useState(false);
  const routeDataMap = useMemo(
    () => location.state?.routeDataMap ?? {},
    [location.state?.routeDataMap],
  );
  const [searchParams] = useSearchParams();

  const navValue = searchParams.get("folders") || "";

  useEffect(() => {
    if (renderUpload === "uploadFile") inputRef.current && inputRef.current.focus();
    return () => {
      renderUploadContainer("");
    };
  }, [renderUpload]);

  useEffect(() => {
    setCanProcess(isFUProcess);
    setCheckboxChecked({ ...isCheckboxChecked, parseFlag: isFUProcess });
  }, [isFUProcess, isGRCRole]);

  const fetchData = async (folder?: FolderType) => {
    try {
      dispatch(fileListLoading(true));
      if (location.pathname.includes(ROUTE_USER_DASHBOARD)) {
        await dispatch(getFilePerPage(1, folder)); // TODO: may require change to remove page 1
        if (!routeData) await dispatch(getRecentFilesList({ dataReset: true }));
      } else {
        await dispatch(getTeamFilesPerPage(teamData?.id, 1, folder));
      }
    } catch (error) {
      console.error("Error while fetching data:", error);
    } finally {
      dispatch(fileListLoading(false));
    }
  };

  // upload files
  const handleDrag = (e: React.DragEvent<HTMLFormElement | HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // triggers when file is dropped
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const selectedFile = e.dataTransfer.files?.[0];
    const fileType = selectedFile.name.split(".").pop();

    if (["rar", "", undefined].includes(fileType)) {
      CommonService.popupToast({
        type: "error",
        message: `${fileType?.toUpperCase() || "Unknown"} file type not supported`,
      });
      return;
    }

    if (!selectedFile || !hasSpecificString(selectedFile.name, acceptedFileTypes)) {
      handleInvalidFile("Please select a valid file.");
      return;
    }

    // if (!isValidFileSize(selectedFile)) {
    //   handleInvalidFile("File size exceeds the maximum limit (10MB).");
    //   return;
    // }

    // setFile(selectedFile);
    handleFileUpload(selectedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];

    const fileType = selectedFile?.name.split(".").pop();
    if (["rar", "", undefined].includes(fileType)) {
      CommonService.popupToast({
        type: "error",
        message: `${fileType?.toUpperCase() || "Unknown"} file type not supported`,
      });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    if (!selectedFile) {
      // setFile(null);
      handleInvalidFile("Please select a file.");
      return;
    }

    // if (!isValidFileSize(selectedFile)) {
    //   handleInvalidFile("File size exceeds the maximum limit (10MB).");
    //   return;
    // }
    // setFile(selectedFile);
    handleFileUpload(selectedFile);
  };

  const handleFileUpload = async (selectedFile: File): Promise<void> => {
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;
    const obj = {
      file: selectedFile,
      folder,
      parseFlag: isCheckboxChecked.parseFlag ? 1 : 0,
      grcParseFlag: isCheckboxChecked.grcParseFlag ? 1 : 0,
      teamId: getTeamId(),
    };
    try {
      await dispatch(fileUpload(obj));
      focusMove?.();
    } catch (error) {
      console.error("Error while fetching data:", error);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setTimeout(() => {
        fetchData(folder);
      }, 2000);
    }
  };

  const handleCheckboxClick = (event: any) => {
    const { name, checked } = event.target;
    setCheckboxChecked((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const closePopup = () => {
    dispatch(renderUploadContainer(""));
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
            {fileList.length === 0 ? "You have no Files" : "File Upload"}
          </h2>
          <div
            className={`upolad-empty rounded-6  ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="close-popups-upload" onClick={closePopup}></div>
            <div className="upload-info font-bold">
              Drag and drop files here to upload
              <br />
              Or, Click to Select files to upload
              <input
                type="file"
                className="upload-light"
                // accept=".pdf,.doc,.docx,.zip, .csv"
                accept="*/*"
                onChange={handleFileChange}
                ref={inputRef}
              />
              <div className="icon-upload"></div>
            </div>
            <div className="ch-box-area w-full">
              <div className="flex fs12">
                <label className={`ch-box ${!canProcess ? "disabled" : ""} cursor-pointer`}>
                  <input
                    type="checkbox"
                    name="parseFlag"
                    checked={isCheckboxChecked.parseFlag}
                    onChange={handleCheckboxClick}
                    className="cursor-pointer"
                    disabled={!canProcess}
                    aria-disabled={!canProcess}
                    role="checkbox"
                  />
                  Process on Upload
                </label>
                {isGRCRole && (
                  <label className="ch-box ml-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="grcParseFlag"
                      checked={isCheckboxChecked.grcParseFlag}
                      onChange={handleCheckboxClick}
                      className="cursor-pointer"
                      disabled={!isGRCRole}
                      role="checkbox"
                    />
                    Include in GRC
                  </label>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {isLoading && <Loader />}
    </>
  );
};

export default SingleFileUpload;
