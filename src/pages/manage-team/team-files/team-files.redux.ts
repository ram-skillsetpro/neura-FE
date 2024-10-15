import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { CommonService } from "core/services/common.service";
import { ApiResponse, TeamListType } from "pages/manage-team/team.model";
import {
  FileSharedSenderType,
  FileSharedType,
  FileSharedTypeResponse,
  FileStatusCheckPayload,
  FileType,
  FilesFoldersResponseType,
  FilesResponseType,
  FolderSearchResult,
  FolderType,
  PaginatedApiResponse,
  ShareFilePayload,
  UploadingFileType,
} from "pages/user-dashboard/dashboard.model";
import { ROUTE_TEAM_FILES } from "src/const";
import { buildDataEndpoint } from "src/core/utils";
import { renderUploadContainer } from "src/pages/user-dashboard/dashboard.redux";
import { AppDispatch } from "src/redux/create-store";

type FilesType = PaginatedApiResponse<FileType>;
type FoldersType = PaginatedApiResponse<FolderType>;
export interface TeamsFilesFoldersState {
  fileList: Array<FileType>;
  folderList: Array<FolderType>;
  files: FilesType & { isLoading?: boolean };
  folders: FoldersType & { isLoading?: boolean };
  isLoading: boolean;
  errorMessage: string;
  filesStatus: Array<FileType>;
  isShareDialogOpen: boolean;
  FileSharedSenderList: Array<FileSharedSenderType>;
  FileSharedList: FileSharedTypeResponse;
  fileId: number;
  uploadingFiles: Array<UploadingFileType>;
  teamFolderBreadcrumbs: FoldersType & {
    isLoading?: boolean;
  };
  teamFolderBreadcrumbsPerPage: Array<FolderType>;
  moveTeamFolderBreadcrumbs: Array<FolderType>;
  SearchFolderResponse: Array<FolderSearchResult>;
  SearchFolderParentExists: boolean;
}

const initialState: TeamsFilesFoldersState = {
  fileList: [],
  folderList: [],
  filesStatus: [],
  FileSharedList: {
    internalShare: [],
    externalShare: []
  },
  isShareDialogOpen: false,
  FileSharedSenderList: [],
  fileId: 0,
  files: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
    isLoading: false,
  },
  folders: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
    isLoading: false,
  },
  isLoading: false,
  errorMessage: "",
  uploadingFiles: [],
  teamFolderBreadcrumbs: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  teamFolderBreadcrumbsPerPage: [],
  moveTeamFolderBreadcrumbs: [],
  SearchFolderResponse: [],
  SearchFolderParentExists: false,
};
export const getTeamFilesFoldersList = (
  teamId: number,
  folder?: FolderType,
  status: number = 1,
  currentPage: number = 1,
) => {
  const baseUrl = `/v1/team/list-files-folder?status=${status}&teamId=${teamId}`;
  const queryParams = folder ? `&folderId=${folder?.id}` : "";
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    if (currentPage !== 1) {
      dispatch(setFoldersLoading(true));
    }
    dispatch(clearTeamFolders());
    const dataEndpoint = buildDataEndpoint(baseUrl, currentPage, queryParams, _getState());
    try {
      const apiResponse = await api.get<FilesFoldersResponseType>(dataEndpoint);
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(filesFoldersListFetched(apiResponse.data));
        return apiResponse;
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      dispatch(setFoldersLoading(false));
    }
  };
};
export const getTeamFoldersPerPage = (
  teamId: number,
  pgn: number = 1,
  folder?: FolderType,
  status: number = 1,
) => {
  const baseUrl = `/v1/team/list-folder?status=${status}&teamId=${teamId}&pgn=${pgn}`;
  const url = folder ? `${baseUrl}&folderId=${folder?.id}` : baseUrl;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    // if (pgn !== 1) {
    dispatch(setFoldersLoading(true));
    // }
    try {
      const apiResponse = await api.get<FoldersType>(url);
      if (apiResponse?.isSuccess && apiResponse.data) {
        if (pgn > 1 && apiResponse.data.result.length === 0) {
          dispatch(getTeamFoldersPerPage(teamId, pgn - 1, folder, status));
        } else {
          dispatch(teamFoldersPerPageFetched(apiResponse.data?.result));
          dispatch(teamFoldersFetched(apiResponse.data));
        }

        return apiResponse;
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      dispatch(setFoldersLoading(false));
    }
  };
};

