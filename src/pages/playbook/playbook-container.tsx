import { useAppDispatch, useAppSelector } from "core/hook";
import { contractReducer } from "pages/contract/contract.redux";
import GlobalPlaybook from "pages/playbook/components/global-playbook-listing";
import PlaybookListing from "pages/playbook/components/playbook-listing";
import { dashboardReducer } from "pages/pre-dashboard/dashboard.redux";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FILTER_TYPE, ROUTE_ADMIN, ROUTE_CREATE_PLAYBOOK, USER_AUTHORITY } from "src/const";
import { Loader } from "src/core/components/loader/loader.comp";
import { useAuthorityCheck } from "src/core/utils/use-authority-check.hook";
import DataFilter from "src/layouts/admin/components/data-filter/data-filter";
import {
  dataFilterReducer,
  setFilterActive,
} from "src/layouts/admin/components/data-filter/data-filter.redux";
import { teamReducer } from "../manage-team/team.redux";
import { EmptyComponent } from "../user-dashboard/empty-component/empty-component";
import "./playbook-container.scss";
import {
  clearPlaybookState,
  fetchPlayBookListing,
  playbookReducer,
  setGlobalPlaybookListLoading,
} from "./playbook.redux";

interface PlaybookContainerProps {}

const PlaybookContainer: React.FC<PlaybookContainerProps> = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isPlaybookCreator = useAuthorityCheck([USER_AUTHORITY.PB_CREATE]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const PBList = useAppSelector((state) => state.playbook.PBList);
  const globalPBList = useAppSelector((state) => state.playbook.globalPBList);
  const isLoading = useAppSelector((state) => state.playbook.isGlobalPlaybookListLoading);
  const handleFilter = async () => {
    dispatch(setFilterActive(true));
    await dispatch(fetchPlayBookListing(1, 1));
    await dispatch(fetchPlayBookListing(0, 1));
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(setGlobalPlaybookListLoading(true));
      await dispatch(fetchPlayBookListing(0, 1));
      await dispatch(fetchPlayBookListing(1, 1));
    };

    fetchData();
    return () => {
      dispatch(clearPlaybookState());
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {isLoading && <Loader />}
      <div className="left-section left-divider-sec">
        <div className="left-section-inner">
          <div className="left-inner-sticky pb-1">
            <div className="filter-sec">
              <DataFilter filterType={[FILTER_TYPE.CONTRACT_TYPE]} handleFilter={handleFilter} />
              <span className="grow"></span>
              {isPlaybookCreator && (
                <div className="relative drop-down-modal" ref={dropdownRef}>
                  <button
                    className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase"
                    onClick={toggleDropdown}
                  >
                    Create New
                  </button>
                  {isDropdownOpen && (
                    <div className={`menu-card rounded-6 ${isDropdownOpen ? "is-open" : ""}`}>
                      <ul>
                        <li
                          className="create-icon cursor-pointer"
                          onClick={() => {
                            navigate(`/${ROUTE_ADMIN}/${ROUTE_CREATE_PLAYBOOK}`);
                          }}
                        >
                          Create playbook
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            {globalPBList.length || PBList.length ? (
              <>
                <GlobalPlaybook />
                <PlaybookListing />
              </>
            ) : (
              <EmptyComponent
                text="My PlayBook"
                messageOne={"Your PlayBook section are empty now"}
              />
            )}
          </div>
        </div>
      </div>
      {/* <div className="right-section">
        <NotificationStack />
      </div> */}
    </>
  );
};

export default PlaybookContainer;

export const reducer = {
  dashboard: dashboardReducer,
  contract: contractReducer,
  playbook: playbookReducer,
  team: teamReducer,
  dataFilter: dataFilterReducer,
};
