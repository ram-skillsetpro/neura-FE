import "core/components/modals/share-file-modal/_share-popup.scss";
import { useAppDispatch, useAppSelector } from "core/hook";
import { LS_TEAM, LS_TEAM_FILES_FOLDERS_ROUTE } from "core/utils/constant";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import { TeamListType } from "pages/manage-team/team.model";
import {
  clearSharedTeamList,
  fetchSharedTeamList,
  setSharedTeamListPageCount,
} from "pages/manage-team/team.redux";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_TEAM_FILES } from "src/const";

export const TeamsDriveSharedTeamsList = () => {
  const {
    sharedTeamList = [],
    teamListPageCount = 1,
    totalSharedTeamCount = 0,
    isSharedTeamsLoading: isLoading,
  } = useAppSelector((state) => state.team);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeOption, setActiveOption] = useState(-1);
  // const [deleteTeam, setDeleteTeam] = useState(false);
  // const [addNewTeamMember, setAddNewTeamMember] = useState(false);
  const [paginationData, setPaginationData] = useState({
    totalItems: totalSharedTeamCount,
    currentPage: teamListPageCount || 1,
    itemsPerPage: 50,
  });
  // const [selectedTeam, setSlectedTeam] = useState();
  // const [editTeam, setEditTeam] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  // const [teamUserList, setTeamUserList] = useState(false);
  // const [teamId, setTeamId] = useState(0);
  const [lsTeamData] = useLocalStorage<TeamListType>(LS_TEAM);
  const { itemsPerPage } = paginationData;
  const totalCount = totalSharedTeamCount;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  useEffect(() => {
    dispatch(fetchSharedTeamList({ page: teamListPageCount || 1 }));
    return () => {
      dispatch(clearSharedTeamList());
    };
  }, []);

  const handleItemClicked = (team: TeamListType) => {
    if (lsTeamData?.id !== team.id) {
      localStorage.removeItem(LS_TEAM_FILES_FOLDERS_ROUTE);
      localStorage.setItem(LS_TEAM, JSON.stringify(team));
    }
    navigate(`/${ROUTE_ADMIN}/${ROUTE_TEAM_FILES}`, { state: { team } });
  };

  const handleFolderOption = (team: TeamListType) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActiveOption(team.id);
  };

  const handleLoadMore = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      // setIsLoading(true);
      dispatch(setSharedTeamListPageCount(newPage));
      dispatch(fetchSharedTeamList({ page: newPage }));
    }
  };
  // const openTeamUserListModal = (e: any, teamId: number) => {
  //   e.stopPropagation();
  //   setTeamId(teamId);
  //   setActiveOption(-1);
  //   setTeamUserList(true);
  // };

  // const handleEditTeam = (e: any, team: any) => {
  //   e.stopPropagation();
  //   setActiveOption(-1);
  //   setEditTeam(true);
  //   setSlectedTeam(team);
  // };

  // const closeTeamUserListModal = () => {
  //   setTeamUserList(false);
  // };
  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: totalSharedTeamCount,
    });
  }, [totalSharedTeamCount]);

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveOption(-1);
    });
    // checkTeamData();
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {sharedTeamList.length > 0 && (
          <section className="mb-5">
            <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
              shared teams
            </h2>
            <div className="folder-sec">
              {sharedTeamList.map((team) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="folder-card"
                  key={team.id}
                >
                  <div className="folder-col">
                    <div className="folder-img" onClick={() => handleItemClicked(team)}>
                      <i className="team-folder-img"></i>
                    </div>

                    <div
                      onClick={() => handleItemClicked(team)}
                      className="file-title tool-tip-text"
                      data-fulltext={team.teamName}
                    >
                      {team.teamName}
                    </div>
                    {/* <div className="file-info">
                      71 Files, <span className="font-bold">3 New</span>
                    </div> */}

                    <div className="folder-action">
                      <button
                        className="icon-option-dot"
                        onClick={handleFolderOption(team)}
                      ></button>

                      {activeOption === team.id && (
                        <div className="dropdown-container">
                          <div className="dropdown-box">
                            <ul>
                              {/* {(isSuperAdmin || team.isAdmin) && (
                                <li onClick={(e) => handleAddNewMember(e, team)}>Add New Member</li>
                              )}
                              {team.isAdmin === 1 && (
                                <> */}
                              <li
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemClicked(team);
                                }}
                              >
                                View Team
                              </li>
                              <li
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="disabled"
                              >
                                Leave Team
                              </li>
                              {/* <li
                                    onClick={(e) => {
                                      handleDeleteTeam(e, team);
                                    }}
                                  >
                                    Delete
                                  </li>
                                </> */}
                              {/* )} */}
                            </ul>
                          </div>
                          <div className="notch"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {isLoading ? (
              <div className="flex justify-end mt-3">
                <div className="simpleO-loader"></div>
              </div>
            ) : (
              <div
                className={`flex ${paginationData.currentPage > 1 ? "justify-between" : "justify-end"}`}
              >
                {paginationData.currentPage > 1 && (
                  <div
                    className="dataTables_info"
                    id="myTable_info"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mt-3 mb-2 flex justify-center">
                      <button
                        className={`load-more-btn paginate_button next ${
                          paginationData.currentPage === 1 ? "disabled" : ""
                        }`}
                        onClick={() => handleLoadMore(paginationData.currentPage - 1)}
                      >
                        Load Previous
                      </button>
                    </div>
                  </div>
                )}
                {paginationData.currentPage === totalPages && totalPages > 1 ? (
                  <div
                    className="dataTables_info flex"
                    id="myTable_info"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mt-3 mb-2 flex items-center justify-end">
                      <div className="text-light-color fs12 font-bold mr-3">
                        Page {paginationData.currentPage} of {totalPages}
                      </div>
                    </div>
                  </div>
                ) : totalPages > 1 ? (
                  <div
                    className="dataTables_info flex"
                    id="myTable_info"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mt-3 mb-2 flex items-center justify-end">
                      <div className="text-light-color fs12 font-bold mr-3">
                        Page {paginationData.currentPage} of {totalPages}
                      </div>
                    </div>
                    <div className="mt-3 mb-2 flex justify-center">
                      <button
                        className={`load-more-btn paginate_button next ${
                          paginationData.currentPage === totalPages ? "disabled" : ""
                        }`}
                        onClick={() => handleLoadMore(paginationData.currentPage + 1)}
                      >
                        Load Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        )}
      </AnimatePresence>

      {/* {teamUserList && (
        <TeamUserListModal
          shouldCloseOnOverlayClick={true}
          isOpen={teamUserList}
          onClose={closeTeamUserListModal}
          teamId={teamId}
          onAfterClose={() => setTeamId(0)}
        />
      )}

      {editTeam && selectedTeam && (
        <EditTeamModal
          isOpen={editTeam}
          onClose={() => setEditTeam(false)}
          shouldCloseOnOverlayClick={true}
          team={selectedTeam}
        />
      )}

      {deleteTeam && selectedTeam && (
        <DeleteTeamModal
          isOpen={deleteTeam}
          onClose={() => setDeleteTeam(false)}
          shouldCloseOnOverlayClick={true}
          team={selectedTeam}
        />
      )}
      {addNewTeamMember && selectedTeam && (
        <AddNewMemberModal
          isOpen={addNewTeamMember}
          onClose={() => setAddNewTeamMember(false)}
          shouldCloseOnOverlayClick={true}
          team={selectedTeam}
          onAfterClose={() => setTeamId(0)}
        />
      )} */}
    </>
  );
};
