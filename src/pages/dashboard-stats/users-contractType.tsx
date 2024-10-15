import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { USER_AUTHORITY } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { getShortUsername, getUsernameColor } from "src/core/utils";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import AddNewMemberModal from "../manage-members/components/add-new-user";
import {
  activateMember,
  clearMembersData,
  getAllMembers,
  getAllMembersPerpage,
} from "../manage-members/manage-members.redux";

const UserContractType: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const members = useAppSelector((state) => state.manageMembers.members);
  const currentPage = useAppSelector((state) => state.manageMembers.membersData.pgn);
  const totalItems = useAppSelector((state) => state.manageMembers.membersData.totct);
  const itemsPerPage = useAppSelector((state) => state.manageMembers.membersData.perpg);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const isLoading = useAppSelector((state) => state.manageMembers.isLoading);
  const roleSuperAdmin = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const { contractType } = useAppSelector((state) => state.dashboardStats);
  const [addNewTeamMember, setAddNewTeamMember] = useState(false);
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [createUser, setCreateUser] = useState(false);
  const createUserRef = useRef<HTMLDivElement | null>(null);

  const colors = ["#488FCE", "#3f2be2", "#812be2", "#c82be2", "#FF5733"];
  const widths = ["100%", "60%", "50%", "40%", "35%"];
  const handleToggleMember = async (id: number, status: number | undefined) => {
    const response = await dispatch(
      activateMember({ profileId: id, status: status === 0 ? 1 : 0 }),
    );
    if (response?.isSuccess) {
      await dispatch(getAllMembers());
    }
  };

  const handleLoadMore = (page: number) => {
    dispatch(getAllMembersPerpage(page));
  };

  useEffect(() => {
    dispatch(getAllMembersPerpage(1));
    return () => {
      dispatch(clearMembersData());
    };
  }, []);

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

  const getColor = (index: number, colorArray: string | any[]) => {
    return colorArray[index % colorArray.length];
  };

  const getWidth = (index: number, widthArray: string | any[]) => {
    return widthArray[index % widthArray.length];
  };

  const handleAddNewMember = (e: any) => {
    e.stopPropagation();
    setAddNewTeamMember(true);
  };

  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };
  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (createUserRef.current && !createUserRef.current.contains(event.target)) {
        setCreateUser(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <section className="relative mb-3">
        <div className="sec-row">
          <div className="col-50">
            <div className="flex h-full">
              <div className="inner-card w-full">
                <div>
                  <div className="flex mb-4">
                    <div className="card-info-title font-bold">Users</div>
                    <span className="grow"></span>
                    <div className="sorting-menu-modal relative mr-3">
                      <button
                        className="icon-option-dot cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCreateUser(true);
                        }}
                      ></button>
                      {createUser && (
                        <div
                          className="sorting-menu-card rounded-6 cursor-pointer"
                          ref={createUserRef}
                        >
                          <ul>
                            <li>
                              <div
                                className="truncate-line1"
                                onClick={(e) => handleAddNewMember(e)}
                              >
                                Create User
                              </div>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="dash-user-list">
                    <ul>
                      {members.map((member) => (
                        <li key={member.id}>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {member.userLogoUrl ? (
                                <i className="dash-user-img mr-3">
                                  <img src={member.userLogoUrl} className="rounded-full" />
                                </i>
                              ) : (
                                <div
                                  className="user-name rounded-full"
                                  style={{
                                    backgroundColor: member.userLogoUrl
                                      ? "initial"
                                      : getUsernameColor(member.userName) || "",
                                  }}
                                >
                                  {member.userName !== "" && getShortUsername(member.userName)}
                                </div>
                              )}
                              <div className="fs12">
                                <div className="mb-1">{member.userName}</div>
                                <div className="mb-1 text-light-color">{member.emailId}</div>
                                <div className="mb-1 text-light-color">
                                  {member.status === 1 ? "Active" : "Deactive"}
                                </div>
                              </div>
                            </div>
                            <span className="grow"></span>
                            <div className="fs10">
                              <div className="sorting-menu-modal relative">
                                <button
                                  className="icon-option-dot cursor-pointer"
                                  onClick={(e) => handleFileOption(e, member.id)}
                                ></button>
                                {activeFileOption === member.id && (
                                  <div className="sorting-menu-card rounded-6 cursor-pointer">
                                    <ul>
                                      <li>
                                        <div
                                          className="truncate-line1"
                                          key={member.id}
                                          onClick={() => handleUserProfile(member.id)}
                                        >
                                          View
                                        </div>
                                      </li>
                                      <li>
                                        <div
                                          className="truncate-line1"
                                          onClick={() =>
                                            handleToggleMember(member.id, member.status)
                                          }
                                        >
                                          {member.status === 1 ? "Deactivate" : "Activate"}
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-end mr-4">
                    <div className="simpleO-loader"></div>
                  </div>
                ) : currentPage === totalPages ? null : totalPages > 0 ? (
                  <div className="flex justify-end">
                    <div
                      className="dataTables_info"
                      id="myTable_info"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="mt-3 mb-2 flex justify-center">
                        <button
                          className={`load-more-btn paginate_button next ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                          onClick={() => handleLoadMore(currentPage + 1)}
                        >
                          Load Next
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="col-50">
            <div className="flex h-full">
              <div className="inner-card w-full">
                <div>
                  <div className="flex mb-4">
                    <div className="card-info-title font-bold">Contract By Type</div>
                    <span className="grow"></span>
                    <div className="fs10"></div>
                  </div>
                  <div className="relative dash-user-list">
                    {contractType &&
                      contractType?.length > 0 &&
                      [...contractType]
                        .sort((a, b) => b.count - a.count)
                        .map((contract, index) => (
                          <div className="contract-type-sec" key={index}>
                            <div className="flex items-center">
                              <div
                                className="contract-fill-box mr-3"
                                style={{ background: getColor(index, colors) }}
                              ></div>
                              {contract.name}
                            </div>
                            <span className="grow"></span>
                            <div className="fill-num-sec font-bold">
                              <div
                                className="contract-fill-num flex items-center justify-center rounded-6"
                                style={{
                                  width: getWidth(index, widths),
                                  background: getColor(index, colors),
                                }}
                              >
                                {contract.count}
                              </div>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {addNewTeamMember && (
        <AddNewMemberModal
          isOpen={addNewTeamMember}
          onClose={() => setAddNewTeamMember(false)}
          shouldCloseOnOverlayClick={true}
        />
      )}
    </>
  );
};

export default UserContractType;
