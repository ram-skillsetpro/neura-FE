import DOMPurify from "dompurify";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { CommonService } from "src/core/services/common.service";
import {
  clearSearchListPlaybook,
  fetchContractTypeForPlayBook,
  fetchPlaybookSearchResults,
  generatePlaybook,
  playbookReducer,
} from "../playbook.redux";
import PlayConsent from "./playbook-consent";
import PlayBookName from "./playbook-name";
import "./playbook.scss";

const PlaybookComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [playbookName, setPlayBookName] = useState(false);
  const { contractTypes, playbookSearchList } = useAppSelector((state) => state.playbook);
  const [localContractTypeId, setLocalContractTypeId] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [showContractTypeError, setShowContractTypeError] = useState(false);
  const [setConsent, setConsentModal] = useState(false);
  const [addedPlaybooks, setAddedPlaybooks] = useState<Playbook[]>([]);
  const [selectedContractTypeId, setSelectedContractTypeId] = useState(0);

  useEffect(() => {
    dispatch(fetchContractTypeForPlayBook());
  }, []);

  // const handleAddPlayBookName = (e: any, playbook: Playbook) => {
  //   e.stopPropagation();
  //   if (!addedPlaybooks.some((p) => p.fileId === playbook.fileId)) {
  //     setAddedPlaybooks([...addedPlaybooks, playbook]);
  //   }
  //   CommonService.toast({
  //     type: "success",
  //     message: `Contract added successfully`,
  //   });
  // };

  const handleAddPlayBookName = (e: any, playbook: Playbook) => {
    e.stopPropagation();
    setAddedPlaybooks((prevAddedPlaybooks) => {
      if (prevAddedPlaybooks.length >= 5) {
        CommonService.popupToast({
          type: "error",
          message: `You can't add more than 5 contracts.`,
        });
        return prevAddedPlaybooks;
      }

      if (!prevAddedPlaybooks.some((p) => p.fileId === playbook.fileId)) {
        CommonService.popupToast({
          type: "success",
          message: `Contract added successfully`,
        });
        return [...prevAddedPlaybooks, playbook];
      }

      return prevAddedPlaybooks;
    });
  };

  const handleRemovePlaybook = (fileId: number) => {
    setAddedPlaybooks(addedPlaybooks.filter((p) => p.fileId !== fileId));
    CommonService.popupToast({
      type: "success",
      message: `Contract removed successfully`,
    });
  };

  const handleGeneratePlayBookName = (e: any) => {
    e.stopPropagation();
    setPlayBookName(true);
  };

  const handleSearch = () => {
    if (localContractTypeId !== 0) {
      const payload = {
        notContractIds: addedPlaybooks?.map((p) => p.fileId),
        contractTypeIds: [localContractTypeId],
        keyword: searchInput,
      };
      dispatch(fetchPlaybookSearchResults(payload));
    } else {
      setShowContractTypeError(true);
    }
  };

  const handleContractTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (
      localContractTypeId !== Number(e.target.value) &&
      playbookSearchList.length > 0 &&
      addedPlaybooks.length > 0
    ) {
      setSelectedContractTypeId(Number(e.target.value));
      setConsentModal(true);
    } else if (localContractTypeId !== Number(e.target.value) && playbookSearchList.length > 0) {
      dispatch(clearSearchListPlaybook());
      setLocalContractTypeId(Number(e.target.value));
    } else {
      setLocalContractTypeId(Number(e.target.value));
    }
  };

  const handleOKConsent = () => {
    setConsentModal(false);
    // setLocalContractTypeId(Number(e.target.value));
    setLocalContractTypeId(selectedContractTypeId);
    dispatch(clearSearchListPlaybook());
    setAddedPlaybooks([]);
  };

  const handleAddPlaybookList = async (playBookName: string) => {
    // const contractIds = addedPlaybooks.map((playbook) => playbook.fileId);
    const contractIds = addedPlaybooks.map((playbook) => playbook.fileId).join(", ");

    const payloadGeneratePB = {
      contractIds,
      contractTypeId: localContractTypeId,
      playbookName: playBookName,
    };
    const result = await dispatch(generatePlaybook(payloadGeneratePB));
    if (result?.isSuccess) {
      setAddedPlaybooks([]);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearSearchListPlaybook());
    };
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const filteredPlaybookSearchList = playbookSearchList.filter(
    (playbook) => !addedPlaybooks.some((p) => p.fileId === playbook.fileId),
  );

  function stripHtmlTags(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  function handleKeyDown(event: { key: string }) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <>
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <section className="mb-5">
            <div className="flex view-all-header mb-3 items-center">
              <button className="pageBack-btn ml-3" onClick={handleGoBack}>
                <i className="icon-img"></i>
              </button>
              <h2 className="fs10 text-defaul-color font-normal tracking-wider uppercase ml-3">
                Add Playbook
              </h2>
            </div>

            <div className="p-card rounded-6">
              <div>
                <div className="playbook-search mb-5">
                  <div>
                    <select
                      className="custom-select w-full p-2"
                      value={localContractTypeId}
                      onChange={handleContractTypeChange}
                    >
                      <option value={0}>Contract Type</option>
                      {contractTypes?.map((data, index) => (
                        <option key={index} value={data.id}>
                          {data.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grow">
                    <div className="flex items-center">
                      <div className="grow">
                        <input
                          type="search"
                          placeholder="Search..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          style={{ width: "100%" }}
                        />
                      </div>
                      <div>
                        <button
                          onClick={handleSearch}
                          className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase ml-3"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {localContractTypeId === 0 && showContractTypeError && (
                  <div className="contract-input-error mt-3 mb-5">
                    {"Please select contract type"}
                  </div>
                )}
              </div>

              {filteredPlaybookSearchList?.map((playbook, index) => (
                <div key={index} className="flex items-center mb-3 playbook-list-add">
                  <div className="file-list-name fs12 flex items-center">
                    <div
                      className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
                      data-fulltext={stripHtmlTags(DOMPurify.sanitize(playbook.filename))}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(playbook.filename) }}
                    />
                  </div>
                  <span className="grow"></span>
                  <div>
                    <button
                      onClick={(e) => handleAddPlayBookName(e, playbook)}
                      className="green-button uppercase tracking-wider"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-5">
            <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
              Generate Playbook
            </h2>
            <div className="p-card rounded-6">
              {addedPlaybooks.map((playbook, index) => (
                <div key={index} className="flex items-center mb-3 playbook-list-add">
                  <div className="file-list-name fs12 flex items-center">
                    <div
                      className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
                      data-fulltext={playbook.filename}
                    >
                      {playbook.filename}
                    </div>
                  </div>
                  <span className="grow"></span>
                  <div>
                    <button
                      onClick={() => handleRemovePlaybook(playbook.fileId)}
                      className="remove-button uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-3">
                <button
                  disabled={addedPlaybooks.length === 0}
                  onClick={handleGeneratePlayBookName}
                  className="button-green xl-button fs18 font-bold rounded-12 tracking-wider font-bold uppercase cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* <div className="right-section">
        <NotificationStack />
      </div> */}
      {playbookName && (
        <PlayBookName
          isOpen={playbookName}
          onClose={() => setPlayBookName(false)}
          shouldCloseOnOverlayClick={true}
          handleAddPlaybookList={handleAddPlaybookList}
        />
      )}
      {setConsent && (
        <PlayConsent
          isOpen={setConsent}
          onClose={() => setConsentModal(false)}
          shouldCloseOnOverlayClick={true}
          handleOK={() => handleOKConsent()}
        />
      )}
    </>
  );
};

export default PlaybookComponent;

export const reducer = {
  playbook: playbookReducer,
};

interface Playbook {
  contractcode: string;
  fileId: number;
  filename: string;
  fileSize: number;
  pageCount: number;
  mimeType: string;
  folderId: number;
  teamId: number;
  companyId: number;
  createdById: number;
  createdByName: string;
  updatedDate: number;
  firstParty: string;
  secondParty: string;
  jurisdiction: string;
  contractTypeName: string;
  effectiveDate: string;
  executionDate: string;
  terminationDate: string | null;
  sharedWith: { id: number; userName: string; logoUrl: string }[] | null;
}
