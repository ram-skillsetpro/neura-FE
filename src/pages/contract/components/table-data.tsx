import React, { Fragment } from "react";
import { TableDataResponseType } from "../contract.model";

interface TableDataType extends TableDataResponseType {}

const TableData: React.FC<TableDataType> = ({ tableData = [] }) => {
  return (
    <>
      {tableData &&
        Array.isArray(tableData) &&
        tableData.map((data, index) => (
          <Fragment key={index}>
            <div className="table-data-wrapper">
              <h3 className="h3">{data.header}</h3>
              <div
                style={{ overflowX: "scroll" }}
                dangerouslySetInnerHTML={{ __html: tableData[0]?.value }}
              ></div>
            </div>
          </Fragment>
        ))}
    </>
  );
};
export default TableData;
