import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GetState, ThunkApi } from "core/models/common.model";
import { CommonService } from "core/services/common.service";
import { buildDataEndpoint } from "core/utils";
import { ApiResponse } from "pages/auth/auth.model";
import { FolderType } from "pages/pre-dashboard/dashboard.model";
import {
  AutoSuggestFiled,
  Field,
  QuestionnairePlaceholderType,
  SaveTemplateResponse,
  TemplateType,
} from "pages/pre-dashboard/templates/templates.model";
import { PaginatedApiResponse } from "pages/user-dashboard/dashboard.model";
import { FILTER_TYPE } from "src/const";
import { setDraftPublishStatus } from "src/pages/pre-contract/contract-editor/only-office-editor/onlyoffice.redux";
import { AgreementResponse } from "src/pages/pre-contract/pre-contract.model";
import { AppDispatch } from "src/redux/create-store";

export interface TemplatesState {
  templatesList: Array<TemplateType>;
  globaltemplatesList: Array<TemplateType>;
  isLoading: boolean;
  errorMessage: string;
  templatesResponse: PaginatedApiResponse<TemplateType>;
  globalTemplatesResponse: PaginatedApiResponse<TemplateType>;
  trashTemplateList: Array<TemplateType>;
  trashTemplateResponse: PaginatedApiResponse<TemplateType>;
  deletedTemplateListPageCount: number;
  currentQuestionnaire: QuestionnairePlaceholderType | null;
  questionnaireForDelete: QuestionnairePlaceholderType | null;
  editorContent: any;
  contractTypeError: any;
  contractTypeId: number;
  templateFields: Field[];
  templateData: any;
  templateName: string;
  contractId: number;
  questionaireArray: Field[];
  isSaving: boolean;
  autoSuggestFieldList: Array<AutoSuggestFiled>;
  templateId: number;
  oldTemplateJsonData: any;
  templateLastUpdate: any;
  saveTemplateError: any;
}
type GetTemplatesPerPageParams = {
  currentPage?: number;
  folder?: FolderType;
  flag?: boolean;
  status?: number;
};

const initialState: TemplatesState = {
  templatesList: [],
  globaltemplatesList: [],
  isLoading: false,
  errorMessage: "",
  templatesResponse: {
    result: [],
    perpg: 0,
    pgn: 1,
    totct: 0,
  },
   globalTemplatesResponse: {
    result: [],
    perpg: 0,
    pgn: 1,
    totct: 0,
  },
  trashTemplateList: [],
  trashTemplateResponse: {
    result: [],
    perpg: 0,
    pgn: 0,
    totct: 0,
  },
  deletedTemplateListPageCount: 0,
  currentQuestionnaire: null,
  questionnaireForDelete: null,
  editorContent: undefined,
  contractTypeError: null,
  contractTypeId: 0,
  templateFields: [],
  templateData: {},
  templateName: "",
  contractId: 0,
  questionaireArray: [],
  isSaving: false,
  autoSuggestFieldList: [],
  templateId: 0,
  oldTemplateJsonData: {},
  templateLastUpdate: null,
  saveTemplateError: null,
};

