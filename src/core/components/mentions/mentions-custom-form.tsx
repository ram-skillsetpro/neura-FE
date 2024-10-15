import React from "react";
import { Mention, MentionsInput } from "react-mentions";
import "./mention-styles.scss";

interface IMentionCustomForm {
  value: string;
  data: (query: any, callback: any) => void;
  onChange: (e: any) => void;
  mentionClassName?: string;
  mentionInputClassName?: string;
  placeholder?: string;
  onKeyDown?: (e: any) => void;
  disabled?: boolean;
}

let container: Element | undefined;

const mentionInputStyles = {
  control: {
    backgroundColor: "#fff",
    // fontWeight: 'normal',
  },

  "&multiLine": {
    control: {
      fontFamily: "monospace",
      minHeight: 60,
      // backgroundColor: "transparent",
    },
    highlighter: {
      fontFamily: "var(--default-font)",
      fontSize: "0.875rem",
      padding: "9px",
      border: "1px solid transparent",
      minHeight: "64px",
      lineHeight: "24px",
    },
    input: {
      border: "1px solid silver",
      padding: "9px",
      outline: 0,
      minHeight: "64px",
      lineHeight: "24px",
      // backgroundColor: "#fff",
    },
  },

  "&singleLine": {
    display: "inline-block",
    width: 180,

    highlighter: {
      padding: 1,
      border: "2px inset transparent",
    },
    input: {
      padding: 1,
      border: "2px inset",
    },
  },

  suggestions: {
    list: {
      maxHeight: "200px",
      overflowY: "auto",
      backgroundColor: "white",
      border: "1px solid rgba(0,0,0,0.15)",
      fontSize: 16,
      boxShadow: "0 18px 24px rgba(0, 0, 0, 0.2)",
      "&::-webkit-scrollbar": {
        backgroundColor: "rgba(0, 0, 0, .2)",
        width: "8px",
        borderRadius: "24px",
      },
    },
    item: {
      padding: "5px 15px",
      // borderBottom: "1px solid rgba(0,0,0,0.15)",
      "&focused": {
        backgroundColor: "#cee4e5", // style the background for selected user from suggested list
      },
    },
  },
};

const mentionStyles = {
  backgroundColor: "#cee4e5", // style for the selected user in textarea
};

export const MentionCustomForm: React.FC<IMentionCustomForm> = ({
  value,
  data,
  onChange,
  mentionClassName,
  mentionInputClassName,
  placeholder = "Add Comment. Use '@' for mention",
  onKeyDown,
  disabled,
}) => {
  return (
    <div
      id="suggestionPortal"
      ref={(el) => {
        container = el ?? undefined;
      }}
    >
      <MentionsInput
        autoFocus
        placeholder={placeholder}
        value={value}
        style={mentionInputStyles}
        onChange={(e) => onChange(e.target.value)}
        className={mentionInputClassName ?? "mention-input-control"}
        a11ySuggestionsListLabel={"Suggested users for mention"}
        suggestionsPortalHost={container}
        allowSuggestionsAboveCursor={true}
        onKeyDown={onKeyDown}
        disabled={disabled}
      >
        <Mention
          appendSpaceOnAdd={true}
          trigger={"@"}
          data={data}
          style={mentionStyles}
          displayTransform={(id, display) => `@${display}`}
          className={mentionClassName ?? "mention-list"}
          renderSuggestion={(suggestion: any, search, highlightedDisplay, index, focused) => {
            return (
              <div className={`user flex items-center ${focused ? "focused" : ""}`}>
                <div className="mr-3 fs12 flex items-center">
                  <div className="shared-user-img rounded-full">
                    {suggestion.userLogoUrl ? (
                      <img
                        src={suggestion.userLogoUrl}
                        alt={suggestion.userName}
                        className="rounded-full"
                      />
                    ) : (
                      <>{suggestion.userName.charAt(0).toUpperCase()}</>
                    )}
                  </div>
                  <div>
                    <div className="mb-1">{suggestion.userName}</div>
                    <div className="font-bold">
                      {suggestion.emailId} {suggestion.isExternal ? "(External)" : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
          // markup="{{__display__}}"
          // displayTransform={(display) => `@${display}`}
        />
        <Mention
          appendSpaceOnAdd={true}
          // onAdd={handleSelect}
          trigger={".@"}
          data={data}
          style={mentionStyles}
          displayTransform={(id, display) => `@${display}`}
          className={mentionClassName ?? "mention-list"}
          renderSuggestion={(suggestion: any, search, highlightedDisplay, index, focused) => {
            return (
              <div className={`user flex items-center ${focused ? "focused" : ""}`}>
                <div className="mr-3 fs12 flex items-center">
                  <div className="shared-user-img rounded-full">
                    {suggestion.userLogoUrl ? (
                      <img
                        src={suggestion.userLogoUrl}
                        alt={suggestion.userName}
                        className="rounded-full"
                      />
                    ) : (
                      <>{suggestion.userName.charAt(0).toUpperCase()}</>
                    )}
                  </div>
                  <div>
                    <div className="mb-1">{suggestion.userName}</div>
                    <div className="font-bold">
                      {suggestion.emailId} {suggestion.isExternal ? "(External)" : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
          // markup="{{__display__}}"
          // displayTransform={(display) => `@${display}`}
        />
      </MentionsInput>
    </div>
  );
};
