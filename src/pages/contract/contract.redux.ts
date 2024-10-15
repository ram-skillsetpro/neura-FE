import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { FileToOpenType } from "pages/pre-dashboard/dashboard.model";
import { ToastContent } from "react-toastify";
import { CommonService } from "src/core/services/common.service";
import { HttpClientOptions } from "src/core/services/http-client";
import { AppDispatch } from "src/redux/create-store";
import { ContractType } from "../user-dashboard/dashboard.model";
import {
  ApiResponse,
  ApiResponseSideBar,
  ComputeObligationPayloadTypes,
  ContractCalenderType,
  ExceptionApiResponse,
  ExceptionsPayloadType,
  ExceptionsResponseType,
  ExtracetedDocumentPayloadType,
  ExtractedClausePayloadType,
  ExtractedClauseResponseType,
  ExtractedSummary,
  FileMetaResponse,
  FileMetaType,
  FileNavigationApiResponse,
  FileNavigationPayload,
  FileNavigationState,
  GetFileMetaPayloadTypes,
  OriginalFilePayloadType,
  OriginalFileResponseType,
  PaginatedApiResponse,
  PlaybookList,
  PlaybookResponseType,
  RightsCalendarPayloadType,
  RightsSummaryDownloadPayloadType,
  RightsSummaryPayloadType,
  Section,
  sharedFileUser,
  sharedUserPayloadType,
  SimilarFileUploadType,
  SmartViewPayloadTypes,
  SmartViewResponse,
  SnippetListResponse,
  TableDataPayloadType,
  TableDataResponseType,
} from "./contract.model";

export interface ContractStateType
  extends OriginalFileResponseType,
    ExtractedClauseResponseType,
    ExceptionsResponseType,
    TableDataResponseType {
  errorMessage: string;
  tableData: any;
  errorMsg: string;
  sideBarData: Array<Section>;
  isLoading: boolean;
  isUpdateSummaryLoading: boolean;
  originalFileError: string;
  clipboardText: string;
  resetPdf: boolean;
  rightsSummary: string;
  extractedDocument: string;
  fileId: number;
  shareUser: Array<sharedFileUser>;
  fileName: string;
  calenderData: Array<ContractCalenderType>;
  sideBarSummary: string;
  playbookList: Array<any>;
  playbookList_missing: Array<any>;
  playbookList_gap: Array<any>;
  playbookList_ok: Array<any>;
  summary: any;
  smartViewAggrList: any;
  smartViewResult: Array<any>;
  smartViewTotalCount: number;
  fileToOpen: FileToOpenType | null;
  linkContractList: Array<any>;
  linkContractData: any;
  fileMetaData: FileMetaType | null;
  previewFile: string | null;
  contractTypes: Array<ContractType>;
  fileMeta: FileMetaResponse | null;
  selectedItems: Array<number>;
  extractedCoordinates: Array<any>;
  currentHighlightedPage: any;
  playbookResult: Array<PlaybookList>;
  globalPlaybookResult: Array<PlaybookList>;
  globalPBReviewResponse: PlaybookResponseType & {
    isLoading?: boolean;
  };
  PBFilesReviewResponse: PlaybookResponseType & {
    isLoading?: boolean;
  };
  snippets: Array<any>;
  contractSnippetList: Array<any>;
  contractSnippetListInfo: {
    totct: number;
    pgn: number;
    perpg: number;
  };
  fileNavigationStack: FileNavigationState | null;
  originalPDFContent: string | null;
  redactedContractBlob: any;
  redactedContractList: Array<any>;
  redactedContractListInfo: {
    totct: number;
    pgn: number;
    perpg: number;
  };
}