export const getTemplatesPerPage =
  ({ currentPage = 1, folder, flag = false, status = 1 }: GetTemplatesPerPageParams) =>
  async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = new URLSearchParams();
    queryParams.set("status", status.toString());
    queryParams.set("pgn", currentPage.toString());
    if (folder && folder.id) queryParams.set("folderId", folder.id.toString());
    // if (currentPage !== 1) {
    dispatch(setTemplatesLoading(true));
    // }
    // if (!flag) {
    //   dispatch(templatesFetched([]));
    //   dispatch(templatesPerPageFetched(initialState.templatesResponse));
    // }
    const baseUrl = `/v1/presigned/template/fetch-all?`;
    const dataEndpoint = buildDataEndpoint(
      baseUrl,
      undefined,
      queryParams,
      _getState(),
      undefined,
      [FILTER_TYPE.CONTRACT_TYPE],
    );
    try {
      const apiResponse = await api.get<PaginatedApiResponse<TemplateType>>(dataEndpoint);
      if (apiResponse?.isSuccess && apiResponse.data) {
        // const filesData = [
        //   ..._getState().templates.templatesList,
        //   ...(apiResponse.data?.result || []),
        // ];
        if (currentPage > 1 && apiResponse.data.result.length === 0) {
          dispatch(getTemplatesPerPage({ currentPage: currentPage - 1, folder }));
        } else {
          dispatch(templatesFetched(apiResponse.data?.result));
          dispatch(templatesPerPageFetched(apiResponse.data));
        }
      } else {
        dispatch(templatesError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(templatesError((error as Error).message));
    } finally {
      dispatch(setTemplatesLoading(false));
    }
  };

export const deleteTemplate =
  (templateId: number, folder?: FolderType, activeStatus: string = "0") =>
  async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = new URLSearchParams();
    queryParams.set("templateId", templateId.toString());
    queryParams.set("activeStatus", activeStatus);
    const baseUrl = `/v1/presigned/template/toggle?${queryParams}`;
    try {
      const apiResponse = await api.get<ApiResponse>(baseUrl);
      if (apiResponse?.isSuccess && apiResponse.data) {
        CommonService.popupToast({
          type: "success",
          message: apiResponse.message[0] ?? "Deleted Successfully",
        });

        if (activeStatus === "1") {
          dispatch(
            getTemplateTrashListData({
              currentPage: _getState().templates?.deletedTemplateListPageCount,
              mergeResponse: true,
            }),
          );
        } else {
          await dispatch(
            getTemplatesPerPage({
              currentPage: 1,
              folder,
            }),
          );
        }
      } else {
        dispatch(templatesError(apiResponse.message[0]));
      }
      return apiResponse;
    } catch (error) {
      dispatch(templatesError((error as Error).message));
    }
  };

export const getTemplateTrashListData = (payload?: any) => {
  const { currentPage, mergeResponse = false } = payload || {};
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    try {
      dispatch(setTemplatesLoading(true));
      const apiResponse = await api.get<PaginatedApiResponse<TemplateType>>(
        `/v1/trash/my-templates?pgn=${currentPage || 1}`,
      );
      if (apiResponse.isSuccess && apiResponse.status === 200) {
        if (currentPage > 1 && apiResponse.data?.result.length === 0) {
          dispatch(getTemplateTrashListData({ currentPage: currentPage - 1 }));
        } else {
          dispatch(trashTemplateFetched(apiResponse.data?.result || []));
          dispatch(trashTemplatePerPageFetched(apiResponse.data));
        }
        dispatch(setTemplatesLoading(false));
      } else {
        dispatch(templatesError(apiResponse.message[0] || ""));
        dispatch(setTemplatesLoading(false));
      }
    } catch (error: any) {
      dispatch(templatesError((error as Error).message));
      dispatch(setTemplatesLoading(false));
    }
  };
};

export const saveTemplateData = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    dispatch(setButtonLoader(true));
    try {
      const {
        contractTypeId,
        markerJson,
        status = 0,
        templateName,
        templateText,
        templateId = 0,
        showMessage = false,
      } = payload;

      const data = {
        templateId: undefined,
        contractTypeId,
        markerJson,
        status,
        templateName,
        templateText,
      };

      if (templateId) {
        data.templateId = templateId;
      }

      if (JSON.stringify(payload) !== JSON.stringify(_getState().templates.oldTemplateJsonData)) {
        const apiResponse = await api.post<SaveTemplateResponse>(
          `/v1/presigned/template/save`,
          data,
        );

        if (apiResponse?.isSuccess && apiResponse?.data) {
          dispatch(setContractId(apiResponse.data));
          dispatch(setDraftPublishStatus(status));
          dispatch(setOldTemplateJsonData({ ...payload, showMessage: false }));
          dispatch(setTemplateLastUpdate(new Date().getTime()));
          status === 1 &&
            showMessage &&
            CommonService.toast({ type: "success", message: "Template Published Successfully" });

          status === 0 &&
            showMessage &&
            CommonService.toast({ type: "success", message: "Template Unpublished Successfully" });
          return templateId;
        } else {
          dispatch(setOldTemplateJsonData({ ...payload, showMessage: false }));
          dispatch(handleSaveError(apiResponse.message[0]));
          CommonService.toast({ type: "error", message: apiResponse.message[0] });
          return 0;
        }
      }
    } catch (error) {
      dispatch(setOldTemplateJsonData(payload));
      dispatch(handleSaveError((error as Error).message));

      CommonService.toast({ type: "error", message: (error as Error).message });
      return 0;
    } finally {
      dispatch(setLoading(false));
      dispatch(setButtonLoader(false));
    }
  };
};

