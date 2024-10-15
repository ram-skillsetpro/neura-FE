import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ToastContent } from "react-toastify";
import { GetState, ThunkApi } from "src/core/models/common.model";
import { CommonService } from "src/core/services/common.service";
import { buildDataEndpoint } from "src/core/utils";
import { AppDispatch } from "src/redux/create-store";
import {
  ApiResponse,
  ContractType,
  copyPlaybookPayload,
  PaginatedApiResponse,
  PayloadGenertePlaybook,
  PayloadSearchPlaybook,
  PlaybookResponse,
  PlaybookResponseType,
  PlaybookTypeList,
  SavePlaybookPayload,
  SearchResult,
} from "./playbook.model";

export interface PlayBookState {
  contractTypes: Array<ContractType>;
  errorMessage: string;
  contractTypeId: number;
  playbookSearchList: Array<any>;
  isGlobalPlaybookListLoading: boolean;
  globalPBList: Array<PlaybookTypeList>;
  globalPBFilesResponse: PlaybookResponseType & {
    isLoading?: boolean;
  };
  PBList: Array<PlaybookTypeList>;
  PBFilesResponse: PlaybookResponseType & {
    isLoading?: boolean;
  };
  playbookResponse: PlaybookResponse | null;
  isLoading: boolean;
}

const initialState: PlayBookState = {
  contractTypes: [],
  errorMessage: "",
  contractTypeId: 0,
  playbookSearchList: [],
  isGlobalPlaybookListLoading: false,
  globalPBList: [],
  globalPBFilesResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  PBList: [],
  PBFilesResponse: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: [],
    isLoading: false,
  },
  playbookResponse: null,
  isLoading: false,
};

export const fetchContractTypeForPlayBook = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<ApiResponse>(`/v1/cms/contract-type-list/1`);
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

export const fetchPlaybookSearchResults = (payload: PayloadSearchPlaybook) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setIsLoading(true));
      const apiResponse = await api.post<SearchResult>("/v1/submit-file-search", payload);
      if (apiResponse.data?.result && apiResponse.isSuccess && apiResponse.status === 200) {
        apiResponse?.data?.result?.length === 0 &&
          CommonService.popupToast({
            type: "error",
            message: "No contract found" as ToastContent,
          });
        dispatch(setSearchListPlaybook(apiResponse.data.result));
      } else {
        dispatch(setError(apiResponse.message[0]));
      }
    } catch (error: any) {
      dispatch(setError(error.message || "An error occurred"));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const generatePlaybook = (payload: PayloadGenertePlaybook) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setIsLoading(false));
      const apiResponse = await api.post<ApiResponse>("/v1/playbook/generate", payload);
      if (apiResponse.data && apiResponse.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({
          type: "success",
          message: (apiResponse.message[0] || "Playbook generate request accepted") as ToastContent,
        });
      } else {
        CommonService.popupToast({
          type: "error",
          message: (apiResponse.message[0] || "Something went wrong") as ToastContent,
        });
        dispatch(setError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error: any) {
      dispatch(setError(error.message || "An error occurred"));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const fetchPlayBookListing = (playbookType: number, pgn: number) => {
  const queryParams =
    playbookType === 0 || playbookType === 1 ? `&isUniversal=${playbookType}` : "";

  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const dataEndpoint = buildDataEndpoint(
      "/v1/playbook/fetch-all?status=1",
      pgn,
      queryParams,
      _getState(),
    );
    try {
      const apiResponse = await api.get<PaginatedApiResponse<PlaybookTypeList>>(dataEndpoint);
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        if (playbookType === 1) {
          dispatch(globalPBListFetched(apiResponse.data?.result ?? []));
          dispatch(globalPBPerPageFetched(apiResponse.data));
        } else if (playbookType === 0) {
          dispatch(PBListFetched(apiResponse.data?.result ?? []));
          dispatch(PBPerPageFetched(apiResponse.data));
        }
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setGlobalPlaybookListLoading(false));
    }
  };
};

