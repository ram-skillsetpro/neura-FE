import {
  ACTIVITY_LOG,
  ADMIN_SETTINGS,
  PRE_CONTRACT,
  PRE_TEMPLATE,
  ROUTE_404,
  ROUTE_500,
  ROUTE_ACTIVITY_TRACKER,
  ROUTE_ALERTS_CREATE,
  ROUTE_ALERTS_VIEW,
  ROUTE_CONTRACT_LIST,
  ROUTE_CONTRACT_VIEW,
  ROUTE_CREATE_PLAYBOOK,
  ROUTE_DASHBOARD,
  ROUTE_HOME,
  ROUTE_MANAGE_MEMBERS,
  ROUTE_OBLIGATION,
  ROUTE_OPEN_GLOBAL_PLAYBOOK,
  ROUTE_OPEN_NONEDITABLE_PLAYBOOK,
  ROUTE_OPEN_PLAYBOOK,
  ROUTE_PLAYBOOK,
  ROUTE_PRE_DRAFTS,
  ROUTE_PRE_MY_TEMPLATE,
  ROUTE_RECENT_CONTRACT,
  ROUTE_SHAREDWITHME_VIEW,
  ROUTE_TEAMS_DRIVE,
  ROUTE_TEAM_FILES,
  ROUTE_TEAM_LIST,
  ROUTE_TRASH,
  ROUTE_USER_DASHBOARD,
  ROUTE_VIEW_CONTRACT_SNIPPET,
  ROUTE_VIEW_SHARED_CONTRACT,
  SEARCH_RESULTS,
  SMART_VIEW,
  UPLOAD_AND_SIGN,
  UPLOAD_AND_SIGN_LIST,
} from "./const";
import { IRoute } from "./core/models/route.model";

/**
 * React routes of all pages.\
 * Always define webpackChunkName for import. This chunk name will use while creating build. This
 * will help developers to debug in production.
 */