const initialState: ContractStateType = {
  file: "",
  errorMessage: "",
  originalFileError: "",
  extractedClause: [],
  exceptions: [],
  tableData: [],
  sideBarData: [],
  errorMsg: "",
  isLoading: false,
  isUpdateSummaryLoading: false,
  clipboardText: "",
  resetPdf: false,
  rightsSummary: "",
  extractedDocument: "",
  fileId: 0,
  shareUser: [],
  fileName: "",
  calenderData: [],
  sideBarSummary: "",
  playbookList: [],
  globalPBReviewResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  PBFilesReviewResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  playbookList_missing: [],
  playbookList_gap: [],
  playbookList_ok: [],
  summary: {},
  smartViewAggrList: null,
  smartViewResult: [],
  smartViewTotalCount: 0,
  fileToOpen: null,
  linkContractList: [],
  linkContractData: null,
  fileMetaData: null,
  previewFile: null,
  contractTypes: [],
  fileMeta: null,
  selectedItems: [],
  extractedCoordinates: [],
  currentHighlightedPage: null,
  playbookResult: [],
  globalPlaybookResult: [],
  snippets: [],
  contractSnippetList: [],
  contractSnippetListInfo: {
    totct: 0,
    pgn: 0,
    perpg: 50,
  },
  fileNavigationStack: null,
  originalPDFContent: null,
  redactedContractBlob: null,
  redactedContractList: [],
  redactedContractListInfo: {
    totct: 0,
    pgn: 0,
    perpg: 50,
  },
};

export const fetchOriginalFile = (payload: OriginalFilePayloadType) => {
  const { fileId, folderId, teamId, previewFileFlag = false, controller = null } = payload;
  const queryParams = `fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setLoading(true));
      const apiResponse = await api.get<ApiResponse>(`/v1/team/read-file-content?${queryParams}`, {
        signal: controller?.signal,
      });

      if (apiResponse.isSuccess) {
        if (!apiResponse.data) {
          dispatch(setLoading(false));
          dispatch(setOriginalFileError("Error in file loading"));
        } else {
          if (previewFileFlag) {
            dispatch(setPreviewFile(apiResponse.data));
          } else {
            dispatch(saveOriginalFile(apiResponse.data));
          }
        }
      } else {
        dispatch(setLoading(false));
        if (apiResponse.status === 1000) {
          dispatch(setOriginalFileError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(setOriginalFileError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchExtractedClause = (payload: ExtractedClausePayloadType) => {
  const { fileId, folderId, teamId } = payload;
  const queryParams = `fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/team/read-extracted-clause?${queryParams}`,
      );
      if (apiResponse.isSuccess) {
        dispatch(saveExtractedClause(apiResponse.data || []));
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const fetchExceptions = (payload: ExceptionsPayloadType) => {
  const { fileId } = payload;
  const queryParams = `fileId=${fileId}&pgn=1&verifiedStatus=1`;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ExceptionApiResponse>(
        `/v1/alert/alerts-for-me-on-file?${queryParams}`,
      );
      if (apiResponse.isSuccess) {
        dispatch(saveExceptions(apiResponse.data?.result));
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const fetchTableData = (payload: TableDataPayloadType) => {
  const { fileId, folderId, teamId } = payload;
  const queryParams = `fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/team/read-file-table-extracts?${queryParams}`,
      );

      if (apiResponse.isSuccess) {
        if (Array.isArray(apiResponse.data)) {
          dispatch(saveTableData(apiResponse.data));
        }
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const fetchRightsSummaryData = (payload: RightsSummaryPayloadType) => {
  const { fileId, folderId, teamId } = payload;
  const queryParams = `fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/team/contract-rights-summary?${queryParams}`,
      );

      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setRightsSummary(apiResponse.data?.response));
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const fetchRightsSummaryDownloadData = (payload: RightsSummaryDownloadPayloadType) => {
  const { fileId, folderId, teamId } = payload;
  const queryParams = `fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<Blob>(`/v1/team/download-rights-summary?${queryParams}`, {
        responseType: "blob",
      });

      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        const blob = new Blob([apiResponse.data], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

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
            a.download = filename.trim();
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          }
        });
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }

      return apiResponse;
    } catch (error) {
      dispatch(setError((error as Error).message));
      return (error as Error).message;
    }
  };
};

export const fetchExtracetedDocument = (payload: ExtracetedDocumentPayloadType) => {
  const { fileId, folderId, teamId } = payload;
  const queryParams = `fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`;

  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    // dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<ApiResponse>(`/v1/team/read-raw-extracts?${queryParams}`);
      dispatch(setLoading(false));
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setExtractedDocument(apiResponse.data?.response));
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(setError((error as Error).message));
    }
  };
};

