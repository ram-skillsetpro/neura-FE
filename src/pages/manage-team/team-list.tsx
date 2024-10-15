import NoTeamIcon from "assets/icons/icon-shared-inactive.svg";
import { CreateTeamType, TeamListType as TeamType } from "pages/manage-team/team.model";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ROUTE_ADMIN,
  ROUTE_MANAGE_TEAMS,
  ROUTE_TEAM_FILES,
  TOAST,
  USER_AUTHORITY,
} from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import DeleteTeamModal from "src/core/components/modals/edit-team-modal/delete-team-modal/delete-team-modal";
import EditTeamModal from "src/core/components/modals/edit-team-modal/edit-team-modal";
import TeamUserListModal from "src/core/components/modals/team-user-list-model/team-user-list.modal";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { Toaster } from "src/core/models/toaster.model";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import {
  clearCreateTeamResponse,
  createTeam,
  fetchTeamList,
  setTeamListPageCount,
  teamReducer,
} from "./team.redux";
import "./team.scss";

interface TeamListType {}

const TeamList: React.FC<TeamListType> = () => {
  const dispatch = useAppDispatch();
  const navigateTo = useNavigate();

  const colors = ["#f6744b", "#4f4f4f", "#ffa533", "#f26c6c", "#60a563"];

  const [addTeam, setAddTeam] = useState(false);
  const [editTeam, setEditTeam] = useState(false);
  const [deleteTeam, setDeleteTeam] = useState(false);
  const [teamForm, setTeamForm] = useState<CreateTeamType>({
    teamName: "",
    teamDescription: "",
  });
  const [rows, setRows] = useState<Array<any>>([]);
  const [activeOption, setActiveOption] = useState(-1);
  const [teamUserList, setTeamUserList] = useState(false);
  const [teamId, setTeamId] = useState(0);
  const [selectedTeam, setSlectedTeam] = useState();

  const teamNameRef = useRef<HTMLInputElement | null>(null);

  const {
    teamList = [],
    createTeamResponseStatus,
    totalTeamCount = 0,
    teamListPageCount = 1,
    isLoading,
    errorMessage,
  } = useAppSelector((state) => state.team);

  const isAdmin = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_ADMIN,
  ]);

  const isSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);

  const openTeamUserListModal = (e: any, teamId: number) => {
    e.stopPropagation();
    setTeamId(teamId);
    setActiveOption(-1);
    setTeamUserList(true);
  };

  const closeTeamUserListModal = () => {
    setTeamUserList(false);
  };

  const handleCreateTeam = () => {
    if (teamForm.teamName.trim()) {
      const { teamName, teamDescription } = teamForm;
      dispatch(createTeam({ teamName, teamDescription }));
      return;
    }

    teamNameRef.current && teamNameRef.current.focus();
  };

  const handleDeleteTeam = (e: any, team: any) => {
    e.stopPropagation();
    setActiveOption(-1);
    setDeleteTeam(true);
    setSlectedTeam(team);
  };

  const columns = [
    {
      key: "fileSelector",
      label: (
        <div className="file-item-selector">
          <input type="checkbox" />
        </div>
      ),
      isSorting: false,
    },
    {
      key: "teamName",
      label: <div>Team Name</div>,
      isSorting: false,
    },
    { key: "creator", label: "Creator", isSorting: false },
    { key: "people", label: "People", isSorting: true },
    { key: "action", label: "Action", isSorting: false },
  ];

  const handleEditTeam = (e: any, team: any) => {
    e.stopPropagation();
    setActiveOption(-1);
    setEditTeam(true);
    setSlectedTeam(team);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveOption(-1);
    });
    checkTeamData();
  }, []);

  const teamDataString = localStorage.getItem("team");
  const checkTeamData = () => {
    if (teamDataString) {
      const teamData: TeamType = JSON.parse(teamDataString);
      // dispatch(getTeamFilesFoldersList(teamData.id));
      navigateTo(`/${ROUTE_ADMIN}/${ROUTE_TEAM_FILES}`, { state: { teamData } });
    }
  };

  const dataGenerator = (data: any, index: number) => {
    return {
      fileSelector: (
        <div className="file-item-selector">
          <input type="checkbox" />
        </div>
      ),
      teamName: (
        <div className="team-name">
          <div className="file-item-icon">
            <p>
              <span style={{ backgroundColor: colors[index % 5] }} className="icon team"></span>
            </p>
          </div>
          <div onClick={() => handleCellClick(data)}>{data.teamName}</div>
        </div>
      ),
      creator: data.firstName,
      people: data.totalUser,
      action: (
        <div className="file-item-controls option-width">
          <div
            className="icon control has-dropdown"
            onClick={(e) => {
              e.stopPropagation();
              setActiveOption(data.id);
            }}
          >
            <div
              className="dropdown-list medium"
              style={{ display: activeOption === data.id ? "block" : "none" }}
            >
              <ul>
                {(isSuperAdmin || data.isAdmin) && (
                  <li onClick={() => navigateTo("/admin/manage-members?action=add-new-member")}>
                    <a>Add New Member</a>
                  </li>
                )}
                {data.isAdmin === 1 && (
                  <>
                    <li onClick={(e) => openTeamUserListModal(e, data.id)}>
                      <a>Add/View Team Members</a>
                    </li>
                    <li onClick={(e) => handleEditTeam(e, data)}>
                      <a>Edit Team name and description</a>
                    </li>
                    <li
                      onClick={(e) => {
                        handleDeleteTeam(e, data);
                      }}
                    >
                      <a>Delete</a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      ),
    };
  };

  useEffect(() => {
    setRows(teamList.map((data, index) => dataGenerator(data, index)));
  }, [teamList, activeOption]);

  useEffect(() => {
    if (createTeamResponseStatus === 200) {
      setTeamForm({ teamName: "", teamDescription: "" });
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "success",
            message: "Team created successfully",
          },
        }),
      );
      dispatch(clearCreateTeamResponse());
    }

    return () => {
      dispatch(clearCreateTeamResponse());
    };
  }, [createTeamResponseStatus]);

  const [paginationData, setPaginationData] = useState({
    totalItems: 0,
    currentPage: teamListPageCount || 1,
    itemsPerPage: 10,
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalTeamCount && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      dispatch(setTeamListPageCount(newPage));
    }
  };

  useEffect(() => {
    setPaginationData({ ...paginationData, totalItems: totalTeamCount as number });
  }, [totalTeamCount, teamList]);

  useEffect(() => {
    isAdmin && dispatch(fetchTeamList({ page: teamListPageCount || 1 }));
    setPaginationData({ ...paginationData, currentPage: teamListPageCount });
  }, [teamListPageCount, isAdmin]);

  useEffect(() => {
    if (errorMessage && errorMessage !== "") {
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "error",
            message: errorMessage,
          },
        }),
      );
    }
  }, [errorMessage]);

  const handleCellClick = (team: TeamType) => {
    localStorage.setItem("team", JSON.stringify(team));
    navigateTo(`/${ROUTE_ADMIN}/${ROUTE_TEAM_FILES}`, { state: { team } });
  };

  const goToManageTeams = () => {
    navigateTo(`/${ROUTE_ADMIN}/${ROUTE_MANAGE_TEAMS}`);
    localStorage.removeItem("route");
    localStorage.removeItem("team");
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="dashboard-viewer">
        <div className="dashboard-viewer-wrapper">
          <div className="files-container">
            <div className="scroller">
              <div className="files-container-list ">
                <div className="wrapper nobg list-controls">
                  <div className="breadcrumb">
                    <ul className="" id="breadcrumb-collapse">
                      <li className="open">
                        <a onClick={goToManageTeams}>Manage teams</a>
                      </li>
                    </ul>
                  </div>
                  {isSuperAdmin && (
                    <div className="list-meta">
                      <p>
                        {addTeam ? (
                          <a className="button button-red" onClick={() => setAddTeam(false)}>
                            Close
                          </a>
                        ) : (
                          <a className="button button-red" onClick={() => setAddTeam(true)}>
                            Add New Team
                          </a>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`files-container-list ${addTeam ? "add-team-show" : "add-team-hide"}`}
                id="addteam"
              >
                <div className="wrapper nobg">
                  <h3>Add a Team</h3>
                </div>
                <div className="wrapper">
                  <div className="file-item header-row">
                    <div className="file-item-form">
                      <p>
                        <input
                          ref={teamNameRef}
                          value={teamForm.teamName}
                          onChange={(e) =>
                            setTeamForm((prevState) => ({ ...prevState, teamName: e.target.value }))
                          }
                          type="text"
                          className="inline-list inline-list-custom"
                          placeholder="New Team Name"
                        />
                        <input
                          value={teamForm.teamDescription}
                          onChange={(e) =>
                            setTeamForm((prevState) => ({
                              ...prevState,
                              teamDescription: e.target.value,
                            }))
                          }
                          type="text"
                          className="inline-list inline-list-custom"
                          placeholder="Short Description"
                        />
                        <input
                          onClick={handleCreateTeam}
                          type="button"
                          defaultValue="Add"
                          className="add-btn w-fix"
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="files-container-list">
                {totalTeamCount > 0 ? (
                  <>
                    <div className="wrapper nobg">
                      <h3>Active Teams</h3>
                      <p className="meta">{totalTeamCount} Teams</p>
                    </div>
                    <DataTable
                      columns={columns}
                      data={rows}
                      className="team-table"
                      enablePagination={paginationData.totalItems > 10}
                      enableSorting={true}
                      paginationData={paginationData}
                      onPageChange={handlePageChange}
                    />
                  </>
                ) : (
                  <div className="no-message">
                    <img src={NoTeamIcon} alt="SharedFileIcon" style={{ height: "100px" }} />
                    <h4 style={{ marginBottom: "10px" }}>No Team Shared</h4>
                    <p style={{ margin: "0" }}>Team Shared with You will be visible here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {teamUserList && (
        <TeamUserListModal
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
    </>
  );
};

export default TeamList;

export const reducer = {
  team: teamReducer,
};
