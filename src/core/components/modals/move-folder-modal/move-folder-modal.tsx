import IconMoreHorizontalDark from "assets/images/icon-more-horizontal-dark.svg";
import { LoaderSection } from "core/components/loader/loaderSection.comp";
import AppModal from "core/components/modals/app-modal";
import { AppModalType } from "core/components/modals/app-modal.model";
import { useAppDispatch, useAppSelector } from "core/hook";
import { AnimatePresence, motion } from "framer-motion";
import { TeamListType } from "pages/manage-team/team.model";
import { FileType, FolderType } from "pages/user-dashboard/dashboard.model";
import {
  getFoldersForBreadcrumbs,
  moveFile,
  setFolderBreadcrumbs,
} from "pages/user-dashboard/dashboard.redux";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PRE_CONTRACT, ROUTE_TEAM_FILES, ROUTE_USER_DASHBOARD, UPLOAD_AND_SIGN } from "src/const";
import { CommonService } from "src/core/services/common.service";
import { getAuth } from "src/core/utils";
import { getTeamFoldersBreadcrumbs } from "src/pages/manage-team/team-files/team-files.redux";
import {
  clearSharedTeamList,
  clearTeamList,
  fetchSharedTeamList,
  fetchTeamList,
  setSharedTeamListPageCount,
  setTeamListPageCount,
} from "src/pages/manage-team/team.redux";
import { fetchConfigByContractId } from "src/pages/pre-contract/contract-editor/only-office-editor/onlyoffice.redux";
import { fetchUploadFileAndSignDocument } from "src/pages/pre-contract/pre-contract.redux";
import "./move-folder-modal.scss";

interface IMoveFolderModal extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  folderToMove?: Partial<FolderType>;
  fileToMove?: Partial<FileType>;
}

