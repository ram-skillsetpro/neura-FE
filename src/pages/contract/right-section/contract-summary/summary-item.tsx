import React, { useState } from "react";
import EditSummaryModal from "src/core/components/modals/contract-summary-modal/edit-summary-item-modal";
import { useAppSelector } from "src/core/hook";
import { formatString } from "src/core/utils";
import ContractHighlighter from "./contract-highlighter";
import "./summary-item.scss";

interface ISummaryItem {
  data: Array<any>;
  summary: string;
  folderId: number;
  fileId: number;
  teamId: number;
}

const SummaryItem: React.FC<ISummaryItem> = ({ data, summary, folderId, fileId, teamId }) => {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [openSubSection, setOpenSubSection] = useState<string | null>(null);
  const [isEditButtonClicked, setIsEditButtonClicked] = useState<boolean>(false);
  const [subClausesLevel1, setSubClausesLevel1] = useState<Array<any>>([]);
  const [section, setSection] = useState<any>({});
  const { extractedCoordinates } = useAppSelector((state) => state.contract);

  const toggleSection = (index: number) => {
    if (openSection === index) {
      setOpenSection(null);
    } else {
      setIsEditButtonClicked(false);
      setOpenSection(index);
    }
  };

  const toggleEdit = (index: number, section: any) => {
    setSection(section);
    if (Array.isArray(section?.value)) {
      //@ts-ignore
      const keys = section?.value?.map((item) => {
        if (Array.isArray(item.value)) {
          return item.key ? { label: item.key, value: item.id } : null
        }
      }).filter(Boolean);
      setSubClausesLevel1(keys);
    } else {
      setSubClausesLevel1([]);
    }
    setIsEditButtonClicked(!isEditButtonClicked);
  };

  return (
    <ul>
      {data?.length ? data.map((section, index) => section && (<li className={`tab-icon ${openSection === index ? "open" : ""}`} key={index}>
        <ContractHighlighter
          clauseName={section?.key}
          extractedCoordinates={extractedCoordinates}
          openSection={openSection === index}
          handleClick={() => toggleSection(index)}
          setIsEditButtonClicked={() => {
            toggleEdit(index, section);
          }}
        />
        <ul style={{ display: openSection === index ? "block" : "none" }}>
          {Array.isArray(section?.value) && section?.key ? (
            section.value.map((item: any, subIndex: number) => (
              <>
                <li key={subIndex}>
                  {Array.isArray(item?.value) && <div className="subkey">{item?.key} -</div>}
                  {Array.isArray(item?.value) ? (
                    item.value.map((subItem: any, subSubIndex: number) =>
                      Array.isArray(subItem.value) ? (
                        <ul
                          className="subkey-item"
                          key={subSubIndex}
                          style={{ display: "block" }}
                        >
                          <li
                            className={`tab-nested ${openSubSection === `${subIndex}${subSubIndex}` ? "expand" : ""}`}
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenSubSection(`${subIndex}${subSubIndex}`);
                            }}
                          >
                            <div className="nested-heading sub-item-tab">{`${item.key} ${subItem.key}`}</div>
                            <div
                              className="nested-sec"
                              style={{
                                display: `${openSubSection === `${subIndex}${subSubIndex}` ? "block" : "none"}`,
                              }}
                            >
                              {subItem.value.map((subItem1: any, subIndex1: number) => (
                                <div className="info-row" key={subIndex1}>
                                  <div className="info-row-left font-bold">
                                    <span className="block">{subItem1.key}</span>
                                  </div>
                                  <div className="info-row-right">
                                    <p
                                      className="block"
                                      dangerouslySetInnerHTML={{ __html: formatString(subItem1.value) }}
                                    ></p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </li>
                        </ul>
                      ) : (
                        <div className="info-row items-center" key={subSubIndex}>
                          <div className="info-row-left font-bold">
                            <span className="block">{subItem?.key}</span>
                          </div>
                          <div className="info-row-right">
                            <p
                              className="block"
                              dangerouslySetInnerHTML={{ __html: formatString(subItem?.value) }}
                            ></p>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="info-row items-center">
                      <div className="info-row-left font-bold">
                        <span className="block">{item?.key}</span>
                      </div>
                      <div className="info-row-right">
                        <p
                          className="block"
                          dangerouslySetInnerHTML={{
                            __html:
                              typeof item?.value === "string"
                                ? formatString(item?.value)
                                : "",
                          }}
                        ></p>
                      </div>
                    </div>
                  )}
                </li>
                {/* <li className="tab-icon open">
                      <div className="clause-edit-heading">
                        <div className="pb-2">
                          <select className="custom-select w-full p-2">
                            <option value="">GENERAL</option>
                            <option value="">LIFECYCLE</option>
                          </select>
                        </div>
                        <div className="pb-2">
                          <input type="text" className="edit-input" value="New Clasue Heading" />
                        </div>
                      </div>
                      <ul style={{ display: "block" }}>
                        <li>
                          <div className="info-row items-center">
                            <div className="info-row-left font-bold">
                              <span className="block"><input type="text" className="edit-input" value="Key" /></span>

                            </div>
                            <div className="info-row-right">
                              <p className="block">
                                <input type="text" className="edit-input" value="Value text " />

                              </p>
                            </div>
                            <div className="button-tool-tip relative"><button className="trash-btn" type="button"></button>
                              <div className="button-info">Discard</div>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="flex justify-center pt-2">
                            <button
                              className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase mr-2-5">Add
                              Rule</button>
                            <button
                              className="button-green rounded-12 sm-button tracking-wider font-bold uppercase">Save</button>
                            <div className="button-tool-tip relative"><button className="trash-btn ml-3" type="button"></button>
                              <div className="button-info">Discard</div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </li> */}
              </>
            ))
          ) : (
            <>
              <li>
                <div className="info-row items-center">
                  <div className="info-row-left font-bold">
                    <span className="block">{section?.key}</span>
                  </div>
                  <div className="info-row-right">
                    <p
                      className="block"
                      dangerouslySetInnerHTML={{ __html: section?.value }}
                    ></p>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex justify-end pt-2">
                  <button className="button-red rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer mr-2-5">
                    <i className="font-bold fs10">+</i> Add Rule
                  </button>
                  <button className="button-green rounded-12 sm-button tracking-wider font-bold uppercase">
                    Save
                  </button>
                  <div className="button-tool-tip relative">
                    <button className="trash-btn ml-3" type="button"></button>
                    <div className="button-info">Discard</div>
                  </div>
                </div>
              </li>
              {/* <li className="tab-icon open">
                    <div className="clause-edit-heading">
                      <div className="pb-2">
                        <select className="custom-select w-full p-2">
                          <option value="">GENERAL</option>
                          <option value="">LIFECYCLE</option>
                        </select>
                      </div>
                      <div className="pb-2">
                        <input type="text" className="edit-input" value="New Clasue Heading" />
                      </div>
                    </div>
                    <ul style={{ display: "block" }}>
                      <li>
                        <div className="info-row items-center">
                          <div className="info-row-left font-bold">
                            <span className="block"><input type="text" className="edit-input" value="Key" /></span>

                          </div>
                          <div className="info-row-right">
                            <p className="block">
                              <input type="text" className="edit-input" value="Value text " />

                            </p>
                          </div>
                          <div className="button-tool-tip relative"><button className="trash-btn" type="button"></button>
                            <div className="button-info">Discard</div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="flex justify-center pt-2">
                          <button
                            className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase mr-2-5">Add
                            Rule</button>
                          <button
                            className="button-green rounded-12 sm-button tracking-wider font-bold uppercase">Save</button>
                          <div className="button-tool-tip relative"><button className="trash-btn ml-3" type="button"></button>
                            <div className="button-info">Discard</div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </li> */}
            </>
          )}
        </ul>
      </li>)) : null
      }


      <EditSummaryModal
        mainClauseData={data}
        onClose={() => setIsEditButtonClicked(false)}
        isOpen={isEditButtonClicked}
        subClauseLevel1={subClausesLevel1}
        shouldCloseOnOverlayClick={true}
        section={section}
        summary={summary}
        folderId={folderId}
        fileId={fileId}
        teamId={teamId}
      />
    </ul>
  );
};

export default SummaryItem;
