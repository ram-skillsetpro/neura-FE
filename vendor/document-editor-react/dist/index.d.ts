import React from 'react';

interface IConfig {
    documentType?: string;
    height?: string;
    token?: string;
    type?: string;
    width?: string;
    document: {
        fileType: string;
        key: string;
        referenceData?: {
            fileKey: string;
            instanceId: string;
            key: string;
        };
        title: string;
        url: string;
        info?: {
            owner?: string;
            uploaded?: string;
            favorite?: boolean;
            folder?: string;
            sharingSettings?: any[];
        };
        permissions?: {
            /**
             * @deprecated Deprecated since version 5.5, please add the onRequestRestore field instead.
             */
            changeHistory?: boolean;
            chat?: boolean;
            comment?: boolean;
            commentGroups?: any;
            copy?: boolean;
            deleteCommentAuthorOnly?: boolean;
            download?: boolean;
            edit?: boolean;
            editCommentAuthorOnly?: boolean;
            fillForms?: boolean;
            modifyContentControl?: boolean;
            modifyFilter?: boolean;
            print?: boolean;
            protect?: boolean;
            /**
             * @deprecated Deprecated since version 6.0, please add the onRequestRename field instead.
             */
            rename?: boolean;
            review?: boolean;
            reviewGroups?: string[];
            userInfoGroups?: string[];
        };
    };
    editorConfig?: {
        actionLink?: any;
        callbackUrl?: string;
        coEditing?: {
            mode: string;
            change: boolean;
        };
        createUrl?: string;
        lang?: string;
        location?: string;
        mode?: string;
        recent?: any[];
        region?: string;
        templates?: any[];
        user?: {
            /**
             * @deprecated Deprecated since version 4.2, please use name instead.
             */
            firstname?: string;
            group?: string;
            id?: string;
            image?: string;
            /**
             * @deprecated Deprecated since version 4.2, please use name instead.
             */
            lastname?: string;
            name?: string;
        };
        customization?: {
            anonymous?: {
                request?: boolean;
                label?: string;
            };
            autosave?: boolean;
            /**
             * @deprecated Deprecated since version 7.1, please use the document.permissions.chat parameter instead.
             */
            chat?: boolean;
            /**
             * @deprecated Deprecated since version 6.3, please use the document.permissions.editCommentAuthorOnly and document.permissions.deleteCommentAuthorOnly fields instead.
             */
            commentAuthorOnly?: boolean;
            comments?: boolean;
            compactHeader?: boolean;
            compactToolbar?: boolean;
            compatibleFeatures?: boolean;
            customer?: {
                address?: string;
                info?: string;
                logo?: string;
                logoDark?: string;
                mail?: string;
                name?: string;
                phone?: string;
                www?: string;
            };
            features?: any;
            feedback?: any;
            forcesave?: boolean;
            goback?: any;
            help?: boolean;
            hideNotes?: boolean;
            hideRightMenu?: boolean;
            hideRulers?: boolean;
            integrationMode?: string;
            logo?: {
                image?: string;
                imageDark?: string;
                imageEmbedded?: string;
                url?: string;
            };
            macros?: boolean;
            macrosMode?: string;
            mentionShare?: boolean;
            mobileForceView?: boolean;
            plugins?: boolean;
            review?: {
                hideReviewDisplay?: boolean;
                hoverMode?: boolean;
                reviewDisplay?: string;
                showReviewChanges?: boolean;
                trackChanges?: boolean;
            };
            /**
             * @deprecated Deprecated since version 7.0. Please use the review.reviewDisplay parameter instead.
             */
            reviewDisplay?: string;
            /**
             * @deprecated Deprecated since version 7.0. Please use the review.showReviewChanges parameter instead.
             */
            showReviewChanges?: boolean;
            /**
             * @deprecated Deprecated since version 7.1. Please use the features.spellcheck parameter instead.
             */
            spellcheck?: boolean;
            submitForm?: boolean;
            toolbarHideFileName?: boolean;
            toolbarNoTabs?: boolean;
            /**
             * @deprecated Deprecated since version 7.0. Please use the review.trackChanges parameter instead.
             */
            trackChanges?: boolean;
            uiTheme?: string;
            unit?: string;
            zoom?: number;
        };
        embedded?: {
            embedUrl?: string;
            fullscreenUrl?: string;
            saveUrl?: string;
            shareUrl?: string;
            toolbarDocked?: string;
        };
        plugins?: {
            autostart?: string[];
            pluginsData?: string[];
            /**
             * @deprecated Deprecated since version 4.3, please use the absolute URLs in pluginsData field.
             */
            url?: string;
        };
    };
    events?: {
        onAppReady?: (event: object) => void;
        onCollaborativeChanges?: (event: object) => void;
        onDocumentReady?: (event: object) => void;
        onDocumentStateChange?: (event: object) => void;
        onDownloadAs?: (event: object) => void;
        onError?: (event: object) => void;
        onInfo?: (event: object) => void;
        onMetaChange?: (event: object) => void;
        onMakeActionLink?: (event: object) => void;
        onOutdatedVersion?: (event: object) => void;
        onPluginsReady?: (event: object) => void;
        onReady?: (event: object) => void;
        onRequestClose?: (event: object) => void;
        /**
         * @deprecated Deprecated since version 7.5, please use onRequestSelectDocument instead.
         */
        onRequestCompareFile?: (event: object) => void;
        onRequestCreateNew?: (event: object) => void;
        onRequestEditRights?: (event: object) => void;
        onRequestHistory?: (event: object) => void;
        onRequestHistoryClose?: (event: object) => void;
        onRequestHistoryData?: (event: object) => void;
        onRequestInsertImage?: (event: object) => void;
        /**
         * @deprecated Deprecated since version 7.5, please use onRequestSelectSpreadsheet instead.
         */
        onRequestMailMergeRecipients?: (event: object) => void;
        onRequestOpen?: (event: object) => void;
        onRequestReferenceData?: (event: object) => void;
        onRequestReferenceSource?: (event: object) => void;
        onRequestRename?: (event: object) => void;
        onRequestRestore?: (event: object) => void;
        onRequestSaveAs?: (event: object) => void;
        onRequestSelectDocument?: (event: object) => void;
        onRequestSelectSpreadsheet?: (event: object) => void;
        onRequestSendNotify?: (event: object) => void;
        onRequestSharingSettings?: (event: object) => void;
        onRequestUsers?: (event: object) => void;
        onWarning?: (event: object) => void;
    };
}

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
    events_onOutdatedVersion?: (event: object) => void;
};
declare const DocumentEditor: (props: DocumentEditorProps) => React.JSX.Element;

export { DocumentEditor };
