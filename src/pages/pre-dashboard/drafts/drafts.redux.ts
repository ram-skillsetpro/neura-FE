import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ApiResponse } from "pages/auth/auth.model";
import {
  DraftPayload,
  DraftType,
  FolderType,
  UploadedSignedContractType,
} from "pages/pre-dashboard/drafts/drafts.model";
import { FILTER_TYPE } from "src/const";
import { GetState, ThunkApi } from "src/core/models/common.model";
import { CommonService } from "src/core/services/common.service";
import { buildDataEndpoint } from "src/core/utils";
import { PaginatedApiResponse } from "src/pages/user-dashboard/dashboard.model";
import { AppDispatch } from "src/redux/create-store";

export interface MyDraftState {
  draftList: Array<DraftType>;
  trashDraftList: Array<DraftType>;
  trashUploadAndSignList: Array<DraftType>;
  isLoading: boolean;
  errorMessage: string;
  draftResponse: PaginatedApiResponse<DraftType>;
  trashDraftResponse: PaginatedApiResponse<DraftType>;
  trashUploadAndSignResponse: PaginatedApiResponse<DraftType>;
  deletedDraftListPageCount: number;
  deletedUploadSignListPageCount: number;
  uploadedSignedContractList: Array<UploadedSignedContractType>;
  uploadedSignedContractResp: PaginatedApiResponse<UploadedSignedContractType>;
  isLoadingUploadedSignedContract: boolean;
}

const initialState: MyDraftState = {
  draftList: [],
  trashDraftList: [],
  trashUploadAndSignList: [],
  isLoading: false,
  errorMessage: "",
  draftResponse: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  trashDraftResponse: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  trashUploadAndSignResponse: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  deletedDraftListPageCount: 0,
  deletedUploadSignListPageCount: 0,
  uploadedSignedContractList: [],
  uploadedSignedContractResp: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  isLoadingUploadedSignedContract: false,
};

