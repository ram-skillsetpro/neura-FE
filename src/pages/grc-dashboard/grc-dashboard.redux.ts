import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { CommonService } from "core/services/common.service";
import { setPreviewFile } from "pages/contract/contract.redux";
import {
  ContractObligationsType,
  DepartmentTeamType,
  EscalationFiltersType,
  IEscalations,
  PaginatedContractInfo,
  RiskAuditType,
  RiskComplianceType,
  RiskDeadlineType,
  RiskStatusType,
  ValueMapResponseData
} from "pages/grc-dashboard/grc-dashboard.model";
import { AppDispatch } from "src/redux/create-store";

export interface GRCDashboardStateType {
  isLoading: boolean;
  errorMessage: string;
  riskStatus: RiskStatusType[];
  riskType: RiskComplianceType[];
  departmentTeams: DepartmentTeamType[];
  riskDeadlines: RiskDeadlineType[];
  riskAudits: RiskAuditType[];
  escalationFilters: EscalationFiltersType;
  escalations: PaginatedContractInfo;
  obligations: ContractObligationsType;
  dropdownData: ValueMapResponseData;
}

const initialState: GRCDashboardStateType = {
  isLoading: false,
  errorMessage: "",
  riskStatus: [],
  riskType: [],
  departmentTeams: [],
  riskDeadlines: [],
  riskAudits: [],
  escalationFilters: {
    contractType: [],
    ownerName: [],
    ownerDept: [],
    riskType: [],
    riskCategory: [],
    obligationType: [],
    secondParty: [],
    department: [],
  },
  escalations: {
    totct: 0,
    pgn: 0,
    perpg: 0,
    result: []
  },
  obligations: {
    contractName: "",
    contractFolderId: "",
    contractTeamId: "",
    obligations: [],
    contractId: "",
  },
  dropdownData: {
    trackingFrequencies: {
      Daily: 0,
      Monthly: 0,
      Once: 0,
      Weekly: 0,
      Yearly: 0,
      Quarterly: 0
    },
    controlMap: {},
    teamOwners: {}
  }
};

export const getEscalations = (payload?: { pgn: number }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { pgn } = payload || {};
    dispatch(dataFetching(true));
    try {
      const apiResponse = await api.get<IEscalations>(`/v1/contract/get/escalations?pgn=${pgn}`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(escalationsFetched(apiResponse.data));
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(dataFetching(false));
    }
  };
};

export const getRiskImpact = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(dataFetching(true));
    try {
      const apiResponse = await api.get<RiskStatusType[]>(`/v1/contract/get/risk-status`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(riskStatusFetched(apiResponse.data));
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(dataFetching(false));
    }
  };
};

export const getComplianceType = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(dataFetching(true));
      const apiResponse = await api.get<RiskComplianceType[]>(`/v1/contract/get/risk-types`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(complianceTypeFetched(apiResponse.data));
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(dataFetching(false));
    }
  };
};

export const getDepartmentTeams = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(dataFetching(true));
    try {
      const apiResponse = await api.get<DepartmentTeamType[]>(`/v1/contract/get/risk-teams`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(departmentTeamsFetched(apiResponse.data));
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(dataFetching(false));
    }
  };
};

export const getRiskDeadlines = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(dataFetching(true));
    try {
      const apiResponse = await api.get<RiskDeadlineType[]>(`/v1/contract/get/risk-deadlines`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(riskDeadlinesFetched(apiResponse.data));
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(dataFetching(false));
    }
  };
};
export const getRiskAudits = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(dataFetching(true));
    try {
      const apiResponse = await api.get<RiskAuditType[]>(`/v1/contract/get/risk-audits`);
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(riskAuditsFetched(apiResponse.data));
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(dataFetching(false));
    }
  };
};
export const getEscalationsFilters = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(dataFetching(true));
    try {
      const apiResponse = await api.get<EscalationFiltersType>(
        `/v1/contract/get/escalation-filters`,
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(escalationsFiltersFetched(apiResponse.data));
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(dataFetching(false));
    }
  };
};
export const getObligations = (payload?: { contractId: string, obligationId: string }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { contractId, obligationId } = payload || {};
    let queryParams = contractId ? `contractId=${contractId}` : "";
    if (obligationId != "") {
      queryParams += obligationId ? `&obligationId=${obligationId}` : "";
    }
    try {
      dispatch(dataFetching(true));
      const apiResponse = await api.get<ContractObligationsType>(
        `/v1/contract/get/obligations?${queryParams}`,
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(obligationsFetched(apiResponse.data));
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(dataFetching(false));
    }
  };
};

export const markAsResolvedObligation = (payload: {
  file: File;
  contractId: number;
  mappingId: number;
}) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const formData = new FormData();
    const { file, contractId, mappingId } = payload;
    formData.append("file", file);
    const queryParams = new URLSearchParams();
    queryParams.append("contractId", contractId.toString());
    queryParams.append("mappingId", mappingId.toString());
    try {
      dispatch(dataFetching(true));
      const apiResponse = await api.post(
        `/v1/contract/obligations/evidence/resolve-obligation`,
        formData,
        { params: queryParams, headers: { "Content-Type": "multipart/form-data" } },
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0],
        });
        return true;
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0],
        });
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
    } finally {
      dispatch(dataFetching(false));
    }
  };
};

