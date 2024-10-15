import React, { useEffect, useState } from "react";
import { TOAST } from "src/const";
import AppModal from "src/core/components/modals/app-modal";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { Toaster } from "src/core/models/toaster.model";
import { getShortUsername, getUsernameColor } from "src/core/utils";
import { TeamProfileType } from "src/pages/manage-team/team.model";
import {
  clearTeamUserList,
  clearUpdateTeamUserResponse,
  fetchAllUserList,
  fetchTeamUserList,
  updateTeamUser,
} from "src/pages/manage-team/team.redux";
import { AppModalType } from "../app-modal.model";
import "./team-user-list-modal.scss";

interface TeamUserListModalType extends AppModalType {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  onAfterClose: () => void;
}

const TeamUserListModal: React.FC<TeamUserListModalType> = ({
  isOpen,
  onClose,
  teamId,
  onAfterClose,
  shouldCloseOnOverlayClick,
}) => {
  const dispatch = useAppDispatch();

  const { allActiveUserList, teamUserList, teamUserResponse } = useAppSelector(
    (state) => state.team,
  );

  const [admin, setAdmin] = useState(0);
  const [selectedTeamUser, setSelectedTeamUser] = useState<Array<number>>([]);
  const [currentSelectedTeamUser, setCurrentSelectedTeamUser] = useState<Array<number>>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [checkAllUsers, setCheckAllUsers] = useState(false);

  const selectTeamUser = (id: number, forceSelect: boolean = false) => {
    if (selectedTeamUser.includes(id)) {
      !forceSelect &&
        id !== admin &&
        setSelectedTeamUser(selectedTeamUser.filter((data) => data !== id));
    } else {
      setSelectedTeamUser([...selectedTeamUser, id]);
    }

    if (currentSelectedTeamUser.includes(id)) {
      setCurrentSelectedTeamUser(currentSelectedTeamUser.filter((data) => data !== id));
    } else {
      setCurrentSelectedTeamUser([...currentSelectedTeamUser, id]);
    }
  };

  const handleAddUsers = () => {
    const payload: {
      teamId: number;
      teamProfiles: Array<TeamProfileType>;
    } = {
      teamId,
      teamProfiles: [],
    };
    selectedTeamUser.forEach((data) => {
      payload.teamProfiles.push({ isTeamAdmin: admin === data ? 1 : 0, profileId: data });
    });

    dispatch(updateTeamUser(payload));
  };

  useEffect(() => {
    if (teamId) {
      dispatch(fetchAllUserList());
      dispatch(fetchTeamUserList({ teamId }));
    }

    return () => {
      dispatch(clearTeamUserList());
      setAdmin(0);
    };
  }, [teamId]);

  useEffect(() => {
    if (checkAllUsers) {
      const selectedUsers = allActiveUserList.map((data) => {
        return data.id;
      });
      setSelectedTeamUser(selectedUsers);
    } else {
      setSelectedTeamUser(admin ? [admin] : []);
    }
  }, [checkAllUsers]);

  useEffect(() => {
    const selectedUsers = teamUserList.map((data) => {
      return data.id;
    });
    setSelectedTeamUser(selectedUsers);

    teamUserList.forEach((data) => {
      if (data.profileAdminStatus) {
        setAdmin(data.id);
      }
    });
  }, [teamUserList]);

  useEffect(() => {
    if (teamUserResponse === 200) {
      dispatch(clearUpdateTeamUserResponse());
      onClose();
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "success",
            message: "Team member updated successfully",
          },
        }),
      );
    }
  }, [teamUserResponse]);

  return (
    <AppModal
      isOpen={isOpen}
      onAfterClose={onAfterClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      onClose={onClose}
    >
      <div className="share-outer-wrap">
        {/* share-inner div start below */}
        <div className="share-inner">
          {/* User list info section start here */}
          <div className="fs14 font-bold mb-5 text-body">Manage team members</div>
          <div className="w-full">
            {teamUserList.length > 0 ? (
              <div className="share-user-info">
                This team is also shared with{" "}
                <span className="font-bold">{teamUserList.length} users</span>
              </div>
            ) : (
              ""
            )}
            <div className="shared-user-list shared-user-list-scroll">
              <ul>
                {Array.isArray(allActiveUserList) && allActiveUserList.length > 0 ? (
                  allActiveUserList.map((data, index) => (
                    <li key={index}>
                      <div className="flex items-center">
                        <div className="flex items-center fs12">
                          <div
                            className="share-user-img rounded-full"
                            style={{ background: getUsernameColor(data.userName) || "" }}
                          >
                            {getShortUsername(data.userName)}
                          </div>
                          {data.userName} ({data.emailId})
                        </div>
                        <span className="grow" />
                        <div className="mr-10 admin-checkbox">
                          <input
                            title="Select for admin"
                            value={admin === data.id ? 1 : 0}
                            checked={admin === data.id}
                            onChange={() => {
                              selectTeamUser(data.id, true);
                              setAdmin(data.id);
                            }}
                            type="checkbox"
                          />
                        </div>
                        <div>
                          {selectedTeamUser.includes(data.id) ? (
                            <button
                              style={{
                                width: "88px",
                                justifyContent: "center",
                                background: `${data.id === admin ? "#80AB88" : ""}`,
                              }}
                              className="remove-button uppercase tracking-wider"
                              onClick={() => selectTeamUser(data.id)}
                            >
                              {data.id === admin ? "admin" : "remove"}
                            </button>
                          ) : (
                            <button
                              className="remove-button uppercase tracking-wider"
                              style={{
                                background: "#ff6868",
                                width: "88px",
                                justifyContent: "center",
                              }}
                              onClick={() => selectTeamUser(data.id)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="loader-box">Loading users list...</div>
                )}
              </ul>
            </div>
            <div className="flex justify-end pt-3">
              <button className="remove-button uppercase tracking-wider mr-3" onClick={onClose}>
                Cancel
              </button>
              {currentSelectedTeamUser.length > 0 ? (
                <button className="green-button uppercase tracking-wider" onClick={handleAddUsers}>
                  Save
                </button>
              ) : (
                <button className="green-button uppercase tracking-wider">Save</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default TeamUserListModal;