export const getDraftListData =
  (payload: DraftPayload) => async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { currentPage = 1, contractTypeId, folder, state, dataReset = false } = payload;
    const queryParams = new URLSearchParams();
    if (state) queryParams.set("state", state.toString());
    if (contractTypeId !== undefined) queryParams.set("contractTypeId", contractTypeId.toString());
    if (currentPage !== undefined) queryParams.set("pgn", currentPage.toString());
    if (folder && folder.id) queryParams.set("folderId", folder.id.toString());
    if (currentPage !== 1) {
      dispatch(setDraftLoading(true));
    }
    if (dataReset) {
      dispatch(draftFetched([]));
      dispatch(draftPerPageFetched(initialState.draftResponse));
    }
    const baseUrl = `/v1/presigned/contract/fetch-all?`;
    const dataEndpoint = buildDataEndpoint(
      baseUrl,
      undefined,
      queryParams,
      _getState(),
      undefined,
      [FILTER_TYPE.CONTRACT_STAGE],
    );
    try {
      const apiResponse = await api.get<PaginatedApiResponse<DraftType>>(dataEndpoint);

      if (apiResponse?.isSuccess && apiResponse.data) {
        // const filesData = [..._getState().drafts.draftList, ...(apiResponse.data?.result || [])];
        if (currentPage > 1 && apiResponse.data.result.length === 0) {
          dispatch(getDraftListData({ currentPage: currentPage - 1 }));
        } else {
          dispatch(draftFetched(apiResponse.data?.result || []));
          dispatch(draftPerPageFetched(apiResponse.data));
        }
      } else {
        dispatch(draftError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(draftError((error as Error).message));
    } finally {
      dispatch(setDraftLoading(false));
    }
  };

export const getUploadedSignedContracts =
  (payload: Partial<{ pgn: number; dataReset: boolean; state: Array<any> }>) =>
  async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { pgn = 1, dataReset = false, state } = payload;

    if (pgn !== 1) {
      dispatch(setUploadedSignedContracts(true));
    }
    if (dataReset) {
      dispatch(uploadedSignedContractsFetched([]));
      dispatch(uploadedSignedContractsPerPageFetched(initialState.uploadedSignedContractResp));
    }
    try {
      const apiResponse = await api.get<PaginatedApiResponse<UploadedSignedContractType>>(
        `/v1/presigned/upload-sign/fetch-all`,
        {
          params: {
            pgn,
            state: state?.length ? state?.join(",") : undefined,
          },
        },
      );

      if (apiResponse?.isSuccess && apiResponse.data) {
        // const filesData = [
        //   ..._getState().drafts.uploadedSignedContractList,
        //   ...(apiResponse.data?.result || []),
        // ];
        dispatch(uploadedSignedContractsFetched(apiResponse.data?.result || []));
        dispatch(uploadedSignedContractsPerPageFetched(apiResponse.data));
      } else {
        dispatch(draftError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(draftError((error as Error).message));
    } finally {
      dispatch(setUploadedSignedContracts(false));
    }
  };

export const deleteDraft =
  (draftId: number, folder?: FolderType, activeStatus: string = "0") =>
  async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = new URLSearchParams();
    queryParams.set("contractId", draftId.toString());
    queryParams.set("activeStatus", activeStatus);
    dispatch(setUploadedSignedContracts(true));
    const baseUrl = `/v1/presigned/contract/toggle?${queryParams}`;
    try {
      const apiResponse = await api.get<ApiResponse>(baseUrl);
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "Deleted Successfully",
        });
        const payload = {
          folder,
          dataReset: true,
        };
        if (activeStatus === "1") {
          dispatch(
            getDraftTrashListData({
              currentPage: _getState().drafts.deletedDraftListPageCount,
              mergeResponse: true,
            }),
          );
        } else {
          await dispatch(getDraftListData(payload));
        }
      } else {
        dispatch(draftError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(draftError((error as Error).message));
    }
    dispatch(setUploadedSignedContracts(false));
  };

  export const deleteUploadAndSignDraft =
  (draftId: number, folder?: FolderType, activeStatus: string = "0") =>
  async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = new URLSearchParams();
    queryParams.set("contractId", draftId.toString());
    queryParams.set("activeStatus", activeStatus);
    const baseUrl = `/v1/presigned/upload-sign/toggle?${queryParams}`;
    try {
      const apiResponse = await api.get<ApiResponse>(baseUrl);
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "Deleted Successfully",
        });
        const payload = {
          folder,
          dataReset: true,
        };
        if (activeStatus === "1") {
          dispatch(
            getUploadAndSignTrashListData({
              currentPage: _getState().drafts?.deletedUploadSignListPageCount,
              mergeResponse: true,
            }),
          );
        } else {
          await dispatch(getUploadedSignedContracts(payload));
        }
      } else {
        dispatch(draftError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(draftError((error as Error).message));
    }
  };

