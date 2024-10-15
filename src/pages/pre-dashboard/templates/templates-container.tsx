import { Loader } from "core/components/loader/loader.comp";
import { useAppDispatch, useAppSelector } from "core/hook";
import { LS_MY_TEMPLATES } from "core/utils/constant";
import { contractReducer } from "pages/contract/contract.redux";
import { manageMembersReducer } from "pages/manage-members/manage-members.redux";
import { teamReducer } from "pages/manage-team/team.redux";
import { FolderType } from "pages/pre-dashboard/dashboard.model";
import { dashboardReducer, setRenderContainer } from "pages/pre-dashboard/dashboard.redux";
import GlobalTemplateListView from "pages/pre-dashboard/templates/components/globaltemplate-list.component";
import TemplateListView from "pages/pre-dashboard/templates/components/template-list.component";
import {
  TemplatesReducer,
  getGlobalTemplatesPerPage,
  getTemplatesPerPage,
} from "pages/pre-dashboard/templates/templates.redux";
import CreateFolderComponent from "pages/user-dashboard/components/file-upload/create-folder/create-folder";
import AddDriveFolder from "pages/user-dashboard/components/file-upload/drive-folder/add-drive-folder";
import FolderNavigation from "pages/user-dashboard/components/file-upload/folder-navigation";
import UploadDropdown from "pages/user-dashboard/components/file-upload/upload-dropdown";
import UploadFolder from "pages/user-dashboard/components/upload-folder/upload-folder";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FILTER_TYPE, ROUTE_ADMIN, ROUTE_PRE_MY_TEMPLATE, USER_AUTHORITY } from "src/const";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataFilter from "src/layouts/admin/components/data-filter/data-filter";
import {
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import { EmptyComponent } from "src/pages/user-dashboard/empty-component/empty-component";
import "./templates-container.scss";

interface TemplatesContainerProps {}

const TemplatesContainer: React.FC<TemplatesContainerProps> = () => {
  const navigateTo = useNavigate();
  const dispatch = useAppDispatch();
  const summaryAlerts = useAppSelector((state) => state.dashboard.summaryAlerts);
  const renderUpload = useAppSelector((state) => state.dashboard.createNew);
  const [traversePath, setTraversePath] = useState<Array<FolderType>>([]);
  const routeDataString = localStorage.getItem(LS_MY_TEMPLATES);
  const isFilterActive = useAppSelector((state) => state.dataFilter.isFilterActive);
  const [isTemplateListLoading, setIsTemplateListLoading] = useState<boolean>(false);
  const [isGlobalTemplateListLoading, setIsGlobalTemplateListLoading] = useState<boolean>(false);
  const templateList = useAppSelector((state) => state.templates.templatesList);
  const templateListResp = useAppSelector((state) => state.templates.templatesResponse);
  const globaltemplatesList = useAppSelector((state) => state.templates.globaltemplatesList);
  const globalTemplatesResponse = useAppSelector(
    (state) => state.templates.globalTemplatesResponse,
  );

  const foldersTableRef = useRef<HTMLDivElement | null>(null);
  const othersTableRef = useRef<HTMLDivElement | null>(null);
  const isContractCreator = useAuthorityCheck([USER_AUTHORITY.ROLE_PRE_CONTRACT_CREATOR]);

  const fetchData = async (folder?: FolderType) => {
    if (templateListResp.pgn === 1) {
      setIsTemplateListLoading(true);
    }
    try {
      await dispatch(
        getTemplatesPerPage({
          currentPage: 1,
          folder,
        }),
      );
      setIsTemplateListLoading(false);
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isFilterActive]);

  const fetchGlobalTemplate = async (folder?: FolderType) => {
    if (globalTemplatesResponse.pgn === 1) {
      setIsGlobalTemplateListLoading(true);
    }
    try {
      await dispatch(
        getGlobalTemplatesPerPage({
          currentPage: 1,
          folder,
        }),
      );
      setIsGlobalTemplateListLoading(false);
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  useEffect(() => {
    fetchGlobalTemplate();
  }, [isFilterActive]);

  const handleGoBack = (id: number) => {
    const routeData = [...JSON.parse(routeDataString || "")];
    const index = routeData.findIndex((i) => i.id === id);
    const newPath = routeData.slice(0, index + 1);
    setTraversePath(newPath);
    localStorage.setItem(LS_MY_TEMPLATES, JSON.stringify(newPath));
  };

  const goToMyTemplates = () => {
    setTraversePath([]);
    navigateTo(`/${ROUTE_ADMIN}/${ROUTE_PRE_MY_TEMPLATE}`);
  };

  const handleFilter = async () => {
    dispatch(setFilterActive(true));
  };

  return (
    <>
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <div className="left-inner-sticky pb-1">
            {!isFilterActive && (
              <FolderNavigation
                label="My Templates"
                fetchData={fetchData}
                goBack={goToMyTemplates}
                handleGoBack={handleGoBack}
                routeString={LS_MY_TEMPLATES}
              />
            )}
            <div className="filter-sec">
              <DataFilter filterType={[FILTER_TYPE.CONTRACT_TYPE]} handleFilter={handleFilter} />
              <span className="grow"></span>
              {isContractCreator && <UploadDropdown />}
            </div>
          </div>
          {/* {renderUpload === "uploadFile" && <SingleFileUpload />} */}
          {renderUpload === "addDriveFolder" && <AddDriveFolder />}
          {renderUpload === "addFolder" && (
            <CreateFolderComponent
              routeString={LS_MY_TEMPLATES}
              isOpen={renderUpload === "addFolder"}
              onClose={() => dispatch(setRenderContainer(""))}
            />
          )}
          {renderUpload === "uploadFolder" && <UploadFolder />}

          {isGlobalTemplateListLoading ? (
            <Loader />
          ) : (
            <>
              {globaltemplatesList.length > 0 && (
                <>
                  <div ref={othersTableRef}>
                    <GlobalTemplateListView />
                  </div>
                  <div ref={foldersTableRef}></div>
                </>
              )}
            </>
          )}

          {isTemplateListLoading ? (
            <Loader />
          ) : isFilterActive ? (
            templateList.length ? (
              <div ref={othersTableRef}>
                <TemplateListView isFilterActive={isFilterActive} />
              </div>
            ) : (
              <EmptyComponent text="My Templates" messageOne={"Template data not available"} />
            )
          ) : (
            <>
              {templateList.length ? (
                <>
                  <div ref={othersTableRef}>
                    <TemplateListView />
                  </div>
                  <div ref={foldersTableRef}></div>
                </>
              ) : (
                <EmptyComponent
                  text="My Templates"
                  messageTwo={isContractCreator ? "You can create new." : ""}
                  messageOne={"Your Templates section are empty now"}
                />
              )}
            </>
          )}
        </div>
      </div>
      {/* <div className="right-section">
        <NotificationStack />
      </div> */}
    </>
  );
};

export default TemplatesContainer;

export const reducer = {
  dashboard: dashboardReducer,
  templates: TemplatesReducer,
  team: teamReducer,
  contract: contractReducer,
  manageMembers: manageMembersReducer,
  dataFilter: dataFilterReducer,
};
