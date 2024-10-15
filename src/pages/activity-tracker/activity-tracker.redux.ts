import { createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { AppDispatch } from "src/redux/create-store";
import { ApiResponse } from "./activity-tracker.model";

export interface ActivityTrackerState {
  errorMessage: string;
  isLoading: boolean;
  actionList: Array<any>;
}

const initialState: ActivityTrackerState = {
  errorMessage: "",
  isLoading: false,
  actionList: [],
};

export const fetchActionList = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setLoading(true));
      const apiResponse = await api.get<ApiResponse>(`/v1/report/action-list`);
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        dispatch(setActionList(apiResponse.data));
      } else {
        dispatch(setError(apiResponse.message || ""));
        dispatch(setLoading(false));
      }
    } catch (error: any) {
      dispatch(setError((error as Error).message));
      dispatch(setLoading(false));
    }
  };
};

const activityTrackerSlice = createSlice({
  name: "activityTracker",
  initialState,
  reducers: {
    setError: (state, action) => {
      state.errorMessage = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setActionList: (state, action) => {
      state.actionList = action.payload;
    },
  },
});

export const { setError, setLoading, setActionList } = activityTrackerSlice.actions;
export const activityTrackerReducer = activityTrackerSlice.reducer;
