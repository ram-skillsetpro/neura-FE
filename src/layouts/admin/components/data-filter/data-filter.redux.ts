import { createSlice } from "@reduxjs/toolkit";

export interface DataFilterStateType {
  selectedFilterContractType: Array<any>;
  selectedFilterUsers: Array<any>;
  currentPath: string;
  selectedFilterActivityType: Array<any>;
  selectedDateRangeFilter: { fromDate: any; toDate: any };
  isFilterActive: boolean;
  selectedFilterContractStage: Array<any>;
}

const initialState: DataFilterStateType = {
  selectedFilterContractType: [],
  selectedFilterUsers: [],
  currentPath: "",
  selectedFilterActivityType: [],
  selectedDateRangeFilter: {
    fromDate: null,
    toDate: null,
  },
  isFilterActive: false,
  selectedFilterContractStage: [],
};

const dataFilterSlice = createSlice({
  name: "dataFilter",
  initialState,
  reducers: {
    clearFilter: (state) => {
      state.selectedFilterUsers = [];
      state.selectedFilterContractType = [];
      state.selectedFilterActivityType = [];
      state.selectedDateRangeFilter = { fromDate: null, toDate: null };
      state.isFilterActive = false;
      state.selectedFilterContractStage = [];
    },
    setCurrentPath: (state, action) => {
      state.currentPath = action.payload;
    },
    setSelectedActivityType: (state, action) => {
      let selectedFilterActivityType = [];
      if (state.selectedFilterActivityType.filter((data) => data.key === action.payload.key)[0]) {
        selectedFilterActivityType = state.selectedFilterActivityType.filter(
          (data) => data.key !== action.payload.key,
        );
      } else {
        selectedFilterActivityType = [...state.selectedFilterActivityType, action.payload];
      }
      state.selectedFilterActivityType = selectedFilterActivityType;
      state.isFilterActive = false;
    },
    setSelectedContractStage: (state, action) => {
      let selectedFilterContractStage = [];
      if (state.selectedFilterContractStage.filter((data) => data.id === action.payload.id)[0]) {
        selectedFilterContractStage = state.selectedFilterContractStage.filter(
          (data) => data.id !== action.payload.id,
        );
      } else {
        selectedFilterContractStage = [...state.selectedFilterContractStage, action.payload];
      }
      state.selectedFilterContractStage = selectedFilterContractStage;
      state.isFilterActive = false;
    },
    setSelectedFilterContractType: (state, action) => {
      let selectedFilterContractType = [];
      if (state.selectedFilterContractType.filter((data) => data.id === action.payload.id)[0]) {
        selectedFilterContractType = state.selectedFilterContractType.filter(
          (data) => data.id !== action.payload.id,
        );
      } else {
        selectedFilterContractType = [...state.selectedFilterContractType, action.payload];
      }
      state.selectedFilterContractType = selectedFilterContractType;
      state.isFilterActive = false;
    },
    setSelectedFilterSingleUser: (state, action) => {
      if (state.selectedFilterUsers.filter((data) => data.id === action.payload.id)[0]) {
        state.selectedFilterUsers = [];
      } else {
        state.selectedFilterUsers = [action.payload];
        state.isFilterActive = false;
      }
    },
    setSelectedFilterUsers: (state, action) => {
      let selectedFilterUsers = [];
      if (state.selectedFilterUsers.filter((data) => data.id === action.payload.id)[0]) {
        selectedFilterUsers = state.selectedFilterUsers.filter(
          (data) => data.id !== action.payload.id,
        );
      } else {
        selectedFilterUsers = [...state.selectedFilterUsers, action.payload];
      }
      state.selectedFilterUsers = selectedFilterUsers;
      state.isFilterActive = false;
    },
    setFilterActive: (state, action) => {
      state.isFilterActive = action.payload;
    },
    clearDateRangeFilter: (state) => {
      state.selectedDateRangeFilter = { fromDate: null, toDate: null };
      state.isFilterActive = false;
    },
    setDateRangeFilter: (state, action) => {
      state.selectedDateRangeFilter = {
        fromDate: action.payload.fromDate,
        toDate: action.payload.toDate,
      };
      state.isFilterActive = false;
    },
  },
});

export const {
  clearFilter,
  setCurrentPath,
  setSelectedActivityType,
  setSelectedContractStage,
  setSelectedFilterContractType,
  setSelectedFilterSingleUser,
  setSelectedFilterUsers,
  setFilterActive,
  clearDateRangeFilter,
  setDateRangeFilter,
} = dataFilterSlice.actions;
export const dataFilterReducer = dataFilterSlice.reducer;
