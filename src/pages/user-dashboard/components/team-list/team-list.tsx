import { LS_TEAM, LS_TEAM_FILES_FOLDERS_ROUTE, sharedUsersCount } from "core/utils/constant";
import useLocalStorage from "core/utils/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import AddNewMemberModal from "pages/manage-members/components/add-new-member-modal";
import { TeamListType, TeamListType as TeamType } from "pages/manage-team/team.model";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ROUTE_ADMIN, ROUTE_TEAM_FILES, USER_AUTHORITY } from "src/const";
import DeleteTeamModal from "src/core/components/modals/edit-team-modal/delete-team-modal/delete-team-modal";
import EditTeamModal from "src/core/components/modals/edit-team-modal/edit-team-modal";
import TeamUserListModal from "src/core/components/modals/team-user-list-model/team-user-list.modal";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { getShortUsername, getUsernameColor } from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import {
  clearTeamList,
  fetchTeamList,
  setTeamListPageCount,
} from "src/pages/manage-team/team.redux";
import "./team-list.scss";

const TeamList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const colors = ["#f6744b", "#4f4f4f", "#ffa533", "#f26c6c", "#60a563"];

  const isAdmin = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_ADMIN,
  ]);
  const isSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const itemIds = rows.map((item) => item.id);
      setSelectedItems(itemIds);
    }
    setSelectAll((prevSelectAll) => !prevSelectAll);
  };

  const columns = [
    {
      key: "fileSelector",
      label: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            onClick={(event) => event.stopPropagation()}
          />
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
    {
      key: "action",
      label: (
        <div className="file-list-action">
          <span className="file-action">Action</span>
        </div>
      ),
      isSorting: false,
    },
  ];

  const {
    teamList = [],
    teamListPageCount = 1,
    totalTeamCount = 0,
    isLoading,
  } = useAppSelector((state) => state.team);

  const [rows, setRows] = useState<Array<any>>([]);
  const [activeOption, setActiveOption] = useState(-1);
  const [deleteTeam, setDeleteTeam] = useState(false);
  const [addNewTeamMember, setAddNewTeamMember] = useState(false);
  const [paginationData, setPaginationData] = useState({
    totalItems: totalTeamCount,
    currentPage: teamListPageCount || 1,
    itemsPerPage: 10,
  });
  const [selectedTeam, setSlectedTeam] = useState();
  const [editTeam, setEditTeam] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [teamUserList, setTeamUserList] = useState(false);
  const [teamId, setTeamId] = useState(0);
  const [lsTeamData] = useLocalStorage<TeamListType>(LS_TEAM);

  const handleCellClick = (team: TeamType) => {
    if (lsTeamData?.id !== team.id) {
      localStorage.removeItem(LS_TEAM_FILES_FOLDERS_ROUTE);
      localStorage.setItem(LS_TEAM, JSON.stringify(team));
    }
    navigate(`/${ROUTE_ADMIN}/${ROUTE_TEAM_FILES}`, { state: { team } });
  };

  const { itemsPerPage } = paginationData;
  const totalCount = totalTeamCount;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const handleUserProfile = (data: number) => {
    const authData = localStorage.getItem("auth");
    let UserCheck, buttonAction;
    if (authData) {
      const parsedAuthData = JSON.parse(authData);
      if (parsedAuthData.profileId === data) {
        UserCheck = true;
        buttonAction = true;
        navigate("/admin/settings", {
          state: { showData: UserCheck, buttonAction },
        });
      } else {
        UserCheck = !!roleSuperAdmin;
        buttonAction = false;
        navigate("/admin/settings", {
          state: { showData: UserCheck, buttonAction, profileId: data },
        });
      }
    }
  };

  const getSharedWithUser = (user: {
    isAdmin: number;
    id: number;
    userName: string;
    logoUrl: string;
  }) => {
    return (
      <li key={user.id} onClick={() => handleUserProfile(user.id)}>
        <div
          className="ic-member tool-tip-wrap"
          style={{
            backgroundColor:
              user?.logoUrl === "" ? getUsernameColor(user.userName) || "" : "initial",
          }}
        >
          {user?.logoUrl !== "" ? <img src={user.logoUrl} /> : `${getShortUsername(user.userName)}`}
          <div className="tool-tip-card rounded-6">
            <div className="block font-bold">{user.userName}</div>
            {user.isAdmin === 1 ? "Admin" : "User"}
          </div>
        </div>
      </li>
    );
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  const dataGenerator = (data: any, index: number) => {
    return {
      id: data.id,
      fileSelector: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            onChange={() => toggleItemSelection(data.id)}
            onClick={(event) => event.stopPropagation()}
            checked={selectedItems?.includes(data.id)}
          />
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
      people: (
        <div className="file-list-shared fs12">
          <div className="flex">
            <div className="sharing-members li-overlap">
              <ul>
                {!Array.from(data.sharedWith || []).length && "-"}
                {data.sharedWith?.length <= sharedUsersCount
                  ? data?.sharedWith?.map((user: any) => getSharedWithUser(user))
                  : data?.sharedWith
                      ?.slice(0, sharedUsersCount)
                      .map((user: any) => getSharedWithUser(user))}
                {data.sharedWith?.length > sharedUsersCount && (
                  <li>
                    <div className="share-list-wrap">
                      <div className="shared-all">
                        +{data.sharedWith?.length - sharedUsersCount}
                      </div>
                      <div className="shared-all-list">
                        {data.sharedWith
                          ?.slice(-(data.sharedWith?.length - sharedUsersCount))
                          .map((user: any) => (
                            <div
                              className="shared-all-row fs11 font-bold items-center"
                              key={user.id}
                            >
                              <i className="u-img-size mr-4 rounded-full">
                                {user?.logoUrl !== "" ? (
                                  <img src={user.logoUrl} />
                                ) : (
                                  <div
                                    className="ic-member"
                                    style={{
                                      backgroundColor:
                                        user?.logoUrl === ""
                                          ? getUsernameColor(user.userName) || ""
                                          : "initial",
                                    }}
                                  >
                                    {user?.userName !== "" && getShortUsername(user.userName)}
                                  </div>
                                )}
                              </i>
                              <span className="truncate-line1">{user.userName}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ),
      action: (
        <>
          <div className="file-list-action">
            <button
              className="icon-option-dot"
              onClick={(e) => {
                e.stopPropagation();
                setActiveOption(data.id);
              }}
            ></button>
            <div
              className="dropdown-list medium"
              style={{ display: activeOption === data.id ? "block" : "none" }}
            >
              <ul>
                {(isSuperAdmin || data.isAdmin) && (
                  <li onClick={(e) => handleAddNewMember(e, data)}>
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
        </>
      ),
    };
  };

  const closeTeamUserListModal = () => {
    setTeamUserList(false);
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

  const openTeamUserListModal = (e: any, teamId: number) => {
    e.stopPropagation();
    setTeamId(teamId);
    setActiveOption(-1);
    setTeamUserList(true);
  };
  const handleAddNewMember = (e: any, team: any) => {
    e.stopPropagation();
    setSlectedTeam(team);
    setActiveOption(-1);
    setAddNewTeamMember(true);
  };

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      // setIsLoading(true);
      dispatch(setTeamListPageCount(newPage));
      dispatch(fetchTeamList({ page: newPage }));
    }
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
    setRows(teamList.map((data, index) => dataGenerator(data, index)));
  }, [activeOption, teamList, selectedItems]);

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveOption(-1);
    });
    // checkTeamData();
  }, []);

  return (
    <>
      {rows.length ? (
        <AnimatePresence mode="wait">
          <motion.div
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <section className="mb-5">
              <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
                Teams
              </h2>
              <DataTable
                className="file-list-card rounded-6 other-files-view team-list-1"
                data={rows}
                columns={columns}
                paginationData={paginationData}
                onPageChange={getCurrentPageNumber}
                enablePagination={true}
                isLoading={isLoading ?? false}
              />
            </section>
          </motion.div>
        </AnimatePresence>
      ) : (
        ""
      )}

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

export default TeamList;