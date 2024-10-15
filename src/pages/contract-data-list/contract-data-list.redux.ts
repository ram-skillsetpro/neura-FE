import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import {
  ContractType,
  DownloadFilePayloadType,
  ExtractedContractReportType,
  RequestedDownloadPayloadTypes,
} from "pages/contract-data-list/contract-data-list.model";
import { CommonService } from "src/core/services/common.service";
import { base64toBlob, downloadFileFromBlobUrl } from "src/core/utils";
import { AppDispatch } from "src/redux/create-store";

export interface DashboardContractState {
  // extractedContractReport: ExtractedContractReportType<ContractType>;
  extractedContractReport: Array<ContractType>;
  isLoading: boolean;
  errorMessage: string;
  totalReportsCount: number;
  perPageReportsCount: number;
  requestedDownloadList: Array<any>;
  totalRequestedDownloadCount: number;
  perPageRequestedDownloadCount: number;
  contractReportHeaders: Array<{ key: string; value: any }>;
}

const initialState: DashboardContractState = {
  // extractedContractReport: {
  //   perpg: 10,
  //   result: [],
  //   pgn: 1,
  //   totct: "",
  // },
  extractedContractReport: [],
  isLoading: false,
  errorMessage: "",
  totalReportsCount: 0,
  perPageReportsCount: 0,
  requestedDownloadList: [],
  totalRequestedDownloadCount: 0,
  perPageRequestedDownloadCount: 0,
  contractReportHeaders: [],
};

// export const getExtractedContractReport = (payload: any) => {
//   const { pageNo, mergeResponse = false } = payload;

//   return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
//     dispatch(setLoading(true));
//     try {
//       // if (mergeResponse && pageNo > 1) {
//       //   let reportList: any = [];
//       //   for (let i: number = 1; i <= pageNo; i++) {
//       //     const apiResponse = await api.get<ExtractedContractReportType>(
//       //       `/v1/report/contract-extracted-data-list?pgn=${i}`,
//       //     );
//       //     if (apiResponse?.isSuccess && apiResponse.data) {
//       //       reportList = [...reportList, ...Array.from(apiResponse?.data?.result || [])];
//       //       dispatch(totalReportsCount(apiResponse.data?.totct));
//       //     }
//       //   }
//       //   dispatch(contractReportSuccess(reportList));
//       // } else {

//       const contractTypeIds = _getState().dataFilter.selectedFilterContractType.map((d) => d.id);
//       const userIds = _getState().dataFilter.selectedFilterUsers.map((d) => d.id);
//       const fromDate = _getState().dataFilter.selectedDateRangeFilter.fromDate / 1000 || null;
//       const existingTimestamp = _getState().dataFilter.selectedDateRangeFilter.toDate || 0;

//       const existingDate = new Date(existingTimestamp);
//       existingDate.setHours(23, 59, 59, 0);
//       const toDate = Math.floor(existingDate.getTime() / 1000);

//       const data = {
//         pgn: pageNo,
//         contractTypeIds,
//         fromDate,
//         toDate: existingTimestamp ? toDate : null,
//         userIds,
//       };
//       const queryParams = pageNo !== undefined ? `?pgn=${pageNo}` : "";
//       const apiResponse = await api.post<ExtractedContractReportType>(
//         `/v1/report/contract-extracted-data-list${queryParams}`,
//         data,
//       );
//       if (apiResponse?.isSuccess && apiResponse.data) {
//         // dispatch(contractReportSuccess(apiResponse?.data?.result || []));
//         dispatch(totalReportsCount(apiResponse.data?.totct));
//         dispatch(perPageReportsCount(apiResponse.data?.perpg));
//         // const prevReports =
//         //   pageNo > 1 ? Array.from(_getState().dashboardContract.extractedContractReport) : [];

//         // const teamsData = [...prevReports, ...Array.from(apiResponse?.data?.result || [])];

//         return true;
//       } else {
//         dispatch(contractReportSuccess([]));
//         dispatch(contractReportError(apiResponse.message[0]));
//       }
//       // }

//       return false;
//     } catch (error) {
//       dispatch(contractReportError((error as Error).message));
//       return false;
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };
// };

