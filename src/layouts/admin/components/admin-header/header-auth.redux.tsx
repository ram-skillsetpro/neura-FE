import { createSlice } from "@reduxjs/toolkit";
import { ToastContent } from "react-toastify";
import { GetState, ThunkApi } from "src/core/models/common.model";
import { CommonService } from "src/core/services/common.service";
import {
  ApiResponseResetPassword,
  LogoutResponse,
  SearchResponsePayLoad,
  SearchResponseResp,
  SearchResultResponse,
} from "src/pages/user-dashboard/dashboard.model";
import { AppDispatch } from "src/redux/create-store";

export interface SearchState {
  errorMessage: string;
  searchList: SearchResponseResp[];
  searchString: string;
  isLoading: boolean;
  activeContractTab: string;
  autoCompleteSearchList: Array<any>;
  totalSearchCount: number;
  searchCurrentPage: number;
  searchIndexHash: string | null;
}

const initialState: SearchState = {
  errorMessage: "",
  searchList: [],
  searchString: "",
  isLoading: false,
  activeContractTab: "summary",
  autoCompleteSearchList: [],
  totalSearchCount: 0,
  searchCurrentPage: 1,
  searchIndexHash: null,
};

export const fetchAutoCompleteSearchResults = (
  payload: SearchResponsePayLoad,
  controller?: any,
) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.post<SearchResultResponse>("/v1/submit-file-search", payload, {
        signal: controller?.signal,
      });
      if (apiResponse.data?.result) {
        dispatch(setAutoCompleteSearchList(apiResponse.data.result));
        // dispatch(saveSearchedText(payload.keyword));
      } else {
        dispatch(searchContractError(apiResponse.message[0]));
      }
    } catch (error: any) {
      dispatch(searchContractError(error.message || "An error occurred"));
    } finally {
      dispatch(setLoading(false)); // Set loading state to false
    }
  };
};

export const searchContract = (payload: SearchResponsePayLoad) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true)); // Set loading state to true
    const { pgn = 1, keyword, mergeResponse = false, sIndexHash = undefined } = payload;
    try {
      if (String(keyword).trim() === "") {
        return false;
      }
      const userIds = _getState().dataFilter.selectedFilterUsers.map((data) => data.id);
      const contractTypeIds = _getState().dataFilter.selectedFilterContractType.map(
        (data) => data.id,
      );
      const { fromDate, toDate } = _getState().dataFilter.selectedDateRangeFilter || {};

      const data = {
        contractTypeIds,
        fromDate: Math.floor(fromDate / 1000),
        keyword,
        toDate: Math.floor(toDate / 1000),
        userIds,
        sIndexHash,
      };

      if (mergeResponse && pgn > 1) {
        let searchList: any = [];
        for (let i: number = 1; i <= pgn; i++) {
          const apiResponse = await api.post<SearchResultResponse>(
            `/v1/submit-file-search?pgn=${i}`,
            data,
          );
          if (apiResponse.data && Array.from(apiResponse.data?.result || []).length) {
            searchList = [...searchList, ...(apiResponse.data.result || [])];
            dispatch(setTotalSearchCount(apiResponse.data.totct));
            dispatch(setSearchIndexHash(apiResponse?.data.sIndexHash));
          }
        }
        dispatch(searchContractSuccesss(searchList));
        // dispatch(saveSearchedText(payload.keyword));
      } else {
        const apiResponse = await api.post<SearchResultResponse>(
          `/v1/submit-file-search?pgn=${pgn || 1}`,
          data,
        );
        if (apiResponse.data && Array.from(apiResponse.data?.result || []).length) {
          const prevResults = pgn === 1 ? [] : _getState().headerSearchContract.searchList;
          dispatch(searchContractSuccesss([...prevResults, ...apiResponse.data.result]));
          // dispatch(saveSearchedText(payload.keyword));
          dispatch(setTotalSearchCount(apiResponse.data.totct));
          if ((apiResponse.data.result || []).length > 0) {
            dispatch(setSearchCurrentPage(pgn + 1));
          }
          dispatch(setSearchIndexHash(apiResponse?.data.sIndexHash));
        } else {
          dispatch(searchContractError(apiResponse.message[0]));
        }
      }
    } catch (error: any) {
      dispatch(searchContractError(error.message || "An error occurred"));
    } finally {
      dispatch(setLoading(false)); // Set loading state to false
    }
  };
};

export const logoutUser = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<Array<LogoutResponse>>(`/v1/logout`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        localStorage.clear();
        window.location.reload();
      } else {
        dispatch(searchContractError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(searchContractError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const resetPassword = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<Array<ApiResponseResetPassword>>(
      `/v1/profile/reset-password`,
    );
    if (apiResponse?.isSuccess && apiResponse?.data && apiResponse.status === 200) {
      CommonService.toast({
        type: "success",
        message: (apiResponse.data || "Something went wrong!") as ToastContent,
      });
    }
  };
};

export const setActiveContractTab = (tab: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));

    try {
      dispatch(setTab(tab));
    } catch (error) {
      dispatch(searchContractError((error as Error).message));
    } finally {
      dispatch(setLoading(false)); // Set loading state to false
    }
  };
};

const headerSearchSlice = createSlice({
  name: "headerSearchContract",
  initialState,
  reducers: {
    searchContractSuccesss: (state, action) => {
      state.searchList = action.payload;
    },
    setAutoCompleteSearchList: (state, action) => {
      state.autoCompleteSearchList = action.payload;
    },
    saveSearchedText: (state, action) => {
      state.searchString = action.payload;
    },
    searchContractError: (state, action) => {
      state.errorMessage = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTab: (state, action) => {
      state.activeContractTab = action.payload;
    },
    clearSearch: (state) => {
      state.searchList = [];
    },
    clearAutoCompleteSearchResult: (state) => {
      state.autoCompleteSearchList = [];
    },
    setTotalSearchCount: (state, action) => {
      state.totalSearchCount = action.payload;
    },
    setSearchCurrentPage: (state, action) => {
      state.searchCurrentPage = action.payload;
    },
    setSearchIndexHash: (state, action) => {
      state.searchIndexHash = action.payload;
    },
  },
});

export const {
  searchContractSuccesss,
  saveSearchedText,
  searchContractError,
  setLoading,
  setTab,
  clearSearch,
  setAutoCompleteSearchList,
  clearAutoCompleteSearchResult,
  setTotalSearchCount,
  setSearchCurrentPage,
  setSearchIndexHash,
} = headerSearchSlice.actions;
export const headerSearchdReducer = headerSearchSlice.reducer;
