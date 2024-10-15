import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { CommonService } from "core/services/common.service";
import { HttpClientOptions } from "core/services/http-client";
import { base64toBlob, buildDataEndpoint, downloadFileFromBlobUrl, getAuth } from "core/utils";
import { ApiResponse, ApiResponseResetPassword } from "pages/auth/auth.model";
import { clearTeamFiles } from "pages/manage-team/team-files/team-files.redux";
import {
  AddFolderPayload,
  ApiResponseSharedWithMe,
  FileSharedSenderType,
  FileSharedType,
  FileSharedTypeResponse,
  FileSharedWithMe,
  FileStatusCheckPayload,
  FileType,
  FileUploadType,
  FilesFoldersResponseType,
  FilesResponseType,
  FolderType,
  PaginatedApiResponse,
  ShareFilePayload,
  ShareToExternalUserPayload,
  SummaryAlert,
  UploadFolderPayload,
  UploadingFileType,
  UserData,
  foldersResponseType,
} from "pages/user-dashboard/dashboard.model";
import { PRE_CONTRACT, ROUTE_TEAM_FILES, ROUTE_USER_DASHBOARD, UPLOAD_AND_SIGN } from "src/const";
import { AppDispatch } from "src/redux/create-store";

export interface DashboardState extends FilesFoldersResponseType {
  SharedWithMeFileList_curr: Array<FileSharedWithMe>;
  SharedWithMeFileList_prev: Array<FileSharedWithMe>;
  SharedWithMeFileList_prev2: Array<FileSharedWithMe>;
  recentFilesList: Array<FileType>;
  FileSharedList: FileSharedTypeResponse;
  userSearchData: Array<FileSharedType>;
  FileSharedSenderList: Array<FileSharedSenderType>;
  errorMessage: string;
  filesStatus: Array<FileType>;
  isLoading: boolean;
  isShareDialogOpen: boolean;
  fileId: number;
  SharedWithMeResponse_curr: ApiResponseSharedWithMe;
  SharedWithMeResponse_prev: ApiResponseSharedWithMe;
  SharedWithMeResponse_prev2: ApiResponseSharedWithMe;
  filesResponse: FilesResponseType & {
    isLoading?: boolean;
  };
  foldersResponse: foldersResponseType & {
    isLoading?: boolean;
  };
  uploadingFiles: Array<UploadingFileType>;
  TopSharedFileUsers: Array<UserData>;
  suggestedFiles: Array<any>;
  isRecentFilesLoading: boolean;
  summaryAlerts: SummaryAlert[];
  createNew: string;
  folderBreadcrumbs: foldersResponseType & {
    isLoading?: boolean;
  };
  folderBreadcrumbsPerPage: Array<FolderType>;
  moveFolderBreadcrumbs: Array<FolderType & { pgn?: number; filePgn?: number }>;
  recentFilesResponse: FilesResponseType & {
    isLoading?: boolean;
  };
  totalFileCount: number;
  fileListPageCount: number;
  fileListLoading: boolean;
  selectedItems: Array<number>;
}

