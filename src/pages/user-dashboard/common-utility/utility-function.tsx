export const getLastArrayFromLocalStorage = (localStorageKey: string): any | null => {
  const localStorageValue = localStorage.getItem(localStorageKey);

  if (localStorageValue) {
    try {
      const parsedData = JSON.parse(localStorageValue);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData[parsedData.length - 1];
      }
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
    }
  }

  return null;
};

export const exportToCSV = (leadsList: any[], headerMapping: { [key: string]: string }) => {
  const csvContent = "data:text/csv;charset=utf-8," + convertToCSV(leadsList, headerMapping);

  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.target = "_blank";
  link.download = "Reports.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const convertToCSV = (
  leads: { [key: string]: string | null | undefined }[],
  headerMapping: { [key: string]: string },
) => {
  if (leads.length === 0) {
    return ""; // Return an empty string if leads list is empty
  }

  const header = Object.keys(headerMapping).map((key) => {
    return headerMapping[key] || key;
  });

  const rows = leads.map((lead) => {
    return Object.keys(headerMapping)
      .map((key) => {
        const value = lead[key];
        // Wrap the value in double quotes if it's a string and contains a comma
        const formattedValue =
          typeof value === "string" && value?.includes(",") ? `"${value}"` : value;
        return formattedValue || "NA";
      })
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");
  return csv;
};

// Define a type for the state values
export type StateValue = 1 | 2 | 3 | 4 | 5 | 6;

// Define a utility function with the state-to-string mapping
export const getStateString = (state: StateValue): string => {
  const stateMap: Record<StateValue, string> = {
    1: "Draft",
    2: "Collaborate",
    3: "Review",
    4: "Approvals",
    5: "Signing",
    6: "Complete",
  };

  return stateMap[state] || "-";
};

export const checkUserAuthrity = (
  createdby: number,
  profileID: number,
  canEdit?: number | boolean,
  activeStagePreContract?: number,
) => {
  if (createdby === profileID) {
    return false;
  } else if (canEdit === profileID && activeStagePreContract === 2) {
    return false;
  } else {
    return true;
  }
};
