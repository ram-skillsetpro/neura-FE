import { useAppDispatch, useAppSelector } from "core/hook";
import { getFileIcon } from "core/utils";
import { LS_MY_TEMPLATES, formatDateWithOrdinal } from "core/utils/constant";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateType } from "pages/pre-dashboard/templates/templates.model";
import {
  clearDeleteTemplateResponse,
  deleteTemplate,
  getTemplateTrashListData,
  setDeletedTemplateListPageCount,
} from "pages/pre-dashboard/templates/templates.redux";
import { getLastArrayFromLocalStorage } from "pages/user-dashboard/common-utility/utility-function";
import "pages/user-dashboard/components/my-files/recent-files-view.scss";
import React, { useEffect, useMemo, useState } from "react";
import DataTable from "src/layouts/admin/components/data-table/data-table";
import "./template-list.styles.scss";

const TemplateTrashListView: React.FC = () => {
  // const [auth] = useLocalStorage<AuthResponse>("auth");
  const trashTemplateList = useAppSelector((state) => state.templates?.trashTemplateList);
  const [activeFileOption, setActiveFileOption] = useState(-1);
  const dispatch = useAppDispatch();
  const [rows, setRows] = useState<Array<any>>([]);
  const trashTemplateListResp = useAppSelector((state) => state.templates?.trashTemplateResponse);
  const isLoading = useAppSelector((state) => state.templates?.isLoading);

  const [paginationData, setPaginationData] = useState({
    totalItems: trashTemplateListResp.totct as number,
    currentPage: 1,
    itemsPerPage: trashTemplateListResp.perpg,
  });

  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setSelectAll(checked);
    if (checked) {
      const newVisibleItemIds = rows.map((item) => item.id);
      const uniqueItems = Array.from(new Set([...selectedItems, ...newVisibleItemIds]));
      setSelectedItems(uniqueItems);
    } else {
      const visibleItemIds = rows.map((item) => item.id);
      const remainingSelectedItems = selectedItems.filter((id) => !visibleItemIds.includes(id));
      setSelectedItems(remainingSelectedItems);
    }
  };

  useEffect(() => {
    setSelectAll(false);
  }, [trashTemplateList]);

  useEffect(() => {
    const visibleItemIds = rows.map((item) => item.id);
    const allSelected = visibleItemIds.every((id) => selectedItems.includes(id));
    setSelectAll(allSelected);
  }, [rows, selectedItems]);

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

    const folder = getLastArrayFromLocalStorage(LS_MY_TEMPLATES);
    const payload = {
      currentPage: 1,
      folder,
    };
    dispatch(getTemplateTrashListData(payload));

    return () => {
      dispatch(clearDeleteTemplateResponse());
    };
  }, []);

  const { itemsPerPage } = paginationData;
  const totalCount = trashTemplateListResp.totct as number;

  const totalPages = useMemo(
    () => Math.ceil(totalCount / itemsPerPage),
    [totalCount, itemsPerPage],
  );

  const getCurrentPageNumber = async (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && paginationData.currentPage !== newPage) {
      setPaginationData({ ...paginationData, currentPage: newPage });
      const folder = getLastArrayFromLocalStorage(LS_MY_TEMPLATES);
      const payload = {
        currentPage: newPage,
        folder,
      };
      dispatch(setDeletedTemplateListPageCount(newPage));
      await dispatch(getTemplateTrashListData(payload));
    }
  };

  useEffect(() => {
    setPaginationData({
      ...paginationData,
      totalItems: trashTemplateListResp.totct as number,
      itemsPerPage: trashTemplateListResp.perpg,
    });
  }, [trashTemplateListResp]);

  useEffect(() => {
    setRows(
      trashTemplateList?.map((data) =>
        dataGenerator({
          ...data,
        }),
      ),
    );
  }, [trashTemplateList, activeFileOption, selectedItems]);

  const handleRestoreTemplate = async (templateId: number) => {
    const folder = getLastArrayFromLocalStorage(LS_MY_TEMPLATES);
    const activeStatus = "1";
    dispatch(deleteTemplate(templateId, folder, activeStatus));
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
                `assets/images/icon-${getFileIcon(data.templateName, data.mimeType)}.svg`,
              )}
            />
          </i>
          <div
            className="flex items-center file-title-table inline-block overflow-hidden truncate-line1 lh1 rounded-6"
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
                  <li className="border-bottom" onClick={() => handleRestoreTemplate(data.id)}>
                    Restore Template
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
      {rows?.length > 0 && (
        <section className="mb-5">
          <div className="d-table-full">
            <h2 className="fs10 mb-3 text-defaul-color font-normal tracking-wider uppercase ml-3">
              Deleted templates
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
                enablePagination={totalPages > 1}
                isLoading={isLoading}
              />
            </motion.div>
          </div>
        </section>
      )}
    </AnimatePresence>
  );
};

export default TemplateTrashListView;
