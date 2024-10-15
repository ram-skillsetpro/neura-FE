import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { setFilterActive } from "src/layouts/admin/components/data-filter/data-filter.redux";
import "../../../layouts/admin/components/data-filter/data-filter.scss";

interface IAggrFilter {
  handleFilter: (filter: any, reset?: boolean) => void;
}

const AggrFilter: React.FC<IAggrFilter> = ({ handleFilter }) => {
  const dispatch = useAppDispatch();

  const [mergedFilter, setMergedFilter] = useState<Array<any>>([]);

  const { smartViewAggrList } = useAppSelector((state) => state.contract);
  const { isFilterActive } = useAppSelector((state) => state.dataFilter);

  const [filter, setFilter] = useState<any>({
    CONTRACT_TYPE_AGG: [],
    CREDIT_DURATION_RANGE: [],
    EFFECTIVE_MONTH_YEAR_AGG: [],
    EFFECTIVE_YEAR_AGG: [],
    FIRST_PARTY_AGG: [],
    JURISDICTION_AGG: [],
    LIABILITY_RANGE: [],
    SECOND_PARTY_AGG: [],
    TERMINATION_MONTH_YEAR_AGG: [],
    TERMINATION_YEAR_AGG: [],
  });

  const mergeAllFilter = (obj: any) => {
    const iteratorArray: any = [];

    function flattenObject(obj: any) {
      for (const key in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === "object" && obj[key] !== null) {
            flattenObject(obj[key]);
          } else {
            !iteratorArray.filter((d: any) => d.key === obj.key).length && iteratorArray.push(obj);
          }
        }
      }
    }

    flattenObject(obj);
    return iteratorArray[Symbol.iterator]();
  };

  const handleChange = (e: any, obj: any, key: string) => {
    if (key) {
      setFilter((prevState: any) => {
        if (prevState[key].filter((d: any) => d.key === obj.key).length) {
          const data = prevState[key].filter((d: any) => d.key !== obj.key);
          prevState[key] = data;
        } else {
          prevState[key].push(obj);
        }
        dispatch(setFilterActive(false));
        const mergedFilter = Array.from(mergeAllFilter(prevState));
        setMergedFilter(Array.from(mergeAllFilter(prevState)));
        !mergedFilter.length && handerResetFilter();
        return prevState;
      });
    }
  };

  // useEffect(() => {
  //   console.log(filter);
  // }, [filter]);

  useEffect(() => {
    window.addEventListener("click", () => {
      resetFilter();
    });
  }, []);

  const resetFilter = () => {
    const filterElList: NodeListOf<Element> = document.querySelectorAll(".filter-menu-card");

    if (filterElList.length) {
      filterElList.forEach((el: any) => {
        el.style.visibility = "hidden";
      });
    }
  };

  const objectToArray = (objList: any) => {
    return Object.entries(objList).map(([key, value]: any) => {
      return {
        key,
        value,
      };
    });
  };

  const filterList: any = {
    CONTRACT_TYPE_AGG: { key: "CONTRACT_TYPE_AGG", label: "Contract Type" },
    CREDIT_DURATION_RANGE: { key: "CREDIT_DURATION_RANGE", label: "Credit Duration" },
    EFFECTIVE_MONTH_YEAR_AGG: { key: "EFFECTIVE_MONTH_YEAR_AGG", label: "Effective Month" },
    EFFECTIVE_YEAR_AGG: { key: "EFFECTIVE_YEAR_AGG", label: "Effective Year" },
    FIRST_PARTY_AGG: { key: "FIRST_PARTY_AGG", label: "First Party" },
    JURISDICTION_AGG: { key: "JURISDICTION_AGG", label: "Jurisdiction" },
    LIABILITY_RANGE: { key: "LIABILITY_RANGE", label: "Liability Range" },
    SECOND_PARTY_AGG: { key: "SECOND_PARTY_AGG", label: "Second Party" },
    TERMINATION_MONTH_YEAR_AGG: { key: "TERMINATION_MONTH_YEAR_AGG", label: "Termination Month" },
    TERMINATION_YEAR_AGG: { key: "TERMINATION_YEAR_AGG", label: "Termination Year" },
  };

  const handleFilterOpen = (e: any) => {
    setTimeout(() => {
      const targetEl = e.target.closest(".filter-menu-modal");
      targetEl.querySelector(".filter-menu-card").style.visibility = "visible";
    }, 300);

    resetFilter();
  };

  const renderFilterUI = (itemList: Array<any>, key: any) => {
    const filterItems = itemList.filter((data) => data.value > 0);
    return (
      <>
        {filterItems.length > 0 && (
          <div className="filter-menu-modal relative">
            <button
              className={`file-btn1 font-bold down-icon cursor-pointer ${
                filter[key].length > 0 ? "filter-active" : ""
              }`}
              onClick={(e) => {
                handleFilterOpen(e);
              }}
            >
              {filterList[key].label}
            </button>

            <div
              className="filter-menu-card rounded-6 contract-filter-menu-card"
              style={{ visibility: "hidden" }}
            >
              <ul>
                {filterItems.map((data) => (
                  <li key={data.key} onClick={(e) => e.stopPropagation()}>
                    <div className="truncate-line1">{`${data.key} (${data.value})`}</div>
                    <div className="ch-box">
                      <input
                        type="checkbox"
                        className="checkbox-filter"
                        onChange={(e) => handleChange(e, data, key)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderContractTypeAgg = () => {
    if (smartViewAggrList) {
      const CONTRACT_TYPE_AGG = objectToArray(smartViewAggrList.CONTRACT_TYPE_AGG || []);

      return (
        <>
          {Array.from(CONTRACT_TYPE_AGG || []).length
            ? renderFilterUI(CONTRACT_TYPE_AGG, filterList.CONTRACT_TYPE_AGG.key)
            : ""}
        </>
      );
    }
  };

  const renderCreditDurationRange = () => {
    if (smartViewAggrList) {
      const CREDIT_DURATION_RANGE = objectToArray(smartViewAggrList.CREDIT_DURATION_RANGE || []);

      return (
        <>
          {Array.from(CREDIT_DURATION_RANGE || []).length
            ? renderFilterUI(CREDIT_DURATION_RANGE, filterList.CREDIT_DURATION_RANGE.key)
            : ""}
        </>
      );
    }
  };

  const renderEffectiveMonthYearAgg = () => {
    if (smartViewAggrList) {
      const EFFECTIVE_MONTH_YEAR_AGG = objectToArray(
        smartViewAggrList.EFFECTIVE_MONTH_YEAR_AGG || [],
      );

      return (
        <>
          {Array.from(EFFECTIVE_MONTH_YEAR_AGG || []).length
            ? renderFilterUI(EFFECTIVE_MONTH_YEAR_AGG, filterList.EFFECTIVE_MONTH_YEAR_AGG.key)
            : ""}
        </>
      );
    }
  };

  const renderEffectiveYearAgg = () => {
    if (smartViewAggrList) {
      const EFFECTIVE_YEAR_AGG = objectToArray(smartViewAggrList.EFFECTIVE_YEAR_AGG || []);

      return (
        <>
          {Array.from(EFFECTIVE_YEAR_AGG || []).length
            ? renderFilterUI(EFFECTIVE_YEAR_AGG, filterList.EFFECTIVE_YEAR_AGG.key)
            : ""}
        </>
      );
    }
  };

  const renderFirstPartyAgg = () => {
    if (smartViewAggrList) {
      const FIRST_PARTY_AGG = objectToArray(smartViewAggrList.FIRST_PARTY_AGG || []);

      return (
        <>
          {Array.from(FIRST_PARTY_AGG || []).length
            ? renderFilterUI(FIRST_PARTY_AGG, filterList.FIRST_PARTY_AGG.key)
            : ""}
        </>
      );
    }
  };

  const renderSecondPartyAgg = () => {
    if (smartViewAggrList) {
      const SECOND_PARTY_AGG = objectToArray(smartViewAggrList.SECOND_PARTY_AGG || []);

      return (
        <>
          {Array.from(SECOND_PARTY_AGG || []).length
            ? renderFilterUI(SECOND_PARTY_AGG, filterList.SECOND_PARTY_AGG.key)
            : ""}
        </>
      );
    }
  };

  const renderJurisdictionAgg = () => {
    if (smartViewAggrList) {
      const JURISDICTION_AGG = objectToArray(smartViewAggrList.JURISDICTION_AGG || []);

      return (
        <>
          {Array.from(JURISDICTION_AGG || []).length
            ? renderFilterUI(JURISDICTION_AGG, filterList.JURISDICTION_AGG.key)
            : ""}
        </>
      );
    }
  };

  const renderLiabilityRange = () => {
    if (smartViewAggrList) {
      const LIABILITY_RANGE = objectToArray(smartViewAggrList.LIABILITY_RANGE || []);

      return (
        <>
          {Array.from(LIABILITY_RANGE || []).length
            ? renderFilterUI(LIABILITY_RANGE, filterList.LIABILITY_RANGE.key)
            : ""}
        </>
      );
    }
  };

  const renderTerminationMonthYearAgg = () => {
    if (smartViewAggrList) {
      const TERMINATION_MONTH_YEAR_AGG = objectToArray(
        smartViewAggrList.TERMINATION_MONTH_YEAR_AGG || [],
      );

      return (
        <>
          {Array.from(TERMINATION_MONTH_YEAR_AGG || []).length
            ? renderFilterUI(TERMINATION_MONTH_YEAR_AGG, filterList.TERMINATION_MONTH_YEAR_AGG.key)
            : ""}
        </>
      );
    }
  };

  const renderTerminationYearAgg = () => {
    if (smartViewAggrList) {
      const TERMINATION_YEAR_AGG = objectToArray(smartViewAggrList.TERMINATION_YEAR_AGG || []);

      return (
        <>
          {Array.from(TERMINATION_YEAR_AGG || []).length
            ? renderFilterUI(TERMINATION_YEAR_AGG, filterList.TERMINATION_YEAR_AGG.key)
            : ""}
        </>
      );
    }
  };

  const handleClick = () => {
    handleFilter(filter);
    // setMergedFilter(Array.from(mergeAllFilter(filter)));
  };

  const resetAllInputes = () => {
    const allCheckbox: NodeListOf<HTMLInputElement> = document.querySelectorAll(".checkbox-filter");
    allCheckbox.forEach((el) => {
      el.checked = false;
    });
    setFilter({
      CONTRACT_TYPE_AGG: [],
      CREDIT_DURATION_RANGE: [],
      EFFECTIVE_MONTH_YEAR_AGG: [],
      EFFECTIVE_YEAR_AGG: [],
      FIRST_PARTY_AGG: [],
      JURISDICTION_AGG: [],
      LIABILITY_RANGE: [],
      SECOND_PARTY_AGG: [],
      TERMINATION_MONTH_YEAR_AGG: [],
      TERMINATION_YEAR_AGG: [],
    });
    setMergedFilter([]);
  };

  const handerResetFilter = () => {
    resetAllInputes();
    dispatch(setFilterActive(false));
    handleFilter(filter, true);
  };

  // useEffect(() => {
  //   console.log(Array.from(mergeAllFilter(filter)).length);
  //   if (!Array.from(mergeAllFilter(filter)).length && smartViewAggrList) {
  //     // handerResetFilter();
  //     console.log("ss");
  //   }
  // }, [filter]);

  return (
    <>
      <>{renderContractTypeAgg()}</>
      <>{renderCreditDurationRange()}</>
      <>{renderEffectiveMonthYearAgg()}</>
      <>{renderEffectiveYearAgg()}</>
      <>{renderFirstPartyAgg()}</>
      <>{renderSecondPartyAgg()}</>
      <>{renderJurisdictionAgg()}</>
      <>{renderLiabilityRange()}</>
      <>{renderTerminationMonthYearAgg()}</>
      <>{renderTerminationYearAgg()}</>
      {mergedFilter.length ? (
        <button
          title={`${isFilterActive ? "Filter Applied" : "Apply Filter"}`}
          onClick={isFilterActive ? () => {} : handleClick}
          className={`apply-btn ${isFilterActive ? "active" : ""} cursor-pointer`}
        ></button>
      ) : (
        ""
      )}
      {isFilterActive && mergedFilter.length ? (
        <button
          title="Clear Filter"
          onClick={handerResetFilter}
          className="filter-reset cursor-pointer"
        ></button>
      ) : (
        ""
      )}
    </>
  );
};

export default AggrFilter;
