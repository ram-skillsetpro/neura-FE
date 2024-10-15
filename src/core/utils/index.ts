import moment from "moment";
import { AuthResponse } from "pages/auth/auth.model";
import { FILTER_TYPE, iconForMimeType, ROUTE_TEAM_FILES, ROUTE_USER_DASHBOARD } from "src/const";
import { RiskStatusType } from "src/pages/grc-dashboard/grc-dashboard.model";
import { TeamListType } from "src/pages/manage-team/team.model";
import { User } from "src/pages/pre-contract/pre-contract.model";
import { getLastArrayFromLocalStorage } from "src/pages/user-dashboard/common-utility/utility-function";
import { FolderType } from "src/pages/user-dashboard/dashboard.model";
import { v5 as uuidv5 } from "uuid";
import { GetState } from "../models/common.model";
import { CommonService } from "../services/common.service";
import { LS_FILES_FOLDERS_ROUTE, LS_TEAM, LS_TEAM_FILES_FOLDERS_ROUTE } from "./constant";

export const base64toBlob = (base64: string, mimeType: string = "application/pdf") => {
  const contentType = mimeType;
  const bytes = atob(base64);
  let length = bytes.length;
  const out = new Uint8Array(length);
  while (length--) {
    out[length] = bytes.charCodeAt(length);
  }
  const f = new Blob([out], { type: contentType });
  return URL.createObjectURL(f);
};

export const removeHtmlTags = (inputString: any) => {
  const doc = new DOMParser().parseFromString(inputString, "text/html");
  return doc.body.textContent || "";
};

export const encodeFileKey = (file: any) => {
  const {
    id,
    folderId,
    teamId,
    fileName = null,
    createdBy = null,
    source = null,
    other = null,
  } = file || {};
  const encodedString = window.btoa(
    `fileId=${id},folderId=${folderId},teamId=${teamId},` +
      `fileName=${removeHtmlTags(fileName)},createdBy=${createdBy},` +
      `source=${source},other=${encodeURIComponent(JSON.stringify(other))}`,
  );
  return encodedString;
};

export const encodeFilePreContractKey = (file: any) => {
  const { contractId, folderId, state } = file;
  const encodedString = window.btoa(
    `contractId=${contractId},folderId=${folderId},state=${state},`,
  );
  return encodedString;
};

export const decodeFileKey = (key: string) => {
  const decodedString = window.atob(key);
  const decodedArray = decodedString.split(",");
  const result: any = {
    fileId: 0,
    folderId: 0,
    teamId: 0,
    fileName: "",
    createdBy: "",
    source: "",
    other: null,
  };
  decodedArray.forEach((data) => {
    const splittedKeyValue = data.split("=");
    if (splittedKeyValue[0] === "fileId") {
      result.fileId = Number(splittedKeyValue[1]);
    } else if (splittedKeyValue[0] === "folderId") {
      result.folderId = Number(splittedKeyValue[1]);
    } else if (splittedKeyValue[0] === "teamId") {
      result.teamId = Number(splittedKeyValue[1]);
    } else if (splittedKeyValue[0] === "fileName") {
      result.fileName = String(splittedKeyValue[1]);
    } else if (splittedKeyValue[0] === "createdBy") {
      result.createdBy = String(splittedKeyValue[1]);
    } else if (splittedKeyValue[0] === "source") {
      result.source = splittedKeyValue[1] === "null" ? null : String(splittedKeyValue[1]);
    } else if (splittedKeyValue[0] === "other") {
      const data = decodeURIComponent(splittedKeyValue[1]).replace(/^"|"$/g, "");
      result.other = JSON.parse(data);
    }
  });
  return result;
};

export const decodeFilePreContractKey = (key: string) => {
  const decodedString = window.atob(key);
  const decodedArray = decodedString.split(",");
  const result = { contractId: 0, folderId: 0, state: 0 };
  decodedArray.forEach((data) => {
    const splittedKeyValue = data.split("=");
    if (splittedKeyValue[0] === "contractId") {
      result.contractId = Number(splittedKeyValue[1]);
    }
    if (splittedKeyValue[0] === "folderId") {
      result.folderId = Number(splittedKeyValue[1]);
    }
    if (splittedKeyValue[0] === "state") {
      result.state = Number(splittedKeyValue[1]);
    }
  });
  return result;
};