export const getExtractedContractReport = (payload: any) => {
  const { pageNo } = payload;

  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const contractTypeIds = _getState().dataFilter.selectedFilterContractType.map((d) => d.id);
      const userIds = _getState().dataFilter.selectedFilterUsers.map((d) => d.id);
      const fromDate = _getState().dataFilter.selectedDateRangeFilter.fromDate / 1000 || null;
      const existingTimestamp = _getState().dataFilter.selectedDateRangeFilter.toDate || 0;

      const existingDate = new Date(existingTimestamp);
      existingDate.setHours(23, 59, 59, 0);
      const toDate = Math.floor(existingDate.getTime() / 1000);

      const data = {
        pgn: pageNo,
        contractTypeIds,
        fromDate,
        toDate: existingTimestamp ? toDate : null,
        userIds,
      };
      const queryParams = pageNo !== undefined ? `?pgn=${pageNo}` : "";
      const apiResponse = await api.post<ExtractedContractReportType>(
        `/v1/report/extracted-data${queryParams}`,
        data,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        // dispatch(contractReportSuccess(apiResponse?.data?.result || []));
        dispatch(totalReportsCount(apiResponse.data?.totct));
        dispatch(perPageReportsCount(apiResponse.data?.perpg));
        dispatch(setContractReportHeaders(apiResponse.data?.headerList || []));
        dispatch(contractReportSuccess(apiResponse?.data?.dataList || []));

        return true;
      } else {
        dispatch(contractReportSuccess([]));
        dispatch(contractReportError(apiResponse.message[0]));
      }

      return false;
    } catch (error) {
      dispatch(contractReportError((error as Error).message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const initiateDownloadRequest = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const contractTypeIds = _getState().dataFilter.selectedFilterContractType.map((d) => d.id);
      const userIds = _getState().dataFilter.selectedFilterUsers.map((d) => d.id);
      const fromDate = _getState().dataFilter.selectedDateRangeFilter.fromDate / 1000 || null;
      const existingTimestamp = _getState().dataFilter.selectedDateRangeFilter.toDate || 0;

      const existingDate = new Date(existingTimestamp);
      existingDate.setHours(23, 59, 59, 0);
      const toDate = Math.floor(existingDate.getTime() / 1000);

      const data = {
        contractTypeIds,
        fromDate,
        toDate: existingTimestamp ? toDate : null,
        userIds,
      };

      const apiResponse = await api.post<any>(`/v1/report/download-extracts`, data);

      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({ type: "success", message: apiResponse.message[0] });
        dispatch(fetchRequestedDownloadList());
        return true;
      }

      return false;
    } catch (error) {
      CommonService.toast({ type: "error", message: (error as Error).message });
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchRequestedDownloadList = (payload?: RequestedDownloadPayloadTypes | undefined) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { pageNo = 0 } = payload || {};
      const queryParams = pageNo ? `?pgn=${pageNo}` : "";
      const apiResponse = await api.get<any>(`/v1/report/download-history${queryParams}`);

      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(setRequestedDownloadList(apiResponse.data.result || []));
        dispatch(setTotalRequestedDownloadCount(apiResponse.data?.totct));
        dispatch(setPerPageRequestedDownloadCount(apiResponse.data?.perpg));
        return true;
      }

      return false;
    } catch (error) {
      CommonService.toast({ type: "error", message: (error as Error).message });
      return false;
    } finally {
      // dispatch(setLoading(false));
    }
  };
};

export const fetchDownloadFile = (payload: DownloadFilePayloadType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const { reportId } = payload;
      const apiResponse = await api.get<any>(`/v1/report/download-file?reportId=${reportId}`);

      if (
        apiResponse?.isSuccess &&
        apiResponse.data &&
        apiResponse.data !== "" &&
        apiResponse.status === 200
      ) {
        const header = apiResponse.headers["Content-Disposition"];
        let contentDispostion = [];

        if (header) {
          contentDispostion = header.split(";");
        } else {
          contentDispostion = apiResponse.headers["content-disposition"].split(";");
        }

        contentDispostion.forEach((data: string) => {
          const hasFilename = data.includes("filename");
          if (hasFilename) {
            const filename = data.replace("filename=", "");
            downloadFileFromBlobUrl(base64toBlob(apiResponse.data), String(filename).trim());
          }
        });

        return true;
      } else {
        if (apiResponse.status === 400) {
          CommonService.popupToast({ type: "error", message: "Something went wrong!" });
        }
      }
      return false;
    } catch (error) {
      CommonService.popupToast({ type: "error", message: (error as Error).message });
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

const dashboardContract = createSlice({
  name: "dashboardContract",
  initialState,
  reducers: {
    contractReportSuccess: (state, action) => {
      state.extractedContractReport = action.payload;
      state.errorMessage = "";
    },
    contractReportError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    totalReportsCount: (state, action) => {
      state.totalReportsCount = action.payload;
    },
    setTotalRequestedDownloadCount: (state, action) => {
      state.totalRequestedDownloadCount = action.payload;
    },
    perPageReportsCount: (state, action) => {
      state.perPageReportsCount = action.payload;
    },
    setPerPageRequestedDownloadCount: (state, action) => {
      state.perPageRequestedDownloadCount = action.payload;
    },
    clearReportList: (state) => {
      state.extractedContractReport = [];
      state.errorMessage = "";
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRequestedDownloadList: (state, action) => {
      state.requestedDownloadList = action.payload;
    },
    setContractReportHeaders: (state, action) => {
      state.contractReportHeaders = action.payload;
    },
  },
});

export const {
  contractReportSuccess,
  contractReportError,
  totalReportsCount,
  clearReportList,
  setLoading,
  perPageReportsCount,
  setRequestedDownloadList,
  setTotalRequestedDownloadCount,
  setPerPageRequestedDownloadCount,
  setContractReportHeaders,
} = dashboardContract.actions;
export const dashboardContractReducer = dashboardContract.reducer;