const MoveFolderModal: React.FC<IMoveFolderModal> = ({
  isOpen,
  onClose,
  folderToMove,
  fileToMove,
}) => {
  const dispatch = useAppDispatch();
  const foldersData = useAppSelector((state) => state.dashboard.folderBreadcrumbs);
  const isLoading = useAppSelector((state) => state.dashboard.isLoading);
  const foldersListing = useAppSelector((state) => state.dashboard.folderBreadcrumbsPerPage);
  const sharedFoldersListing = useAppSelector((state) => state.team.sharedTeamList);

  const traversePath = useAppSelector((state) => state.dashboard.moveFolderBreadcrumbs);
  const teamFoldersList = useAppSelector(
    (state) => state.teamDashboard.teamFolderBreadcrumbsPerPage,
  );
  const teamFoldersData = useAppSelector((state) => state.teamDashboard.teamFolderBreadcrumbs);
  const teamFolderIsLoading = useAppSelector((state) => state.teamDashboard.isLoading);
  const teamList = useAppSelector((state) => state.team.teamList);
  const teamListPageCount = useAppSelector((state) => state.team.teamListPageCount);
  const totalTeamCount = useAppSelector((state) => state.team.totalTeamCount);
  const teamListLoading = useAppSelector((state) => state.team.isTeamsLoading);

  const [folder, setFolder] = useState<FolderType>();
  const [rootDirectory, setRootDirectory] = useState<string>();
  const [selectedTeam, setSelectedTeam] = useState<TeamListType>();
  const [showTeamDir, setShowTeamDir] = useState<boolean>(false);
  const [showSharedTeamDir, setShowSharedTeamDir] = useState<boolean>(false);

  const location = useLocation();

  useEffect(() => {
    dispatch(setFolderBreadcrumbs([]));
    return () => {
      dispatch(setFolderBreadcrumbs([]));
      setShowTeamDir(false);
      setRootDirectory("");
      setFolder(undefined);
      dispatch(clearTeamList());
    };
  }, []);

  const addFolderToTraversePath = (folder: FolderType) => {
    const newPath = [...traversePath, folder];
    setFolder(folder);
    if (showTeamDir) {
      const payload = {
        teamId: selectedTeam?.id,
        pgn: 1,
        status: 1,
        folder,
      };
      dispatch(getTeamFoldersBreadcrumbs(payload));
    } else {
      dispatch(getFoldersForBreadcrumbs(1, folder));
    }
    dispatch(setFolderBreadcrumbs(newPath));
  };

  const handleGoBack = (folder: FolderType) => {
    setFolder(folder);
    const index = traversePath?.findIndex((i) => i.id === folder.id);
    const newPath = traversePath?.slice(0, index + 1);
    dispatch(setFolderBreadcrumbs(newPath));
    if (showTeamDir) {
      const payload = {
        teamId: selectedTeam?.id,
        pgn: 1,
        status: 1,
        folder,
      };
      dispatch(getTeamFoldersBreadcrumbs(payload));
    } else {
      dispatch(getFoldersForBreadcrumbs(1, folder));
    }
  };

  // const handleCloseCreateFolderModal = () => {
  //   setCreateFolderModal(false);
  //   dispatch(setRenderContainer(""));
  // };

  // const handleCreateFolder = () => {
  //   const folder = traversePath[traversePath?.length - 1];
  //   setFolder(folder);
  //   setCreateFolderModal(true);
  //   dispatch(renderUploadContainer("addFolder"));
  // };

  const totalPages = Math.ceil(foldersData?.totct / foldersData?.perpg) || 0;
  const teamFoldersTotalPages = Math.ceil(teamFoldersData?.totct / teamFoldersData?.perpg) || 0;

  const handleLoadMore = (newPage: number) => {
    if (newPage >= 1 && newPage <= teamFoldersData?.totct && showTeamDir) {
      const payload = {
        teamId: selectedTeam?.id,
        pgn: newPage,
        status: 1,
        folder,
      };
      dispatch(getTeamFoldersBreadcrumbs(payload));
    } else if (newPage >= 1 && newPage <= foldersData?.totct && !showTeamDir) {
      dispatch(getFoldersForBreadcrumbs(newPage, folder));
    }
  };
  const handleTeamDrive = () => {
    dispatch(setFolderBreadcrumbs([]));
    setRootDirectory("Team Drive");
    setSelectedTeam(undefined);
    setFolder(undefined);
    setShowTeamDir(false);
    dispatch(setTeamListPageCount(1));
    dispatch(fetchTeamList({ page: 1 }));
  };
  const handleSharedTeamDrive = () => {
    dispatch(setFolderBreadcrumbs([]));
    dispatch(clearSharedTeamList())
    setRootDirectory("Shared Team Drive");
    setSelectedTeam(undefined);
    setFolder(undefined);
    setShowTeamDir(false);
    dispatch(setSharedTeamListPageCount(1));
    dispatch(fetchSharedTeamList({ page: 1 }));
    setShowSharedTeamDir(true);
  };
  const handleMyDrive = () => {
    setRootDirectory("My Drive");
    setFolder(undefined);
    setShowTeamDir(false);
    dispatch(setFolderBreadcrumbs([]));
    dispatch(getFoldersForBreadcrumbs(1, folder));
  };

  const handleGoBackArrow = () => {
    setRootDirectory("");
    dispatch(setFolderBreadcrumbs([]));
    setSelectedTeam(undefined);
    setFolder(undefined);
    dispatch(clearTeamList());
  };

  const goToRoot = () => {
    dispatch(clearTeamList());
    setFolder(undefined);
    dispatch(setFolderBreadcrumbs([]));
    setShowTeamDir(false);
    setSelectedTeam(undefined);

    switch (rootDirectory) {
      case "My Drive":
        dispatch(getFoldersForBreadcrumbs(1));
        break;
      case "Shared Team Drive":
        dispatch(setSharedTeamListPageCount(1));
        dispatch(fetchSharedTeamList({ page: 1 }));
        break;
      default:
        dispatch(setTeamListPageCount(1));
        dispatch(fetchTeamList({ page: 1 }));
        break;
    }
  };

  const handleOnClickTeam = (team: TeamListType) => {
    dispatch(setFolderBreadcrumbs([]));

    setSelectedTeam(team);
    const payload = {
      teamId: team.id,
      pgn: 1,
      status: 1,
      folder: undefined,
    };
    dispatch(getTeamFoldersBreadcrumbs(payload));
    setShowTeamDir(true);
  };

  const auth = getAuth();
  const handleMoveItem = async (driveFolder?: FolderType) => {
    const route = location?.pathname?.split("/")?.length - 1;
    try {
      if (fileToMove) {
        const payload = {
          fileId: fileToMove.id!,
          targetFolderName: driveFolder ? driveFolder.folderName : folder?.folderName,
          targetTeamId: driveFolder
            ? driveFolder.teamId
            : folder
              ? folder.teamId
              : selectedTeam
                ? selectedTeam.id
                : auth.myteamId,
          targetFolderId: driveFolder ? driveFolder.id : folder?.id,
        };
        const response = await dispatch(moveFile(payload, location?.pathname?.split("/")[route]));
        if (response?.isSuccess) {
          if (location.pathname.includes(UPLOAD_AND_SIGN)) {
            await dispatch(fetchUploadFileAndSignDocument(fileToMove.id!));
          } else if (location.pathname.includes(PRE_CONTRACT)) {
            await dispatch(fetchConfigByContractId(fileToMove.id!));
          } else if (location.pathname.includes(ROUTE_USER_DASHBOARD) || location.pathname.includes(ROUTE_TEAM_FILES)) {
            CommonService.popupToast({
              message: response.message[0],
              type: "success"
            })
          }
        }
      }
    } catch (error) {
      console.error("something went wrong", error);
    } finally {
      onClose();
    }
  };

  const onOverlayClick = () => {
    handleGoBackArrow();
    onClose();
  };

  const handleLoadMoreTeams = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(totalTeamCount / 50) &&
      teamListPageCount !== newPage
    ) {
      dispatch(setTeamListPageCount(newPage));
      dispatch(fetchTeamList({ page: newPage }));
    }
  };

  return (
    <AppModal isOpen={isOpen} onClose={onOverlayClick} shouldCloseOnOverlayClick={true}>
      <AnimatePresence mode="wait">
        <div className="pop-outer-wrap">
          <div className="share-inner">
            <div className="px-5">
              <div className="flex flex items-center fs14 font-bold text-body truncate-line1">
                Move {fileToMove?.fileName || folderToMove?.folderName}
              </div>
            </div>
            <div className="border-t w-full">
              <div className="px-5">
                {(!!rootDirectory || !!traversePath?.length) && (
                  <div className="page-breadcrum mb-5">
                    <ul className="breadcrum-ul items-center">
                      {rootDirectory && (
                        <button className="back-btn" onClick={handleGoBackArrow}>
                          <i className="icon-img" />
                        </button>
                      )}
                      <li className="list">
                        <a href="#" onClick={goToRoot}>
                          {rootDirectory}
                        </a>{" "}
                      </li>
                      {selectedTeam && (
                        <li className="list">
                          <a href="#" onClick={() => handleOnClickTeam(selectedTeam)}>
                            {selectedTeam?.teamName}
                          </a>{" "}
                        </li>
                      )}
                      {/* {traversePath?.length > 0 &&
                      traversePath?.map((folder) => (
                        <li className="list" key={folder.id} onClick={() => handleGoBack(folder)}>
                          <a href="#">{folder.folderName}</a>{" "}
                        </li>
                      ))} */}
                      {traversePath?.length < 4
                        ? traversePath?.map((folder) => (
                          // <AnimatePresence mode="wait">
                          <motion.li
                            exit={{ opacity: 0, x: 100 }}
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="list"
                            key={folder.id}
                          >
                            <a onClick={() => handleGoBack(folder)}>
                              <div
                                className="truncate-link tool-tip-text"
                                data-fulltext={folder.folderName}
                              >
                                {folder.folderName}
                              </div>
                            </a>
                          </motion.li>
                          // </AnimatePresence>
                        ))
                        : traversePath?.slice(0, 1).map((folder) => (
                          // <AnimatePresence mode="wait" key={folder.id}>
                          <motion.li
                            exit={{ opacity: 0, x: 100 }}
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="list"
                            key={folder.id}
                          >
                            <a onClick={() => handleGoBack(folder)}>
                              <div
                                className="truncate-link tool-tip-text"
                                data-fulltext={folder.folderName}
                              >
                                {folder.folderName}
                              </div>
                            </a>
                          </motion.li>
                          // </AnimatePresence>
                        ))}

                      {traversePath?.length > 3 && (
                        <>
                          <li>
                            <div className="relative drop-down-modal flex items-center mr-3">
                              <button className="breadcrum-btn flex">
                                <img src={IconMoreHorizontalDark} />
                              </button>
                              <div className="menu-card rounded-6">
                                <ul>
                                  {traversePath?.slice(1, -2).map((folder) => (
                                    <li key={folder.id} onClick={() => handleGoBack(folder)}>
                                      <a className="forward-arrow">
                                        <div
                                          className="truncate-link tool-tip-text"
                                          data-fulltext={folder.folderName}
                                        >
                                          {folder.folderName}
                                        </div>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </li>
                          {traversePath?.slice(-2).map((folder) => (
                            // <AnimatePresence mode="wait" key={folder.id}>
                            <motion.li
                              exit={{ opacity: 0, x: 100 }}
                              initial={{ opacity: 0, x: -100 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5 }}
                              key={folder.id}
                              onClick={() => handleGoBack(folder)}
                              className="list"
                            >
                              <a className="forward-arrow">
                                <div
                                  className="truncate-link tool-tip-text"
                                  data-fulltext={folder.folderName}
                                >
                                  {folder.folderName}
                                </div>
                              </a>
                            </motion.li>
                            // </AnimatePresence>
                          ))}
                        </>
                      )}
                    </ul>
                  </div>
                )}
                <div className="move-folder-list">
                  {!rootDirectory ? (
                    <ul>
                      <li>
                        <div className="flex items-center" onClick={handleMyDrive}>
                          <i className="folder-img mr-3"></i>
                          My Drive
                        </div>
                        <span className="grow"></span>
                        <div>
                          <div className="flex items-center">
                            <button
                              className="move-button uppercase tracking-wider"
                              onClick={() => handleMoveItem()}
                            >
                              Move
                            </button>
                            <button className="forward-btn" onClick={handleMyDrive}></button>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="flex items-center" onClick={handleTeamDrive}>
                          <i className="folder-img mr-3"></i>
                          Team Drive
                        </div>
                        <span className="grow"></span>
                        <div>
                          <div className="flex items-center">
                            {/* <button className="move-button uppercase tracking-wider">Move</button> */}
                            <button className="forward-btn" onClick={handleTeamDrive}></button>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="flex items-center" onClick={handleSharedTeamDrive}>
                          <i className="folder-img mr-3"></i>
                          Shared Team Drive
                        </div>
                        <span className="grow"></span>
                        <div>
                          <div className="flex items-center">
                            {/* <button className="move-button uppercase tracking-wider">Move</button> */}
                            <button className="forward-btn" onClick={handleSharedTeamDrive}></button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  ) : rootDirectory === "My Drive" ? (
                    <ul>
                      {foldersListing?.length ? (
                        foldersListing
                          .filter((item) => item.id !== folderToMove?.id)
                          .map((folder) => (
                            <motion.li
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              key={folder.id}
                            >
                              <div
                                className="flex items-center"
                                onClick={() => addFolderToTraversePath(folder)}
                              >
                                <i className="folder-img mr-3"></i>
                                {folder.folderName}
                              </div>
                              <span className="grow"></span>
                              <div>
                                <div className="flex items-center">
                                  <button
                                    className="move-button uppercase tracking-wider"
                                    onClick={() => handleMoveItem(folder)}
                                  >
                                    Move
                                  </button>
                                  <button
                                    className="forward-btn"
                                    onClick={() => addFolderToTraversePath(folder)}
                                  ></button>
                                </div>
                              </div>
                            </motion.li>
                          ))
                      ) : isLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <LoaderSection />
                        </div>
                      ) : (
                        <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                          Folder is empty
                        </h4>
                      )}
                    </ul>
                  ) : (
                    <ul>
                      {teamList?.length && !showTeamDir ? (
                        teamList.map((team) => (
                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            key={team.id}
                          >
                            <div
                              className="flex items-center"
                              onClick={() => handleOnClickTeam(team)}
                            >
                              <i className="folder-img mr-3"></i>
                              {team.teamName}
                            </div>
                            <span className="grow"></span>
                            <div>
                              <div className="flex items-center">
                                {/* <button className="move-button uppercase tracking-wider">
                                  Move
                                </button> */}
                                <button
                                  className="forward-btn"
                                  onClick={() => handleOnClickTeam(team)}
                                ></button>
                              </div>
                            </div>
                          </motion.li>
                        ))
                      ) : showTeamDir ? (
                        <ul>
                          {teamFoldersList?.length ? (
                            teamFoldersList
                              .filter((item) => item.id !== folderToMove?.id)
                              .map((folder) => (
                                <motion.li
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.5 }}
                                  key={folder.id}
                                >
                                  <div
                                    className="flex items-center"
                                    onClick={() => addFolderToTraversePath(folder)}
                                  >
                                    <i className="folder-img mr-3"></i>
                                    {folder.folderName}
                                  </div>
                                  <span className="grow"></span>
                                  <div>
                                    <div className="flex items-center">
                                      <button
                                        className="move-button uppercase tracking-wider"
                                        onClick={() => handleMoveItem(folder)}
                                      >
                                        Move
                                      </button>
                                      <button
                                        className="forward-btn"
                                        onClick={() => addFolderToTraversePath(folder)}
                                      ></button>
                                    </div>
                                  </div>
                                </motion.li>
                              ))
                          ) : teamFolderIsLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <LoaderSection />
                            </div>
                          ) : (
                            <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                              Folder is empty
                            </h4>
                          )}
                        </ul>
                      ) : showSharedTeamDir ? (
                        <ul>
                          {sharedFoldersListing?.length ? (
                            sharedFoldersListing
                              .filter((item) => item.id !== folderToMove?.id)
                              .map((team) => (
                                <motion.li
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.5 }}
                                  key={team.id}
                                >
                                  <div
                                    className="flex items-center"
                                    onClick={() => handleOnClickTeam(team)}
                                  >
                                    <i className="folder-img mr-3"></i>
                                    {team.teamName}
                                  </div>
                                  <span className="grow"></span>
                                  <div>
                                    <div className="flex items-center">
                                      {/* <button
                                        className="move-button uppercase tracking-wider"
                                        onClick={() => handleMoveItem(folder)}
                                      >
                                        Move
                                      </button> */}
                                      <button
                                        className="forward-btn"
                                        onClick={() => handleOnClickTeam(team)}
                                      ></button>
                                    </div>
                                  </div>
                                </motion.li>
                              ))
                          ) : teamFolderIsLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <LoaderSection />
                            </div>
                          ) : (
                            <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                              Folder is empty
                            </h4>
                          )}
                        </ul>
                      ) : teamListLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <LoaderSection />
                        </div>
                      ) : (
                        <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 ml-3">
                          Folder is empty
                        </h4>
                      )}
                    </ul>
                  )}




                  {/* pagination UI */}
                  {rootDirectory === "My Drive" ? (
                    foldersData.isLoading ? (
                      <div className="flex justify-end">
                        <div className="simpleO-loader"></div>
                      </div>
                    ) : (
                      <div className={`flex ${foldersData.pgn > 1 ? "justify-between" : "justify-end"}`}>
                        {foldersData.pgn > 1 && (
                          <div className="dataTables_info" id="myTable_info" role="status" aria-live="polite">
                            <div className="mt-3 mb-2 flex justify-center">
                              <button
                                className={`load-more-btn paginate_button next ${foldersData.pgn === 1 ? "disabled" : ""
                                  }`}
                                onClick={() => handleLoadMore(foldersData.pgn - 1)}
                              >
                                Load Previous
                              </button>
                            </div>
                          </div>
                        )}
                        {foldersData.pgn === totalPages ? null : totalPages > 0 ? (
                          <div
                            className="dataTables_info flex"
                            id="myTable_info"
                            role="status"
                            aria-live="polite"
                          >
                            <div className="mt-3 mb-2 flex items-center justify-end">
                              <div className="text-light-color fs12 font-bold mr-3">
                                Page {foldersData.pgn} of {totalPages}
                              </div>
                            </div>
                            <div className="mt-3 mb-2 flex justify-center">
                              <button
                                className={`load-more-btn paginate_button next ${foldersData.pgn === totalPages ? "disabled" : ""
                                  }`}
                                onClick={() => handleLoadMore(foldersData.pgn + 1)}
                              >
                                Load Next
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  ) : null}
                  {rootDirectory === "Team Drive" ? (
                    showTeamDir ? (
                      teamFoldersData.isLoading ? (
                        <div className="flex justify-end">
                          <div className="simpleO-loader"></div>
                        </div>
                      ) : teamFoldersData.pgn ===
                        teamFoldersTotalPages ? null : teamFoldersTotalPages > 0 ? (
                          <div className="flex justify-end">
                            <div
                              className="dataTables_info"
                              id="myTable_info"
                              role="status"
                              aria-live="polite"
                            >
                              <div className="mt-3 mb-2 flex justify-center">
                                <button
                                  className={`load-more-btn paginate_button next ${teamFoldersData.pgn === teamFoldersTotalPages ? "disabled" : ""
                                    }`}
                                  onClick={() => handleLoadMore(teamFoldersData.pgn + 1)}
                                >
                                  Load Next
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null
                    ) : teamListLoading ? (
                      <div className="flex justify-end">
                        <div className="simpleO-loader"></div>
                      </div>
                    ) : (
                      <div className={`flex ${teamListPageCount > 1 ? "justify-between" : "justify-end"}`}>
                        {teamListPageCount > 1 && (
                          <div className="dataTables_info" id="myTable_info" role="status" aria-live="polite">
                            <div className="mt-3 mb-2 flex justify-center">
                              <button
                                className={`load-more-btn paginate_button next ${teamListPageCount === 1 ? "disabled" : ""
                                  }`}
                                onClick={() => handleLoadMoreTeams(teamListPageCount - 1)}
                              >
                                Load Previous
                              </button>
                            </div>
                          </div>
                        )}
                        {teamListPageCount === Math.ceil(totalTeamCount / 50) ? null : Math.ceil(totalTeamCount / 50) > 0 ? (
                          <div
                            className="dataTables_info flex"
                            id="myTable_info"
                            role="status"
                            aria-live="polite"
                          >
                            <div className="mt-3 mb-2 flex justify-center">
                              <button
                                className={`load-more-btn paginate_button next ${teamListPageCount === Math.ceil(totalTeamCount / 50) ? "disabled" : ""
                                  }`}
                                onClick={() => handleLoadMoreTeams(teamListPageCount + 1)}
                              >
                                Load Next
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  ) : null}



                  {rootDirectory === "Shared Team Drive" ? (
                    showSharedTeamDir ? (
                      teamFoldersData.isLoading ? (
                        <div className="flex justify-end">
                          <div className="simpleO-loader"></div>
                        </div>
                      ) : teamFoldersData.pgn ===
                        teamFoldersTotalPages ? null : teamFoldersTotalPages > 0 ? (
                          <div className="flex justify-end">
                            <div
                              className="dataTables_info"
                              id="myTable_info"
                              role="status"
                              aria-live="polite"
                            >
                              <div className="mt-3 mb-2 flex justify-center">
                                <button
                                  className={`load-more-btn paginate_button next ${teamFoldersData.pgn === teamFoldersTotalPages ? "disabled" : ""
                                    }`}
                                  onClick={() => handleLoadMore(teamFoldersData.pgn + 1)}
                                >
                                  Load Next
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null
                    ) : teamListLoading ? (
                      <div className="flex justify-end">
                        <div className="simpleO-loader"></div>
                      </div>
                    ) : (
                      <div className={`flex ${teamListPageCount > 1 ? "justify-between" : "justify-end"}`}>
                        {teamListPageCount > 1 && (
                          <div className="dataTables_info" id="myTable_info" role="status" aria-live="polite">
                            <div className="mt-3 mb-2 flex justify-center">
                              <button
                                className={`load-more-btn paginate_button next ${teamListPageCount === 1 ? "disabled" : ""
                                  }`}
                                onClick={() => handleLoadMoreTeams(teamListPageCount - 1)}
                              >
                                Load Previous
                              </button>
                            </div>
                          </div>
                        )}
                        {teamListPageCount === Math.ceil(totalTeamCount / 50) ? null : Math.ceil(totalTeamCount / 50) > 0 ? (
                          <div
                            className="dataTables_info flex"
                            id="myTable_info"
                            role="status"
                            aria-live="polite"
                          >
                            <div className="mt-3 mb-2 flex justify-center">
                              <button
                                className={`load-more-btn paginate_button next ${teamListPageCount === Math.ceil(totalTeamCount / 50) ? "disabled" : ""
                                  }`}
                                onClick={() => handleLoadMoreTeams(teamListPageCount + 1)}
                              >
                                Load Next
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  ) : null}







                </div>
              </div>
              <div className="border-t w-full">
                <div className="px-5">
                  <div className="flex items-center">
                    {/* {(traversePath?.length > 0 || selectedTeam) && (
                      <div>
                        <button
                          className="green-button uppercase tracking-wider"
                          onClick={() => handleCreateFolder()}
                        >
                          Create folder
                        </button>
                      </div>
                    )} */}
                    <span className="grow"></span>
                    <div className="flex items-center">
                      <div className=" mr-3">
                        <button
                          className="remove-button uppercase tracking-wider"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                      {(traversePath?.length > 0 || showTeamDir) && (
                        <button
                          className="green-button uppercase tracking-wider"
                          onClick={() => handleMoveItem()}
                        >
                          Move here
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatePresence>
      {/* {createFolderModal && (
        <CreateFolderComponent
          routeString={routeString ?? ""}
          isOpen={renderUpload === "addFolder"}
          onClose={handleCloseCreateFolderModal}
          selectedFolder={folder}
          selectedTeam={selectedTeam}
        />
      )} */}
    </AppModal>
  );
};

export default MoveFolderModal;