export const encodeFilePreTemplateKey = (file: any) => {
  const { id, templateName, isGlobalTemplate } = file;
  const encodedString = window.btoa(
    `id=${id},templateName=${templateName},isGlobalTemplate=${isGlobalTemplate}`,
  );
  return encodedString;
};

export const decodeFilePreTemplateKey = (key: string) => {
  const decodedString = window.atob(key);
  const decodedArray = decodedString.split(",");
  const result = { id: 0, templateName: "", isGlobalTemplate: "" };
  decodedArray.forEach((data) => {
    const splittedKeyValue = data.split("=");
    if (splittedKeyValue[0] === "id") {
      result.id = Number(splittedKeyValue[1]);
    }
    if (splittedKeyValue[0] === "templateName") {
      result.templateName = String(splittedKeyValue[1]);
    }
    if (splittedKeyValue[0] === "isGlobalTemplate") {
      result.isGlobalTemplate = String(splittedKeyValue[1]);
    }
  });
  return result;
};

export const encodePlaybookId = (file: any) => {
  const { id } = file;
  const encodedString = window.btoa(`id=${id}`);
  return encodedString;
};

export const decodePlaybookId = (key: string) => {
  const decodedString = window.atob(key);
  const decodedArray = decodedString.split(",");
  const result = { id: 0 };
  decodedArray.forEach((data) => {
    const splittedKeyValue = data.split("=");
    if (splittedKeyValue[0] === "id") {
      result.id = Number(splittedKeyValue[1]);
    }
  });
  return result;
};

export const formatDate = (timestamp: number) => {
  return moment(timestamp * 1000).format("LLL");
};

export const convertKeysToCamel = (obj: Record<string, any>): Record<string, any> => {
  const camelObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const words = key.split("_");
      const camelKey =
        words[0].toLowerCase() +
        words
          .slice(1)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("");
      camelObj[camelKey] = obj[key];
    }
  }
  return camelObj;
};

export const getAuth = (): AuthResponse => {
  return JSON.parse(localStorage.getItem("auth") || "{}");
};

export const getUsernameColor = (username: string) => {
  if (!username) {
    return null;
  }

  if (username.length < 2) {
    throw new Error("Username must be at least 2 characters long");
  }

  const userName = username.split(" ");

  let uname = "";

  if (userName.length > 1) {
    const firstCharOfFirstName = userName[0][0];
    const firstCharOfLastName = userName[1][0];

    uname = `${firstCharOfFirstName}${firstCharOfLastName}${firstCharOfFirstName}`;
  } else {
    uname = `${username.substring(0, 2)}${username.substring(0, 1)}`;
  }

  const primaryColors = ["#55a630", "#1e88e5", "#fe6d73", "#fb8b24", "#9381ff", "#3c6e71"];
  // const usernameChars = uname.substring(0, 2);
  const usernameChars = uname;

  let colorIndex = 0;

  for (const char of usernameChars) {
    colorIndex += char.charCodeAt(0) + primaryColors.length;
  }

  colorIndex = colorIndex % primaryColors.length;

  const color = primaryColors[colorIndex];

  return color;
};

export const getShortUsername = (username: string) => {
  if (!username) {
    return "";
  }

  const userName = username.trim().split(" ");

  let uname = `${username[0]}${username[1]}`;

  if (userName.length > 1) {
    const firstCharOfFirstName = userName[0][0];
    const firstCharOfLastName = userName[1][0];

    uname = `${firstCharOfFirstName}${firstCharOfLastName}`;
  }

  return uname.toUpperCase();
};

export const getSummaryAlertColor = (status: number) => {
  switch (status) {
    case 0:
      return "dot-red";
    case 1:
      return "dot-g";
    case 2:
      return "dot-orange";
    default:
      return "dot-g";
  }
};

export function getFileIcon(fileName: string, mimeType?: string) {
  const parts = String(fileName).split(".");
  const extension = parts.pop();

  if (extension && parts.length) {
    switch (String(extension).toLowerCase()) {
      case "pdf":
        return "pdf";
      case "folder":
        return "folder";
      case "doc":
      case "docx":
        return "doc";
      case "xls":
      case "xlsx":
      case "csv":
        return "xls";
      case "rtf":
        return "rtf";
      case "txt":
        return "txt";
      case "team":
        return "team";
      case "control":
        return "control";
      case "jpg":
      case "jpeg":
      case "png":
        return "image";
      default:
        return "other";
    }
  } else {
    if (mimeType && iconForMimeType[mimeType]) {
      console.log("mimeType/" + iconForMimeType[mimeType]);
      return iconForMimeType[mimeType];
    } else {
      return "other";
    }
  }
}
export function getUploadFileTypeIcon(extension: string) {
  switch (extension) {
    case "pdf":
      return "pdf";
    case "folder":
      return "folder";
    case "doc":
    case "docx":
      return "doc";
    case "xls":
    case "xlsx":
      return "xls";
    case "rtf":
      return "rtf";
    case "txt":
      return "txt";
    case "team":
      return "team";
    case "control":
      return "control";
    default:
      return "anyfile";
  }
}

