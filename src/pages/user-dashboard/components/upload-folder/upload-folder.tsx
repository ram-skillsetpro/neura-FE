import { Loader } from "core/components/loader/loader.comp";
import { useAppDispatch, useAppSelector } from "core/hook";
import { CommonService } from "core/services/common.service";
import { LS_TEAM } from "core/utils/constant";
import {
  generateZipBlob,
  handleZipGeneration,
  handleZipGenerationFromDirHandle,
} from "core/utils/upload-utils";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import {
  getTeamFilesFoldersList,
  getTeamFilesPerPage,
} from "pages/manage-team/team-files/team-files.redux";
import { TeamListType } from "pages/manage-team/team.model";
import { FolderType } from "pages/user-dashboard/dashboard.model";
import {
  fileListLoading,
  fileUpload,
  getFilePerPage,
  getFilesFolders,
  renderUploadContainer,
} from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ROUTE_USER_DASHBOARD, USER_AUTHORITY } from "src/const";
import { getTeamId } from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import "./upload-folder.scss";

const UploadFolder: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isLoading = useAppSelector((state) => state.dashboard.isLoading);
  const renderUpload = useAppSelector((state) => state.dashboard.createNew);
  const [teamData] = useLocalStorage<TeamListType>(LS_TEAM);

  const [isCheckboxChecked, setCheckboxChecked] = useState({
    parseFlag: true,
    grcParseFlag: false,
  });
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
    setCanProcess(isFUProcess);
    setCheckboxChecked({ ...isCheckboxChecked, parseFlag: isFUProcess });
  }, [isFUProcess, isGRCRole]);

  useEffect(() => {
    if (renderUpload === "uploadFolder") inputRef.current && inputRef.current.focus();
    return () => {
      renderUploadContainer("");
    };
  }, [renderUpload]);

  const fetchData = async (folder?: FolderType) => {
    try {
      dispatch(fileListLoading(true));
      if (location.pathname.includes(ROUTE_USER_DASHBOARD)) {
        await dispatch(getFilesFolders(1, folder));
        await dispatch(getFilePerPage(1, folder));
      } else {
        await dispatch(getTeamFilesFoldersList(teamData.id, folder));
        await dispatch(getTeamFilesPerPage(teamData.id, 1, folder));
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    if (items) {
      const entries = Array.from(items)
        .filter((item) => item.kind === "file")
        .map((item) => item.webkitGetAsEntry());

      // Filter out only directories (folders)
      const folders = entries.filter((entry) => entry?.isDirectory);

      if (folders.length > 0) {
        // Process folders
        const zip = await handleZipGeneration(folders as FileSystemDirectoryEntry[]);
        const zipBlob = await generateZipBlob(zip);
        // downloadZipFile(zipBlob, `${formatDateWithOrdinal(new Date(), "-")}_uploaded-folder.zip`);
        handleFileUpload(zipBlob);
      } else {
        CommonService.toast({
          type: "error",
          message: "Only folders are allowed. Please make sure to upload folders only.",
        });
      }
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setDragActive(false);
  };

  const handleFileUpload = async (selectedFile: File): Promise<void> => {
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;

    const obj = {
      file: selectedFile,
      folder,
      parseFlag: isCheckboxChecked.parseFlag ? 1 : 0,
      teamId: getTeamId(),
      grcParseFlag: isCheckboxChecked.grcParseFlag ? 1 : 0,
    };
    try {
      await dispatch(fileUpload(obj));
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
    event.stopPropagation();
    const { name, checked } = event.target;
    setCheckboxChecked((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };
  const closePopup = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    dispatch(renderUploadContainer(""));
  };

  const handleDirectorySelect = async () => {
    try {
      const folders = await (window as any).showDirectoryPicker();
      const zipBlob = await handleZipGenerationFromDirHandle(folders);
      // downloadZipFile(zipBlob, `${formatDateWithOrdinal(new Date(), "-")}_uploaded-folder.zip`);
      handleFileUpload(zipBlob);
    } catch (error) {
      console.error("Error selecting directory:", error);
    }
  };
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click is directly on the container and not on any child elements
    if (event.target === event.currentTarget) {
      handleDirectorySelect();
    }
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
          <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase">
            folder upload
          </h2>
          <div
            className={`upolad-empty rounded-6 cursor-pointer  ${dragActive ? "drag-active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleContainerClick}
          >
            <div className="close-popups-upload" onClick={closePopup}></div>
            <div className="upload-info font-bold" onClick={handleContainerClick}>
              Drag and drop folders
              <br />
              Or, Click to Select folders to upload
              <div onClick={handleContainerClick} className="icon-upload"></div>
            </div>
            <div className="ch-box-area w-full">
              <div className="flex fs12">
                <div className={`ch-box ${!canProcess ? "disabled" : ""} cursor-pointer`}>
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
                </div>
                {isGRCRole && (
                  <div className="ch-box ml-3 cursor-pointer">
                    <input
                      role="checkbox"
                      type="checkbox"
                      name="grcParseFlag"
                      checked={isCheckboxChecked.grcParseFlag}
                      onChange={handleCheckboxClick}
                      className="cursor-pointer"
                      disabled={!isGRCRole}
                    />
                    Include in GRC
                  </div>
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

export default UploadFolder;
