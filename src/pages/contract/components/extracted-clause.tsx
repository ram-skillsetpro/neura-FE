import { AnimatePresence, motion } from "framer-motion";
import React, { Fragment } from "react";
import { ExtractedClauseResponseType } from "../contract.model";

interface ExtractedClauseType extends ExtractedClauseResponseType {}

const ExtractedClause: React.FC<ExtractedClauseType> = ({ extractedClause = [] }) => {
  const formatContent = (content: string) => {
    const emTagRegex = /\n/gi;
    return content.replace(emTagRegex, "<br/>");
  };
  return (
    extractedClause &&
    Array.isArray(extractedClause) && (
      <AnimatePresence mode="wait">
        {extractedClause.map((data, index) => (
          <Fragment key={index}>
            <motion.div
              key={index}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * index, duration: 1 }}
            >
              <div className="app-content-inner">
                <h3 className="h3">{data.header}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html: formatContent(`...${data.content}`),
                  }}
                ></p>
                {/* <p>
                  <a href="#">Show</a>
                </p> */}
              </div>
            </motion.div>
          </Fragment>
        ))}
      </AnimatePresence>
    )
  );
};

export default ExtractedClause;
