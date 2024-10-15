import { useAppDispatch, useAppSelector } from "core/hook";
import { AnimatePresence, motion } from "framer-motion";
import { FolderType } from "pages/user-dashboard/dashboard.model";
import {
  createFolder,
  getFilePerPage,
  getFoldersForBreadcrumbs,
  getFoldersPerPage,
  getRecentFilesList,
  renderUploadContainer,
} from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ROUTE_TEAM_FILES } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import AppModal from "src/core/components/modals/app-modal";
import { getTeamId } from "src/core/utils";
import { LS_TEAM } from "src/core/utils/constant";
import useLocalStorage from "src/core/utils/use-local-storage";
import {
  getTeamFilesPerPage,
  getTeamFoldersBreadcrumbs,
  getTeamFoldersPerPage,
} from "src/pages/manage-team/team-files/team-files.redux";
import { TeamListType } from "src/pages/manage-team/team.model";
import "./create-folder.scss";

interface ICreateFolder {
  routeString?: string;
  focusMove?: () => void | undefined;
  isOpen: boolean;
  onClose: () => void;
  selectedFolder?: FolderType;
  selectedTeam?: TeamListType;
}

const initialState = {
  isError: false,
  errorMessage: "",
};
const CreateFolder: React.FC<ICreateFolder> = ({
  routeString,
  focusMove,
  isOpen,
  onClose,
  selectedFolder,
  selectedTeam,
}) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [folderName, setFolderName] = useState("");
  const [errors, setErrors] = useState(initialState);
  // const routeDataString = routeString && localStorage.getItem(routeString);
  const [teamData] = useLocalStorage<TeamListType>(LS_TEAM);
  const isLoading = useAppSelector((state) => state.dashboard.isLoading);
  const createFolderInputRef = useRef<HTMLInputElement | null>(null);
  const renderUpload = useAppSelector((state) => state.dashboard.createNew);
  const routeDataMap = useMemo(
    () => location.state?.routeDataMap ?? {},
    [location.state?.routeDataMap],
  );
  const [searchParams] = useSearchParams();

  const navValue = searchParams.get("folders") || "";

  const closePopup = () => {
    dispatch(renderUploadContainer(""));
  };

  const handleFolderNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
    if (event.target.value !== "") {
      setErrors(initialState);
    } else {
      setErrors((prevState) => ({
        ...prevState,
        isError: true,
        errorMessage: "Folder name cannot be empty or contain only spaces.",
      }));
    }
  };

  useEffect(() => {
    if (renderUpload === "addFolder") {
      createFolderInputRef.current && createFolderInputRef.current.focus();
    }
    return () => {
      renderUploadContainer("");
    };
  }, [renderUpload]);

  const handleFolderSave = async () => {
    const trimmedFolderName = folderName.trim();
    if (trimmedFolderName === "") {
      setErrors((prevState) => ({
        ...prevState,
        isError: true,
        errorMessage: "Folder name cannot be empty or contain only spaces.",
      }));
      return;
    }
    const folder = routeDataMap[navValue]
      ? routeDataMap[navValue][routeDataMap[navValue]?.length - 1]
      : undefined;

    const data = {
      folderName: trimmedFolderName,
      parentFolderId: selectedFolder ? selectedFolder?.id : folder?.id,
      teamId: selectedTeam?.id ?? getTeamId(),
    };
    try {
      await dispatch(createFolder(data));
      if (!selectedFolder) {
        fetchData(folder);
      } else {
        fetchMoveData(selectedFolder);
      }
      closePopup();
      focusMove?.();
    } catch {
      console.log("Something went wrong");
    } finally {
      setErrors(initialState);
      setFolderName("");
    }
  };

  const fetchData = async (folder?: FolderType) => {
    try {
      if (location.pathname.includes(ROUTE_TEAM_FILES)) {
        await dispatch(getTeamFoldersPerPage(teamData?.id, 1, folder));
        await dispatch(getTeamFilesPerPage(teamData?.id, 1, folder));
      } else {
        await dispatch(getFoldersPerPage(1, folder));
        await dispatch(getFilePerPage(1, folder));
        if (!folder) await dispatch(getRecentFilesList({ dataReset: true }));
      }
    } catch (error) {
      console.error("Error while fetching data:", error);
    } finally {
      onClose();
    }
  };
  const fetchMoveData = async (folder?: FolderType) => {
    try {
      if (selectedTeam) {
        const payload = {
          teamId: selectedTeam?.id,
          pgn: 1,
          status: 1,
          folder,
        };
        await dispatch(getTeamFoldersBreadcrumbs(payload));
      } else {
        dispatch(getFoldersForBreadcrumbs(1, folder));
      }
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  return (
    <>
      <AppModal isOpen={isOpen} onClose={onClose} shouldCloseOnOverlayClick={true}>
        <AnimatePresence mode="wait">
          <motion.div
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="share-outer-wrap create-folder"
          >
            <div className="share-inner">
              <div className="w-full mb-5">
                <div className="fs14 font-bold mb-5 text-body">You are creating a folder</div>
                <div className="close-popups-upload drive-folder" onClick={onClose}></div>
                <form>
                  <div className="w-full mb-4 relative">
                    <input
                      placeholder="Provide folder name"
                      className={`input-box ${errors.isError && "error-state"}`}
                      onChange={handleFolderNameChange}
                      value={folderName}
                      ref={createFolderInputRef}
                    />
                    {errors.isError && <div className="error-message">{errors.errorMessage}</div>}
                  </div>
                  {/* <div className="w-full mb-4 relative">
                  <input value="" placeholder="Share this with …" className="input-box" />
                </div> */}
                </form>
              </div>
              <div className="flex items-center border-t pt-3">
                <div className="w-content-left">You are creating a folder.</div>
                <div className="grow">
                  <div className="flex justify-end">
                    <button
                      className="remove-button uppercase tracking-wider mr-3"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      className="green-button uppercase tracking-wider"
                      onClick={handleFolderSave}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </AppModal>
      {isLoading && <Loader />}
    </>
  );
};

export default CreateFolder;