export const fetchClickPlaybook = (playbookId: number, reviewId?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setIsLoading(true));

      const currentUrl = window.location.href;

      let url;
      if (reviewId) {
        if (currentUrl.includes("pre-contract")) {
          url = `/v1/playbook/presigned/view-playbook?playbookId=${playbookId}&reviewId=${reviewId}`;
        } else {
          url = `/v1/playbook/view-playbook?playbookId=${playbookId}&reviewId=${reviewId}`;
        }
      } else {
        url = `/v1/playbook/fetch-byid?playbookId=${playbookId}`;
      }
      const apiResponse = await api.get<PlaybookResponse>(url);
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        dispatch(setPlaybookResponse(apiResponse.data));
      } else {
        if (apiResponse.status === 1000) {
          CommonService.popupToast({
            type: "error",
            message: (apiResponse.message[0] || "Something went wrong") as ToastContent,
          });
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const fetchClickGlobalPlaybook = (playbookId: number, reviewId?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setIsLoading(true));
      const currentUrl = window.location.href;

      let url;
      if (reviewId) {
        if (currentUrl.includes("pre-contract")) {
          url = `/v1/playbook/presigned/view-playbook?playbookId=${playbookId}&reviewId=${reviewId}`;
        } else {
          url = `/v1/playbook/view-playbook?playbookId=${playbookId}&reviewId=${reviewId}`;
        }
      } else {
        url = `/v1/global-playbook/fetch-byid?playbookId=${playbookId}`;
      }
      const apiResponse = await api.get<PlaybookResponse>(url);
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
        dispatch(setPlaybookResponse(apiResponse.data));
      } else {
        if (apiResponse.status === 1000) {
          CommonService.popupToast({
            type: "error",
            message: (apiResponse.message[0] || "Something went wrong") as ToastContent,
          });
          dispatch(setError(apiResponse.message));
        }
      }
    } catch (error) {
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const savePlaybook = (payload: SavePlaybookPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setIsLoading(true));
      const apiResponse = await api.post<ApiResponse>("/v1/playbook/save", payload);
      if (apiResponse.data && apiResponse.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({
          type: "success",
          message: (apiResponse.message[0] || "Playbook generate request accepted") as ToastContent,
        });
      } else {
        CommonService.popupToast({
          type: "error",
          message: (apiResponse.message[0] || "Something went wrong") as ToastContent,
        });
        dispatch(setError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error: any) {
      dispatch(setError(error.message || "An error occurred"));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const publishPlaybook = (id: number, pgn: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/playbook/toggle-publish?playbookId=${id}&status=1`,
        {},
      );
      if (apiResponse.data && apiResponse.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({
          type: "success",
          message: (apiResponse.message[0] || "Playbook published successfully") as ToastContent,
        });
        dispatch(fetchPlayBookListing(0, pgn));
      } else {
        CommonService.popupToast({
          type: "error",
          message: (apiResponse.message[0] || "Something went wrong") as ToastContent,
        });
        dispatch(setError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error: any) {
      dispatch(setError(error.message || "An error occurred"));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const deletePlaybook = (id: number, pgn: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<ApiResponse>(
        `/v1/playbook/toggle?playbookId=${id}&status=0`,
        {},
      );
      if (apiResponse.data && apiResponse.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({
          type: "success",
          message: (apiResponse.message[0] || "PlayBook deleted successfully") as ToastContent,
        });

        dispatch(fetchPlayBookListing(0, pgn));
      } else {
        CommonService.popupToast({
          type: "error",
          message: (apiResponse.message[0] || "Something went wrong") as ToastContent,
        });
        dispatch(setError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error: any) {
      dispatch(setError(error.message || "An error occurred"));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const copyPlaybook = (payload: copyPlaybookPayload, pgn: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<ApiResponse>(`/v1/playbook/copy`, payload);
      if (apiResponse.data && apiResponse.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({
          type: "success",
          message: (apiResponse.message[0] || "PlayBook copy successfully created") as ToastContent,
        });

        dispatch(fetchPlayBookListing(0, pgn));
      } else {
        CommonService.popupToast({
          type: "error",
          message: (apiResponse.message[0] || "Something went wrong") as ToastContent,
        });
        dispatch(setError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error: any) {
      dispatch(setError(error.message || "An error occurred"));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const copyGlobalPlaybook = (payload: copyPlaybookPayload, pgn: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<ApiResponse>(`/v1/global-playbook/copy`, payload);
      if (apiResponse.data && apiResponse.isSuccess && apiResponse.status === 200) {
        CommonService.popupToast({
          type: "success",
          message: (apiResponse.message[0] || "PlayBook copy successfully created") as ToastContent,
        });

        dispatch(fetchPlayBookListing(0, pgn));
      } else {
        CommonService.popupToast({
          type: "error",
          message: (apiResponse.message[0] || "Something went wrong") as ToastContent,
        });
        dispatch(setError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error: any) {
      dispatch(setError(error.message || "An error occurred"));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const updatePlayBookStatus = (playbookId: string) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<PlaybookTypeList[]>(
        `/v1/playbook/fetch-status?playbookIdCsv=${playbookId}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200 && apiResponse.data) {
      } else {
        if (apiResponse.status === 1000) {
          dispatch(setError(apiResponse.message));
        }
      }
      return apiResponse.data;
    } catch (error) {
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

const PlaybookSlice = createSlice({
  name: "playbook",
  initialState,
  reducers: {
    setContractTypes: (state, action) => {
      state.contractTypes = action.payload;
    },
    setError: (state, action) => {
      state.errorMessage = action.payload;
    },
    setContractTypeId: (state, action) => {
      state.contractTypeId = action.payload;
    },
    setSearchListPlaybook: (state, action) => {
      state.playbookSearchList = action.payload;
    },
    clearSearchListPlaybook: (state) => {
      state.playbookSearchList = [];
    },
    setGlobalPlaybookListLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalPlaybookListLoading = action.payload;
    },
    globalPBListFetched: (state, action: PayloadAction<PlaybookTypeList[]>) => {
      state.globalPBList = action.payload;
    },
    globalPBPerPageFetched: (
      state,
      action: PayloadAction<PaginatedApiResponse<PlaybookTypeList>>,
    ) => {
      state.globalPBFilesResponse = action.payload;
      state.errorMessage = "";
    },
    PBListFetched: (state, action: PayloadAction<PlaybookTypeList[]>) => {
      state.PBList = action.payload;
    },
    PBPerPageFetched: (state, action: PayloadAction<PaginatedApiResponse<PlaybookTypeList>>) => {
      state.PBFilesResponse = action.payload;
      state.errorMessage = "";
    },
    setPlaybookResponse: (state, action: PayloadAction<PlaybookResponse>) => {
      state.playbookResponse = action.payload;
      state.errorMessage = "";
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearPlaybookIdData: (state) => {
      state.playbookResponse = null;
      state.isLoading = false;
    },
    clearPlaybookState: () => initialState,
  },
});

export const {
  setContractTypes,
  setError,
  setContractTypeId,
  setSearchListPlaybook,
  clearSearchListPlaybook,
  setGlobalPlaybookListLoading,
  globalPBListFetched,
  globalPBPerPageFetched,
  PBListFetched,
  PBPerPageFetched,
  setPlaybookResponse,
  setIsLoading,
  clearPlaybookIdData,
  clearPlaybookState,
} = PlaybookSlice.actions;
export const playbookReducer = PlaybookSlice.reducer;
