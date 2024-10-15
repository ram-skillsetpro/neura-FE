import React, { Fragment, useEffect, useState } from "react";
import { ButtonLoader } from "src/core/components/loader/button-loader";
import { LoaderSection } from "src/core/components/loader/loaderSection.comp";
import AppModal from "src/core/components/modals/app-modal";
import { AppModalType } from "src/core/components/modals/app-modal.model";
import NoDataPage from "src/core/components/no-data/no-data";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { getFileIcon } from "src/core/utils";
import {
  fetchContractLinkingFiles,
  linkContracts,
  resetLinkContractData,
} from "src/pages/contract/contract.redux";

interface LinkContractPopupType extends AppModalType {
  selectedFile: { id: number; folderId?: number; teamId: number };
}

const LinkContractPopup: React.FC<LinkContractPopupType> = ({
  isOpen,
  onClose,
  shouldCloseOnOverlayClick,
  selectedFile,
}) => {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<number | null>(1);
  const [selectedContracts, setSelectedContracts] = useState<Array<number>>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { linkContractList, linkContractData, isLoading } = useAppSelector(
    (state) => state.contract,
  );

  const { searchResponse: { totct: totalCount = 0 } = {}, relatedAddedList = [] } =
    linkContractData || {};

  const { teamId, folderId, id: contractId } = selectedFile || {};

  const handleContractSelect = (id: number) => {
    if (selectedContracts.includes(id)) {
      const ids = selectedContracts.filter((d) => d !== id);
      setSelectedContracts(ids);
    } else {
      setSelectedContracts([...selectedContracts, id]);
    }
  };

  const handleSubmit = async () => {
    await dispatch(
      linkContracts({ teamId, folderId, contractId, relatedIds: selectedContracts.join(",") }),
    );
    dispatch(fetchContractLinkingFiles({ pgn: 1, teamId, folderId, contractId }));
  };

  const handleLoadMore = async (newPage: number) => {
    if (newPage >= 1 && (newPage - 1) * 10 <= totalCount) {
      setCurrentPage(newPage);
      dispatch(fetchContractLinkingFiles({ pgn: newPage, teamId, folderId, contractId }));
    }
  };

  useEffect(() => {
    dispatch(fetchContractLinkingFiles({ pgn: 1, teamId, folderId, contractId }));

    return () => {
      dispatch(resetLinkContractData());
    };
  }, []);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      <div className="share-outer-wrap">
        <div className="share-inner">
          {/* <div className="fs14 font-bold mb-5 text-body">Link Contracts</div> */}
          <div className="w-full">
            <ul className="app-tab-style" style={{ marginBottom: "12px" }}>
              <li className={`${activeTab === 1 ? "active" : ""}`} onClick={() => setActiveTab(1)}>
                <a>Link Contracts</a>
              </li>
              <li className={`${activeTab === 2 ? "active" : ""}`} onClick={() => setActiveTab(2)}>
                <a>Linked Contracts</a>
              </li>
            </ul>
            {activeTab === 1 && (
              <div
                className="shared-user-list shared-user-list-scroll"
                style={{ minHeight: "260px" }}
              >
                <ul>
                  {Array.from(linkContractList || []).map((data: any, index: number) => (
                    <li key={index}>
                      <div className="flex items-center">
                        <div className="mr-2 admin-checkbox">
                          <input
                            type="checkbox"
                            defaultValue={0}
                            onClick={() => handleContractSelect(data.fileId)}
                          />
                        </div>
                        <div className="flex items-center fs12">
                          <i className="w-20 h-20 mr-2">
                            <img
                              src={require(
                                `assets/images/icon-${getFileIcon(data.filename, data.mimeType)}.svg`,
                              )}
                            />
                          </i>
                          <div
                            className="truncate-pop-text lh1 relative"
                            data-fulltext="Agreement-3M-INDIA-LIMITED-CHENNAI-B2B-01-04-2023-15-05-30-Rights-Summary-1-1-.pdf"
                          >
                            {data.filename}
                          </div>
                        </div>
                        <span className="grow" />

                        {/* <div>
                      <select className="select-default">
                        <option>Contract</option>
                        <option>Attachment</option>
                      </select>
                    </div> */}
                      </div>
                    </li>
                  ))}
                </ul>
                {!isLoading && !Array.from(linkContractList || []).length && (
                  <NoDataPage hideIcon={true} />
                )}
                {isLoading && currentPage < 2 && (
                  <div
                    style={{
                      minHeight: "260px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <LoaderSection />
                  </div>
                )}
              </div>
            )}
            {activeTab === 2 && (
              <div
                className="shared-user-list shared-user-list-scroll"
                style={{ minHeight: "260px" }}
              >
                {relatedAddedList.map((item: any, index: number) => {
                  const { key, value } = item;
                  if (key === "RELATED CONTRACTS") {
                    return (
                      <Fragment key={index}>
                        <h4 className="fs10 uppercase text-default-color tracking-wider font-normal mb-3 mt-3">
                          {key}
                        </h4>
                        <ul className="mb-3">
                          {Array.from(value || []).map((data: any, i: number) => (
                            <li key={i}>
                              <div className="flex items-center">
                                <div className="flex items-center fs12">
                                  <i className="w-20 h-20 mr-2">
                                    <img
                                      src={require(
                                        `assets/images/icon-${getFileIcon(data.fileName, data.mimeType)}.svg`,
                                      )}
                                    />
                                  </i>
                                  <div
                                    className="truncate-pop-text lh1 relative"
                                    data-fulltext={data.fileName}
                                  >
                                    {data.fileName}
                                  </div>
                                </div>
                                <span className="grow" />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Fragment>
                    );
                  }
                  if (key === "RELATED ATTACHMENTS") {
                    return (
                      <Fragment key={index}>
                        <h4 className="fs10 uppercase text-default-color tracking-wider font-normal mb-3 mt-3">
                          {key}
                        </h4>
                        <ul className="mb-3">
                          {Array.from(value || []).map((data: any, i: number) => (
                            <li key={i}>
                              <div className="flex items-center">
                                <div className="flex items-center fs12">
                                  <i className="w-20 h-20 mr-2">
                                    <img
                                      src={require(
                                        `assets/images/icon-${getFileIcon(data.fileName, data.mimeType)}.svg`,
                                      )}
                                    />
                                  </i>
                                  <div
                                    className="truncate-pop-text lh1 relative"
                                    data-fulltext={data.fileName}
                                  >
                                    {data.fileName}
                                  </div>
                                </div>
                                <span className="grow" />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Fragment>
                    );
                  }

                  return null;
                })}
                {!Array.from(relatedAddedList || []).length && <NoDataPage hideIcon={true} />}
              </div>
            )}

            <div className="flex justify-end pt-3">
              {isLoading && activeTab === 1 && currentPage > 1 ? (
                <div className="mr-2">
                  <ButtonLoader />
                </div>
              ) : currentPage * 10 > totalCount ? null : totalCount > 0 ? (
                <button
                  className={`remove-button uppercase tracking-wider mr-3 ${
                    currentPage * 10 > totalCount ? "disabled" : ""
                  }`}
                  onClick={() => handleLoadMore(currentPage + 1)}
                >
                  Load Next
                </button>
              ) : null}
              <button className="remove-button uppercase tracking-wider" onClick={onClose}>
                Cancel
              </button>
              {linkContractList.length ? (
                <button
                  disabled={!selectedContracts.length}
                  className="green-button uppercase tracking-wider ml-3"
                  onClick={handleSubmit}
                >
                  Save
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default LinkContractPopup;
