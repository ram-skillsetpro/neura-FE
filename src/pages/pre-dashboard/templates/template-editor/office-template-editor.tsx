import { DocumentEditor } from "@onlyoffice/document-editor-react";
import BlankDocumentImage from "assets/images/stat-blank.png";
import React from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import PdfSpinner from "src/pages/contract/components/pdf/pdf-spinner";
import { fetchNewTemplateEditorConfig } from "src/pages/pre-contract/contract-editor/only-office-editor/onlyoffice.redux";

const OfficeTemplateEditor: React.FC = () => {
  const dispatch = useAppDispatch();

  const { getEditorConfigReps, isLoading } = useAppSelector((state) => state.onlyOfficeEditor);
  const { config, apiUrl = "" } = getEditorConfigReps || {};

  const onDocumentReady = () => {};

  const onLoadComponentError = (errorCode: any, errorDescription: any) => {
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

  return (
    <>
      {config ? (
        <DocumentEditor
          id="docxEditor"
          documentServerUrl={apiUrl}
          config={JSON.parse(JSON.stringify(config))}
          events_onDocumentReady={onDocumentReady}
          onLoadComponentError={onLoadComponentError}
          // events_onDocumentStateChange={onChangeContentControl}
        />
      ) : isLoading ? (
        <PdfSpinner />
      ) : (
        <div className="stat-blank-img">
          <img src={BlankDocumentImage} />
          <div className="img-overlay flex items-center justify-center">
            <button
              className="button-red rounded-12 xl-button tracking-wider font-bold uppercase"
              onClick={() => dispatch(fetchNewTemplateEditorConfig())}
            >
              + Start with blank
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OfficeTemplateEditor;