const initialState: DashboardState = {
  recentFilesList: [],
  fileList: [],
  SharedWithMeFileList_curr: [],
  SharedWithMeFileList_prev: [],
  SharedWithMeFileList_prev2: [],
  folderList: [],
  FileSharedList: [],
  userSearchData: [],
  FileSharedSenderList: [],
  errorMessage: "",
  filesStatus: [],
  isLoading: false,
  isShareDialogOpen: false,
  fileId: 0,
  SharedWithMeResponse_curr: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  SharedWithMeResponse_prev: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  SharedWithMeResponse_prev2: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  fileCount: 0,
  folderCount: 0,
  perpg: 0,
  pgn: 0,
  filesResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  recentFilesResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  foldersResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  isRecentFilesLoading: false,
  uploadingFiles: [],
  TopSharedFileUsers: [],
  suggestedFiles: [],
  summaryAlerts: [],
  createNew: "",
  folderBreadcrumbs: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  folderBreadcrumbsPerPage: [],
  moveFolderBreadcrumbs: [],
  totalFileCount: 0,
  fileListPageCount: 1,
  fileListLoading: false,
  selectedItems: [],
};
export const createFolder = (payload: AddFolderPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>("/v1/team/create-folder", payload);
      if (apiResponse.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: (apiResponse.data as unknown as string) ?? "Created Successfully",
        });
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const getFilesFolders = (currentPage: number = 1, folder?: FolderType) => {
  const queryParams = folder ? `&folderId=${folder?.id}` : "";
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    if (currentPage !== 1) {
      dispatch(setFoldersLoading(true));
    }
    dispatch(clearFolders());
    try {
      const apiResponse = await api.get<FilesFoldersResponseType>(
        `/v1/my-files-folder?status=1&pgn=${currentPage}${queryParams}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(filesFoldersFetched(apiResponse.data));
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    } finally {
      dispatch(setFoldersLoading(false));
    }
  };
};

export const getRecentFilesList = (
  payload?: Partial<{ size: number; pgn: number; dataReset: boolean }>,
) => {
  const { size = 6, pgn = 1, dataReset = false } = payload || {};
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = new URLSearchParams();
    if (size) queryParams.set("size", size.toString());
    if (pgn) queryParams.set("pgn", pgn.toString());
    dispatch(setRecentFilesLoading(true));
    // if (dataReset) {
    //   dispatch(recentFilesFetched([]));
    //   dispatch(recentFilesPerPageFetched(initialState.recentFilesResponse));
    // }
    try {
      const apiResponse = await api.get<PaginatedApiResponse<FileType>>(`/v1/my-latest-files`, {
        params: queryParams,
      });
      if (apiResponse?.isSuccess && apiResponse.data) {
        // const filesData = [
        //   ..._getState().dashboard.recentFilesList,
        //   ...(apiResponse.data?.result || []),
        // ];
        dispatch(recentFilesFetched(apiResponse.data?.result));
        dispatch(recentFilesPerPageFetched(apiResponse.data));
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    } finally {
      dispatch(setRecentFilesLoading(false));
    }
  };
};

export const getRecentDashboardFilesList = (
  payload?: Partial<{ pgn: number; dataReset: boolean }>,
) => {
  const { pgn = 1, dataReset = false } = payload || {};
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = new URLSearchParams();
    if (pgn) queryParams.set("pgn", pgn.toString());
    dispatch(setRecentFilesLoading(true));

    try {
      const apiResponse = await api.get<PaginatedApiResponse<FileType>>(
        `/v1/dashboard/latest-files`,
        {
          params: queryParams,
        },
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(recentFilesFetched(apiResponse.data?.result));
        dispatch(recentFilesPerPageFetched(apiResponse.data));
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    } finally {
      dispatch(setRecentFilesLoading(false));
    }
  };
};

export const fileUpload = (payload: FileUploadType, options?: HttpClientOptions) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    const formData = new FormData();
    formData.append("file", payload.file);
    const queryParams = new URLSearchParams();
    if (payload.folder) queryParams.append("folderId", payload.folder.id.toString());
    if (typeof payload.parseFlag === "number")
      queryParams.append("parseFlag", payload.parseFlag.toString());
    if (payload.teamId) queryParams.append("teamId", payload.teamId.toString());
    if (payload.grcParseFlag) queryParams.append("grcParseFlag", payload.grcParseFlag.toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/team/upload-files${queryString}`,
        formData,
        options,
      );
      if (apiResponse.isSuccess && apiResponse.data) {
        dispatch(clearFiles());
        dispatch(clearTeamFiles());
        CommonService.popupToast({
          type: "success",
          message: (apiResponse.data as unknown as string) ?? "File uploaded successfully",
        });
        return true;
      } else {
        dispatch(fileUploadError(apiResponse.message[0]));
        return false;
      }
    } catch (error) {
      CommonService.popupToast({
        type: "error", // Changed to "error" to correctly reflect the nature of the toast.
        message: (error as Error).message,
      });
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fileStatusCheck = (payload: FileStatusCheckPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.post<Array<FileType>>("/v1/files-status-check", payload);
    if (apiResponse.isSuccess && apiResponse.data) {
      dispatch(filesStatusFetched(apiResponse.data));
      return apiResponse;
    } else {
      dispatch(fileUploadError(apiResponse.message[0]));
    }
  };
};

export const uploadFolderToDrive = (payload: UploadFolderPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post("/v1/team/share-drive-files", payload);
      if (apiResponse.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "File shared successfully",
        });
      } else {
        dispatch(uploadFolderError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(uploadFolderError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const getSharedFile = (fileId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<Array<FileSharedType>>(
      `/v1/shared-file-profiles?fileId=${fileId}`,
    );
    if (apiResponse?.isSuccess && apiResponse?.data) {
      dispatch(sharedFilesFetched(apiResponse.data));
      dispatch(setFileId(fileId));
    } else {
      dispatch(shareFileError(apiResponse.message[0]));
    }
  };
};

export const getSharedFileSender = (fileId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<Array<FileSharedSenderType>>(
        `/v1/team/list-users/${fileId}`,
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(sharedFilesSenderFetched(apiResponse.data));
        dispatch(openShareDialog());
      } else {
        dispatch(shareFileError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(shareFileError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const submitFileShare = (payload: ShareFilePayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>("/v1/share-files-submit", payload);
      if (apiResponse.isSuccess) {
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0] ?? "Shared Successfully",
        });
      } else {
        dispatch(shareFileError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(shareFileError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const getSharedWithMeFile = (currentPage: number, monthId: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<ApiResponseSharedWithMe>(
        `/v1/my-shared-files?status=1&pgn=${currentPage}&monthId=${monthId}`,
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        if (monthId === "curr") {
          const filesDataCurr = [
            ..._getState().dashboard.SharedWithMeFileList_curr,
            ...(apiResponse.data?.result || []),
          ];
          dispatch(sharedWithMeFilesFetchedCurr(filesDataCurr));
          dispatch(sharedWithMeResponseCurr(apiResponse.data));
        } else if (monthId === "prev") {
          const filesDataPrev = [
            ..._getState().dashboard.SharedWithMeFileList_prev,
            ...(apiResponse.data?.result || []),
          ];
          dispatch(sharedWithMeFilesFetchedPrev(filesDataPrev));
          dispatch(sharedWithMeResponsePrev(apiResponse.data));
        } else if (monthId === "prev2") {
          const filesDataOth = [
            ..._getState().dashboard.SharedWithMeFileList_prev2,
            ...(apiResponse.data?.result || []),
          ];
          dispatch(sharedWithMeFilesFetchedOth(filesDataOth));
          dispatch(sharedWithMeResponseOth(apiResponse.data));
        }
      } else {
        dispatch(shareFileError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(shareFileError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const getFoldersPerPage = (currentPage: number, folder?: FolderType) => {
  const queryParams = folder ? `&folderId=${folder?.id}` : "";
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    // if (currentPage !== 1) {
    dispatch(setFoldersLoading(true));
    // }
    try {
      const apiResponse = await api.get<foldersResponseType>(
        `/v1/my-folder-list?status=1&pgn=${currentPage}${queryParams}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        if (currentPage > 1 && apiResponse.data.result.length === 0) {
          dispatch(getFoldersPerPage(currentPage - 1, folder));
        } else {
          dispatch(foldersPerPageFetched(apiResponse.data?.result || []));
          dispatch(foldersFetched(apiResponse.data));
        }
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    } finally {
      dispatch(setFoldersLoading(false));
    }
  };
};
export const getFoldersForBreadcrumbs = (currentPage: number, folder?: FolderType) => {
  const queryParams = folder ? `&folderId=${folder?.id}` : "";
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    if (currentPage > 1) {
      dispatch(setBreadCrumbsLoading(true));
    } else {
      dispatch(foldersPerPageBreadcrumbsFetched([]));
      dispatch(
        foldersBreadcrumbsFetched({
          totct: 0,
          pgn: 0,
          perpg: 0,
          result: [],
          isLoading: false,
        }),
      );
    }
    try {
      const apiResponse = await api.get<foldersResponseType>(
        `/v1/my-folder-list?status=1&pgn=${currentPage}${queryParams}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        const foldersData = [
          ..._getState().dashboard.folderBreadcrumbs.result,
          ...(apiResponse.data.result || []),
        ];
        dispatch(foldersPerPageBreadcrumbsFetched(foldersData));
        dispatch(foldersBreadcrumbsFetched(apiResponse.data));
      } else {
        dispatch(foldersBreadcrumbsError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    } finally {
      dispatch(setBreadCrumbsLoading(false));
      dispatch(setLoading(false));
    }
  };
};

export const forgetPassword = (email: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<ApiResponseResetPassword>(
      `/v1/profile/forgot-password?emailId=${email}`,
      {
        isAuth: false,
      },
    );
    console.log("api response", apiResponse);
    if (apiResponse?.isSuccess && apiResponse?.data) {
      console.log("api response", apiResponse);
    } else {
      dispatch(shareFileError(apiResponse.message[0]));
    }
  };
};

export const getFilePerPage = (
  currentPage: number,
  folder?: FolderType,
  mergeResponse: boolean = false,
) => {
  const queryParams = folder ? `&folderId=${folder?.id}` : "";
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setLoading(true));
      // const fileListPageCount = _getState().dashboard.fileListPageCount || 1;
      // if (mergeResponse && fileListPageCount > 1) {
      //   let fileList: FileType[] = [];
      //   for (let i: number = 1; i <= fileListPageCount; i++) {
      //     const apiResponse = await api.get<FilesResponseType>(
      //       `/v1/my-file-list?status=1&pgn=${i}${queryParams}`,
      //     );
      //     if (apiResponse.isSuccess && apiResponse.status === 200) {
      //       fileList = [...fileList, ...(apiResponse.data?.result || [])];
      //       dispatch(totalFileCount(apiResponse.data?.totct));
      //     }
      //   }
      //   dispatch(filesPerPageFetched(fileList));
      //   dispatch(setLoading(false));
      // } else {
      const apiResponse = await api.get<FilesResponseType>(
        `/v1/my-file-list?status=1&pgn=${currentPage || 1}${queryParams}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        if (currentPage > 1 && apiResponse.data?.result?.length === 0) {
          dispatch(getFilePerPage(currentPage - 1, folder));
        } else {
          dispatch(filesPerPageFetched(apiResponse.data?.result || []));
          dispatch(filesFetched(apiResponse.data || initialState.filesResponse));
          dispatch(totalFileCount(apiResponse.data?.totct));
          dispatch(setLoading(false));
        }
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
        dispatch(setLoading(false));
      }
      // }
    } catch (error: any) {
      dispatch(filesFoldersError((error as Error).message));
      dispatch(setLoading(false));
    } finally {
      if (
        _getState().dashboard.fileList.length === 0 &&
        _getState().dashboard.folderList.length === 0
      ) {
        dispatch(renderUploadContainer("uploadFile"));
      } else {
        dispatch(renderUploadContainer(""));
      }
    }
  };
};

export const updateFilesArr = (id: number) => {
  return async (dispatch: AppDispatch, _getState: GetState) => {
    const updatedFiles = _getState().dashboard.fileList.filter((file) => file.id !== id);
    dispatch(updateFilesInState(updatedFiles));
  };
};

export const getTopTwoSharedUsers = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<UserData[]>("/v1/shared-suggested-files");
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(fileFetchedTopTwoUsers(apiResponse.data));
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fetchSuggestedFilesList = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<UserData[]>("/v1/my-suggested-files");
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(setSuggestedFiles(apiResponse.data));
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const fetchMyDriveSummaryAlerts = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<SummaryAlert[]>("/v1/myfiles-alert-summary");
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(summaryAlertsFetched(apiResponse.data));
      } else {
        dispatch(summaryAlertsError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(summaryAlertsError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const deleteFile = (fileId: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/file-action?fileId=${fileId}&status=0`,
        {},
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "Deleted Successfully",
        });
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    }
  };
};

export const deleteAllFile = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { fileIds, folder, myDriveFile = false } = payload;

    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/file-action?fileIds=${fileIds}&status=0`,
        {},
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "Deleted Successfully",
        });
        if (myDriveFile) {
          await dispatch(fetchSuggestedFilesList());
          await dispatch(getRecentFilesList({ dataReset: true }));
          await dispatch(getFilePerPage(folder?.filePgn || 1, folder));
        }
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    }
  };
};

export const updateFilesArrSharedWithMe = (id: number, monthId: string) => {
  return async (dispatch: AppDispatch, _getState: GetState) => {
    let updatedFiles;
    if (monthId === "curr") {
      updatedFiles = _getState().dashboard.SharedWithMeFileList_curr.filter(
        (file) => file.id !== id,
      );
      dispatch(sharedWithMeFilesFetchedCurr(updatedFiles));
    } else if (monthId === "prev") {
      updatedFiles = _getState().dashboard.SharedWithMeFileList_prev.filter(
        (file) => file.id !== id,
      );
      dispatch(sharedWithMeFilesFetchedPrev(updatedFiles));
    } else if (monthId === "prev2") {
      updatedFiles = _getState().dashboard.SharedWithMeFileList_prev2.filter(
        (file) => file.id !== id,
      );
      dispatch(sharedWithMeFilesFetchedOth(updatedFiles));
    }
  };
};

export const renderUploadContainer = (value: string) => (dispatch: AppDispatch) => {
  dispatch(setRenderContainer(value));
};

export const userSearchList = (keyword: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<FileSharedType[]>(
        `/v1/team/suggest-users?terms=${keyword}`,
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(userSearchListSuccesss(apiResponse.data));

        return apiResponse?.data;
      } else {
        dispatch(shareFileError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(shareFileError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const shareToExternalUser = (payload: ShareToExternalUserPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>("/v1/contract/external/share-contract", payload);
      if (apiResponse.isSuccess) {
        dispatch(getSharedFile(payload.fileId));
      } else {
        dispatch(shareFileError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(shareFileError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const fileShareAddRemove = (payload: ShareFilePayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>("/v1/action-shared-users", payload);
      if (apiResponse.isSuccess) {
        dispatch(getSharedFile(payload.fileId));
      } else {
        dispatch(shareFileError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(shareFileError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const getFilterDataMyDrive = (currentPage: number, folder?: FolderType) => {
  const queryParams = folder ? `&folderId=${folder?.id}` : "";
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    if (currentPage !== 1) {
      dispatch(setFilesLoading(true));
    }
    const dataEndpoint = buildDataEndpoint(
      "/v1/myfiles-filter?status=1",
      currentPage,
      queryParams,
      _getState(),
    );
    try {
      const apiResponse = await api.get<FilesResponseType>(dataEndpoint);
      if (apiResponse?.isSuccess && apiResponse.data) {
        // const filesData = [..._getState().dashboard.fileList, ...(apiResponse.data?.result || [])];
        dispatch(filesPerPageFetched(apiResponse.data.result));
        dispatch(filesFetched(apiResponse.data));
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    } finally {
      dispatch(setFilesLoading(false));
    }
  };
};

export const getFilterSharedWithMeFile = (currentPage: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    const dataEndpoint = buildDataEndpoint(
      "/v1/team/shared-files-filter?status=1",
      currentPage,
      "",
      _getState(),
    );
    try {
      const apiResponse = await api.get<ApiResponseSharedWithMe>(dataEndpoint);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        // const filesDataCurr = [
        //   ..._getState().dashboard.SharedWithMeFileList_curr,
        //   ...(apiResponse.data?.result || []),
        // ];
        dispatch(sharedWithMeFilesFetchedCurr(apiResponse.data?.result));
        dispatch(sharedWithMeResponseCurr(apiResponse.data));
      } else {
        dispatch(shareFileError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(shareFileError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const deleteFolder = (
  obj: { folderId: number; teamId?: number } = {
    folderId: 0,
    teamId: 0,
  },
) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<ApiResponse>(`/v1/team/folder-action`, {
        ...obj,
        status: 0,
      });
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0] ?? "Deleted Successfully",
        });
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    }
  };
};
export const moveFile = (
  payload: {
    fileId: number;
    targetFolderName?: string;
    targetTeamId?: number;
  },
  route?: string,
) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    let apiUrl = "";
    switch (route) {
      case UPLOAD_AND_SIGN:
        apiUrl = `/v1/presigned/upload-sign/move-contract`;
        break;
      case PRE_CONTRACT:
        apiUrl = `/v1/presigned/move-contract`;
        break;
      case ROUTE_TEAM_FILES:
      case ROUTE_USER_DASHBOARD:
      default:
        apiUrl = `/v1/move-myfile`;
        break;
    }
    try {
      const apiResponse = await api.post<ApiResponse>(apiUrl, payload);
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0],
        });
        return apiResponse;
      } else {
        dispatch(filesFoldersError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(filesFoldersError((error as Error).message));
    }
  };
};

export const downloadCSVData = (payload: { fileIdCsv: number[]; teamId: number }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { fileIdCsv, teamId } = payload;
    const apiResponse = await api.get<string>(`/v1/team/bulk/download-extracts`, {
      params: {
        fileIdCsv: fileIdCsv.toString(),
        teamId,
      },
    });
    if (apiResponse?.isSuccess && apiResponse?.data) {
      let fileName: string | undefined;
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
          fileName = filename.trim();
        }
      });
      downloadFileFromBlobUrl(
        base64toBlob(
          apiResponse.data,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ),
        `${fileName}`,
      );
      CommonService.popupToast({
        type: "success",
        message: "Contract data summary downloaded successfully",
      });
    } else {
      CommonService.popupToast({
        type: "error",
        message: apiResponse.message[0],
      });
      dispatch(filesFoldersError(apiResponse.message[0]));
    }
  };
};

const filesFolderSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    filesFoldersFetched: (state, action: PayloadAction<FilesFoldersResponseType>) => {
      state.fileList = [];
      state.folderList = action.payload.folderList;
      state.foldersResponse.result = action.payload.folderList;
      state.foldersResponse.perpg = action.payload.perpg;
      state.foldersResponse.totct = action.payload.folderCount;
      state.foldersResponse.pgn = action.payload.pgn;
      state.errorMessage = "";
    },
    clearFolders: (state) => {
      state.folderList = [];
    },
    clearFiles: (state) => {
      state.fileList = [];
    },
    filesFoldersError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    fileUploadSuccess: (state) => {
      state.errorMessage = "";
    },
    fileUploadError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    recentFilesFetched: (state, action: PayloadAction<Array<FileType>>) => {
      state.recentFilesList = action.payload;
    },
    recentFilesListError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    uploadFolderError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    filesStatusFetched: (state, action: PayloadAction<Array<FileType>>) => {
      state.filesStatus = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setFoldersLoading: (state, action: PayloadAction<boolean>) => {
      state.foldersResponse.isLoading = action.payload;
    },
    setFilesLoading: (state, action: PayloadAction<boolean>) => {
      state.filesResponse.isLoading = action.payload;
    },
    setRecentFilesLoading: (state, action: PayloadAction<boolean>) => {
      state.isRecentFilesLoading = action.payload;
    },
    sharedFilesFetched: (state, action: PayloadAction<Array<FileSharedType>>) => {
      state.FileSharedList = action.payload;
    },
    sharedFilesSenderFetched: (state, action: PayloadAction<Array<FileSharedSenderType>>) => {
      state.FileSharedSenderList = action.payload;
    },
    openShareDialog: (state) => {
      state.isShareDialogOpen = true;
    },
    closeShareDialog: (state) => {
      state.isShareDialogOpen = false;
    },
    shareFileError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setFileId: (state, action: PayloadAction<number>) => {
      state.fileId = action.payload;
    },
    sharedWithMeFilesFetchedCurr: (state, action: PayloadAction<Array<FileSharedWithMe>>) => {
      state.SharedWithMeFileList_curr = action.payload;
    },
    sharedWithMeResponseCurr: (state, action: PayloadAction<ApiResponseSharedWithMe>) => {
      state.SharedWithMeResponse_curr = action.payload;
    },
    sharedWithMeFilesFetchedPrev: (state, action: PayloadAction<Array<FileSharedWithMe>>) => {
      state.SharedWithMeFileList_prev = action.payload;
    },
    sharedWithMeResponsePrev: (state, action: PayloadAction<ApiResponseSharedWithMe>) => {
      state.SharedWithMeResponse_prev = action.payload;
    },
    sharedWithMeFilesFetchedOth: (state, action: PayloadAction<Array<FileSharedWithMe>>) => {
      state.SharedWithMeFileList_prev2 = action.payload;
    },
    sharedWithMeResponseOth: (state, action: PayloadAction<ApiResponseSharedWithMe>) => {
      state.SharedWithMeResponse_prev2 = action.payload;
    },
    clearReduxStateSharedWithMe: (state) => {
      state.SharedWithMeResponse_curr.result = [];
      state.SharedWithMeFileList_curr = [];
      state.SharedWithMeResponse_prev.result = [];
      state.SharedWithMeFileList_prev = [];
      state.SharedWithMeResponse_prev2.result = [];
      state.SharedWithMeFileList_prev2 = [];
      state.TopSharedFileUsers = [];
      state.errorMessage = "";
    },
    foldersPerPageFetched: (state, action: PayloadAction<Array<FolderType>>) => {
      state.folderList = action.payload;
      state.errorMessage = "";
    },
    recentFilesPerPageFetched: (state, action: PayloadAction<PaginatedApiResponse<FileType>>) => {
      state.recentFilesResponse = action.payload;
      state.errorMessage = "";
    },
    foldersFetched: (state, action: PayloadAction<foldersResponseType>) => {
      state.foldersResponse = action.payload;
      state.errorMessage = "";
    },
    updateFilesInState: (state, action: PayloadAction<Array<FileType>>) => {
      state.fileList = action.payload;
      state.errorMessage = "";
    },
    filesPerPageFetched: (state, action: PayloadAction<Array<FileType>>) => {
      state.fileList = action.payload;
      state.errorMessage = "";
    },
    filesFetched: (state, action: PayloadAction<FilesResponseType>) => {
      state.filesResponse = action.payload;
      state.errorMessage = "";
    },
    setUploadProgress: (state, action: PayloadAction<UploadingFileType>) => {
      const { id } = action.payload;
      const existingFileIndex = state.uploadingFiles.findIndex((file) => file.id === id);

      if (existingFileIndex !== -1) {
        state.uploadingFiles[existingFileIndex] = action.payload;
      } else {
        state.uploadingFiles.push(action.payload);
      }
    },
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      const { uploadingFiles } = state;
      const updatedFiles = uploadingFiles.filter((item) => item.id !== action.payload);
      state.uploadingFiles = updatedFiles;
    },
    fileFetchedTopTwoUsers: (state, action: PayloadAction<UserData[]>) => {
      state.TopSharedFileUsers = action.payload;
      state.errorMessage = "";
    },
    setSuggestedFiles: (state, action) => {
      state.suggestedFiles = action.payload;
    },
    summaryAlertsFetched: (state, action: PayloadAction<Array<SummaryAlert>>) => {
      state.summaryAlerts = action.payload;
      state.errorMessage = "";
    },
    summaryAlertsError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setRenderContainer: (state, action: PayloadAction<string>) => {
      state.createNew = action.payload;
    },
    userSearchListSuccesss: (state, action: PayloadAction<Array<FileSharedType>>) => {
      const filteredUserSearchData = action.payload.filter(
        (item) => item.id !== getAuth().profileId,
      );
      state.userSearchData = filteredUserSearchData;
    },
    clearUserSearchData: (state) => {
      state.userSearchData = [];
    },
    foldersBreadcrumbsFetched: (
      state,
      action: PayloadAction<
        foldersResponseType & {
          isLoading?: boolean;
        }
      >,
    ) => {
      state.folderBreadcrumbs = action.payload;
    },
    foldersBreadcrumbsError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setBreadCrumbsLoading: (state, action: PayloadAction<boolean>) => {
      state.folderBreadcrumbs.isLoading = action.payload;
    },
    foldersPerPageBreadcrumbsFetched: (state, action: PayloadAction<Array<FolderType>>) => {
      state.folderBreadcrumbsPerPage = action.payload;
      state.errorMessage = "";
    },
    setFolderBreadcrumbs: (state, action: PayloadAction<Array<FolderType>>) => {
      state.moveFolderBreadcrumbs = action.payload;
    },
    totalFileCount: (state, action) => {
      state.totalFileCount = action.payload;
    },
    setFileListPageCount: (state, action) => {
      state.fileListPageCount = action.payload;
      state.errorMessage = "";
    },
    clearMyDriveState: () => initialState,
    fileListLoading: (state, action: PayloadAction<boolean>) => {
      state.fileListLoading = action.payload;
    },
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload || [];
    },
  },
});

export const {
  filesFoldersFetched,
  filesFoldersError,
  fileUploadSuccess,
  fileUploadError,
  recentFilesFetched,
  recentFilesListError,
  filesStatusFetched,
  uploadFolderError,
  setLoading,
  sharedFilesFetched,
  sharedFilesSenderFetched,
  openShareDialog,
  closeShareDialog,
  setFileId,
  shareFileError,
  sharedWithMeFilesFetchedCurr,
  sharedWithMeResponseCurr,
  sharedWithMeFilesFetchedPrev,
  sharedWithMeResponsePrev,
  sharedWithMeFilesFetchedOth,
  sharedWithMeResponseOth,
  clearReduxStateSharedWithMe,
  foldersPerPageFetched,
  filesPerPageFetched,
  setUploadProgress,
  clearUploadProgress,
  filesFetched,
  foldersFetched,
  fileFetchedTopTwoUsers,
  clearFolders,
  setSuggestedFiles,
  setFoldersLoading,
  setFilesLoading,
  setRecentFilesLoading,
  updateFilesInState,
  summaryAlertsFetched,
  summaryAlertsError,
  clearFiles,
  setRenderContainer,
  userSearchListSuccesss,
  clearUserSearchData,
  foldersBreadcrumbsFetched,
  foldersBreadcrumbsError,
  setBreadCrumbsLoading,
  foldersPerPageBreadcrumbsFetched,
  setFolderBreadcrumbs,
  recentFilesPerPageFetched,
  totalFileCount,
  setFileListPageCount,
  clearMyDriveState,
  fileListLoading,
  setSelectedItems,
} = filesFolderSlice.actions;
export const dashboardReducer = filesFolderSlice.reducer;