// export const getContentCkEditorForTemplate = (id: number) => {
//   return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
//     dispatch(setLoading(true));
//     try {
//       const apiResponse = await api.get<AgreementResponse>(
//         `/v1/presigned/template/fetch?templateId=${id}`,
//       );

//       if (apiResponse?.isSuccess && apiResponse?.data) {
//         const { templateId, templateName, contractTypeId } = apiResponse?.data.template || {};
//         dispatch(contentCkEditorSuccess(apiResponse?.data));
//         dispatch(setTemplateName(templateName));
//         dispatch(setContractTypeId(contractTypeId));
//         dispatch(setContractId(templateId));
//       } else {
//         dispatch(handleError(apiResponse.message[0]));
//       }
//     } catch (error) {
//       dispatch(handleError((error as Error).message));
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };
// };

export const fetchAutoSuggestField = (payload: any) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    dispatch(setLoading(true));
    try {
      const { key, contractTypeId = 0 } = payload;

      const apiResponse = await api.get<any>(
        `/v1/playbook/suggest-placeholder?contractTypeId=${contractTypeId}&terms=${key}`,
      );

      if (apiResponse?.isSuccess && apiResponse?.data) {
        if (apiResponse.data.result.length) {
          dispatch(setAutoSuggestFieldList(apiResponse.data.result));
        } else {
          if (key.trim() !== "") {
            dispatch(
              setAutoSuggestFieldList([
                {
                  ques: key,
                },
              ]),
            );
          } else {
            dispatch(setAutoSuggestFieldList([]));
          }
        }
      } else {
        dispatch(handleError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(handleError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const getGlobalTemplatesPerPage =
  ({ currentPage = 1, folder, flag = false, status = 1 }: GetTemplatesPerPageParams) =>
  async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const queryParams = new URLSearchParams();
    queryParams.set("status", status.toString());
    queryParams.set("pgn", currentPage.toString());
    if (folder && folder.id) queryParams.set("folderId", folder.id.toString());
    dispatch(setTemplatesLoading(true));
    const baseUrl = `/v1/presigned/template/global/fetch-all?`;
    const dataEndpoint = buildDataEndpoint(
      baseUrl,
      undefined,
      queryParams,
      _getState(),
      undefined,
      [FILTER_TYPE.CONTRACT_TYPE],
    );
    try {
      const apiResponse = await api.get<PaginatedApiResponse<TemplateType>>(dataEndpoint);
      if (apiResponse?.isSuccess && apiResponse.data) {
     
        if (currentPage > 1 && apiResponse.data.result.length === 0) {
          dispatch(getGlobalTemplatesPerPage({ currentPage: currentPage - 1, folder }));
        } else {
          dispatch(globalTemplatesFetched(apiResponse.data?.result));
          dispatch(GlobalTemplatesPerPageFetched(apiResponse.data));
        }
      } else {
        dispatch(templatesError(apiResponse.message[0]));
      }
    } catch (error) {
      dispatch(templatesError((error as Error).message));
    } finally {
      dispatch(setTemplatesLoading(false));
    }
  };

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    templatesFetched: (state, action) => {
      state.templatesList = action.payload;
    },
    globalTemplatesFetched: (state, action) => {
      state.globaltemplatesList = action.payload;
    },
    setTemplatesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    templatesError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    templatesPerPageFetched: (state, action: PayloadAction<PaginatedApiResponse<TemplateType>>) => {
      state.templatesResponse = action.payload;
    },
      GlobalTemplatesPerPageFetched: (state, action: PayloadAction<PaginatedApiResponse<TemplateType>>) => {
      state.globalTemplatesResponse = action.payload;
    },
    trashTemplateFetched: (state, action) => {
      state.trashTemplateList = action.payload;
    },
    trashTemplatePerPageFetched: (state, action) => {
      state.trashTemplateResponse = action.payload;
    },
    setDeletedTemplateListPageCount: (state, action) => {
      state.deletedTemplateListPageCount = action.payload;
      state.errorMessage = "";
    },
    clearDeleteTemplateResponse: (state) => {
      state.deletedTemplateListPageCount = 0;
      state.trashTemplateList = [];
      state.trashTemplateResponse = initialState.trashTemplateResponse;
      state.errorMessage = "";
    },
    addQuestionnaire: (state, action) => {
      state.currentQuestionnaire = action.payload;
    },
    deleteQuestionnaire: (state, action) => {
      state.questionnaireForDelete = action.payload;
    },
    contentCkEditorOffline: (state, action: PayloadAction<string>) => {
      state.editorContent = action.payload || undefined;
    },
    setContractTypeError: (state, action) => {
      state.contractTypeError = action.payload;
    },
    setContractTypeId: (state, action) => {
      state.contractTypeId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setButtonLoader: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action?.payload;
    },
    setQuesFields: (state, action: PayloadAction<Field[]>) => {
      state.templateFields = action.payload;
    },
    handleError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    contentCkEditorSuccess: (state, action: PayloadAction<AgreementResponse>) => {
      const templateMarker = action.payload?.templateMarker;
      state.templateData = action.payload;
      state.editorContent =
        JSON.parse(action.payload?.template?.templateText || "{}").initialData || undefined;
      if (templateMarker) {
        const markerJson = JSON.parse(templateMarker.markerJson);
        if (markerJson && markerJson.questionaire && Array.isArray(markerJson.questionaire)) {
          state.questionaireArray = markerJson.questionaire;
        }
      }
    },
    setTemplateQuestionaireArray: (state, action) => {
      state.questionaireArray = action.payload;
    },
    setTemplateName: (state, action) => {
      state.templateName = action.payload;
    },
    setContractId: (state, action) => {
      state.contractId = action.payload;
    },
    setTemplateTypeError: (state, action) => {
      state.contractTypeError = action.payload;
    },
    clearTemplateData: (state) => {
      state.templateData = {};
      state.templateName = "";
      state.contractId = 0;
      state.editorContent = undefined;
      state.contractTypeId = 0;
      state.questionaireArray = [];
      state.currentQuestionnaire = null;
      state.templateLastUpdate = null;
      state.saveTemplateError = null;
    },
    setAutoSuggestFieldList: (state, action) => {
      state.autoSuggestFieldList = action.payload;
    },
    setTemplateId: (state, action) => {
      state.templateId = action.payload;
    },
    setOldTemplateJsonData: (state, action) => {
      state.oldTemplateJsonData = action.payload;
    },
    setTemplateLastUpdate: (state, action) => {
      state.templateLastUpdate = action.payload;
    },
    handleSaveError: (state, action) => {
      state.saveTemplateError = action.payload;
    },
  },
});

export const {
  setOldTemplateJsonData,
  setTemplateLastUpdate,
  templatesFetched,
  setTemplatesLoading,
  templatesError,
  templatesPerPageFetched,
  trashTemplateFetched,
  trashTemplatePerPageFetched,
  setDeletedTemplateListPageCount,
  clearDeleteTemplateResponse,
  addQuestionnaire,
  deleteQuestionnaire,
  contentCkEditorOffline,
  setTemplateTypeError,
  setContractTypeId,
  setLoading,
  setQuesFields,
  handleError,
  contentCkEditorSuccess,
  setTemplateName,
  setContractId,
  clearTemplateData,
  setButtonLoader,
  setTemplateQuestionaireArray,
  setAutoSuggestFieldList,
  setTemplateId,
  handleSaveError,
  globalTemplatesFetched,
  GlobalTemplatesPerPageFetched
} = templatesSlice.actions;
export const TemplatesReducer = templatesSlice.reducer;