export const readSideBarContent = (payload: OriginalFilePayloadType) => {
  const { fileId, teamId, folderId } = payload;
  const queryParams = `${
    folderId && folderId > 0
      ? `fileId=${fileId}&folderId=${folderId}&teamId=${teamId}`
      : `fileId=${fileId}&teamId=${teamId}`
  }`;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<ApiResponseSideBar>(
      `/v1/team/read-processed-extracts?${queryParams}`,
    );
    if (apiResponse.isSuccess && apiResponse?.data) {
      dispatch(sideBarContentFetched(apiResponse.data));
    } else {
      dispatch(sideBarContentError(apiResponse.message));
    }
  };
};

export const getSharedUser = (fileId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<sharedUserPayloadType>(`/v1/shared-users?fileId=${fileId}`);
    if (apiResponse.isSuccess && apiResponse?.data) {
      dispatch(shareUsersFetched(apiResponse.data));
    } else {
      dispatch(setError(apiResponse.message));
    }
  };
};

export const fetchRightCalenderData = (payload: RightsCalendarPayloadType) => {
  const { fileId, folderId, teamId } = payload;
  const queryParams = `fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`;

  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/team/contract-calendar-events?${queryParams}`,
      );

      // if (apiResponse.isSuccess && apiResponse.status === 200) {
      if (apiResponse.isSuccess) {
        dispatch(setRightCalender(apiResponse.data));
        return apiResponse.data;
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
        return null;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return null;
    }
  };
};

export const createAlertOnContractCalendar = (key: string, isActive: boolean) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const payload = {
      alertType: key,
      status: isActive ? 1 : 0,
    };
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>(`/v1/settings/update-alert`, payload);
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0] ?? "Created Successfully",
        });
      } else {
        dispatch(setError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchPlaybook = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { fileId, playbookId, reviewId } = payload;
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/playbook/view-review?contractId=${fileId}&playbookId=${playbookId}&reviewId=${reviewId}
        `,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setPlaybookList(apiResponse.data || []));
        return true;
      } else {
        dispatch(setPlaybookList([]));
        return false;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return false;
    }
  };
};

export const raiseAlertOnSummary = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { fileId, comment } = payload;
    dispatch(setLoading(true));
    try {
      const data = { fileId, comment };
      const apiResponse = await api.post<ApiResponse>(
        `/v1/team/raise-alert?fileId=${fileId}`,
        data,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(setAlertRsponse({ raisedAlertflag: true }));
        CommonService.toast({
          type: "success",
          message: apiResponse.message,
        });
      } else {
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0],
        });
        dispatch(setError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      CommonService.toast({
        type: "success",
        message: (error as Error).message,
      });
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchSmartView = (payload: SmartViewPayloadTypes) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setLoading(true));
      const {
        pno = 1,
        contractType,
        creditDuration = [],
        effectiveMonth,
        effectiveYear,
        firstParty,
        jurisdiction,
        liability = [],
        secondParty,
        terminationMonth,
        terminationYear,
        loadFilter = false,
        mergeResponse = false,
      } = payload;

      const creditDurationRange = creditDuration.length ? creditDuration[0].split("-") : [];
      const liabilityRange = liability.length ? liability[0].split("-") : [];

      const data = {
        pno,
        cntp: contractType,
        cdlte: creditDuration.length ? creditDurationRange[0] : undefined,
        cdgte: creditDuration.length ? creditDurationRange[1] : undefined,
        emy: effectiveMonth,
        eyear: effectiveYear,
        fprt: firstParty,
        jurs: jurisdiction,
        mllte: liability.length ? liabilityRange[0] : undefined,
        mlgte: liability.length ? liabilityRange[1] : undefined,
        sprt: secondParty,
        tmy: terminationMonth,
        tyear: terminationYear,
      };
      const smartViewPageCount = pno || 1;
      if (mergeResponse && smartViewPageCount > 1) {
        let smartViewList: any = [];
        for (let i: number = 1; i <= smartViewPageCount; i++) {
          data.pno = i;
          const apiResponse = await api.post<SmartViewResponse>(`/v1/dashboard/get-agg-data`, data);
          if (apiResponse.isSuccess && apiResponse.status === 200) {
            const { result, totalCnt } = apiResponse.data || {};
            smartViewList = [...smartViewList, ...(result || [])];
            dispatch(setSmartViewTotalCount(totalCnt));
          }
        }
        dispatch(setSmartViewResult(smartViewList));
        dispatch(setLoading(false));
      } else {
        const apiResponse = await api.post<SmartViewResponse>(`/v1/dashboard/get-agg-data`, data);
        if (apiResponse.isSuccess && apiResponse.status === 200) {
          const { aggr, result, totalCnt } = apiResponse.data || {};

          const prevTeams = smartViewPageCount > 1 ? _getState().contract.smartViewResult : [];
          const smartViewData = [...prevTeams, ...(result || [])];

          loadFilter && dispatch(setSmartViewAggrList(aggr));
          dispatch(setSmartViewResult(smartViewData));
          dispatch(setSmartViewTotalCount(totalCnt));
          dispatch(setLoading(false));
          return true;
        } else {
          dispatch(setError(apiResponse.message[0]));
          dispatch(setLoading(false));
          return false;
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      dispatch(setLoading(false));
      return false;
    }
  };
};

