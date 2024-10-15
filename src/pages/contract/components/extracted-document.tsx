import React from "react";

interface ExtractedDocumentType {
  content: string;
}

const ExtractedDocument: React.FC<ExtractedDocumentType> = ({ content }) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    ></div>
  );
};

export default ExtractedDocument;