export const getTeamFoldersBreadcrumbs = (payload: {
  teamId?: number;
  pgn: number;
  status: number;
  folder?: FolderType;
}) => {
  const { teamId, pgn, folder, status } = payload;
  const queryParams = new URLSearchParams();
  if (teamId) queryParams.set("teamId", teamId.toString());
  if (status) queryParams.set("status", status.toString());
  if (pgn) queryParams.set("pgn", pgn.toString());
  if (folder && folder.id) queryParams.set("folderId", folder.id.toString());
  const url = `/v1/team/list-folder?${queryParams}`;
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    if (pgn > 1) {
      dispatch(setTeamFoldersBreadCrumbsLoading(true));
    } else {
      dispatch(teamFoldersPerPageBreadcrumbsFetched([]));
      dispatch(
        teamFoldersBreadcrumbsFetched({
          totct: 0,
          pgn: 0,
          perpg: 0,
          result: [],
          isLoading: false,
        }),
      );
    }
    try {
      const apiResponse = await api.get<FoldersType>(url);
      if (apiResponse?.isSuccess && apiResponse.data) {
        const foldersData = [
          ..._getState().teamDashboard.teamFolderBreadcrumbs.result,
          ...(apiResponse.data?.result || []),
        ];
        dispatch(teamFoldersPerPageBreadcrumbsFetched(foldersData));
        dispatch(teamFoldersBreadcrumbsFetched(apiResponse.data));
        return apiResponse;
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      dispatch(setTeamFoldersBreadCrumbsLoading(false));
      dispatch(setLoading(false));
    }
  };
};

/**
 * Fetch team files per page.
 *
 * @param {number} teamId - The ID of the team for which to fetch files.
 * @param {number} [pgn=1] - The page number, defaults to 1. Default is `1`
 * @param {FolderType} [folder] - The folder to filter files by (optional).
 * @param {number} [status=1] - The status of files to fetch, defaults to 1. Default is `1`
 * @returns {Promise<ApiResponse>} A promise that resolves with the API response.
 */
