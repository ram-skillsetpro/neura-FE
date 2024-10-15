import { Link, useLocation } from "react-router-dom";
import {
  ROUTE_CONTRACT_LIST,
  ROUTE_DASHBOARD,
  ROUTE_PLAYBOOK,
  ROUTE_PRE_DRAFTS,
  ROUTE_PRE_MY_TEMPLATE,
  // ROUTE_MANAGE_MEMBERS,
  // ROUTE_MANAGE_TEAMS,
  ROUTE_SHAREDWITHME_VIEW,
  ROUTE_TEAMS_DRIVE,
  ROUTE_TEAM_FILES,
  ROUTE_TRASH,
  ROUTE_USER_DASHBOARD,
  SMART_VIEW,
  UPLOAD_AND_SIGN_LIST,
  USER_AUTHORITY,
} from "src/const";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import "./left-sidebar.scss";

export function LeftSidebar() {
  const location = useLocation();
  // const reportsAuthorityCheck = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const isRolePreContract = useAuthorityCheck([
    USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR,
    USER_AUTHORITY.ROLE_PRE_CONTRACT_EDITOR,
    USER_AUTHORITY.ROLE_PRE_CONTRACT_REVIEWER,
    USER_AUTHORITY.ROLE_PRE_CONTRACT_APPROVER,
    USER_AUTHORITY.ROLE_PRE_CONTRACT_SIGNATURE,
  ]);
  // const ManageMembersCheck = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN]);
  const SharedWithMeCheck = useAuthorityCheck([
    USER_AUTHORITY.COMPANY_SUPER_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_ADMIN,
    USER_AUTHORITY.COMPANY_TEAM_USER,
  ]);
  // const CreateAlert = useAuthorityCheck([USER_AUTHORITY.COMPANY_SUPER_ADMIN, USER_AUTHORITY.ALERT]);

  const smartViewAuthorityCheck = useAuthorityCheck([USER_AUTHORITY.SMART_FOLDER_USER]);
  const playBookAuthorityCheck = useAuthorityCheck([USER_AUTHORITY.PB_CREATE]);
  const isUploadSignRole = useAuthorityCheck([
    USER_AUTHORITY.UPLOAD_SIGN,
    USER_AUTHORITY.UPLOAD_SIGN_SIGNATORY,
  ]);

  const sidebarItems = [
    {
      label: "Teams Drive",
      route: ROUTE_TEAMS_DRIVE,
      // icon: "my-contracts",
      isReleased: true,
      roleAuthorityCheck: true,
    },
    {
      label: "Dashboard",
      route: ROUTE_DASHBOARD,
      // icon: "my-contracts",
      isReleased: true,
      roleAuthorityCheck: true,
    },
    {
      label: "My Drive",
      route: ROUTE_USER_DASHBOARD,
      // icon: "my-contracts",
      isReleased: true,
      roleAuthorityCheck: true,
    },
    {
      label: "Shared with me",
      route: ROUTE_SHAREDWITHME_VIEW,
      // icon: "shared",
      isReleased: true,
      roleAuthorityCheck: SharedWithMeCheck,
    },
    // {
    //   label: "Team Drive",
    //   route: ROUTE_MANAGE_TEAMS,
    //   icon: "organisation",
    //   isReleased: false,
    //   roleAuthorityCheck: true,
    // },
    // {
    //   label: "Manage Members",
    //   route: ROUTE_MANAGE_MEMBERS,
    //   icon: "team-members",
    //   isReleased: false,
    //   roleAuthorityCheck: ManageMembersCheck,
    // },
    // {
    //   label: "Alerts",
    //   route: "alerts-view",
    //   icon: "my-contracts",
    //   isReleased: false,
    //   roleAuthorityCheck: true,
    // },
    {
      label: "Reports",
      route: ROUTE_CONTRACT_LIST,
      icon: "my-contracts",
      isReleased: true,
      roleAuthorityCheck: true,
    },
    {
      label: "Smart View",
      route: SMART_VIEW,
      // icon: "trash",
      isReleased: true,
      roleAuthorityCheck: smartViewAuthorityCheck,
    },
    {
      label: "PlayBook",
      route: ROUTE_PLAYBOOK,
      // icon: "trash",
      isReleased: true,
      roleAuthorityCheck: playBookAuthorityCheck,
    },
    // {
    //   label: "Starred",
    //   route: "/starred",
    //   // icon: "archived",
    //   isReleased: false,
    //   roleAuthorityCheck: true,
    // },
  ];

  const sidebarItemsPreDashboard = [
    {
      label: "Drafts",
      route: ROUTE_PRE_DRAFTS,
      // icon: "my-contracts",
      isReleased: true,
      roleAuthorityCheck: isRolePreContract,
    },
    {
      label: "Upload & Sign",
      route: UPLOAD_AND_SIGN_LIST,
      // icon: "my-contracts",
      isReleased: true,
      roleAuthorityCheck: isUploadSignRole,
    },
    {
      label: "Templates",
      route: ROUTE_PRE_MY_TEMPLATE,
      isReleased: true,
      roleAuthorityCheck: isRolePreContract,
    },
  ];

  const sidebarTrashItems = [
    {
      label: "Trash",
      route: ROUTE_TRASH,
      // icon: "trash",
      isReleased: true,
      roleAuthorityCheck: true,
    },
  ];

  return (
    <aside className="aside-bar-menu">
      <div className="navigation-sec">
        <div className="sidebar-menu-sec">
          <div className="navigation-vertical">
            <ul>
              {sidebarItems.map((item) => {
                if (!item.roleAuthorityCheck) {
                  return null;
                } else {
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.route}
                        className={`${
                          location.pathname.includes(item.route) ||
                          (location.pathname.includes(ROUTE_TEAM_FILES) &&
                            item.route === ROUTE_TEAMS_DRIVE)
                            ? "active"
                            : "inactive"
                        }`}
                        style={{ cursor: !item.isReleased ? "not-allowed" : "pointer" }}
                        // onClick={
                        //   item.route === ROUTE_USER_DASHBOARD
                        //     ? () => handleDashboardClick()
                        //     : undefined
                        // }
                      >
                        {item.label}
                        {!item.isReleased && (
                          <span
                            // style={{
                            //   fontSize: "12px",
                            //   opacity: 0.5,
                            //   marginLeft: "10px",
                            //   color: "black",
                            // }}
                            className="coming-soon"
                          >
                            Coming Soon
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
          </div>
          <div className="navigation-vertical">
            <ul>
              {sidebarItemsPreDashboard.map((item) => {
                if (!item.roleAuthorityCheck) {
                  return null;
                } else {
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.route}
                        className={`${
                          location.pathname.includes(item.route) ? "active" : "inactive"
                        }`}
                        style={{ cursor: !item.isReleased ? "not-allowed" : "pointer" }}
                      >
                        {item.label}
                        {!item.isReleased && (
                          <span
                            // style={{
                            //   fontSize: "12px",
                            //   opacity: 0.5,
                            //   marginLeft: "10px",
                            //   color: "black",
                            // }}
                            className="coming-soon"
                          >
                            Coming Soon
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
          </div>
          <div className="navigation-vertical">
            <ul>
              {sidebarTrashItems.map((item) => {
                if (!item.roleAuthorityCheck) {
                  return null;
                } else {
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.route}
                        className={`${
                          location.pathname.includes(item.route) ? "active" : "inactive"
                        }`}
                        style={{ cursor: !item.isReleased ? "not-allowed" : "pointer" }}
                      >
                        {item.label}
                        {!item.isReleased && (
                          <span
                            // style={{
                            //   fontSize: "12px",
                            //   opacity: 0.5,
                            //   marginLeft: "10px",
                            //   color: "black",
                            // }}
                            className="coming-soon"
                          >
                            Coming Soon
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