export const getDropDownValues = (payload?: { companyID: number | undefined }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const { companyID } = payload || {};
    const queryParams = companyID ? `companyId=${companyID}` : "";
    try {
      dispatch(dataFetching(true));
      const apiResponse = await api.get<ValueMapResponseData>(
        `/v1/contract/get/value-maps?${queryParams}`,
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(dropdownFetched(apiResponse.data));
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      CommonService.toast({
        type: "error",
        message: (error as Error).message,
      });
    } finally {
      dispatch(dataFetching(false));
    }
  };
};

export const saveObligations = (payload: {
  attachments: File,
  data: { [key: string]: any },
  isEdit: boolean
}) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {

    try {

      const { attachments, data, isEdit } = payload;
      if (data && data.tags) {
        data.tags = data.tags.replace(/\s*,\s*/g, ",");
        console.log("tags", data.tags);
      }
      const formData = new FormData();
      attachments && formData.append('file', attachments);
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

      dispatch(dataFetching(true));

      let url = "";
      if (isEdit) {
        url = "/v1/contract/edit-risk";
      } else {
        url = "/v1/contract/record-risk";
      }

      const apiResponse = await api.post(url, formData);

      if (apiResponse?.isSuccess && apiResponse?.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0],
        });
        return true;
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0],
        });
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
    } finally {
      dispatch(dataFetching(false));
    }
  };
}


export const changeDeadlineObligation = (payload: {
  file: File;
  contractId: number;
  mappingId: number;
  deadlineDate: string;
  reason: string;
}) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(dataFetching(true));
    const { file, contractId, mappingId, deadlineDate, reason } = payload;
    const formData = new FormData();
    formData.append("file", file);
    const queryParams = new URLSearchParams();
    queryParams.set("contractId", contractId.toString());
    queryParams.set("mappingId", mappingId.toString());
    queryParams.set("deadlineDate", deadlineDate);
    queryParams.set("reason", reason);
    try {
      const apiResponse = await api.post(
        `/v1/contract/obligations/evidence/change-deadline`,
        formData,
        { params: queryParams, headers: { "Content-Type": "multipart/form-data" } },
      );
      if (apiResponse?.isSuccess && apiResponse?.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0],
        });
        return true;
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0],
        });
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
    } finally {
      dispatch(dataFetching(false));
    }
  };
};

export const getObligationEvidence = (payload: { trackingId: number }) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = new URLSearchParams();
    queryParams.set("trackingId", payload.trackingId.toString());
    try {
      dispatch(dataFetching(true));
      const apiResponse = await api.get<string>(`/v1/contract/obligations/evidence/download`, {
        params: queryParams,
      });
      if (apiResponse?.isSuccess && apiResponse?.data) {
        dispatch(setPreviewFile(apiResponse.data));
        return true;
      } else {
        CommonService.popupToast({
          type: "error",
          message: apiResponse.message[0],
        });
        return false;
      }
    } catch (error) {
      dispatch(apiError((error as Error).message));
      return false;
    } finally {
      dispatch(dataFetching(false));
    }
  };
};

const grcDashboardSlice = createSlice({
  name: "grcDashboard",
  initialState,
  reducers: {
    apiError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    dataFetching: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    riskStatusFetched: (state, action: PayloadAction<RiskStatusType[]>) => {
      state.riskStatus = action.payload;
    },
    complianceTypeFetched: (state, action: PayloadAction<RiskComplianceType[]>) => {
      state.riskType = action.payload;
    },
    departmentTeamsFetched: (state, action: PayloadAction<DepartmentTeamType[]>) => {
      state.departmentTeams = action.payload;
    },
    riskDeadlinesFetched: (state, action: PayloadAction<RiskDeadlineType[]>) => {
      state.riskDeadlines = action.payload;
    },
    riskAuditsFetched: (state, action: PayloadAction<RiskAuditType[]>) => {
      state.riskAudits = action.payload;
    },
    escalationsFiltersFetched: (state, action: PayloadAction<EscalationFiltersType>) => {
      state.escalationFilters = action.payload;
    },
    escalationsFetched: (state, action: PayloadAction<IEscalations>) => {
      const { paginatedContracts, escalatedFilters } = action.payload;
      state.escalations = paginatedContracts;
      state.escalationFilters = escalatedFilters;
    },
    obligationsFetched: (state, action: PayloadAction<ContractObligationsType>) => {
      state.obligations = action.payload;
    },
    dropdownFetched: (state, action: PayloadAction<ValueMapResponseData>) => {
      state.dropdownData = action.payload;
    },
  },
});

export const {
  apiError,
  dataFetching,
  riskStatusFetched,
  complianceTypeFetched,
  departmentTeamsFetched,
  riskDeadlinesFetched,
  riskAuditsFetched,
  escalationsFiltersFetched,
  escalationsFetched,
  obligationsFetched,
  dropdownFetched,
} = grcDashboardSlice.actions;
export const grcDashboardReducer = grcDashboardSlice.reducer;