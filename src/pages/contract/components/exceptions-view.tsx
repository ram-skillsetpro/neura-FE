import React, { Fragment } from "react";
import { formatDate } from "src/core/utils";
import { ExceptionsResponseType } from "../contract.model";

interface ExceptionsViewType extends ExceptionsResponseType {}

const ExceptionsView: React.FC<ExceptionsViewType> = ({ exceptions = [] }) => {
  return (
    <div className="wrapper exception-container">
      {exceptions &&
        Array.isArray(exceptions) &&
        exceptions.map((data, index) => (
          <Fragment key={index}>
            <div key={index}>
              <h4>{data.atl}</h4>
              <p>{data.atx}</p>
              <small>{formatDate(data.asd)}</small>
            </div>
            <hr />
          </Fragment>
        ))}
    </div>
  );
};

export default ExceptionsView;
