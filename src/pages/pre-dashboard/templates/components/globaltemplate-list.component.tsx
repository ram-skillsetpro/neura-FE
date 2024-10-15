import DeleteFileModal from "core/components/modals/delete-file-modal/delete-file-modal";
import ShareUserModal from "core/components/modals/share-file-modal/share-file-modal";
import { useAppDispatch, useAppSelector } from "core/hook";
import { encodeFilePreContractKey, encodeFilePreTemplateKey, getFileIcon } from "core/utils";
import { LS_MY_TEMPLATES, formatDateWithOrdinal } from "core/utils/constant";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateType } from "pages/pre-dashboard/templates/templates.model";
import { getGlobalTemplatesPerPage } from "pages/pre-dashboard/templates/templates.redux";
import { getLastArrayFromLocalStorage } from "pages/user-dashboard/common-utility/utility-function";
import "pages/user-dashboard/components/my-files/recent-files-view.scss";
import { FileType } from "pages/user-dashboard/dashboard.model";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TOAST } from "src/const";
import { Toaster } from "src/core/models/toaster.model";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import { getContentCkEditor } from "src/pages/pre-contract/pre-contract.redux";
import "./template-list.styles.scss";
interface GlobalTemplateListViewProps {
  isFilterActive?: boolean;
}

