import React from "react";

interface Stage {
  stageLevel: number;
  text: string;
}

interface Stages {
  [key: number]: Stage;
}

interface Props {
  stages: Stages;
  currentStage: number;
}

const WizardComponent: React.FC<Props> = ({ stages, currentStage }) => {
  return (
    <>
      {Object.values(stages).map((stageData) => (
        <div
          key={stageData.stageLevel}
          className={`${
            currentStage === stageData.stageLevel
              ? "wizard-step1 uppercase"
              : stageData.stageLevel <= currentStage
                ? "wizard-page active"
                : "wizard-page"
          } `}
        >
          {`${stageData.stageLevel} ${currentStage === stageData.stageLevel ? stageData.text : ""}`}
        </div>
      ))}
    </>
  );
};

export default WizardComponent;
