import moment from "moment";

export const USER_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
export const PHONE_REGEX = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
export const PHONE_NUMBER_REGEX = /^\d{10}$/;
export const acceptedFileTypes = ["pdf", "doc", "docx", "zip"];
export const sharedUsersCount = 6;

export function formatDateWithOrdinal(date: Date, separator: string = " ", time: boolean = false) {
  const testDateUtc = moment.utc(date.getTime());
  const localDate = moment(testDateUtc).local();

  // let dayWithOrdinal;
  // if (day === 1 || day === 21 || day === 31) {
  //   dayWithOrdinal = day + "st";
  // } else if (day === 2 || day === 22) {
  //   dayWithOrdinal = day + "nd";
  // } else if (day === 3 || day === 23) {
  //   dayWithOrdinal = day + "rd";
  // } else {
  //   dayWithOrdinal = day + "th";
  // }

  // return `${dayWithOrdinal}${separator}${month}${separator}${year}`;
  return !time ? localDate.format("Do MMM YYYY") : localDate.format("Do MMM YYYY, HH:mm:ss");
}

export const LS_TEAM_FILES_FOLDERS_ROUTE = "teamRoute";
export const LS_TEAM = "team";
export const LS_FILES_FOLDERS_ROUTE = "route";
export const LS_MY_TEMPLATES = "templatesRoute";
export const LS_DRAFT_FOLDERS_ROUTE = "drafts";
export const LS_UPLOAD_SIGN_FOLDERS_ROUTE = "upload-and-sign-list";


export const generateUniqueId = (prefix: string = "id"): string => {
  const timestamp = Date.now().toString(36);
  const randomNumber = Math.random().toString(36).substring(2, 5);
  return `${prefix}-${timestamp}-${randomNumber}`;
};

export const noDataPageConfigs = [
  {
    pathname: "/admin/shared",
    title: "You do not have any files shared with you at the moment.",
    text: "As files are shared with you, they appear here",
    icon: "../../../assets/icons/sharing.svg",
  },
  {
    pathname: "/admin/trash",
    title: "Trash is empty.",
    text: " Items deleted will be moved here.",
    icon: "../../../assets/icons/trash-icons.svg",
  },
];

export const wizardStages = {
  1: {
    stageLevel: 1,
    text: "draft",
    nextStageCta: "initiate collaboration",
  },
  2: {
    stageLevel: 2,
    text: "Collaborate",
    nextStageCta: "initiate review",
  },
  3: {
    stageLevel: 3,
    text: "Review",
    nextStageCta: "initiate approvals",
  },
  4: {
    stageLevel: 4,
    text: "approvals",
    nextStageCta: "initiate signing",
  },
  5: {
    stageLevel: 5,
    text: "signing",
    nextStageCta: "initiate complete",
  },
  6: {
    stageLevel: 6,
    text: "completed",
  },
};

export const frequencyTypes = ["Weekly", "Monthly", "Daily"];