export const isValidFileSize = (file: File): boolean => {
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSizeInBytes;
};

export const handleInvalidFile = (message: string): void => {
  CommonService.toast({
    type: "error",
    message,
  });
};

export const updateLocalStorageUserProfile = (userLogo: string) => {
  const userObj = JSON.parse(localStorage.getItem("auth") || "{}");
  userObj.userLogo = userLogo;
  localStorage.setItem("auth", JSON.stringify(userObj));
};

export const buildDataEndpoint = (
  baseEndpoint: string,
  currentPage?: number,
  queryParams?: string | URLSearchParams,
  state?: ReturnType<GetState>,
  monthId?: string,
  aplliedFilter?: any,
): string => {
  let dataEndpoint = `${baseEndpoint}${queryParams || ""}`;
  const selectedFilterContractType = state?.dataFilter?.selectedFilterContractType;
  const selectedFilterUsers = state?.dataFilter?.selectedFilterUsers;

  if (currentPage) {
    dataEndpoint += `&pgn=${currentPage}`;
  }
  if (monthId) {
    dataEndpoint += `&monthId=${monthId}`;
  }

  if (aplliedFilter) {
    if (aplliedFilter.includes(FILTER_TYPE.CONTRACT_STAGE)) {
      const selectedFilterContractStage = state?.dataFilter?.selectedFilterContractStage;
      dataEndpoint = appendEncodedIds(dataEndpoint, "state", selectedFilterContractStage);
    }
  }
  dataEndpoint = appendEncodedIds(dataEndpoint, "contractTypeId", selectedFilterContractType);
  dataEndpoint = appendEncodedIds(dataEndpoint, "teamUserId", selectedFilterUsers);

  return dataEndpoint;
};

const appendEncodedIds = (
  dataEndpoint: string,
  paramName: string,
  items?: Array<{ id: string }>,
) => {
  if (items && items.length > 0) {
    const ids = items.map((item) => item.id);
    dataEndpoint += `&${paramName}=${ids}`;
  }
  return dataEndpoint;
};

export function getFolderFromLocalStorage() {
  let folder = {} as FolderType;
  if (location.pathname.includes(ROUTE_USER_DASHBOARD)) {
    folder = getLastArrayFromLocalStorage(LS_FILES_FOLDERS_ROUTE);
  } else if (location.pathname.includes(ROUTE_TEAM_FILES)) {
    folder = getLastArrayFromLocalStorage(LS_TEAM_FILES_FOLDERS_ROUTE);
  }
  return folder;
}

export function getTeamId() {
  const teamDataString = localStorage.getItem(LS_TEAM);
  if (teamDataString) {
    const teamData = JSON.parse(teamDataString) as TeamListType;
    return window.location.pathname.includes(ROUTE_TEAM_FILES) ? teamData?.id : null;
  }
  return null;
}

export function getMonthAbbreviation(month: number): string {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames[month - 1];
}

export function getMonthOrder(month: string): number {
  const monthOrderMap: { [key: string]: number } = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  return monthOrderMap[month];
}
export const generateRandomCode = (length: number) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomCode += characters.charAt(randomIndex);
  }

  return randomCode;
};

export const updatePlaceHolder = (key: string, value: string) => {
  if (key) {
    const placeholderEl: NodeListOf<Element> = document.querySelectorAll(`.placeholder-${key}`);
    if (placeholderEl) {
      placeholderEl.forEach((data) => {
        if (data) {
          data.textContent = value;
          if (!value && value === "") {
            data.textContent = `{${key}}`;
          }
        }
      });
    }
  }
};

export function getUserIdWithRole(
  users: User[],
  roleName: string,
  profileId: number,
): number | boolean {
  const userWithRole = users.find(
    (user) =>
      user.authority.some((authority) => authority.name === roleName) && user.id === profileId,
  );
  return userWithRole ? userWithRole.id : false;
}

