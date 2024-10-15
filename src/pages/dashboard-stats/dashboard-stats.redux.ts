import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import {
  ApiResponse,
  ContractExpiring,
  ContractStats,
  ContractTypeCount,
  DashboardStatsBarGraphType,
  FileStatType,
  MonthlyResponseData,
  TopUser,
} from "pages/dashboard-stats/dashboard-stats.model";
import { getMonthAbbreviation } from "src/core/utils";
import { AppDispatch } from "src/redux/create-store";

export interface DashboardStatsState {
  isLoading: boolean;
  monthlyFileStats: Array<FileStatType>;
  modifiedFileStats: Array<DashboardStatsBarGraphType>;
  errorMessage: string;
  fileStats: ContractStats[];
  contractExpiring: ContractExpiring[];
  topUser: TopUser;
  currentMonthData: MonthlyResponseData;
  contractType: Array<ContractTypeCount>
}

const initialState: DashboardStatsState = {
  isLoading: false,
  monthlyFileStats: [],
  errorMessage: "",
  fileStats: [],
  modifiedFileStats: [],
  contractExpiring: [],
  topUser: {
    name: "",
    count: 0,
    logoUrl: ""
  },
  currentMonthData: {
    nopg: null,
    flsz: null,
    spc: 0,
    fpc: 0,
    stronly: 0,
    tfc: 0,
    id: null
  },
  contractType: []
};

export const getMonthlyFileStats = (uuid?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = uuid ? `?uid=${uuid}` : "";
    try {
      dispatch(setIsLoading(true));
      const apiResponse = await api.get<Array<FileStatType>>(
        `/v1/file-monthly-stats${queryParams}`,
      );
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(setMonthlyFileStats(apiResponse.data));
      } else {
        dispatch(setMonthlyFileStatsErr(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(setMonthlyFileStatsErr((error as Error).message));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};
export const getFileStats = (uuid?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = uuid ? `?uid=${uuid}` : "";
    try {
      dispatch(setIsLoading(true));
      const apiResponse = await api.get<ApiResponse>(`/v1/file-stats${queryParams}`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(setFileStats(apiResponse.data));
      } else {
        dispatch(setFileStatsErr(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(setMonthlyFileStatsErr((error as Error).message));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

export const getCurrentMonthFileStats = (uuid?: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = uuid ? `?uid=${uuid}` : "";
    try {
      dispatch(setIsLoading(true));
      const apiResponse = await api.get<MonthlyResponseData>(`/v1/current-month-file-stats${queryParams}`);
      if (apiResponse?.isSuccess && apiResponse.data) {
        dispatch(setCurrentMonthFileStats(apiResponse.data));
      } else {
        dispatch(setFileStatsErr(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(setMonthlyFileStatsErr((error as Error).message));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
};

const dashboardStatsSlice = createSlice({
  name: "dashboardStats",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setMonthlyFileStatsErr: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setFileStatsErr: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setMonthlyFileStats: (state, action: PayloadAction<Array<FileStatType>>) => {
      const transformedArray: DashboardStatsBarGraphType[] = action.payload.reduce(
        (acc, data, index, array) => {
          const [year, month] = data.monthYear.split("-");

          // Add empty months for missing data
          if (index > 0) {
            const prevData = array[index - 1];
            const [prevYear, prevMonth] = prevData.monthYear.split("-");
            const diffMonths =
              (Number(year) - Number(prevYear)) * 12 + (Number(month) - Number(prevMonth));
            for (let i = 1; i < diffMonths; i++) {
              const missingMonth = new Date(prevData.monthYear);
              missingMonth.setMonth(missingMonth.getMonth() + i);
              const missingYear = missingMonth.getFullYear();
              const missingMonthNumber = missingMonth.getMonth() + 1;
              acc.push({
                month: getMonthAbbreviation(missingMonthNumber),
                year: missingYear,
                value: 0,
                tfc: 0,
                spc: 0,
                fpc: 0,
              });
            }
          }
          acc.push({
            month: `${getMonthAbbreviation(Number(month))} ${Number(year) % 100}`,
            year: Number(year),
            value: data.tfc ?? 0,
            tfc: data.tfc ?? 0,
            spc: data.spc ?? 0,
            fpc: data.fpc ?? 0,
          });
          return acc;
        },
        [] as DashboardStatsBarGraphType[],
      );
      // Ensure there are exactly 12 elements in the resulting array
      while (transformedArray.length < 12) {
        const firstData = transformedArray[0];
        const prevMonth = new Date(`${firstData.year}-${firstData.month}`);
        prevMonth.setMonth(prevMonth.getMonth() - 1);

        transformedArray.unshift({
          month: getMonthAbbreviation(prevMonth.getMonth() + 1),
          year: prevMonth.getFullYear(),
          value: 0,
          tfc: 0,
          spc: 0,
          fpc: 0,
        });
      }
      state.modifiedFileStats = transformedArray;
      state.monthlyFileStats = action.payload;
    },
    setFileStats: (state, action: PayloadAction<ApiResponse>) => {
      state.fileStats = action.payload.companyStatsList;
      state.contractExpiring = action.payload.contractsExpiring.contractsExpiring;
      state.topUser = action.payload.topUser;
      state.contractType = action.payload.contractTypeCounts.counts
    },

    setCurrentMonthFileStats: (state, action: PayloadAction<MonthlyResponseData>) => {
      state.currentMonthData = action.payload;
    },
  },
});

export const {
  setIsLoading,
  setMonthlyFileStats,
  setCurrentMonthFileStats,
  setMonthlyFileStatsErr,
  setFileStats,
  setFileStatsErr,
} = dashboardStatsSlice.actions;

export const dashboardStatsReducer = dashboardStatsSlice.reducer;