export const similarFileUpload = (payload: SimilarFileUploadType, options?: HttpClientOptions) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    const { file, folderId, fileId, parseFlag, teamId } = payload;
    const formData = new FormData();

    // eslint-disable-next-line max-len
    const queryParams = `?${
      folderId ? `folderId=${folderId}` : ""
    }&parseFlag=${parseFlag}&teamId=${teamId}&relFileId=${fileId}`;

    formData.append("file", file);
    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/team/upload-files${queryParams}`,
        formData,
        options,
      );
      if (apiResponse.isSuccess && apiResponse.data) {
        // dispatch(clearFiles());
        // dispatch(clearTeamFiles());
        teamId && dispatch(fetchRightCalenderData({ fileId, folderId, teamId }));
        CommonService.toast({
          type: "success",
          message: apiResponse.data?.message ?? "File uploaded successfully",
        });
      } else {
        CommonService.toast({
          type: "error",
          message: apiResponse.message[0],
        });
        // dispatch(fileUploadError(apiResponse.message[0]));
      }
    } catch (error) {
      CommonService.toast({
        type: "success",
        message: (error as Error).message,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchContractLinkingFiles = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setLoading(true));
      // const { contractId = 1541, folderId = 265, pgn = 1, teamId = 80 } = payload;
      const { contractId, folderId, pgn = 1, teamId } = payload;

      const data = {
        contractId,
        folderId,
        pgn,
        teamId,
      };

      const apiResponse = await api.post(`/v1/linking/file-linking`, data);

      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data !== "") {
        const { searchResponse: { result = [] } = {} }: any = apiResponse.data || {};
        const dataList = pgn > 1 ? [..._getState().contract.linkContractList, ...result] : result;
        dispatch(setLinkContractList(dataList));
        dispatch(setLinkContractData(apiResponse.data));
        dispatch(setLoading(false));
        return true;
      } else {
        CommonService.toast({ message: apiResponse.message, type: "error" });
        dispatch(setLoading(false));
        return false;
      }
    } catch (error) {
      CommonService.toast({ message: (error as Error).message, type: "error" });
      dispatch(setLoading(false));
      return false;
    }
  };
};

export const linkContracts = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { contractId, folderId, teamId, relatedIds } = payload;

      const data = {
        contractId,
        folderId,
        teamId,
        relatedIds,
      };

      const apiResponse = await api.post(`/v1/linking/link-contracts`, data);

      if (apiResponse.isSuccess && apiResponse.status === 200) {
        CommonService.toast({ message: apiResponse.message, type: "success" });
        return true;
      } else {
        CommonService.toast({ message: apiResponse.message, type: "error" });
        return false;
      }
    } catch (error) {
      CommonService.toast({ message: (error as Error).message, type: "error" });
      return false;
    }
  };
};

export const fetchContractType = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(`/v1/cms/contract-type-list/1`);

      // if (apiResponse.isSuccess && apiResponse.status === 200) {
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setContractTypes(apiResponse.data));
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const getFileMeta = (payload: GetFileMetaPayloadTypes) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { fileId, folderId, teamId } = payload;
      const apiResponse = await api.get<ApiResponse>(
        `/v1/team/file-meta?fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setFileMeta(apiResponse.data));
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };
};

