import BlankDocumentImage from "assets/images/stat-blank.png";
import moment from "moment";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { LoaderSection } from "src/core/components/loader/loaderSection.comp";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { DocumentEditor } from "vendor/document-editor-react";
import { setQuestionaireArray } from "../../pre-contract.redux";
import {
  fetchBlankGetEditorConfig,
  fetchConfigByContractId,
  fetchConfigByTemplateId,
  fetchNewTemplateEditorConfig,
  setEditorConfig,
  setReviews,
} from "./onlyoffice.redux";

interface EditorType {
  documentType?: string;
  ref?: any;
  getReviewData?: (review: any) => void;
  contractId?: number;
  templateId?: number;
  setEditorLoadingState?: (state: boolean) => void;
}

// eslint-disable-next-line react/display-name, no-empty-pattern, prettier/prettier
const Editor: React.FC<EditorType> = forwardRef(
  (
    {
      documentType = "CONTRACT",
      getReviewData = () => {},
      contractId = 0,
      setEditorLoadingState = () => {},
      templateId = 0,
    }: any,
    ref,
  ) => {
    const dispatch = useAppDispatch();

    const [connector, setConnector] = useState<any>();

    const { questionAnswerSet } = useAppSelector((state) => state.preContract);

    const { getEditorConfigReps, isLoading } = useAppSelector((state) => state.onlyOfficeEditor);
    const { config, apiUrl = "", history: versionHistory } = getEditorConfigReps || {};
    const { currentQuestionnaire } = useAppSelector((state) => state.templates);
    const { reviews } = useAppSelector((state) => state.onlyOfficeEditor);

    const getNextCall = useRef<boolean>(false);

    const insertFormField = (fieldObject: any) => {
      Asc.scope.newFieldObject = fieldObject;
      connector.isConnected &&
        connector.callCommand(
          function () {
            const oDocument = editor.GetDocument();

            oDocument.InsertTextForm({
              key: Asc.scope.newFieldObject.fieldName,
              tip: Asc.scope.newFieldObject.fieldTip,
              required: true,
              placeholder: Asc.scope.newFieldObject.fieldPlaceholder,
              autoFit: true,
            });
            Asc.scope.newFieldObject = {};
          },
          function () {
            console.log("Placeholder added");
          },
          true,
        );
    };

    const onDocumentReady = () => {
      try {
        const editor = window.DocEditor.instances["docxEditor"];
        const connector = editor.createConnector();
        setConnector(connector);

        checkTrackChangesRequestQueue();
      } catch (err) {
        console.error(err);
      }
    };

    const onLoadComponentError = (errorCode: any, errorDescription: any) => {
      console.log("onLoadComponentError", { errorCode, errorDescription });
      switch (errorCode) {
        case -1: // Unknown error loading component
          console.log(errorDescription);
          break;

        case -2: // Error loading DocsAPI from http://documentserver/
          console.log(errorDescription);
          break;

        case -3: // DocsAPI is not defined
          console.log(errorDescription);
          break;
      }
    };

    const getFormData = () => {
      if (connector) {
        !connector.isConnected && connector.connect();
        connector.callCommand(
          function () {
            const formData: any = [];
            // eslint-disable-next-line
            const oDocument = editor.GetDocument();
            const aForms = oDocument.GetAllForms();
            for (let i = 0; i < aForms.length; i++) {
              formData.push({
                question: aForms[i].GetTipText(),
                value: aForms[i].GetText(),
                key: aForms[i].GetFormKey(),
              });
            }
            return formData;
          },
          populateForm,
          true,
        );
      }
    };

    const populateForm = (formData: any) => {
      if (!formData) return;
      const uniqueKeys: any = {};
      const formListData =
        formData &&
        formData
          .filter((data: any) => data?.question)
          .reduce((accumulator: any[], data: any) => {
            if (data.key && !uniqueKeys[data.key]) {
              uniqueKeys[data.key] = true;
              accumulator.push({
                question: data.question,
                ans_type: "String",
                variable_name: data.key,
                value: data.value,
              });
            }
            return accumulator;
          }, []);
      dispatch(setQuestionaireArray(formListData));
    };

    const onRequestHistory = () => {
      if (window.DocEditor) {
        const history = (window as any).documentHistory;
        const docEditor = window.DocEditor.instances.docxEditor;
        docEditor.refreshHistory(JSON.parse(history[0]));
      }
    };

    const onRequestHistoryData = (event: any) => {
      const history = (window as any).documentHistory;
      const docEditor = window.DocEditor.instances.docxEditor;
      const data = event.data;
      docEditor.setHistoryData(JSON.parse(history[1])[data - 1]);
    };

    const onRequestHistoryClose = () => {
      resetEditor();
    };

    const resetEditor = () => {
      setEditorLoadingState(true);
      dispatch(
        setEditorConfig({ ...getEditorConfigReps, config: { ...config, resetConfig: true } }),
      );
      const docEditor = window.DocEditor.instances.docxEditor;
      docEditor && docEditor.destroyEditor();

      setTimeout(() => {
        (async () => {
          if (contractId) {
            await dispatch(fetchConfigByContractId(contractId));
          }
          if (templateId) {
            await dispatch(fetchConfigByTemplateId(templateId));
          }
          setEditorLoadingState(false);
        })();
      }, 2000);
    };

    const getConnector = () => {
      return connector || null;
    };

    const handleNextChanges = () => {
      try {
        connector && connector.executeMethod("MoveToNextReviewChange", [true]);
      } catch (error: any) {}
    };

    const checkTrackChangesRequestQueue = (forwardData: boolean = false) => {
      const docEditor = window.DocEditor.instances?.docxEditor;
      if (!docEditor) {
        return;
      }

      try {
        const connector = docEditor.createConnector();
        connector.callCommand(
          function () {
            const oDocument = Api.GetDocument();
            const review = oDocument.GetReviewReport();
            return review;
          },
          (data: any) => {
            const d = setInterval(() => {
              if (!data) {
                clearInterval(d);
                checkTrackChangesRequestQueue(forwardData);
                setTimeout(() => {
                  handleNextChanges();
                }, 2000);
              }
            }, 1000);

            if (data) {
              clearInterval(d);
              dispatch(setReviews(data));
              forwardData && getReviewData(data);
            }
          },
          true,
        );
      } catch (error: any) {}
    };

    useImperativeHandle(ref, () => ({
      checkTrackChangesRequestQueue,
      getConnector,
    }));

    useEffect(() => {
      if (versionHistory) {
        const parsedHistory = JSON.parse(versionHistory[0] || "{}");
        const historyArr = parsedHistory.history || [];
        let updatedHistoryArr = [];
        if (historyArr.length) {
          updatedHistoryArr = historyArr.map((data: any) => {
            const created = moment.utc(data.created).local().format("YYYY-MM-DD H:mm:ss");

            if (Array.from(data.changes || []).length) {
              const changes = data.changes.map((item: any) => {
                return {
                  ...item,
                  created: moment.utc(item.created).local().format("YYYY-MM-DD H:mm:ss"),
                };
              });
              return {
                ...data,
                created,
                changes,
              };
            }
            return { ...data, created };
          });
        }
        const versionHistory1 = JSON.stringify({
          ...parsedHistory,
          history: updatedHistoryArr,
        });
        (window as any).documentHistory = [versionHistory1, versionHistory[1]];
      }
    }, [versionHistory]);

    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const formListUpdate: any = Object.entries(questionAnswerSet).map(([_, value]) => value);
      if (formListUpdate.length) {
        formListUpdate.forEach((data: any) => {
          const { key, value } = data || {};
          Asc.scope.formObj = { key, value };
          connector.callCommand(
            function () {
              const oDocument = editor.GetDocument();
              const oFormData = Asc.scope.formObj;
              oDocument.SetFormsData([oFormData]);
            },
            function () {},
            true,
          );
        });
      }
    }, [questionAnswerSet]);

    useEffect(() => {
      if (currentQuestionnaire) {
        const { key, label } = currentQuestionnaire || {};
        const fieldName = key;
        const fieldPlaceholder = key;
        const fieldTip = label;
        const fieldObject = { fieldName, fieldPlaceholder, fieldTip };
        insertFormField(fieldObject);
      }
    }, [currentQuestionnaire]);

    useEffect(() => {
      if (connector) getFormData();
    }, [connector]);

    useEffect(() => {
      let id: any = null;
      if (JSON.stringify(reviews) !== "{}" && connector && !getNextCall.current) {
        getNextCall.current = true;
        id = setTimeout(() => {
          handleNextChanges();
        }, 5000);
      }

      return () => {
        id && clearTimeout(id);
      };
    }, [reviews, connector]);

    const onOutdatedVersion = () => {
      window && window.location.reload();
    };

    return (
      <>
        {config ? (
          <DocumentEditor
            id="docxEditor"
            documentServerUrl={apiUrl}
            config={JSON.parse(JSON.stringify(config))}
            events_onDocumentReady={onDocumentReady}
            onLoadComponentError={onLoadComponentError}
            events_onError={(e) => {
              console.log("Error:", e);
            }}
            events_onWarning={(e) => {
              console.log("Warning:", e);
            }}
            events_onRequestHistory={onRequestHistory}
            events_onRequestHistoryData={onRequestHistoryData}
            events_onRequestHistoryClose={onRequestHistoryClose}
            events_onOutdatedVersion={onOutdatedVersion}
          />
        ) : isLoading ? (
          <LoaderSection loaderLabel="Loading" />
        ) : (
          <div className="stat-blank-img">
            <img src={BlankDocumentImage} />
            <div className="img-overlay flex items-center justify-center">
              <button
                className="button-red rounded-12 xl-button tracking-wider font-bold uppercase"
                onClick={() => {
                  if (documentType === "TEMPLATE") {
                    dispatch(fetchNewTemplateEditorConfig());
                  } else {
                    dispatch(fetchBlankGetEditorConfig());
                  }
                }}
              >
                + Start with blank
              </button>
            </div>
          </div>
        )}
      </>
    );
  },
);

export default Editor;
