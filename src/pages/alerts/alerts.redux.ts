import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { AlertsResponseType, AlertsType, CreateAlertType } from "pages/alerts/alerts.model";
import { ApiResponse } from "pages/auth/auth.model";
import { CommonService } from "src/core/services/common.service";
import { AppDispatch } from "src/redux/create-store";

export interface AlertsState {
  unread: Array<AlertsType>;
  count: number;
  errorMessage: string;
  isLoading: boolean;
  forMe: AlertsResponseType<AlertsType>;
  createdByMe: AlertsResponseType<AlertsType>;
  forFile: AlertsResponseType<AlertsType>;
  aleartCreateSuccessMessage: string;
  unreadBellIcon: Array<AlertsType>;
  openAlertView: boolean;
}

const initialState: AlertsState = {
  unread: [],
  forMe: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
    unrdct: 0,
  },
  forFile: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  createdByMe: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  unreadBellIcon: [],
  count: 0,
  errorMessage: "",
  isLoading: false,
  aleartCreateSuccessMessage: "",
  openAlertView: false,
};

export const getAlertsUnread = (pgn: number = 1) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<Array<AlertsType>>(`/v1/alert/alerts-unread?pgn=${pgn}`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(alertsUnreadSuccess(apiResponse.data));
      } else {
        dispatch(alertsUnreadError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(alertsUnreadError((error as Error).message));
    }
  };
};
export const getAlertsUnreadCount = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      const apiResponse = await api.get<number>(`/v1/alert/alerts-unread-count`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(alertsUnreadCountSuccess(apiResponse.data));
      } else {
        dispatch(alertsUnreadCountError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(alertsUnreadCountError((error as Error).message));
    }
  };
};
export const getAlertsCreatedByMe = (pgn: number = 1, status = 1) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<AlertsResponseType<AlertsType>>(
        `/v1/alert/alerts-created-by-me?pgn=${pgn}&verifiedStatus=${status}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(alertsCreatedByMeSuccess(apiResponse.data));
      } else {
        dispatch(alertsCreatedByMeError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(alertsCreatedByMeError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const getAlertsForMe = (pgn: number = 1, status = 1) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<AlertsResponseType<AlertsType>>(
        `/v1/alert/alerts-for-me?pgn=${pgn}&verifiedStatus=${status}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        const alertsData = [
          ..._getState().alerts.unreadBellIcon,
          ...(apiResponse.data.result || []),
        ];
        dispatch(alertsBellIcon(alertsData));
        dispatch(alertsForMeSuccess(apiResponse.data));
      } else {
        dispatch(alertsForMeError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(alertsForMeError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const getAlertsForFile = (fileId: number, pgn: number = 1, status = 1) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<AlertsResponseType<AlertsType>>(
        `/v1/alert/alerts-for-me-on-file?fileId=${fileId}&pgn=${pgn}&verifiedStatus=${status}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(alertsForFileSuccess(apiResponse.data));
      } else {
        dispatch(alertsForMeError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(alertsForMeError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};
export const createAlert = (payload: CreateAlertType) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.post<string>(`/v1/alert/create-alert`, payload);
      if (apiResponse?.isSuccess && apiResponse.data) {
        /* empty */
        dispatch(alertsCreatedeSuccess(apiResponse.message[0]));
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0] || "Created Successfully!!!",
        });
      } else {
        dispatch(alertsError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(alertsError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const acknowledgeAlert = (alertId: number, fileId?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const apiResponse = await api.get<ApiResponse>(`/v1/alert/ack-alert?alertId=${alertId}`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.toast({
          type: "success",
          message: apiResponse.message[0] ?? "Updated Successfully",
        });
        if (fileId) {
          dispatch(getAlertsForFile(fileId, _getState().alerts.forFile.pgn));
        } else {
          dispatch(getAlertsForMe(_getState().alerts.forMe.pgn));
        }
      } else {
        dispatch(alertsError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(alertsError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const clearBellIconAlerts = () => async (dispatch: AppDispatch) => {
  dispatch(alertsBellIcon([]));
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    alertsUnreadSuccess: (state, action: PayloadAction<Array<AlertsType>>) => {
      state.unread = action.payload;
      state.errorMessage = "";
    },
    alertsBellIcon: (state, action: PayloadAction<Array<AlertsType>>) => {
      state.unreadBellIcon = action.payload;
      state.errorMessage = "";
    },
    alertsUnreadCountSuccess: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
      state.errorMessage = "";
    },
    alertsUnreadError: (state, action) => {
      state.errorMessage = action.payload;
    },
    alertsCreatedByMeSuccess: (state, action: PayloadAction<AlertsResponseType<AlertsType>>) => {
      state.createdByMe = action.payload;
      state.errorMessage = "";
    },
    alertsCreatedeSuccess: (state, action) => {
      state.aleartCreateSuccessMessage = action.payload;
      state.errorMessage = "";
    },
    alertsCreatedByMeError: (state, action) => {
      state.errorMessage = action.payload;
    },
    alertsForMeSuccess: (state, action: PayloadAction<AlertsResponseType<AlertsType>>) => {
      state.forMe = action.payload;
      state.errorMessage = "";
    },
    alertsForFileSuccess: (state, action: PayloadAction<AlertsResponseType<AlertsType>>) => {
      state.forFile = action.payload;
      state.errorMessage = "";
    },
    alertsForMeError: (state, action) => {
      state.errorMessage = action.payload;
    },
    alertsUnreadCountError: (state, action) => {
      state.errorMessage = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    alertsError: (state, action) => {
      state.errorMessage = action.payload;
    },
      alertsOpen: (state) => {
      state.openAlertView = true;
    },
      alertsClose: (state) => {
      state.openAlertView = false;
    },
  },
});

export const {
  alertsUnreadSuccess,
  alertsUnreadError,
  alertsUnreadCountSuccess,
  alertsUnreadCountError,
  alertsCreatedByMeSuccess,
  alertsCreatedByMeError,
  alertsForMeError,
  alertsForMeSuccess,
  setLoading,
  alertsError,
  alertsCreatedeSuccess,
  alertsForFileSuccess,
  alertsBellIcon,
  alertsOpen,
  alertsClose
} = alertsSlice.actions;
export const alertsReducer = alertsSlice.reducer;
