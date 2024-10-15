import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import ShareSnippetModal from "src/core/components/modals/share-snippet-modal/share-snippet-modal";
import DeleteIcon from "src/core/components/svg/delete-icon";
import DownChevronIcon from "src/core/components/svg/down-chevron-icon";
import RightChevron from "src/core/components/svg/right-chevron";
import UpChevronIcon from "src/core/components/svg/up-chevron-icon";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { formatString } from "src/core/utils";
import {
  fetchContractSnippetList,
  saveContractSnippets,
  setSnippets,
} from "../../../contract.redux";
import "./contract-snippet.scss";

interface ContractSnippets {
  fileId: number;
  folderId?: number;
  teamId: number;
}

const ContractSnippets: React.FC<ContractSnippets> = ({ fileId, folderId, teamId }) => {
  const dispatch = useAppDispatch();
  const { snippets, contractSnippetList, contractSnippetListInfo } = useAppSelector(
    (state) => state.contract,
  );

  const { pgn, totct, perpg } = contractSnippetListInfo;

  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<number>(-1);

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const onUserSelected = (selectedUsers: any, setSelectedUsers: any, timePeriod: number) => {
    const payload = {
      fileId,
      teamId,
      folderId,
      pageSnippets: snippets.map((data: any) => ({
        pageno: data?.position?.pageNumber,
        snippet: data?.content?.text,
      })),
      emailcsv: selectedUsers.map((data: any) => data.emailId).join(","),
      timePeriod,
    };

    dispatch(saveContractSnippets(payload));

    setSelectedUsers([]);
    dispatch(setSnippets([]));
    setShareModalOpen(false);
    setActiveItem(-1);
  };

  const handleDelete = (index: number) => {
    dispatch(setSnippets(snippets.filter((_, i) => i !== index)));
  };

  const handlePrev = () => {
    if (pgn > 0) {
      dispatch(fetchContractSnippetList({ contractId: fileId, pageno: pgn - 1 }));
    }
  };
  const handleNext = () => {
    if (totct / perpg > pgn) {
      dispatch(fetchContractSnippetList({ contractId: fileId, pageno: pgn + 1 }));
    }
  };

  useEffect(() => {
    dispatch(fetchContractSnippetList({ contractId: fileId, pageno: 1 }));
  }, [fileId]);

  return (
    <>
      <>
        {Array.from(snippets || []).length ? (
          <div className="right-tab-content-inner item-container mb-8">
            <div className="flex fs12 text-defaul-color mt-8 mb-4 app-breadcrumbs  playbook-item ">
              <div className="item-nav item-nav-active">
                <RightChevron />
              </div>
              <span className="font-bold playbook-title">New Excerpt</span>
            </div>
            {snippets.map((snippet, index) => (
              <div className="playbook-subitem active" key={index}>
                <div
                  className="bg-light p-3 rounded-6 mb-2 text-defaul-color"
                  style={{ opacity: 1 }}
                >
                  {snippet?.position?.pageNumber ? (
                    <div className="fs11 font-bold mb-1 flex">
                      <span className="button-red rounded-12 sm-chips uppercase inline-block mr-2-5 font-normal">
                        Page {snippet.position.pageNumber}
                      </span>
                      <span className="grow"></span>
                      <button className="btn-icon1" onClick={() => handleDelete(index)}>
                        <DeleteIcon width="16px" height="16px" />
                      </button>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="body-text">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: formatString(formatString(snippet?.content?.text)),
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <button
                className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                onClick={handleShare}
              >
                Share
              </button>
            </div>
          </div>
        ) : (
          ""
        )}
        {Array.from(contractSnippetList || []).length ? (
          <>
            <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mt-3 ml-1">
              Excerpt Shared History{" "}
            </h4>
            {contractSnippetList.map((snippetItem, index) => (
              <div
                onClick={() => setActiveItem(index)}
                className="right-tab-content-inner item-container"
                key={index}
              >
                <div className="flex fs12 text-defaul-color mt-8 mb-4 app-breadcrumbs  playbook-item ">
                  <div className={`item-nav ${index === activeItem ? "item-nav-active" : ""}`}>
                    <RightChevron />
                  </div>
                  <span className="font-bold playbook-title lh2">{snippetItem.name}</span>
                </div>

                <div className={`playbook-subitem ${index === activeItem ? "active" : ""}`}>
                  {Array.from(snippetItem.emailIdCSV) && (
                    <div className="snippet-share">
                      <div className="shared-with">Shared with:</div>
                      <div className="shared-chips-sec mb-3 " style={{ marginLeft: 0 }}>
                        {snippetItem.emailIdCSV.map((email: string, index: number) => (
                          <div key={index} className="shared-chips">
                            {email}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    {index === activeItem
                      ? JSON.parse(snippetItem.snippetJson).map((snippet: any, index: number) => (
                          <motion.div
                            exit={{ opacity: 0 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.01 * index, duration: 1 }}
                            className="bg-light p-3 rounded-6 mb-2 text-defaul-color"
                            style={{ opacity: 1 }}
                            key={index}
                          >
                            {snippet.pageno ? (
                              <div className="fs11 font-bold mb-1 flex">
                                <span className="button-red rounded-12 sm-chips uppercase inline-block mr-2-5 font-normal">
                                  Page {snippet.pageno}
                                </span>
                                <span className="grow"></span>
                                {/* <span onClick={() => handleDelete(index)}>
                                  <DeleteIcon width="16px" height="16px" />
                                </span> */}
                              </div>
                            ) : (
                              ""
                            )}
                            <div className="body-text">
                              <p
                                dangerouslySetInnerHTML={{
                                  __html: formatString(formatString(snippet?.snippet)),
                                }}
                              ></p>
                            </div>
                          </motion.div>
                        ))
                      : ""}
                  </AnimatePresence>
                </div>
              </div>
            ))}
            {totct / perpg > 1 && (
              <div className="flex justify-end">
                <div title="Prev">
                  <button
                    onClick={handlePrev}
                    disabled={pgn < 2}
                    className={`button-red msg-delete-btn 
                        pdf-rotate-btn next-prev-btn page-prev-btn`}
                  >
                    <UpChevronIcon />
                  </button>
                </div>
                <div className="page-number-container">{pgn}</div>
                <div title="Next">
                  <button
                    onClick={handleNext}
                    disabled={totct / perpg <= pgn}
                    className={`button-red msg-delete-btn 
                        pdf-rotate-btn next-prev-btn page-next-btn`}
                  >
                    <DownChevronIcon />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <h4 className="fs10 uppercase text-defaul-color tracking-wider font-normal mb-3 mt-3 ml-1">
            The excerpt shared will be shown here
          </h4>
        )}
      </>

      {shareModalOpen && (
        <ShareSnippetModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          onSuccess={onUserSelected}
        />
      )}
    </>
  );
};

export default ContractSnippets;