export const getTeamFilesPerPage = (
  teamId: number,
  currentPage: number = 1,
  folder?: FolderType,
  status: number = 1,
) => {
  const baseUrl = `/v1/team/list-file?status=${status}&teamId=${teamId}`;
  const queryParams = folder ? `&folderId=${folder?.id}` : "";
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    // if (currentPage !== 1) {
    dispatch(setFilesLoading(true));
    // }
    const dataEndpoint = buildDataEndpoint(baseUrl, currentPage, queryParams, _getState());
    try {
      const apiResponse = await api.get<FilesResponseType>(dataEndpoint);
      if (apiResponse?.isSuccess && apiResponse.data) {
        if (currentPage > 1 && apiResponse.data.result.length === 0) {
          dispatch(getTeamFilesPerPage(teamId, currentPage - 1, folder, status));
        } else {
          dispatch(teamFilesPerPageFetched(apiResponse.data?.result));
          dispatch(teamFilesFetched(apiResponse.data));
          return apiResponse;
        }
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      if (
        _getState().teamDashboard.fileList.length === 0 &&
        _getState().teamDashboard.folderList.length === 0 &&
        window.location.pathname.includes(ROUTE_TEAM_FILES)
      ) {
        dispatch(renderUploadContainer("uploadFile"));
      } else {
        dispatch(renderUploadContainer(""));
      }
      dispatch(setFilesLoading(false));
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
      dispatch(filesFoldersListError(apiResponse.message[0]));
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
        dispatch(filesFoldersListError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
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
      dispatch(filesFoldersListError(apiResponse.message[0]));
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
        dispatch(filesFoldersListError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const FoldersAndFilesRename = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>("/v1/file/rename", payload);
      if (apiResponse.isSuccess) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "File Rename Successfully",
        });
      } else {
        dispatch(filesFoldersListError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const TeamsFoldersAndFilesRename = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>("/v1/team/rename-folder", payload);
      if (apiResponse.isSuccess) {
        // CommonService.toast({
        //   type: "success",
        //   message: apiResponse.message[0] ?? "Folder Rename Successfully",
        // });
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "Folder Rename Successfully",
        });
      } else {
        dispatch(filesFoldersListError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const updateFilesArr = (id: number) => {
  return async (dispatch: AppDispatch, _getState: GetState) => {
    const updatedFiles = _getState().teamDashboard.fileList.filter((file) => file.id !== id);
    dispatch(updateFilesInState(updatedFiles));
  };
};

export const fileShareAddRemoveTeam = (payload: ShareFilePayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<ApiResponse>("/v1/action-shared-users", payload);
      if (apiResponse.isSuccess) {
        dispatch(getSharedFile(payload.fileId));
      } else {
        dispatch(filesFoldersListError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const getFilterDataTeamDrive = ({
  currentPage,
  folder,
  team,
}: {
  currentPage: number;
  folder?: FolderType;
  team?: TeamListType;
}) => {
  const queryParams = folder ? `&folderId=${folder?.id}` : team ? `&teamId=${team?.id}` : "";
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
        const filesData = [
          ..._getState().teamDashboard.fileList,
          ...(apiResponse.data?.result || []),
        ];
        dispatch(teamFilesPerPageFetched(filesData));
        dispatch(teamFilesFetched(apiResponse.data));
        return apiResponse;
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      dispatch(setFilesLoading(false));
    }
  };
};

export const getFoldersOnSearch = (folderName: string, teamId: number = 0) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<FolderSearchResult[]>(
        `/v1/team/search-folder?folderName=${folderName}&pgn=1&teamId=${teamId}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(searchFoldersFetched(apiResponse.data));
      } else {
        dispatch(filesFoldersListError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesFoldersListError((error as Error).message));
    } finally {
      dispatch(setFoldersLoading(false));
    }
  };
};

const teamDashboard = createSlice({
  name: "teamFilesFolder",
  initialState,
  reducers: {
    filesFoldersListFetched: (state, action: PayloadAction<FilesFoldersResponseType>) => {
      state.fileList = [];
      state.folderList = action.payload.folderList;
      state.folders.result = action.payload.folderList;
      state.folders.perpg = action.payload.perpg;
      state.folders.totct = action.payload.folderCount;
      state.folders.pgn = action.payload.pgn;
      state.errorMessage = "";
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    filesFoldersListError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    teamFilesPerPageFetched: (state, action: PayloadAction<Array<FileType>>) => {
      state.fileList = action.payload;
      state.errorMessage = "";
    },
    teamFoldersPerPageFetched: (state, action: PayloadAction<Array<FolderType>>) => {
      state.folderList = action.payload;
      state.errorMessage = "";
    },
    teamFoldersFetched: (state, action: PayloadAction<FoldersType>) => {
      state.folders = action.payload;
      state.errorMessage = "";
    },
    updateFilesInState: (state, action: PayloadAction<Array<FileType>>) => {
      state.fileList = action.payload;
      state.errorMessage = "";
    },
    filesStatusFetched: (state, action: PayloadAction<Array<FileType>>) => {
      state.filesStatus = action.payload;
    },
    openShareDialog: (state) => {
      state.isShareDialogOpen = true;
    },
    closeShareDialog: (state) => {
      state.isShareDialogOpen = false;
    },
    sharedFilesSenderFetched: (state, action: PayloadAction<Array<FileSharedSenderType>>) => {
      state.FileSharedSenderList = action.payload;
    },
    sharedFilesFetched: (state, action: PayloadAction<Array<FileSharedType>>) => {
      state.FileSharedList = action.payload;
    },
    setFileId: (state, action: PayloadAction<number>) => {
      state.fileId = action.payload;
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
    setFoldersLoading: (state, action: PayloadAction<boolean>) => {
      state.folders.isLoading = action.payload;
    },
    setFilesLoading: (state, action: PayloadAction<boolean>) => {
      state.files.isLoading = action.payload;
    },
    teamFilesFetched: (state, action: PayloadAction<FilesResponseType>) => {
      state.files = action.payload;
      state.errorMessage = "";
    },
    clearTeamFolders: (state) => {
      state.folderList = [];
    },
    clearTeamFiles: (state) => {
      state.fileList = [];
    },
    setTeamFoldersBreadCrumbsLoading: (state, action: PayloadAction<boolean>) => {
      state.teamFolderBreadcrumbs.isLoading = action.payload;
    },
    teamFoldersPerPageBreadcrumbsFetched: (state, action: PayloadAction<Array<FolderType>>) => {
      state.teamFolderBreadcrumbsPerPage = action.payload;
      state.errorMessage = "";
    },
    setFolderBreadcrumbs: (state, action: PayloadAction<Array<FolderType>>) => {
      state.moveTeamFolderBreadcrumbs = action.payload;
    },
    teamFoldersBreadcrumbsFetched: (
      state,
      action: PayloadAction<
        FoldersType & {
          isLoading?: boolean;
        }
      >,
    ) => {
      state.teamFolderBreadcrumbs = action.payload;
    },
    isFolderExistOnSearch: (state, action) => {
      state.SearchFolderParentExists = action.payload;
    },
    searchFoldersFetched: (state, action: PayloadAction<FolderSearchResult[]>) => {
      state.SearchFolderResponse = action.payload;
    },
    clearSearchFoldersFetched: (state) => {
      state.SearchFolderResponse = [];
    },
    clearTeamDriveState: () => initialState,
  },
});

export const {
  setLoading,
  filesFoldersListFetched,
  teamFilesPerPageFetched,
  filesFoldersListError,
  teamFoldersPerPageFetched,
  filesStatusFetched,
  openShareDialog,
  closeShareDialog,
  sharedFilesSenderFetched,
  sharedFilesFetched,
  setFileId,
  setUploadProgress,
  clearUploadProgress,
  setFoldersLoading,
  teamFoldersFetched,
  updateFilesInState,
  teamFilesFetched,
  setFilesLoading,
  clearTeamFiles,
  clearTeamFolders,
  teamFoldersPerPageBreadcrumbsFetched,
  setTeamFoldersBreadCrumbsLoading,
  teamFoldersBreadcrumbsFetched,
  searchFoldersFetched,
  clearSearchFoldersFetched,
  isFolderExistOnSearch,
  clearTeamDriveState,
} = teamDashboard.actions;
export const teamDashboardReducer = teamDashboard.reducer;
