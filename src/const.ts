/* ####### Local storage keys ####### */
export const ACCESS_TOKEN = "accessToken";
export const REFRESH_TOKEN = "refreshToken";

/* ##### API URLS ##### */
export const URL_REFRESH_TOKEN = "/api/refresh-token";

/* ##### Page URLS ##### */
export const ROUTE_HOME = "";
export const ROUTE_404 = "404";
export const ROUTE_500 = "500";
export const ROUTE_LOGIN = "/";
export const ROUTE_SIGNUP = "/?action=signup";
export const ROUTE_403 = "403";
export const ROUTE_ADMIN = "admin";
export const ROUTE_USER_DASHBOARD = "my-drive";
export const ROUTE_DASHBOARD = "dashboard";
export const ROUTE_CONTRACT_LIST = "reports";
export const ROUTE_ALERTS_VIEW = "alerts-view";
export const ROUTE_ALERTS_CREATE = "alerts-create";
export const ROUTE_MANAGE_MEMBERS = "manage-members";
export const ROUTE_MANAGE_TEAMS = "teams";
export const ROUTE_TEAMS_DRIVE = "teams-drive";
export const ROUTE_TEAM_FILES = "team-files";
export const SEARCH_RESULTS = "search-result";
export const ROUTE_RESETPASSWORD = "reset-password";
export const ROUTE_ACTIVITY_TRACKER = "activity-tracker";
export const ADMIN_SETTINGS = "settings";
export const ACTIVITY_LOG = "activity-log";
export const PRE_CONTRACT = "pre-contract";
export const PRE_TEMPLATE = "pre-template";
export const ROUTE_PRE_MY_TEMPLATE = "templates";
export const ROUTE_PRE_DRAFTS = "drafts";
export const SMART_VIEW = "smart-view";
export const UPLOAD_AND_SIGN = "upload-and-sign";
export const UPLOAD_AND_SIGN_LIST = "upload-and-sign-list";
export const ROUTE_OBLIGATION = "obligation";
export const ROUTE_PLAYBOOK = "playbook";
export const ROUTE_CREATE_PLAYBOOK = "create-playbook";
export const ROUTE_OPEN_PLAYBOOK = "view-playbook";
export const ROUTE_OPEN_GLOBAL_PLAYBOOK = "view-globalPlaybook";
export const ROUTE_OPEN_NONEDITABLE_PLAYBOOK = "list-playbook";
export const ROUTE_RECENT_CONTRACT = "recent-contract";
export const ROUTE_VIEW_CONTRACT_SNIPPET = "view-excerpt";
export const ROUTE_VIEW_SHARED_CONTRACT = "view-shared-contract";

export const NO_HEADER_PATHS = [
  // don't show header or footer in case of error page
  // error can happen in header/footer api
  ROUTE_404,
  ROUTE_500,
  ROUTE_403,
];
export const ROUTE_CONTRACT_VIEW = "file";
export const ROUTE_TEAM_LIST = "teams";
export const ROUTE_SHAREDWITHME_VIEW = "shared";
export const ROUTE_TRASH = "trash";

/* ##### ERROR MESSAGES ##### */
export const PAGE_INVALID_RETURN_DATA = `
Page component should return IRedirect or ApiResponse object!!
Reason: Api server can return other status than 200 in that case
User should redirect to appropriate page base on status of api
`;
export const INTERNET_NOT_AVAILABLE =
  "Please check your network connection. Internet not available";

/* ##### Events ##### */
export const TOAST = "toast";
export const POPUP_TOAST = "popup_toast";

/* ##### Regex ##### */
export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

/* ##### Other ##### */
export const IS_DEV = process.env.ENV === "development";
export const TEST_API_PORT = process.env.TEST_API_PORT || 3002;
export const LOCAL_API_SERVER = `http://localhost:${TEST_API_PORT}`;

export const API_URL =
  process.env.ENV === "cypress" || process.env.LOCAL_API_SERVER === "true"
    ? LOCAL_API_SERVER
    : process.env.API_BASE_URL;
export const IS_CYPRESS = process.env.ENV === "cypress";

export const PUBLIC_FOLDER = "build/public";

export const COMMENT_API_URL = process.env.COMMENT_API_BASE_URL;

export enum USER_AUTHORITY {
  COMPANY_SUPER_ADMIN = "COMPANY_SUPER_ADMIN",
  COMPANY_TEAM_ADMIN = "COMPANY_TEAM_ADMIN",
  COMPANY_TEAM_USER = "COMPANY_TEAM_USER",
  ALERT = "ALERT",
  ROLE_PROMPT_CHAT = "ROLE_PROMPT_CHAT",
  ROLE_PRE_CONTRACT_CREATOR = "ROLE_PRE_CONTRACT_CREATOR",
  ROLE_PRE_CONTRACT_EDITOR = "ROLE_PRE_CONTRACT_EDITOR",
  ROLE_PRE_CONTRACT_REVIEWER = "ROLE_PRE_CONTRACT_REVIEWER",
  ROLE_PRE_CONTRACT_APPROVER = "ROLE_PRE_CONTRACT_APPROVER",
  ROLE_PRE_CONTRACT_SIGNATURE = "ROLE_PRE_CONTRACT_SIGNATURE",
  SMART_FOLDER_USER = "SMART_VIEW",
  GRC = "GRC",
  UPLOAD_SIGN = "UPLOAD_SIGN",
  UPLOAD_SIGN_SIGNATORY = "UPLOAD_SIGN_SIGNATORY",
  FU_PROCESS = "FU_PROCESS",
  PB_CREATE = "PB_CREATE",
  SNPT_SHR = "SNPT_SHR",
  RDT_SHR = "RDT_SHR",
  REV_LNK = "REV_LNK",
  SUMM_EDT = "SUMM_EDT",
  PB_REVIEW = "PB_REVIEW",
}

export const FILTER_TYPE = {
  USER_LIST: "USER_LIST",
  CONTRACT_TYPE: "CONTRACT_TYPE",
  ACTIVITY_TYPE: "ACTIVITY_TYPE",
  DATE_RANGE: "DATE_RANGE",
  USER_LIST_SINGLE: "USER_LIST_SINGLE",
  CONTRACT_STAGE: "CONTRACT_STAGE",
  TEMPLATE_STAGE: "TEMPLATE_STAGE",
};

export const MESSAGE_TYPE = {
  COMMENT: "COMMENT",
  ANNOTATED_COMMENT: "ANNOTATED_COMMENT",
};

export const fileSourceType = { SEARCH: "search" };

export const iconForMimeType: any = {
  "application/pdf": "pdf",
  "image/jpg": "image",
  "image/jpeg": "image",
  "image/png": "image",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
  "text/csv": "csv",
};
