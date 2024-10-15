import React from "react";
import IConfig from "./model/config";
declare global {
    interface Window {
        DocsAPI?: any;
        DocEditor?: any;
    }
}
type DocumentEditorProps = {
    id: string;
    documentServerUrl: string;
    config: IConfig;
    document_fileType?: string;
    document_title?: string;
    documentType?: string;
    editorConfig_lang?: string;
    height?: string;
    type?: string;
    width?: string;
    onLoadComponentError?: (errorCode: number, errorDescription: string) => void;
    events_onAppReady?: (event: object) => void;
    events_onDocumentStateChange?: (event: object) => void;
    events_onMetaChange?: (event: object) => void;
    events_onDocumentReady?: (event: object) => void;
    events_onInfo?: (event: object) => void;
    events_onWarning?: (event: object) => void;
    events_onError?: (event: object) => void;
    events_onRequestSharingSettings?: (event: object) => void;
    events_onRequestRename?: (event: object) => void;
    events_onMakeActionLink?: (event: object) => void;
    events_onRequestInsertImage?: (event: object) => void;
    events_onRequestSaveAs?: (event: object) => void;
    /**
     * @deprecated Deprecated since version 7.5, please use events_onRequestSelectSpreadsheet instead.
     */
    events_onRequestMailMergeRecipients?: (event: object) => void;
    /**
     * @deprecated Deprecated since version 7.5, please use onRequestSelectDocument instead.
     */
    events_onRequestCompareFile?: (event: object) => void;
    events_onRequestEditRights?: (event: object) => void;
    events_onRequestHistory?: (event: object) => void;
    events_onRequestHistoryClose?: (event: object) => void;
    events_onRequestHistoryData?: (event: object) => void;
    events_onRequestRestore?: (event: object) => void;
    events_onRequestSelectSpreadsheet?: (event: object) => void;
    events_onRequestSelectDocument?: (event: object) => void;
};
declare const DocumentEditor: (props: DocumentEditorProps) => React.JSX.Element;
export default DocumentEditor;
