import React from "react";
import { convertKeysToCamel } from "src/core/utils";

interface PromptMessageItemType {
  chat: any;
}

const PromptMessageItem: React.FC<PromptMessageItemType> = ({ chat }) => {
  const { msgText, levelNo } = convertKeysToCamel(chat) || {};

  return (
    <>
      {levelNo === 1 ? (
        <div className="send-message">
          <div className="send-card">
            <p dangerouslySetInnerHTML={{ __html: msgText }}></p>
          </div>
        </div>
      ) : (
        <div className="received-message">
          <div className="received-card">
            <p dangerouslySetInnerHTML={{ __html: msgText }}></p>
          </div>
        </div>
      )}
    </>
  );
};

export default PromptMessageItem;