export const computeObligation = (payload: ComputeObligationPayloadTypes) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { fileId, folderId, teamId = null, notificationType = "inline" } = payload;
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/team/compute-obligation?fileIdCsv=${fileId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        teamId && typeof fileId === "number" && dispatch(getFileMeta({ fileId, folderId, teamId }));

        if (notificationType === "inline") {
          CommonService.toast({ type: "success", message: apiResponse.message[0] });
        }
        if (notificationType === "toast") {
          CommonService.popupToast({ type: "success", message: apiResponse.message[0] });
        }
        return true;
      } else {
        if (apiResponse.status === 1000) {
          if (notificationType === "inline") {
            CommonService.toast({ type: "error", message: apiResponse.message[0] });
          }
          if (notificationType === "toast") {
            CommonService.popupToast({ type: "error", message: apiResponse.message[0] });
          }
        }
      }
      return false;
    } catch (error) {
      if (notificationType === "inline") {
        CommonService.toast({ type: "error", message: (error as Error).message });
      }
      if (notificationType === "toast") {
        CommonService.popupToast({ type: "error", message: (error as Error).message });
      }
      dispatch(setError((error as Error).message));
      return false;
    }
  };
};

export const downloadExtractedContractData = (payload: GetFileMetaPayloadTypes) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { fileId, folderId, teamId } = payload;
      const apiResponse = await api.get<Blob>(
        `/v1/team/download-extracts?fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`,
        {
          responseType: "blob",
        },
      );
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        const blob = new Blob([apiResponse.data], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
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
            a.download = filename.trim();
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            CommonService.toast({
              type: "success",
              message: "Contract data downloaded successfully",
            });
          }
        });
      } else {
        if (apiResponse.status === 400) {
          CommonService.toast({ type: "error", message: "No contract data available" });
        }
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      CommonService.toast({ type: "error", message: (error as Error).message });
      dispatch(setError((error as Error).message));
    }
  };
};

export const saveContractSnippets = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { fileId, teamId, folderId, emailcsv, pageSnippets, timePeriod } = payload;
      const data = {
        fileId,
        teamId,
        folderId,
        pageSnippets,
        emailcsv,
        timePeriod: !timePeriod ? 7 : timePeriod,
      };
      const apiResponse = await api.post<ApiResponse>(`/v1/contract/snippet-share`, data);
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        // dispatch(setContractTypes(apiResponse.data));
        dispatch(fetchContractSnippetList({ contractId: fileId }));
        CommonService.toast({ type: "success", message: apiResponse.message });
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
          CommonService.toast({ type: "error", message: apiResponse.message });
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      CommonService.toast({ type: "error", message: (error as Error).message });
    }
  };
};

export const fetchRedactPreSignedUrl = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { fileId, folderId, teamId } = payload;
      const apiResponse = await api.post(
        `/v1/contract/presigned/redact-upload?fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`,
        {},
      );
      if (apiResponse.status === 200) {
        return apiResponse.data as any;
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const uploadPresignedRedactFile = (payload: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { url, file } = payload;
      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      if (response.status === 200) {
        return true;
      } else {
        CommonService.toast({
          type: "error",
          message: "File upload failed.",
        });
        return false;
      }
    } catch (error: any) {
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
      return false;
    }
  };
};

export const saveRedactedContract = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { fileId, teamId, folderId, emailcsv, timePeriod, redactId } = payload;

      const data = { fileId, teamId, folderId, emailcsv, timePeriod, redactId };

      const apiResponse = await api.post<ApiResponse>(`/v1/contract/presigned/redact-save`, data);
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(fetchRedactedContractList({ contractId: fileId }));
        CommonService.toast({ type: "success", message: apiResponse.message });
        return true;
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
          CommonService.toast({ type: "error", message: apiResponse.message });
        }
      }
      return false;
    } catch (error) {
      dispatch(setError((error as Error).message));
      CommonService.toast({ type: "error", message: (error as Error).message });
      return false;
    }
  };
};

