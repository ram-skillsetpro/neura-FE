import "./ckeditor5-new.scss";

import { EditorConfig } from "@ckeditor/ckeditor5-core";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { USER_AUTHORITY } from "src/const";
import CrossIcon from "src/core/components/svg/cross-icon";
import ToggleIcon from "src/core/components/svg/toggle-icon";
import { useAppSelector } from "src/core/hook";
import { getAuth, getUserIdWithRole } from "src/core/utils";
import { checkUserAuthrity } from "src/pages/user-dashboard/common-utility/utility-function";
import EditorBuild from "../../../../vendor/ckeditor5/build/custom-ck-editor";

interface CustomEditorConfig extends EditorConfig {
  sidebar: {
    container?: HTMLElement | any;
  };
  placeholderConfig: any;
}

interface EditorTypes {
  ref: any;
}

// eslint-disable-next-line react/display-name, no-empty-pattern
const Editor: React.FC<EditorTypes> = forwardRef(({}, ref) => {
  const auth = getAuth();

  const { username, profileId, userLogo, isExternal } = auth || {};
  const currentUser = { name: username, id: `${profileId}`, avatar: userLogo || null };

  // const appData = {
  //   users: [],
  //   initialData: ``,
  //   commentThreads: [],
  //   suggestions: [],
  //   revisions: [],
  // };

  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [sidebarEnable, setSidebarEnable] = useState<boolean>(false);
  const sidebarElementRef = useRef<HTMLDivElement>(null);
  const [processedText, setProcessedText] = useState<string>("");

  const placeholderLock = useRef<boolean>(false);
  // const [width, setWidth] = useState<number>(0);

  const licenseKey =
    "a3h1eUdDZDhHNXdMWlpGNjAvUmlWUmNmNlUvNVYzckZ1dzd1Q2JyRmNLY0ppbFVEOXBVcTdTb2Jib2VJLU1qQXlOREF5TURNPQ";

  const {
    editorContent: templateText,
    activeStagePreContract,
    originalEditorContent,
    questionaireArray,
    contractId,
    shareUser,
    createdby,
  } = useAppSelector((state) => state.preContract);
  const canEdit = getUserIdWithRole(shareUser, USER_AUTHORITY.ROLE_PRE_CONTRACT_EDITOR, profileId);

  useImperativeHandle(ref, () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    saveContractData: () => {
      // To get editor data
      // const editorData = editorInstance.data.get();

      // To get comment data
      const commentsRepository = editorInstance.plugins.get("CommentsRepository");
      const commentThreadsData = commentsRepository.getCommentThreads({
        // skipNotAttached: true,
        skipEmpty: true,
        toJSON: true,
      });

      // to get Track Changes Data
      const trackChanges = editorInstance.plugins.get("TrackChanges");
      const suggestionsData = trackChanges.getSuggestions({
        skipNotAttached: true,
        toJSON: true,
      });

      const usersPlugin = editorInstance.plugins.get("Users");

      const users = Array.from(usersPlugin.users);

      // to get Revision History Data
      // const revisionHistory = editorInstance.plugins.get("RevisionHistory");
      // const revisionsData = revisionHistory.getRevisions({ toJSON: true });
      const obj: any = {
        initialData: "",
        commentThreads: [],
        suggestions: [],
        revisions: [],
      };
      obj.initialData = editorInstance.data.get();
      obj.commentThreads = commentThreadsData;
      obj.suggestions = suggestionsData;
      obj.users = users;
      // appData.revisions = revisionsData;

      handleSidebarToggle(editorInstance);
      return obj;
    },
  }));

  const addUser = (editorInstance: any, user: any) => {
    const usersPlugin = editorInstance.plugins.get("Users");
    const u = usersPlugin.getUser(user.id);
    if (!u) {
      usersPlugin.addUser(user);
    }
  };

  useEffect(() => {
    if (editorInstance) {
      addUser(editorInstance, currentUser);
      // addUser(editorInstance, {
      //   name: "Karan",
      //   id: "8",
      //   avatar:
      //     "https://simpleo-user-static.s3.amazonaws.com/user-logo/2023/12/1b62ef8745ba96d9.jpeg",
      // });
      // addUser(editorInstance, { name: "Ajay", id: "12", avatar: null });
      const usersPlugin = editorInstance.plugins.get("Users");
      usersPlugin.defineMe(String(profileId));
      // console.log(Array.from(usersPlugin.users));
    }
  }, [editorInstance]);

  useEffect(() => {
    if (editorInstance && Array.from(shareUser || []).length) {
      const users = shareUser.map((user) => {
        return { id: `${user.id}`, name: user.userName, avatar: user.logoUrl };
      });
      users.forEach((data) => {
        addUser(editorInstance, data);
      });
    }
  }, [editorInstance, shareUser]);

  useEffect(() => {
    let trackChangesPlugin: any;
    let commentsRepositoryPlugin: any;
    let usersPlugin: any;
    if (originalEditorContent && editorInstance) {
      const { suggestions, commentThreads, users: editorUsers } = originalEditorContent;

      trackChangesPlugin = editorInstance.plugins.get("TrackChanges");
      commentsRepositoryPlugin = editorInstance.plugins.get("CommentsRepository");
      usersPlugin = editorInstance.plugins.get("Users");

      // console.log(editorUsers);
      if (usersPlugin && Array.from(editorUsers || []).length) {
        editorUsers.forEach((user: any) => {
          const u = usersPlugin.getUser(user.id);
          if (!u) {
            usersPlugin.addUser(user);
          }
        });
      }

      commentsRepositoryPlugin &&
        Array.from(commentThreads || []).length &&
        commentThreads.forEach((data: any) => {
          const c = commentsRepositoryPlugin.hasCommentThread(data.threadId);
          if (!c) {
            commentsRepositoryPlugin.addCommentThread(data);
          }
        });

      trackChangesPlugin &&
        Array.from(suggestions || []).length &&
        suggestions.forEach((data: any) => {
          trackChangesPlugin.addSuggestion(data);
        });
    }

    return () => {
      commentsRepositoryPlugin && commentsRepositoryPlugin.destroy();
      trackChangesPlugin && trackChangesPlugin.destroy();
      usersPlugin && usersPlugin.destroy();
    };
  }, [originalEditorContent, editorInstance, contractId]);

  function replacePlaceholders(template: string, replacements: any) {
    replacements.forEach((obj: any) => {
      const placeholder = new RegExp("{{" + obj.variable_name + "}}", "g");
      template = template.replace(
        placeholder,
        // eslint-disable-next-line max-len
        `<span class="ck-widget" contenteditable="false"><span class="placeholder placeholder-${obj.variable_name} custom-placeholder">{${obj.variable_name}}</span></span>`,
      );
    });
    return template;
  }

  useEffect(() => {
    if (templateText && templateText !== "" && questionaireArray.length) {
      const updatedAgreement = replacePlaceholders(templateText, questionaireArray);
      setProcessedText(updatedAgreement);
    } else {
      setProcessedText(templateText);
    }
    // templateText && templateText !== "" && setProcessedText(updatedAgreement);
  }, [questionaireArray, templateText]);

  useEffect(() => {
    // window.CKBox = EditorBuild.CKBox;

    // Set the layout ready state to true to render the CKEditor
    setIsLayoutReady(true);

    const handleResize = () => {
      refreshDisplayMode(editorInstance);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      checkPendingActions(event);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setIsLayoutReady(false);
    };
  }, []);

  const refreshDisplayMode = (editor: any) => {
    if (!editor) {
      return false;
    }

    // const annotationsUIs = editor.plugins.get("AnnotationsUIs");
    // annotationsUIs.switchTo("inline");

    // Logic to switch display modes based on window size
    // Adjust logic as necessary

    // const annotationsUIs = editor.plugins.get("AnnotationsUIs");
    // const sidebarElement: HTMLDivElement | null = sidebarElementRef.current;

    // if (sidebarElement) {
    //   if (window.innerWidth < 1070) {
    //     sidebarElement.classList.remove("narrow");
    //     sidebarElement.classList.add("hidden");
    //     annotationsUIs.switchTo("inline");
    //   } else if (window.innerWidth < 1300) {
    //     sidebarElement.classList.remove("hidden");
    //     sidebarElement.classList.add("narrow");
    //     annotationsUIs.switchTo("narrowSidebar");
    //   } else {
    //     sidebarElement.classList.remove("hidden", "narrow");
    //     annotationsUIs.switchTo("wideSidebar");
    //   }
    // }
  };

  const checkPendingActions = (domEvt: BeforeUnloadEvent) => {
    if (!editorInstance) {
      return;
    }

    if (editorInstance.plugins.get("PendingActions").hasAny) {
      domEvt.preventDefault();
      domEvt.returnValue = true;
    }
  };

  const handleSidebarToggle = (editor: any) => {
    const trackChanges = editor.plugins.get("TrackChanges");
    const suggestionsData = trackChanges.getSuggestions({
      skipNotAttached: true,
      toJSON: true,
    });

    const commentsRepository = editor.plugins.get("CommentsRepository");
    const commentThreadsData = commentsRepository.getCommentThreads({
      // skipNotAttached: true,
      skipEmpty: true,
      toJSON: true,
    });

    if (
      suggestionsData.length > 0 ||
      commentThreadsData.filter((d: any) => d.context && !d.resolvedBy).length > 0
    ) {
      setSidebarEnable(true);
    } else {
      setSidebarEnable(false);
    }

    if (isExternal) {
      setReadOnly(editor, true);

      const sidebarEl: HTMLElement | null = document.querySelector(".sidebar");

      if (sidebarEl) {
        sidebarEl.style.display = "none";
      }
      setSidebarEnable(false);

      const msgBtlEl: HTMLElement | null = document.querySelector(
        '[data-cke-tooltip-text="Comment"]',
      );

      if (msgBtlEl) {
        msgBtlEl.style.pointerEvents = "none";
      }
    }
  };

  const onDocumentChange = (_: any, editor: any) => {
    handleSidebarToggle(editor);
  };

  const onDocumentReady = (editor: any) => {
    editor.execute("trackChanges");
    setEditorInstance(editor);
    refreshDisplayMode(editor);

    const msgBtlEl = document.querySelector('[data-cke-tooltip-text="Comment"]');

    if (msgBtlEl) {
      msgBtlEl.addEventListener("click", () => {
        setSidebarEnable(true);
      });
    }

    handleSidebarToggle(editor);
  };

  useEffect(() => {
    if (editorInstance) {
      if (activeStagePreContract > 2) {
        setReadOnly(editorInstance, true);
      } else {
        createdby &&
          setReadOnly(
            editorInstance,
            checkUserAuthrity(createdby, profileId, canEdit, activeStagePreContract),
          );
      }
    }

    // if (activeStagePreContract === 2 && canEdit) {
    //   console.log("dfd");
    //   setReadOnly(editorInstance, true);
    // }
  }, [editorInstance, activeStagePreContract, canEdit, createdby]);

  const dropdownViewRef = useRef<any>(null);
  const addListToDropdownRef = useRef<any>(null);
  const getDropdownItemsDefinitionsRef = useRef<any>(null);

  const fetchPlaceholder = (
    dropdownView: any,
    addListToDropdown: any,
    getDropdownItemsDefinitions: any,
  ) => {
    dropdownViewRef.current = dropdownView;
    addListToDropdownRef.current = addListToDropdown;
    getDropdownItemsDefinitionsRef.current = getDropdownItemsDefinitions;
  };

  useEffect(() => {
    if (
      dropdownViewRef.current &&
      addListToDropdownRef.current &&
      getDropdownItemsDefinitionsRef.current &&
      questionaireArray &&
      editorInstance
    ) {
      if (Array.from(questionaireArray || []).length && !placeholderLock.current) {
        placeholderLock.current = true;
        const placeholderList = questionaireArray.map((data) => {
          return {
            key: data.variable_name,
            label: data.question,
          };
        });
        addListToDropdownRef.current(
          dropdownViewRef.current,
          getDropdownItemsDefinitionsRef.current(placeholderList),
        );
      }
    }
  }, [
    dropdownViewRef,
    addListToDropdownRef,
    getDropdownItemsDefinitionsRef,
    questionaireArray,
    editorInstance,
  ]);

  const config: CustomEditorConfig = {
    toolbar: {
      items: [
        "trackChanges",
        "Comment",
        // "revisionHistory",
        "|",
        "undo",
        "redo",
        "|",
        "highlight",
        "|",
        "heading",
        "|",
        "fontfamily",
        "fontsize",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "link",
        "insertTable",
        "uploadImage",
        "|",
        "alignment",
        "|",
        "bulletedList",
        "numberedList",
        "|",
        "outdent",
        "indent",
        "|",
        "placeholder",
        "pageBreak",
        "blockQuote",
        "horizontalLine",
      ],
    },
    placeholderConfig: {
      types: fetchPlaceholder,
    },
    extraPlugins: [],
    sidebar: {
      container: sidebarElementRef.current,
    },
    licenseKey,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setReadOnly = (editorInstance: any, isReadOnly: boolean) => {
    if (isReadOnly) {
      editorInstance.enableReadOnlyMode("ck-custom-editor");
    } else {
      editorInstance.disableReadOnlyMode("ck-custom-editor");
    }
  };

  const renderQuestionnaireInputes = () => {
    if (Array.from(questionaireArray || []).length) {
      return questionaireArray.map((data, index) => {
        const { variable_name: vName, value } = data || {};
        return (
          <input
            key={index}
            style={{ display: "none" }}
            className={`placeholder-input-${vName}`}
            defaultValue={value}
          />
        );
      });
    }
  };

  return (
    <div className="ck-editor-custom">
      {activeStagePreContract > 2 && renderQuestionnaireInputes()}
      <div className={`row row-editor ${!sidebarEnable ? "editor-full" : ""}`}>
        {!sidebarEnable && (
          <div
            style={{ display: "none" }}
            className="sidebar-toggle"
            title="Toggle Sidebar"
            onClick={() => setSidebarEnable(true)}
          >
            <ToggleIcon />
          </div>
        )}
        {isLayoutReady ? (
          <CKEditor
            onReady={onDocumentReady}
            onChange={onDocumentChange}
            editor={EditorBuild.CustomCKEditor}
            config={config}
            data={processedText}
            onError={(error, { willEditorRestart }) => {
              console.log("Error", error);
              if (willEditorRestart) {
                editorInstance.ui.view.toolbar.element.remove();
              }
            }}
          />
        ) : (
          ""
        )}
        <div ref={sidebarElementRef} className="sidebar">
          <div className="sidebar-header">
            <span>Threads</span>
            <div onClick={() => setSidebarEnable(false)} className="sidebar-close">
              <CrossIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Editor;
