import SealQuestion from "assets/images_compliance/SealQuestion.svg";
import UsersFour from "assets/images_compliance/UsersFour.svg";
import VideoCamera from "assets/images_compliance/VideoCamera.svg";
import React from "react";

const AuditRiskComponent: React.FC = () => {
  return (
    <section className="comp-dash-row mb-8">
      {/* Card 1 */}
      <div className="card-bg comp-dash-w">
        <div className="card-t">
          <div className="card-heading">
            <h2>
              Open Vulnerabilities <span className="card-alert-box ml-3">10</span>
            </h2>
          </div>
          <span className="grow"></span>
          <div className="card-ic-w">
            <img src={SealQuestion} alt="Seal Question" />
          </div>
        </div>
        <div className="card-b-sec">
          <div className="card-inner">
            <div className="text-sm uppercase text-high-color font-semibold">High</div>
            <div className="text-lg font-bold">6</div>
          </div>
          <div className="card-inner">
            <div className="text-sm uppercase text-moderate-color font-semibold">Moderate</div>
            <div className="text-lg font-bold">6</div>
          </div>
          <div className="card-inner">
            <div className="text-sm uppercase text-low-color font-semibold">Low</div>
            <div className="text-lg font-bold">4</div>
          </div>
        </div>
      </div>
      {/* Card 2 */}
      <div className="card-bg comp-dash-w">
        <div className="card-t">
          <div className="card-heading">
            <h2>
              Audit in Progress <span className="card-alert-box ml-3">24</span>
            </h2>
          </div>
          <span className="grow"></span>
          <div className="card-ic-w">
            <img src={VideoCamera} alt="Video Camera" />
          </div>
        </div>
        <div className="card-b-sec">
          <div className="card-inner">
            <div className="text-sm uppercase text-lighter-color font-semibold">Topic1</div>
            <div className="text-lg font-bold">6</div>
          </div>
          <div className="card-inner">
            <div className="text-sm uppercase text-lighter-color font-semibold">Topic2</div>
            <div className="text-lg font-bold">6</div>
          </div>
          <div className="card-inner">
            <div className="text-sm uppercase text-lighter-color font-semibold">Topic3</div>
            <div className="text-lg font-bold">4</div>
          </div>
        </div>
      </div>
      {/* Card 3 */}
      <div className="card-bg comp-dash-w">
        <div className="card-t">
          <div className="card-heading">
            <h2>
              Risk <span className="card-alert-box ml-3">10</span>
            </h2>
          </div>
          <span className="grow"></span>
          <div className="card-ic-w">
            <img src={UsersFour} alt="Users Four" />
          </div>
        </div>
        <div className="card-b-sec">
          <div className="card-inner">
            <div className="text-sm uppercase text-lighter-color font-semibold">topic 1</div>
            <div className="text-lg font-bold">6</div>
          </div>
          <div className="card-inner">
            <div className="text-sm uppercase text-lighter-color font-semibold">topic 2</div>
            <div className="text-lg font-bold">6</div>
          </div>
          <div className="card-inner">
            <div className="text-sm uppercase text-lighter-color font-semibold">topic 3</div>
            <div className="text-lg font-bold">4</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuditRiskComponent;