export const downloadFileFromBlobUrl = (blobUrl: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const resetPlaceholderListItem = () => {
  const elList: NodeListOf<Element> = document.querySelectorAll(
    ".placeholder-custom-container .ck-list",
  );

  if (elList) {
    elList.forEach((el: any) => {
      el.style.display = "none";
    });
  }
};

export function getRiskStatusChartData<T extends RiskStatusType>(
  inputArray: T[],
): { name: string; y: number; color: string }[] {
  const emptyData = {
    name: "No data",
    y: 0,
    color: "gray",
  };
  // Check if inputArray is empty or not an array
  if (!Array.isArray(inputArray) || inputArray.length === 0) {
    return [emptyData]; // Return an empty array
  }

  // Calculate the total count
  const totalCount = inputArray.reduce((sum, item) => {
    // Check if each item has valid count property
    if (typeof item.count !== "number" || isNaN(item.count) || item.count < 0) {
      return sum; // Skip invalid count
    }
    return sum + item.count;
  }, 0);

  // Check if totalCount is zero
  if (totalCount === 0) {
    return [emptyData];
  }

  // Map each item to the modified object
  return inputArray.map((item) => {
    let name, color;

    // Determine name and color based on riskStatus
    switch (item.impact) {
      case "Low":
        name = "Low";
        color = "green";
        break;
      case "Medium":
        name = "Moderate";
        color = "#FF8A00";
        break;
      case "High":
        name = "High";
        color = "#F5365C";
        break;
      default:
        name = "No data";
        color = "gray";
    }

    return {
      name,
      y: item.count / totalCount, // Scale y value such that the sum equals 1
      color,
    };
  });
}

export function getComplianceTypeChartData(inputArray: any) {
  const emptyData = {
    name: "No data",
    y: 0,
    color: "gray",
  };
  // Check if inputArray is empty or not an array
  if (!Array.isArray(inputArray) || inputArray.length === 0) {
    return [emptyData]; // Return an empty array
  }

  // Calculate the total count
  const totalCount = inputArray.reduce((sum, item) => {
    // Check if each item has valid count property
    if (
      typeof item.count !== "number" ||
      isNaN(item.count) ||
      item.count < 0 ||
      typeof item.riskType !== "string" // Validate the 'riskType' property
    ) {
      return sum; // Skip invalid count
    }
    return sum + item.count;
  }, 0);

  // Check if totalCount is zero
  if (totalCount === 0) {
    return [emptyData];
  }

  // Map each item to the modified object
  return inputArray.map((item) => {
    const color = stringToColor(item.riskType);
    return {
      name: item.riskType,
      y: item.count / totalCount,
      color,
    };
  });
}

// export const riskEventTypes = [
//   { riskType: "Financial Risk", riskTypeId: 1, color: "var(--financial-risk-bg)" },
//   { riskType: "Compliance Risk", riskTypeId: 2, color: "var(--compliance-risk-bg)" },
//   { riskType: "Operational Risk", riskTypeId: 3, color: "var(--operational-risk-bg)" },
//   { riskType: "Legal Risk", riskTypeId: 4, color: "var(--legal-risk-bg)" },
// ];

/**
 * Truncates a string, keeping a specified number of characters from the beginning and end, and
 * replacing the removed characters with ellipsis.
 *
 * @remarks
 *   Hover over the function name to see additional examples and remarks.
 * @example
 *   Truncate string, keeping the first 5 and last 3 characters
 *   truncateString("Hello World", 5, 3);
 *
 *   Truncate string, keeping the first 10 characters and adding 5 dots in between
 *   truncateString("This is a long sentence", 10, 0, 5);
 *
 * @param {string} str - The input string to truncate.
 * @param {number} [firstCharCount=str.length] - The number of characters to keep from the beginning
 *   of the string. Default is `str.length`
 * @param {number} [endCharCount=0] - The number of characters to keep from the end of the string.
 *   Default is `0`
 * @param {number} [dotCount=3] - The number of ellipsis dots to insert between truncated portions.
 *   Default is `3`
 * @returns {string} The truncated string with ellipsis added where characters were removed.
 */

export function truncateString(
  str: string,
  firstCharCount: number = str?.length,
  endCharCount: number = 0,
  dotCount: number = 3,
): string {
  if (str?.length <= firstCharCount + endCharCount) {
    return str;
  }

  const firstPortion: string = str?.slice(0, firstCharCount);
  const endPortion: string = str?.slice(-endCharCount);
  const dots: string = ".".repeat(dotCount);

  return `${firstPortion}${dots}${endPortion}`;
}

export const openFile = (file: any, navigate: any) => {
  let flag = true;

  if (!file.mimeType || file.mimeType === "") {
    flag = false;
    CommonService.toast({
      type: "error",
      message: "MimeType is missing",
    });
    return;
  }

  if (!file.id) {
    flag = false;
    CommonService.toast({
      type: "error",
      message: "File id is missing",
    });
    console.log("File id is missing");
  }

  if (!file.folderId) {
    file.folderId = null;
  }

  if (!file.teamId) {
    flag = false;
    CommonService.toast({
      type: "error",
      message: "Team id is missing",
    });
    console.log("Team id is missing");
  }

  // if (!file.status) {
  //   flag = false;
  //   console.log("Status is missing");
  // }

  if (flag) {
    const encodedString = encodeFileKey(file);
    navigate("/admin/file?key=" + encodedString, {
      state: { ...file },
    });
  }
};

export function stringToColor(str: string) {
  switch (str) {
    case "Financial Risk":
      return "var(--financial-risk-bg)";
    case "Compliance Risk":
      return "var(--compliance-risk-bg)";
    case "Operational Risk":
      return "var(--operational-risk-bg)";
    case "Legal Risk":
      return "var(--legal-risk-bg)";
    case "HR Risk":
      return "var(--hr-risk-bg)";
    case "Market Risk":
      return "var(--market-risk-bg)";
    case "Supply Chain Risk":
      return "var(--supply-chain-risk-bg)";
    case "Marketing Risk":
      return "var(--marketing-risk-bg)";
    case "Regulatory Risk":
      return "var(--regulatory-risk-bg)";
    case "Data Security Risk":
      return "var(--data-security-risk-bg)";
    case "Technology Risk":
      return "var(--technology-risk-bg)";
    case "R&D Risk":
      return "var(--rnd-risk-bg)";
    default:
      return "var(--compliance-risk-bg)";
  }
}

export const getPendingTrackChanges = (reviews: any) => {
  let pendingTrackChanges: number = 0;
  if (reviews && JSON.stringify(reviews) !== "{}") {
    for (const obj of Object.values(reviews)) {
      pendingTrackChanges += (obj as any).length;
    }
  }
  return pendingTrackChanges;
};

export const handleFormFieldToggle = (index: number) => {
  const elList: NodeListOf<HTMLDivElement> = document.querySelectorAll(".add-filed-form");
  if (elList) {
    elList.forEach((el, i) => {
      el.classList.add("collapse-form");

      if (i === index) {
        el.classList.remove("collapse-form");
      }
    });
  }
};

// Function to convert date string "DD/MM/YYYY" to Date object
export const convertDateStringToDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

export const getClausePages = (clauseName: string, extractedCoordinates: Array<any>) => {
  try {
    const obj = extractedCoordinates.filter(
      (data) => data.key.toUpperCase() === clauseName.toUpperCase(),
    );
    const object = obj[0].value;
    const result: Array<any> = [];
    Object.keys(object).forEach((key: any) => {
      result.push({
        page: key,
        coordinates: object[key],
      });
    });
    return result;
  } catch (error) {
    return [];
  }
};

export const validateEmail = (email: string) => {
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/;
  return emailRegex.test(email);
};

export const fetchBlobFromUrl = async (blobUrl: string) => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return blob;
};
// Function to format the date and time
function formatDateString(date: Date) {
  // Get the individual components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Determine AM or PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours || 12; // The hour '0' should be '12'

  // Format the date and time string
  return `${year}-${month}-${day} ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
}

export const convertUtcToIstDate = (date: string) => {
  const utcDate = moment(date, "DD/MM/YYYY hh:mm:ss A").utc();
  // let utcDate1 = new Date(utcDate);
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is 5 hours 30 minutes ahead of UTC
  const istDate = new Date(utcDate.valueOf() + istOffset);
  const istDateString = formatDateString(new Date(istDate));
  return istDateString;
};

export const formatString = (content: any) => {
  if (typeof content === "string") {
    // @ts-ignore
    const result = content.replaceAll("\n", "<br />");
    return result;
  }
  return content;
};
const UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export const generateUUID = (originalJsonData: any) => {
  const base64String = window.btoa(JSON.stringify(originalJsonData));
  return uuidv5(base64String, UUID_NAMESPACE);
};