export const fetchContractExtractedCoordinates = (payload: GetFileMetaPayloadTypes) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { fileId, folderId, teamId } = payload;
      const apiResponse = await api.get<any>(
        `/v1/team/extracts-coordinates?fileId=${fileId}${folderId ? `&folderId=${folderId}` : ""}&teamId=${teamId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        try {
          const data = JSON.parse(apiResponse.data).data;
          dispatch(setExtractedCoordinates(data));
        } catch (error) {
          CommonService.toast({ type: "error", message: (error as Error).message });
        }
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
          CommonService.toast({ type: "error", message: apiResponse.message });
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      CommonService.toast({ type: "error", message: (error as Error).message });
    }
  };
};

export const fetchPlaybookListContractView = (
  contractId: number,
  isUniversal: number,
  pgn: number,
) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<PaginatedApiResponse<PlaybookList>>(
        `/v1/playbook/fetch-by-contract-type?contractId=${contractId}&isUniversal=${isUniversal}&pgn=${pgn}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        if (isUniversal === 0) {
          dispatch(playbookResult(apiResponse.data?.result ?? []));
          dispatch(PBPerPageFetched(apiResponse.data));
        } else {
          dispatch(globalPlaybookResult(apiResponse.data?.result ?? []));
          dispatch(globalPBPerPageFetched(apiResponse?.data));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const runPlaybook = (contractId: number, playbookId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/playbook/run-review?contractId=${contractId}&playbookId=${playbookId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({ type: "success", message: apiResponse.message[0] });
      } else {
        CommonService.popupToast({ type: "error", message: apiResponse.message[0] });
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };
};

const filterPlaybookListByStatus = (playbookList: any[], status: string) => {
  return playbookList
    .map((category) => ({
      key: category.key,
      value: category.value.filter((item: { status: string }) => item.status === status),
    }))
    .filter((category) => category.value.length > 0);
};

export const fetchContractSnippetPdfData = (token: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(`/v1/contract/get-snippet?token=${token}`, {
        isAuth: false,
      });
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        return String(apiResponse.data);
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
        return null;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return null;
    }
  };
};

export const fetchRedactedContractPdfData = (token: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(`/v1/contract/get-redact?token=${token}`, {
        isAuth: false,
      });
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        return String(apiResponse.data);
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
        return null;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return null;
    }
  };
};

export const fetchSharedContractPdfData = (token: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(
        `/v1/contract/external/get-contract?token=${token}`,
        {
          isAuth: false,
        },
      );
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        return String(apiResponse.data);
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
        return null;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return null;
    }
  };
};

export const fetchContractSnippetList = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { contractId, pageno = 1 } = payload;
      const apiResponse = await api.get<SnippetListResponse>(
        `/v1/contract/list-snippet?contractId=${contractId}&pgn=${pageno}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        dispatch(setContractSnippetList(apiResponse?.data.result || []));
        const { totct, pgn, perpg } = apiResponse?.data || {};
        dispatch(setContractSnippetListInfo({ totct, pgn, perpg }));
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
        return null;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return null;
    }
  };
};

export const fetchRedactedPdfReadData = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { redactId } = payload;
      const apiResponse = await api.get<ApiResponse>(
        `/v1/contract/redact-file-byid?redactId=${redactId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        return String(apiResponse.data);
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
        return null;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return null;
    }
  };
};