const GlobalTemplateListView: React.FC<GlobalTemplateListViewProps> = ({ isFilterActive }) => {
  const navigate = useNavigate();
  const templateList = useAppSelector((state) => state.templates.globaltemplatesList);
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const [deleteFile, setDeleteFile] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType>();
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Array<any>>([]);
  const templateListResp = useAppSelector((state) => state.templates.globalTemplatesResponse);
  const isLoading = useAppSelector((state) => state.templates.isLoading);

  const [paginationData, setPaginationData] = useState({
    totalItems: templateListResp.totct as number,
    currentPage: 1,
    itemsPerPage: templateListResp.perpg,
  });

  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const itemIds = rows.map((item) => item.id);
      setSelectedItems(itemIds);
    }
    setSelectAll((prevSelectAll) => !prevSelectAll);
  };

  const columns = [
    {
      key: "fileSelector",
      label: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ),
      isSorting: false,
    },
    {
      key: "templateName",
      label: "Name",
      isSorting: false,
    },
    { key: "updatedOn", label: "Last Modified", isSorting: false },
    // { key: "sharedWith", label: "Used in Contracts", isSorting: false },
    { key: "stage", label: "Stage", isSorting: false },
    {
      key: "action",
      label: (
        <div className="file-list-action">
          <span className="file-action">Action</span>
        </div>
      ),
      isSorting: false,
    },
  ];

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  const handleFileOption = (e: any, id: number) => {
    e.stopPropagation();
    setActiveFileOption(id);
  };

  useEffect(() => {
    window.addEventListener("click", () => {
      setActiveFileOption(-1);
    });
  }, []);

  const { itemsPerPage } = paginationData;
  const totalCount = templateListResp.totct as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      const folder = getLastArrayFromLocalStorage(LS_MY_TEMPLATES);
      dispatch(
        getGlobalTemplatesPerPage({
          currentPage: newPage,
          folder,
          flag: true,
        }),
      );
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: templateListResp.totct as number,
      itemsPerPage: templateListResp.perpg,
    });
  }, [templateListResp]);

  useEffect(() => {
    setRows(
      templateList?.map((data) =>
        dataGenerator({
          ...data,
        }),
      ),
    );
  }, [templateList, activeFileOption, selectedItems]);

  const openFile = (file: any) => {
    const flag = true;
    if (!file.id) {
      window.dispatchEvent(
        new CustomEvent<Toaster>(TOAST, {
          detail: {
            type: "error",
            message: "Contract id is missing",
          },
        }),
      );
    }

    if (flag && file.isActive === 1) {
      const encodedString = encodeFilePreTemplateKey(file);
      navigate("/admin/pre-template?key=" + encodedString);
    }
  };

  const handleCloseShareModal = async () => {
    setShareModal(false);
    setSelectedFile(undefined);
    // TODO: update fileList when file is shared to recieve fresh data from BE
  };

  const handleCloseDeleteModal = async () => {
    setDeleteFile(false);
    setSelectedFile(undefined);
  };

  // const toggleStatus = async (id: number) => {
  //   const folder = getLastArrayFromLocalStorage(LS_MY_TEMPLATES);
  //   dispatch(deleteTemplate(id, folder));
  // };

  const handleSelectAutoSuggest = async (id: number) => {
    const cid = await dispatch(getContentCkEditor(id));
    if (cid) {
      const encodedString = encodeFilePreContractKey({ contractId: cid });
      navigate("/admin/pre-contract?key=" + encodedString, { replace: true });
    }
  };

  const dataGenerator = (data: TemplateType) => {
    return {
      id: data.id,
      fileSelector: (
        <div className="file-item-selector">
          <input
            type="checkbox"
            onChange={() => toggleItemSelection(data.id)}
            onClick={(event) => event.stopPropagation()}
            checked={selectedItems?.includes(data.id)}
          />
        </div>
      ),
      templateName: (
        <div className="file-list-name fs12 flex items-center">
          <i className={`w-20 h-20 mr-2`}>
            <img
              src={require(
                `assets/images/icon-${getFileIcon(data.uploadFileType, data.mimeType)}.svg`,
              )}
            />
          </i>
          <div
            className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
            onClick={() =>
              openFile({
                id: data.id,
                templateName: data.templateName,
                isActive: data.isActive,
                isGlobalTemplate: "YES",
              })
            }
            data-fulltext={data.templateName}
          >
            {data.templateName}
          </div>
        </div>
      ),
      updatedOn: (
        <div className="file-list-modified fs12">
          {data.updatedOn
            ? formatDateWithOrdinal(new Date(data.updatedOn * 1000))
            : formatDateWithOrdinal(new Date(data.createdOn * 1000))}
        </div>
      ),
      stage: (
        <div className="file-list-modified fs12">{data.status === 0 ? "Draft" : "Published"}</div>
      ),
      action: (
        <div className="file-list-action">
          <button
            className="icon-option-dot"
            onClick={(e) => handleFileOption(e, data.id)}
          ></button>
          {activeFileOption === data.id && (
            <div className="dropdown-container">
              <div className="dropdown-box">
                <ul>
                  <li
                    className="border-bottom"
                    onClick={() =>
                      openFile({
                        id: data.id,
                        templateName: data.templateName,
                        isActive: data.isActive,
                        isGlobalTemplate: "YES",
                      })
                    }
                  >
                    Open
                  </li>
                  <li
                    className="border-bottom button-tool-tip relative"
                    onClick={() => handleSelectAutoSuggest(data.id)}
                  >
                    Create Contract
                    <div className="button-info">Create contract using this template</div>
                  </li>
                </ul>
              </div>
              <div className="notch"></div>
            </div>
          )}
        </div>
      ),
    };
  };

  return (
    <AnimatePresence mode="wait">
      {rows.length > 0 && (
        <section className="mb-5">
          <div className="d-table-full">
            <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
              Global Templates
            </h2>
            <motion.div
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <DataTable
                className="file-list-card rounded-6 other-files-view"
                data={rows}
                columns={columns}
                paginationData={paginationData}
                onPageChange={getCurrentPageNumber}
                enablePagination={true}
                isLoading={isLoading}
              />
            </motion.div>
            {shareModal && selectedFile && (
              <ShareUserModal
                isOpen={shareModal}
                onClose={handleCloseShareModal}
                fileName={selectedFile?.fileName}
                store="dashboard"
              />
            )}
            {deleteFile && selectedFile && (
              <DeleteFileModal
                isOpen={deleteFile}
                onClose={handleCloseDeleteModal}
                shouldCloseOnOverlayClick={true}
                file={selectedFile}
              />
            )}
          </div>
        </section>
      )}
    </AnimatePresence>
  );
};

export default GlobalTemplateListView;
