import DeleteTeamModal from "core/components/modals/edit-team-modal/delete-team-modal/delete-team-modal";
import EditTeamModal from "core/components/modals/edit-team-modal/edit-team-modal";
import "core/components/modals/share-file-modal/_share-popup.scss";
import TeamUserListModal from "core/components/modals/team-user-list-model/team-user-list.modal";
import { useAppDispatch, useAppSelector } from "core/hook";
import { LS_TEAM, LS_TEAM_FILES_FOLDERS_ROUTE } from "core/utils/constant";
import { useAuthorityCheck } from "core/utils/use-authority-check.hook";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import AddNewMemberModal from "pages/manage-members/components/add-new-member-modal";
import { TeamListType } from "pages/manage-team/team.model";
import { clearTeamList, fetchTeamList, setTeamListPageCount } from "pages/manage-team/team.redux";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_ADMIN, ROUTE_TEAM_FILES, USER_AUTHORITY } from "src/const";
import { EmptyComponent } from "../user-dashboard/empty-component/empty-component";

export const TeamsFoldersList = () => {
  const {
    teamList = [],
    teamListPageCount = 1,
    totalTeamCount = 0,
    isTeamsLoading: isLoading,
  } = useAppSelector((state) => state.team);
  const isSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const isAdmin = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_ADMIN,
  ]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const [auth] = useLocalStorage<AuthResponse>("auth");
  const [activeOption, setActiveOption] = useState(-1);
  const [deleteTeam, setDeleteTeam] = useState(false);
  const [addNewTeamMember, setAddNewTeamMember] = useState(false);
  const [paginationData, setPaginationData] = useState({
    totalItems: totalTeamCount,
    currentPage: teamListPageCount || 1,
    itemsPerPage: 50,
  });
  const [selectedTeam, setSlectedTeam] = useState();
  const [editTeam, setEditTeam] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [teamUserList, setTeamUserList] = useState(false);
  const [teamId, setTeamId] = useState(0);
  const [lsTeamData] = useLocalStorage<TeamListType>(LS_TEAM);
  const { itemsPerPage } = paginationData;
  const totalCount = totalTeamCount;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  // const handleUserProfile = (data: number) => {
  //   const authData = localStorage.getItem("auth");
  //   let UserCheck, buttonAction;
  //   if (authData) {
  //     const parsedAuthData = JSON.parse(authData);
  //     if (parsedAuthData.profileId === data) {
  //       UserCheck = true;
  //       buttonAction = true;
  //       navigate("/admin/settings", {
  //         state: { showData: UserCheck, buttonAction },
  //       });
  //     } else {
  //       UserCheck = !!roleSuperAdmin;
  //       buttonAction = false;
  //       navigate("/admin/settings", {
  //         state: { showData: UserCheck, buttonAction, profileId: data },
  //       });
  //     }
  //   }
  // };

  // const getSharedWithUser = (user: {
  //   isAdmin: number;
  //   id: number;
  //   userName: string;
  //   logoUrl: string;
  // }) => {
  //   return (
  //     <li key={user.id} onClick={() => handleUserProfile(user.id)}>
  //       <div
  //         className="ic-member tool-tip-wrap"
  //         style={{
  //           backgroundColor:
  //             user?.logoUrl === "" ? getUsernameColor(user.userName) || "" : "initial",
  //         }}
  //       >
  //         {user?.logoUrl !== "" ? <img src={user.logoUrl} /> : `${getShortUsername(user.userName)}`}
  //         <div className="tool-tip-card rounded-6">
  //           <div className="block font-bold">{user.userName}</div>
  //           {user.isAdmin === 1 ? "Admin" : "User"}
  //         </div>
  //       </div>
  //     </li>
  //   );
  // };

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
      dispatch(setTeamListPageCount(newPage));
      dispatch(fetchTeamList({ page: newPage }));
    }
  };
  const handleAddNewMember = (e: any, team: any) => {
    e.stopPropagation();
    setSlectedTeam(team);
    setActiveOption(-1);
    setAddNewTeamMember(true);
  };
  const openTeamUserListModal = (e: any, teamId: number) => {
    e.stopPropagation();
    setTeamId(teamId);
    setActiveOption(-1);
    setTeamUserList(true);
  };

  const handleDeleteTeam = (e: any, team: any) => {
    e.stopPropagation();
    setActiveOption(-1);
    setDeleteTeam(true);
    setSlectedTeam(team);
  };

  const handleEditTeam = (e: any, team: any) => {
    e.stopPropagation();
    setActiveOption(-1);
    setEditTeam(true);
    setSlectedTeam(team);
  };

  const closeTeamUserListModal = () => {
    setTeamUserList(false);
  };
  useEffect(() => {
    if (isAdmin) {
      // setIsLoading(false);
      dispatch(fetchTeamList({ mergeResponse: true }));
    }
    // setPaginationData({ ...paginationData, currentPage: totalTeamCount });
    return () => {
      dispatch(clearTeamList());
    };
  }, [isAdmin]);

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: totalTeamCount,
    });
  }, [totalTeamCount]);

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveOption(-1);
    });
    // checkTeamData();
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {teamList.length > 0 ? (
          <section className="mb-5">
            <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
              teams
            </h2>
            <div className="folder-sec">
              {teamList.map((team) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
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
                              {(isSuperAdmin || team.isAdmin) && (
                                <li onClick={(e) => handleAddNewMember(e, team)}>Add New Member</li>
                              )}
                              {team.isAdmin === 1 && (
                                <>
                                  <li onClick={(e) => openTeamUserListModal(e, team.id)}>
                                    Add/View Team Members
                                  </li>
                                  <li onClick={(e) => handleEditTeam(e, team)}>
                                    Edit Team name and description
                                  </li>
                                  <li
                                    onClick={(e) => {
                                      handleDeleteTeam(e, team);
                                    }}
                                  >
                                    Delete
                                  </li>
                                </>
                              )}
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
                {paginationData.currentPage === totalPages ? null : totalPages > 0 ? (
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
        ) : (
          <EmptyComponent
            messageTwo={isAdmin ? "Please create a new team." : ""}
            messageOne={"You haven't created a team yet."}
            text={"Teams"}
          />
        )}
      </AnimatePresence>

      {teamUserList && (
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
      )}
    </>
  );
};