export const fetchRedactedContractList = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const { contractId, pageno = 1 } = payload;
      const apiResponse = await api.get<SnippetListResponse>(
        `/v1/contract/list-redact?contractId=${contractId}&pgn=${pageno}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        dispatch(setRedactedContractList(apiResponse?.data.result || []));
        const { totct, pgn, perpg } = apiResponse?.data || {};
        dispatch(setRedactedContractListInfo({ totct, pgn, perpg }));
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
        return null;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return null;
    }
  };
};

export const updateSummary = (payload: ExtractedSummary) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setUpdateSummaryLoading(true));
      const apiResponse = await api.post<ApiResponse>(
        "/v1/team/update-processed-extracts",
        payload,
      );
      if (apiResponse.data && apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setUpdateSummaryLoading(false));
        CommonService.toast({
          type: "success",
          message: (apiResponse.message[0] || "Summary Added Successfully") as ToastContent,
        });
      } else {
        dispatch(setUpdateSummaryLoading(false));
        CommonService.toast({
          type: "error",
          message: (apiResponse.message[0] || "Something went wrong") as ToastContent,
        });
        dispatch(setError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error: any) {
      dispatch(setUpdateSummaryLoading(false));
      dispatch(setError(error.message || "An error occurred"));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchFileNavigationData = (payload: FileNavigationPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const {
        fileId,
        teamId,
        folderId = null,
        pgn = null,
        source = null,
        contractTypeId = null,
        teamUserId = null,
        sIndexHash = null,
        keyword = null,
        notContractIds = null,
        fromDate = null,
        toDate = null,
      } = payload;
      const data = {
        contractTypeId,
        fileId,
        folderId,
        pgn,
        source,
        teamId,
        teamUserId,
        sIndexHash,
        keyword,
        notContractIds,
        fromDate,
        toDate,
      };
      const apiResponse = await api.post<FileNavigationApiResponse>(`/v1/team/files-nav`, data);
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        dispatch(setFileNavigationStack(apiResponse.data));
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
        return null;
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
      return null;
    }
  };
};

const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    saveOriginalFile: (state, action) => {
      state.file = action.payload;
      state.errorMessage = "";
      state.originalFileError = "";
    },
    clearOriginalFile: (state) => {
      state.file = "";
      state.errorMessage = "";
      state.originalFileError = "";
      state.fileMeta = null;
      state.extractedCoordinates = [];
      state.currentHighlightedPage = [];
      state.fileNavigationStack = null;
      state.snippets = [];
      state.originalPDFContent = null;
    },
    saveExtractedClause: (state, action) => {
      state.extractedClause = action.payload;
      state.errorMessage = "";
    },
    saveExceptions: (state, action) => {
      state.exceptions = action.payload;
      state.errorMessage = "";
    },
    saveTableData: (state, action) => {
      state.tableData = action.payload;
      state.errorMessage = "";
    },
    clearTableData: (state) => {
      state.tableData = [];
      state.errorMessage = "";
    },
    setError: (state, action) => {
      state.errorMessage = action.payload;
    },
    setOriginalFileError: (state, action) => {
      state.originalFileError = action.payload;
    },
    sideBarContentFetched: (state, action) => {
      state.sideBarData = action.payload.data;
      state.errorMsg = "";
      state.sideBarSummary = action.payload.SUMMARY;
      state.summary = {
        raisedAlertflag: action.payload.raisedAlertflag,
        createdBy: action.payload.created_by,
      };
    },
    setAlertRsponse: (state, action) => {
      state.summary = {
        ...state.summary,
        ...action.payload,
      };
    },
    clearSideBarContent: (state) => {
      state.sideBarData = [];
      state.errorMsg = "";
      state.sideBarSummary = "";
      state.summary = {};
    },
    sideBarContentError: (state, action) => {
      state.errorMsg = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUpdateSummaryLoading: (state, action) => {
      state.isUpdateSummaryLoading = action.payload;
    },
    setClipboardText: (state, action) => {
      state.clipboardText = action.payload;
    },
    clearClipboardText: (state) => {
      state.clipboardText = "";
    },
    setRightsSummary: (state, action) => {
      state.rightsSummary = action.payload;
    },
    clearRightsSummary: (state) => {
      state.rightsSummary = "";
    },
    setExtractedDocument: (state, action) => {
      state.extractedDocument = action.payload;
    },
    clearExtractedDocument: (state) => {
      state.extractedDocument = "";
    },
    setFileId: (state, action) => {
      state.fileId = action.payload;
    },
    clearFileId: (state) => {
      state.fileId = 0;
    },
    shareUsersFetched: (state, action) => {
      state.shareUser = action.payload.userMetas;
      state.errorMsg = "";
      state.fileName = action.payload.fileName;
    },
    setRightCalender: (state, action) => {
      state.calenderData = action.payload;
    },
    setPlaybookList: (state, action) => {
      state.playbookList = action.payload;
      state.playbookList_ok = filterPlaybookListByStatus(action.payload, "OK");
      state.playbookList_missing = filterPlaybookListByStatus(action.payload, "MISSING");
      state.playbookList_gap = filterPlaybookListByStatus(action.payload, "GAP");
    },
    setSmartViewAggrList: (state, action) => {
      state.smartViewAggrList = action.payload;
    },
    setSmartViewResult: (state, action) => {
      state.smartViewResult = action.payload;
    },
    setSmartViewTotalCount: (state, action) => {
      state.smartViewTotalCount = action.payload;
    },
    handleFileToOpen: (state, action: PayloadAction<FileToOpenType | null>) => {
      state.fileToOpen = action.payload;
    },
    setLinkContractList: (state, action) => {
      state.linkContractList = action.payload;
    },
    setLinkContractData: (state, action) => {
      state.linkContractData = action.payload;
    },
    resetLinkContractData: (state) => {
      state.linkContractList = [];
      state.linkContractData = null;
    },
    setPreviewFile: (state, action) => {
      state.previewFile = action.payload;
    },
    setContractTypes: (state, action) => {
      state.contractTypes = action.payload;
    },
    setFileMeta: (state, action) => {
      state.fileMeta = action.payload;
    },
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload || [];
    },
    setExtractedCoordinates: (state, action) => {
      state.extractedCoordinates = action.payload;
    },
    setCurrentHighlightedPage: (state, action) => {
      state.currentHighlightedPage = action.payload;
    },
    playbookResult: (state, action: PayloadAction<PlaybookList[]>) => {
      state.playbookResult = action.payload;
    },
    globalPlaybookResult: (state, action: PayloadAction<PlaybookList[]>) => {
      state.globalPlaybookResult = action.payload;
    },
    clearPlaybookReviewData: (state) => {
      state.playbookResult = [];
      state.globalPlaybookResult = [];
      state.globalPBReviewResponse = initialState.globalPBReviewResponse;
      state.PBFilesReviewResponse = initialState.PBFilesReviewResponse;
    },
    setSnippets: (state, action) => {
      state.snippets = action.payload;
    },
    setContractSnippetList: (state, action) => {
      state.contractSnippetList = action.payload;
    },
    setContractSnippetListInfo: (state, action) => {
      state.contractSnippetListInfo = action.payload;
    },
    setRedactedContractListInfo: (state, action) => {
      state.redactedContractListInfo = action.payload;
    },
    setFileNavigationStack: (state, action: PayloadAction<FileNavigationState>) => {
      state.fileNavigationStack = action.payload;
    },
    setOriginalPDFContent: (state, action) => {
      state.originalPDFContent = action.payload;
    },
    setRedactedContractBlob: (state, action) => {
      state.redactedContractBlob = action.payload;
    },
    setRedactedContractList: (state, action) => {
      state.redactedContractList = action.payload;
    },
    globalPBPerPageFetched: (state, action: PayloadAction<PaginatedApiResponse<PlaybookList>>) => {
      state.globalPBReviewResponse = action.payload;
      state.errorMessage = "";
    },
    PBPerPageFetched: (state, action: PayloadAction<PaginatedApiResponse<PlaybookList>>) => {
      state.PBFilesReviewResponse = action.payload;
      state.errorMessage = "";
    },
  },
});

export const {
  saveOriginalFile,
  setError,
  saveExtractedClause,
  saveExceptions,
  saveTableData,
  clearOriginalFile,
  clearTableData,
  sideBarContentFetched,
  sideBarContentError,
  setLoading,
  setUpdateSummaryLoading,
  clearSideBarContent,
  setOriginalFileError,
  setClipboardText,
  clearClipboardText,
  setRightsSummary,
  clearRightsSummary,
  setExtractedDocument,
  clearExtractedDocument,
  setFileId,
  clearFileId,
  shareUsersFetched,
  setRightCalender,
  setPlaybookList,
  setAlertRsponse,
  setSmartViewAggrList,
  setSmartViewResult,
  setSmartViewTotalCount,
  handleFileToOpen,
  setLinkContractList,
  setLinkContractData,
  resetLinkContractData,
  setPreviewFile,
  setContractTypes,
  setFileMeta,
  setSelectedItems,
  setExtractedCoordinates,
  setCurrentHighlightedPage,
  playbookResult,
  globalPlaybookResult,
  globalPBPerPageFetched,
  clearPlaybookReviewData,
  setSnippets,
  setContractSnippetList,
  setContractSnippetListInfo,
  setFileNavigationStack,
  setOriginalPDFContent,
  setRedactedContractBlob,
  setRedactedContractList,
  setRedactedContractListInfo,
  PBPerPageFetched,
} = contractSlice.actions;
export const contractReducer = contractSlice.reducer;