export const Routes: IRoute[] = [
  {
    path: "admin",
    component: () =>
      import(/* webpackChunkName: "admin-layout" */ "src/layouts/admin/admin-layout"),
    private: true,
    children: [
      {
        path: UPLOAD_AND_SIGN,
        component: () =>
          import(
            /* webpackChunkName: "smart-view" */ "pages/user-dashboard/components/upload-and-sign/upload-and-sign"
          ),
      },
      {
        path: UPLOAD_AND_SIGN_LIST,
        component: () =>
          import(
            /* webpackChunkName: "pre-dashboard-container" */ "pages/pre-dashboard/upload-and-sign-container"
          ),
      },
      {
        path: SMART_VIEW,
        component: () => import(/* webpackChunkName: "smart-view" */ "pages/smart-view/smart-view"),
      },
      {
        path: ROUTE_PLAYBOOK,
        component: () =>
          import(/* webpackChunkName: "dashboard-container" */ "pages/playbook/playbook-container"),
      },
      {
        path: ROUTE_CREATE_PLAYBOOK,
        component: () =>
          import(
            /* webpackChunkName: "dashboard-container" */ "pages/playbook/components/create-playbook"
          ),
      },
      {
        path: ROUTE_OPEN_PLAYBOOK,
        component: () =>
          import(
            /* webpackChunkName: "dashboard-container" */ "pages/playbook/components/open-playbook "
          ),
      },
      {
        path: ROUTE_OPEN_GLOBAL_PLAYBOOK,
        component: () =>
          import(
            /* webpackChunkName: "dashboard-container" */ "pages/playbook/components/open-global-playbook"
          ),
      },
      {
        path: ROUTE_OPEN_NONEDITABLE_PLAYBOOK,
        component: () =>
          import(
            /* webpackChunkName: "dashboard-container" */ "pages/playbook/components/list-noneditable-playbook"
          ),
      },

      {
        path: ROUTE_USER_DASHBOARD,
        component: () =>
          import(
            /* webpackChunkName: "dashboard-container" */ "pages/user-dashboard/dashboard-container"
          ),
      },
      {
        path: ROUTE_RECENT_CONTRACT,
        component: () =>
          import(
            /* webpackChunkName: "dashboard-container" */ "pages/user-dashboard/components/my-files/recent-dashboard-contract-container"
          ),
      },
      {
        path: ROUTE_TEAMS_DRIVE,
        component: () =>
          import(/* webpackChunkName: "teams-drive" */ "pages/teams-drive/teams-drive-container"),
      },
      {
        path: ROUTE_PRE_MY_TEMPLATE,
        component: () =>
          import(
            /* webpackChunkName: "pre-dashboard-container" */ "pages/pre-dashboard/templates/templates-container"
          ),
      },
      {
        path: ROUTE_PRE_DRAFTS,
        component: () =>
          import(
            /* webpackChunkName: "pre-dashboard-container" */ "pages/pre-dashboard/drafts/drafts-container"
          ),
      },
      {
        path: ROUTE_CONTRACT_VIEW,
        component: () =>
          import(/* webpackChunkName: "contract-view" */ "src/pages/contract/contract-view"),
      },
      {
        path: ROUTE_CONTRACT_LIST,
        component: () =>
          import(
            /* webpackChunkName: "dashboard-container" */ "pages/contract-data-list/contract-data-list"
          ),
      },
      {
        path: SEARCH_RESULTS,
        component: () =>
          import(
            /* webpackChunkName: "search-list-card" */ "src/layouts/admin/components/admin-header/search-list-card"
          ),
      },
      {
        path: ROUTE_ALERTS_VIEW,
        component: () =>
          import(/* webpackChunkName: "alert-view" */ "pages/alerts/view/alerts-view"),
      },
      {
        path: ROUTE_ALERTS_CREATE,
        component: () =>
          import(/* webpackChunkName: "alert-view" */ "pages/alerts/create/alerts-create"),
      },
      {
        path: ROUTE_TEAM_LIST,
        component: () =>
          import(/* webpackChunkName: "team-list" */ "src/pages/manage-team/team-list"),
      },
      {
        path: ROUTE_TEAM_FILES,
        component: () =>
          import(/* webpackChunkName: "team-list" */ "pages/manage-team/team-files/team-dashboard"),
      },
      {
        path: ROUTE_SHAREDWITHME_VIEW,
        component: () =>
          import(
            /* webpackChunkName: "share-file" */ "pages/user-dashboard/sharedWithMe-container"
          ),
      },
      {
        path: ROUTE_TRASH,
        component: () => import(/* webpackChunkName: "share-file" */ "pages/trash/trash-container"),
      },
      {
        path: ROUTE_ACTIVITY_TRACKER,
        component: () =>
          import(
            /* webpackChunkName: "manage-members" */ "src/pages/activity-tracker/activity-tracker"
          ),
      },
      {
        path: ROUTE_MANAGE_MEMBERS,
        component: () =>
          import(/* webpackChunkName: "manage-members" */ "pages/manage-members/manage-members"),
      },
      {
        path: ADMIN_SETTINGS,
        component: () =>
          import(/* webpackChunkName: "admin-setting" */ "pages/admin-setting/admin-setting"),
      },
      {
        path: ACTIVITY_LOG,
        component: () =>
          import(/* webpackChunkName: "activity-log" */ "pages/admin-setting/activity-log"),
      },
      {
        path: ROUTE_DASHBOARD,
        component: () =>
          import(
            /* webpackChunkName: "user-dashboard" */ "src/pages/dashboard-stats/dashboard-stats"
          ),
      },
      {
        path: ROUTE_OBLIGATION,
        component: () =>
          import(
            /* webpackChunkName: "user-dashboard" */ "src/pages/grc-dashboard/compliance-obligation"
          ),
      },
      {
        path: PRE_CONTRACT,
        component: () =>
          import(/* webpackChunkName: "user-dashboard" */ "src/pages/pre-contract/pre-contract"),
      },
      {
        path: PRE_TEMPLATE,
        component: () =>
          import(/* webpackChunkName: "user-dashboard" */ "src/pages/template/pre-template"),
      },
    ],
  },
  {
    path: ROUTE_HOME,
    component: () =>
      import(/* webpackChunkName: "public-layout" */ "src/layouts/public/public-layout"),
    children: [
      {
        path: "",
        component: () => import(/* webpackChunkName: "home" */ "src/pages/home-page/home-page"),
      },
    ],
  },
  {
    path: "/change-password",
    component: () =>
      import(/* webpackChunkName: "reset-password" */ "src/pages/auth/reset-password"),
  },

  // Replace 404 component code with own code
  {
    path: ROUTE_404,
    component: () => import(/* webpackChunkName: "404" */ "pages/error/404/404.component"),
  },
  // Replace 500 component code with own code
  {
    path: ROUTE_500,
    component: () => import(/* webpackChunkName: "500" */ "pages/error/500/500.component"),
  },
  {
    path: ROUTE_VIEW_CONTRACT_SNIPPET,
    component: () =>
      import(
        /* webpackChunkName: "user-dashboard" */ "src/pages/contract/components/snippet-viewer/view-snippet"
      ),
  },
  {
    path: ROUTE_VIEW_SHARED_CONTRACT,
    component: () =>
      import(
        /* webpackChunkName: "user-dashboard" */ "src/pages/contract/components/snippet-viewer/view-snippet"
      ),
  },
];
