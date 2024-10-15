import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { CommonService } from "core/services/common.service";
import { HttpClientOptions } from "core/services/http-client";
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
  ShareFilePayload,
  SummaryAlert,
  UploadFolderPayload,
  UploadingFileType,
  UserData,
  foldersResponseType,
} from "pages/user-dashboard/dashboard.model";
import { ROUTE_USER_DASHBOARD } from "src/const";
import { buildDataEndpoint, getAuth } from "src/core/utils";
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
}

const initialState: DashboardState = {
  recentFilesList: [],
  fileList: [],
  SharedWithMeFileList_curr: [],
  SharedWithMeFileList_prev: [],
  SharedWithMeFileList_prev2: [],
  folderList: [],
  FileSharedList: {
    internalShare: [],
    externalShare: []
  },
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
};
export const createFolder = (payload: AddFolderPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>("/v1/team/create-folder", payload);
      if (apiResponse.isSuccess && apiResponse.data) {
        CommonService.toast({
          type: "success",
          message: apiResponse.data?.response ?? "Created Successfully",
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

export const getRecentFilesList = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setRecentFilesLoading(true));
    try {
      const apiResponse = await api.get<Array<FileType>>(`/v1/my-latest-files`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(recentFilesFetched(apiResponse.data));
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
    const { file, folder, parseFlag, teamId } = payload;
    const formData = new FormData();
    const queryParams = folder
      ? `?folderId=${folder.id}${typeof parseFlag === "number" ? `&parseFlag=${parseFlag}` : ""}${
          teamId ? `&teamId=${teamId}` : ""
        }`
      : typeof parseFlag === "number"
      ? `?parseFlag=${parseFlag}${teamId ? `&teamId=${teamId}` : ""}`
      : teamId
      ? `?teamId=${teamId}`
      : "";
    formData.append("file", file);
    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/team/upload-files${queryParams}`,
        formData,
        options,
      );
      if (apiResponse.isSuccess && apiResponse.data) {
        dispatch(clearFiles());
        dispatch(clearTeamFiles());
        CommonService.toast({
          type: "success",
          message: apiResponse.data?.response ?? "File uploaded successfully",
        });
      } else {
        dispatch(fileUploadError(apiResponse.message[0]));
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
        CommonService.toast({
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
    const apiResponse = await api.get<FileSharedTypeResponse>(
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
    if (currentPage !== 1) {
      dispatch(setFoldersLoading(true));
    }
    try {
      const apiResponse = await api.get<foldersResponseType>(
        `/v1/my-folder-list?status=1&pgn=${currentPage}${queryParams}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        const foldersData = [
          ..._getState().dashboard.folderList,
          ...(apiResponse.data?.result || []),
        ];
        dispatch(foldersPerPageFetched(foldersData));
        dispatch(foldersFetched(apiResponse.data));
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

export const getFilePerPage = (currentPage: number, folder?: FolderType) => {
  const queryParams = folder ? `&folderId=${folder?.id}` : "";
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    if (currentPage !== 1) {
      dispatch(setFilesLoading(true));
    }
    try {
      const apiResponse = await api.get<FilesResponseType>(
        `/v1/my-file-list?status=1&pgn=${currentPage}${queryParams}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        if (
          apiResponse.data.totct === 0 &&
          _getState().dashboard.foldersResponse.totct === 0 &&
          window.location.pathname.includes(ROUTE_USER_DASHBOARD)
        ) {
          dispatch(renderUploadContainer("uploadFile"));
        }
        const filesData = [..._getState().dashboard.fileList, ...(apiResponse.data?.result || [])];
        dispatch(filesPerPageFetched(filesData));
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
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0] ?? "Deleted Successfully",
        });
        dispatch(clearFiles());
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
        const filesData = [..._getState().dashboard.fileList, ...(apiResponse.data?.result || [])];
        dispatch(filesPerPageFetched(filesData));
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
        const filesDataCurr = [
          ..._getState().dashboard.SharedWithMeFileList_curr,
          ...(apiResponse.data?.result || []),
        ];
        dispatch(sharedWithMeFilesFetchedCurr(filesDataCurr));
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
    sharedFilesFetched: (state, action: PayloadAction<FileSharedTypeResponse>) => {
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
} = filesFolderSlice.actions;
export const dashboardReducer = filesFolderSlice.reducer;