export const getDraftTrashListData = (payload?: any) => {
  const { currentPage, mergeResponse = false } = payload || {};
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setDraftLoading(true));
      // const trashListPageCount = _getState().drafts.deletedDraftListPageCount || 1;
      // if (mergeResponse && trashListPageCount > 1) {
      //   let trashDraftList: any = [];
      //   for (let i: number = 1; i <= trashListPageCount; i++) {
      //     const apiResponse = await api.get<PaginatedApiResponse<DraftType>>(
      //       `/v1/trash/my-precontract?pgn=${i}`,
      //     );
      //     if (apiResponse.isSuccess && apiResponse.status === 200) {
      //       trashDraftList = [...trashDraftList, ...(apiResponse.data?.result || [])];
      //       dispatch(trashDraftPerPageFetched(apiResponse.data));
      //     }
      //   }
      //   dispatch(trashDraftFetched(trashDraftList));
      //   dispatch(setDraftLoading(false));
      // } else {
      const apiResponse = await api.get<PaginatedApiResponse<DraftType>>(
        `/v1/trash/my-precontract?pgn=${currentPage || 1}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        if (currentPage > 1 && apiResponse.data?.result.length === 0) {
          dispatch(getDraftTrashListData({ currentPage: currentPage - 1 }));
        } else {
          dispatch(trashDraftFetched(apiResponse.data?.result));
        }
        dispatch(trashDraftPerPageFetched(apiResponse.data));
        dispatch(setDraftLoading(false));
      } else {
        dispatch(draftError(apiResponse.message[0] || ""));
        dispatch(setDraftLoading(false));
      }
      // }
    } catch (error: any) {
      dispatch(draftError((error as Error).message));
      dispatch(setDraftLoading(false));
    }
  };
};

export const getUploadAndSignTrashListData = (payload?: any) => {
  const { currentPage, mergeResponse = false } = payload || {};
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setDraftLoading(true));
      const apiResponse = await api.get<PaginatedApiResponse<DraftType>>(
        `/v1/trash/my-upload-sign?pgn=${currentPage || 1}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        if (currentPage > 1 && apiResponse.data?.result.length === 0) {
          dispatch(getUploadAndSignTrashListData({ currentPage: currentPage - 1 }));
        } else {
          dispatch(trashUploadSignFetched(apiResponse.data?.result));
        }
        dispatch(trashUploadSignPerPageFetched(apiResponse.data));
        dispatch(setDraftLoading(false));
      } else {
        dispatch(draftError(apiResponse.message[0] || ""));
        dispatch(setDraftLoading(false));
      }
      // }
    } catch (error: any) {
      dispatch(draftError((error as Error).message));
      dispatch(setDraftLoading(false));
    }
  };
};


const draftSlice = createSlice({
  name: "drafts",
  initialState,
  reducers: {
    draftFetched: (state, action) => {
      state.draftList = action.payload;
    },
    setDraftLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    draftError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    draftPerPageFetched: (state, action) => {
      state.draftResponse = action.payload;
    },
    trashDraftFetched: (state, action) => {
      state.trashDraftList = action.payload;
    },
    trashUploadSignFetched: (state, action) => {
      state.trashUploadAndSignList = action.payload;
    },
    trashDraftPerPageFetched: (state, action) => {
      state.trashDraftResponse = action.payload;
    },
    trashUploadSignPerPageFetched: (state, action) => {
      state.trashUploadAndSignResponse = action.payload;
    },
    setDeletedDraftListPageCount: (state, action) => {
      state.deletedDraftListPageCount = action.payload;
      state.errorMessage = "";
    },
    setDeletedUploadSignListPageCount: (state, action) => {
      state.deletedUploadSignListPageCount = action.payload;
      state.errorMessage = "";
    },
    clearDeleteDraftResponse: (state) => {
      state.deletedDraftListPageCount = 0;
      state.trashDraftList = [];
      state.trashDraftResponse = initialState.trashDraftResponse;
      state.errorMessage = "";
    },
    clearDeleteUploadSignResponse: (state) => {
      state.deletedUploadSignListPageCount = 0;
      state.trashUploadAndSignList = [];
      state.trashUploadAndSignResponse = initialState.trashDraftResponse;
      state.errorMessage = "";
    },
    setUploadedSignedContracts: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUploadedSignedContract = action.payload;
    },
    uploadedSignedContractsFetched: (
      state,
      action: PayloadAction<Array<UploadedSignedContractType>>,
    ) => {
      state.uploadedSignedContractList = action.payload;
    },
    uploadedSignedContractsPerPageFetched: (
      state,
      action: PayloadAction<PaginatedApiResponse<UploadedSignedContractType>>,
    ) => {
      state.uploadedSignedContractResp = action.payload;
    },
  },
});

export const {
  draftFetched,
  setDraftLoading,
  draftError,
  draftPerPageFetched,
  trashDraftFetched,
  trashUploadSignFetched,
  trashDraftPerPageFetched,
  trashUploadSignPerPageFetched,
  setDeletedDraftListPageCount,
  setDeletedUploadSignListPageCount,
  clearDeleteDraftResponse,
  clearDeleteUploadSignResponse,
  setUploadedSignedContracts,
  uploadedSignedContractsFetched,
  uploadedSignedContractsPerPageFetched,
} = draftSlice.actions;
export const draftReducer = draftSlice.reducer;
