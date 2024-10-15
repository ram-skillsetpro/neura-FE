import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import {
  ApiResponse,
  FileType,
  FilesResponseType,
  PaginatedApiResponse,
  PlaybookResponseType,
  PlaybookTrashList,
} from "pages/trash/trash.model";
import { FolderType } from "pages/user-dashboard/dashboard.model";
import { ToastContent } from "react-toastify";
import { CommonService } from "src/core/services/common.service";
import { AppDispatch } from "src/redux/create-store";
import { PaginatedReponse } from "../manage-members/manage-members.model";

export interface TrashState {
  isLoading: boolean;
  errorMessage: string;
  fileList: Array<FileType>;
  filesResponse: FilesResponseType & {
    isLoading?: boolean;
  };
  foldersResponse: PaginatedReponse<FolderType> & {
    isLoading?: boolean;
  };
  folderList: Array<FolderType>;
  trashPBList: Array<PlaybookTrashList>;
  trashPBFilesResponse: PlaybookResponseType & {
    isLoading?: boolean;
  };
}

const initialState: TrashState = {
  isLoading: false,
  fileList: [],
  folderList: [],
  errorMessage: "",
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
  trashPBList: [],
  trashPBFilesResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
};

export const getTrashFilePerPage = (currentPage: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setFilesLoading(true));
    try {
      const apiResponse = await api.get<FilesResponseType>(`/v1/trash/my-files?pgn=${currentPage}`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        // const filesData = [..._getState().trash.fileList, ...(apiResponse.data?.result || [])];
        if (currentPage > 1 && apiResponse.data?.result.length === 0) {
          dispatch(getTrashFilePerPage(currentPage - 1));
        } else {
          dispatch(filesPerPageFetched(apiResponse.data?.result || []));
          dispatch(filesFetched(apiResponse.data));
        }
      } else {
        dispatch(filesError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesError((error as Error).message));
    } finally {
      dispatch(setFilesLoading(false));
    }
  };
};
export const getTrashFoldersPerPage = (currentPage: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    // if (currentPage !== 1) {
    dispatch(setFoldersLoading(true));
    // }
    try {
      const apiResponse = await api.get<PaginatedReponse<FolderType>>(
        `/v1/trash/my-folder?pgn=${currentPage}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        // const foldersData = [..._getState().trash.folderList, ...(apiResponse.data?.result || [])];
        if (currentPage > 1 && apiResponse.data?.result.length === 0) {
          dispatch(getTrashFoldersPerPage(currentPage - 1));
        } else {
          dispatch(foldersPerPageFetched(apiResponse.data?.result || []));
          dispatch(foldersFetched(apiResponse.data));
        }
      } else {
        dispatch(filesError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesError((error as Error).message));
    } finally {
      dispatch(setFoldersLoading(false));
    }
  };
};

export const restoreDeletedFiles = (fileId: number, pgn: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get(`/v1/trash/restore-file?fileId=${fileId}`);
    if (apiResponse?.isSuccess && apiResponse?.data && apiResponse.status === 200) {
      CommonService.popupToast({
        type: "success",
        message: (apiResponse.message[0] || "File restored successfully") as ToastContent,
      });
     dispatch(getTrashFilePerPage(pgn));
    }
  };
};

export const restoreAllFile = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { fileIds } = payload;
    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/file-action?fileIds=${fileIds}&status=1`,
        {},
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "Restored Successfully",
        });
      await dispatch(getTrashFilePerPage(1));
      } else {
        dispatch(filesError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(filesError((error as Error).message));
    }
  };
};

export const restoreDeletedFolder = (folderId: number, teamId?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiUrl =
      `/v1/trash/restore-folder?folderId=${folderId}` +
      (teamId !== undefined ? `&teamId=${teamId}` : "");

    const apiResponse = await api.get(apiUrl);
    if (apiResponse?.isSuccess && apiResponse?.data && apiResponse.status === 200) {
      CommonService.popupToast({
        type: "success",
        message: apiResponse.message[0] || "File restored successfully",
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };
};

export const fetchTrashPlayBookListing = (pgn: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setPlaybookLoading(true));
      const apiResponse = await api.get<PaginatedApiResponse<PlaybookTrashList>>(
        `/v1/trash/my-playbook?pgn=${pgn}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        dispatch(trashPBListFetched(apiResponse.data?.result ?? []));
        dispatch(trashPBPerPageFetched(apiResponse.data));
      } else {
        dispatch(filesError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(filesError((error as Error).message));
    } finally {
      dispatch(setPlaybookLoading(false));
    }
  };
};

export const restorePlaybook = (id: number, pgn: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/playbook/toggle?playbookId=${id}&status=1`,
        {},
      );
      if (apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: (apiResponse.message[0] || "PlayBook deleted successfully") as ToastContent,
        });

        dispatch(fetchTrashPlayBookListing(pgn));
      } else {
        dispatch(filesError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error: any) {
      dispatch(filesError((error as Error).message));
    }
  };
};

const filesTrashSlice = createSlice({
  name: "trash",
  initialState,
  reducers: {
    filesError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setFilesLoading: (state, action: PayloadAction<boolean>) => {
      state.filesResponse.isLoading = action.payload;
    },
    setFoldersLoading: (state, action: PayloadAction<boolean>) => {
      state.foldersResponse.isLoading = action.payload;
    },
    filesPerPageFetched: (state, action: PayloadAction<Array<FileType>>) => {
      state.fileList = action.payload;
      state.errorMessage = "";
    },
    foldersPerPageFetched: (state, action: PayloadAction<Array<FolderType>>) => {
      state.folderList = action.payload;
      state.errorMessage = "";
    },
    filesFetched: (state, action: PayloadAction<FilesResponseType>) => {
      state.filesResponse = action.payload;
      state.errorMessage = "";
    },
    foldersFetched: (state, action: PayloadAction<PaginatedReponse<FolderType>>) => {
      state.foldersResponse = action.payload;
      state.errorMessage = "";
    },
    clearReduxForTrashFiles: (state) => {
      state.filesResponse.result = [];
      state.fileList = [];
      state.errorMessage = "";
    },
    trashPBListFetched: (state, action: PayloadAction<PlaybookTrashList[]>) => {
      state.trashPBList = action.payload;
    },
    trashPBPerPageFetched: (
      state,
      action: PayloadAction<PaginatedApiResponse<PlaybookTrashList>>,
    ) => {
      state.trashPBFilesResponse = action.payload;
      state.errorMessage = "";
    },
    setPlaybookLoading: (state, action: PayloadAction<boolean>) => {
      state.trashPBFilesResponse.isLoading = action.payload;
    },
  },
});

export const {
  filesError,
  filesPerPageFetched,
  filesFetched,
  setFilesLoading,
  clearReduxForTrashFiles,
  foldersPerPageFetched,
  foldersFetched,
  setFoldersLoading,
  trashPBListFetched,
  trashPBPerPageFetched,
  setPlaybookLoading,
} = filesTrashSlice.actions;
export const trashReducer = filesTrashSlice.reducer;
