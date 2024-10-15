import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import AppModal from "../../core/components/modals/app-modal";
import "./_record-obligation.scss";
import {
  ComplianceDashboard,
  ControlMap,
  ObligationType,
  TrackingFrequencies,
} from "./grc-dashboard.model";
import { getDropDownValues, getObligations, saveObligations } from "./grc-dashboard.redux";

interface ObligationModalProps {
  isOpen: boolean;
  onClose: () => void;
  obligationByID: ObligationType | undefined;
  contractID: string;
  isEdit: boolean;
  obligationId: string;
}

interface TabStatus {
  activeStep: number;
  doneSteps: number[];
}

interface Team {
  teamName: string;
  teamId: string;
  spocUsers: SpocUsers;
}

interface SpocUsers {
  ownerId: string;
  ownerName: string;
}

const ObligationModal: React.FC<ObligationModalProps> = ({
  isOpen,
  onClose,
  obligationByID,
  contractID,
  isEdit,
  obligationId,
}) => {

  const dispatch = useAppDispatch();
  const dropdownList = useAppSelector((state) => state?.grcDashboard?.dropdownData);
  const [trackingFrequencies, setTrackingFrequencies] = useState<TrackingFrequencies>();
  const [frequencyOptions, setFrequencyOptions] = useState<{ label: string; value: number }[]>([]);
  const [teamOwners, setTeamOwners] = useState<Record<string, Record<string, string>>>({});
  const [spocOptions, setSpocOptions] = useState<{ label: string; value: number }[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isDeadlineActive, setDeadlineActive] = useState(false);
  const authData = localStorage.getItem("auth");
  const companyId = authData ? JSON.parse(authData).companyId : null;
  const [controls, setControls] = useState<ControlMap>({});
  const [controlMaps, setControlsMaps] = useState<{ controlName: string }[]>([]);
  const [obligationTypes, setObligationTypes] = useState<{ name: string; id: number }>({
    name: "",
    id: 0,
  });

  const [errors, setErrors] = useState({
    nameError: "",
    descError: "",
    impactError: "",
    likelihoodError: "",
    categoryError: "",
    trackingFrequencyError: "",
    notesError: "",
    controlError: "",
    teamIdError: "",
    ownerIdError: "",
  });

  useEffect(() => {
    const payload = {
      companyID: companyId,
    };
    dispatch(getDropDownValues(payload));
  }, []);

  useEffect(() => {
    setTrackingFrequencies(dropdownList.trackingFrequencies);
    setTeamOwners(dropdownList.teamOwners);
    setControls(dropdownList.controlMap);
  }, [dropdownList]);

  useEffect(() => {
    if (teamOwners) {
      const teams = parseTeamOwners(teamOwners);
      setTeams(teams);
    }
  }, [teamOwners]);

  const parseTeamOwners = (teamOwners: Record<string, Record<string, string>>): Team[] => {
    return Object.entries(teamOwners).map(([team, ownerInfo]) => {
      const ownerId = Object.keys(ownerInfo)[0];
      const ownerName = ownerInfo[ownerId];
      const [teamName, teamId] = team.split("#");
      const spocUsers = {
        ownerId: ownerId,
        ownerName: ownerName,
      };
      return { teamName, teamId, spocUsers };
    });
  };

  useEffect(() => {
    if (trackingFrequencies) {
      const options = Object.entries(trackingFrequencies).map(([label, value]) => ({
        label,
        value,
      }));
      setFrequencyOptions(options);
    }
  }, [trackingFrequencies]);

  const [step, setStep] = useState<TabStatus>({
    activeStep: 1,
    doneSteps: [],
  });

  const deadlineParts = obligationByID?.deadlineDate ? obligationByID.deadlineDate.split("/") : [];
  const deadlineDate =
    deadlineParts.length === 3
      ? new Date(`${deadlineParts[2]}-${deadlineParts[1]}-${deadlineParts[0]}`).getTime() / 1000
      : new Date().getTime() / 1000;

  const getFrequency = (frequency: string | undefined) => {
    let frequencyNumber = "";
    if (frequency != undefined) {
      switch (frequency) {
        case "Daily":
          frequencyNumber = "1";
          break;
        case "Monthly":
          frequencyNumber = "3";
          break;
        case "Once":
          frequencyNumber = "0";
          break;
        case "Weekly":
          1;
          frequencyNumber = "2";
          break;
        case "Yearly":
          1;
          frequencyNumber = "5";
          break;
        case "Quarterly":
          1;
          frequencyNumber = "4";
          break;
      }
      return frequencyNumber;
    }
  };

  const tagsString: string = obligationByID?.tags?.map(tag => tag).join(', ') || '';

  const [formData, setFormData] = useState<ComplianceDashboard>(() => {
    if (obligationByID === undefined) {
      return {
        category: "",
        companyId: companyId,
        contractId: contractID,
        deadlineDate: Date.now() / 1000,
        desc: "",
        escalateAfterCount: 0,
        impact: "",
        isActive: 2, // Make sure to set isActive as a string
        likelihood: "",
        mappingId: 0,
        name: "",
        ownerId: "",
        prompt: "",
        riskId: 0,
        riskTypeId: 1,
        tags: "",
        trackingFrequency: "",
        trackingMechanism: 1,
        teamId: "",
        notes: "",
        control: "",
      };
    } else {
      return {
        category:
          obligationByID.details.category === "Low"
            ? "1"
            : obligationByID.details.category === "Medium"
              ? "2"
              : "3",
        companyId: companyId,
        contractId: contractID,
        deadlineDate: deadlineDate,
        desc: obligationByID.description,
        escalateAfterCount: 0,
        impact:
          obligationByID.details.impact === "Low"
            ? "1"
            : obligationByID.details.impact === "Medium"
              ? "2"
              : "3",
        isActive: obligationByID.isActive ? 1 : 2, // Make sure to set isActive as a string
        likelihood:
          obligationByID.details.likelihood === "Low"
            ? "1"
            : obligationByID.details.likelihood === "Medium"
              ? "2"
              : "3",
        mappingId: obligationByID.mappingId,
        name: obligationByID.name,
        ownerId: obligationByID.ownerName,
        prompt: "",
        riskId: obligationByID?.riskId,
        riskTypeId: 1,
        tags: tagsString,
        trackingFrequency: getFrequency(obligationByID.trackingFrequency),
        trackingMechanism: 1,
        teamId: obligationByID.ownerDept,
        notes: "",
        control: "Supply Chain Control",
      };
    }
  });

  const handleNext = () => {
    setStep((prevState) => {
      const newActiveStep = prevState.activeStep !== 4 ? prevState.activeStep + 1 : 4;
      const newDoneSteps = [...prevState.doneSteps, prevState.activeStep];
      return { activeStep: newActiveStep, doneSteps: newDoneSteps };
    });
  };

  const handlePrevious = () => {
    setStep((prevState) => {
      const newActiveStep = prevState.activeStep !== 1 ? prevState.activeStep - 1 : 1;
      const newDoneSteps = prevState.doneSteps.filter((step) => step !== prevState.activeStep - 1);
      return { activeStep: newActiveStep, doneSteps: newDoneSteps };
    });
  };

  const handleChange = (name: string, value: any) => {
    if (value === "" || null || undefined) {
      setErrors((prevstate) => ({
        ...prevstate,
        [name + "Error"]: name + " is required",
      }));
    } else {
      setErrors((prevstate) => ({
        ...prevstate,
        [name + "Error"]: "",
      }));
      if (name === "control") {
        const option = {
          name: controls[value].name,
          id: controls[value].id,
        };
        setObligationTypes(option);
      }
    }

    console.log("Tags", value)
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (formData.teamId && teams.length > 0) {
      const selectedTeam = teams.find((team) => team.teamId === formData.teamId);
      if (selectedTeam) {
        const options = [
          {
            label: selectedTeam?.spocUsers.ownerName,
            value: parseInt(selectedTeam?.spocUsers.ownerId),
          },
        ];
        setFormData((prevState) => ({
          ...prevState,
          ["ownerId"]: selectedTeam?.spocUsers.ownerId,
        }));
        setSpocOptions(options);
      }
    }
  }, [formData.teamId, teams, teamOwners]);

  useEffect(() => {
    if (controls) {
      const _controls = parseControls(controls);
      setControlsMaps(_controls);
    }
  }, [controls]);

  const parseControls = (controls: ControlMap): { controlName: string }[] => {
    return Object.entries(controls).map((control) => {
      const [controlName] = control;
      return { controlName };
    });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files ? e.target.files[0] : null;
    setAttachment(file);
  };

  const saveAndExit = () => {
    if (!formData.name) {
      errors.nameError = "Name is required";
    } else {
      errors.nameError = "";
    }
    if (!formData.desc) {
      errors.descError = "Description is required";
    } else {
      errors.nameError = "";
    }
    if (!formData.impact) {
      errors.impactError = "Impact is required";
    } else {
      errors.nameError = "";
    }
    if (!formData.likelihood) {
      errors.likelihoodError = "Likelihood is required";
    } else {
      errors.nameError = "";
    }
    if (!formData.category) {
      errors.categoryError = "Category is required";
    } else {
      errors.nameError = "";
    }
    if (!formData.trackingFrequency) {
      errors.trackingFrequencyError = "Tracking Frequency is required";
    } else {
      errors.nameError = "";
    }
    if (!formData.notes) {
      errors.notesError = "Notes are required";
    } else {
      errors.nameError = "";
    }
    if (!formData.control) {
      errors.controlError = "Control is required";
    } else {
      errors.nameError = "";
    }
    if (!formData.teamId) {
      errors.teamIdError = "Team ID is required";
    } else {
      errors.nameError = "";
    }
    if (!formData.ownerId) {
      errors.ownerIdError = "Owner ID is required";
    } else {
      errors.nameError = "";
    }

    const formDataToSend: { [key: string]: any } = {};
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        formDataToSend[key] = (formData as any)[key];
      }
    }
    const payload = {
      attachments: attachment,
      data: formDataToSend,
      isEdit: isEdit,
    };
    //@ts-ignore
    dispatch(saveObligations(payload)).then((response: any) => {
      if (response) {
        dispatch(
          getObligations({
            contractId: contractID,
            obligationId: obligationId
          }),
        );
      }
    });
    onClose();
  };

  useEffect(() => {
    const defaultTeam = teams.find((team) => team.teamName === obligationByID?.ownerDept);
    if (defaultTeam) {
      setFormData((prevState) => ({
        ...prevState,
        teamId: defaultTeam.teamId,
      }));
    }
  }, [teams]);

  console.log("control", controls);
  console.log("control maps", obligationByID);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={true}
      overlayClassName={"modal-overlay"}
    >
      <div className="flex" style={{ height: "100vh" }}>
        <div className="obligation-modal-wrap">
          <div className="obligation-modal-heading">
            <div className="flex relative">
              Record Obligation
              <div className="close-obligation" onClick={onClose}></div>
            </div>
            <div className="obligation-step-sec">
              <ul>
                {[1, 2, 3, 4].map((stepNumber) => (
                  <li
                    key={stepNumber}
                    className={
                      step.activeStep === stepNumber
                        ? "active"
                        : step.doneSteps.includes(stepNumber)
                          ? "done"
                          : ""
                    }
                  >
                    <div className="step-box">{stepNumber}</div>
                    {stepNumber === 1 && "Basic info"}
                    {stepNumber === 2 && "Ownership"}
                    {stepNumber === 3 && "Tracking"}
                    {stepNumber === 4 && "Additional"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="obligation-modal-body">
            <div className="record-obligation modal-body-scroll">
              {step.activeStep === 1 && (
                <div id="step1">
                  <div>
                    <div className="record-field">
                      <label>Select Control</label>
                      <select
                        className="compliance-select w-full p-2"
                        value={formData.control}
                        onChange={(e) => {
                          handleChange("control", e.target.value);
                        }}
                        disabled={isEdit || false}
                      >
                        {controlMaps.map((control) => {
                          if (isEdit) {
                            const entries = Object.entries(controls);
                            const foundEntry = entries.find(([key, value]) => value.name === obligationByID?.details?.type);
                            if (foundEntry && control.controlName === foundEntry[0]) {
                              return <option>{control.controlName}</option>;
                            }
                          }
                          else {
                            return <option>{control.controlName}</option>;
                          }

                        })}
                      </select>
                    </div>
                    <div className="record-field">
                      <label>Obligation Name</label>
                      <input
                        type="text"
                        className="inpt-style"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        disabled={isEdit || false}
                      />
                      {errors.nameError && (
                        <div
                          className="error-message"
                          style={{
                            color: "var(--button-red)",
                            fontSize: "14px",
                          }}
                        >
                          {errors.nameError}
                        </div>
                      )}
                    </div>
                    <div className="record-field">
                      <label>Select Framework</label>
                      <select disabled={isEdit || false} className="compliance-select w-full p-2">
                        <option>Contract Risk</option>
                      </select>
                    </div>
                    <div className="record-field">
                      <label>Obligation Type</label>
                      <select className="compliance-select w-full p-2" disabled={isEdit || false}>
                        <option value={isEdit ? obligationByID?.details?.type : obligationTypes.id}>{isEdit ? obligationByID?.details?.type : obligationTypes.name}</option>
                      </select>
                    </div>
                    <div className="record-field">
                      <label>Obligation Description</label>
                      <textarea
                        className="ob-textarea"
                        value={formData.desc}
                        onChange={(e) => handleChange("desc", e.target.value)}
                        disabled={isEdit || false}
                      ></textarea>
                    </div>
                  </div>
                  <div className="relative add-record-more">
                    <div className="record-group-field">
                      <div className="record-field">
                        <label>Impact</label>
                        <select
                          className="compliance-select w-full p-2"
                          value={formData.impact}
                          onChange={(e) => handleChange("impact", e.target.value)}
                        >
                          <option value="3">High</option>
                          <option value="2">Medium</option>
                          <option value="1">Low</option>
                        </select>
                      </div>
                      <div className="record-field">
                        <label>Likelihood</label>
                        <select
                          className="compliance-select w-full p-2"
                          value={formData.likelihood}
                          onChange={(e) => handleChange("likelihood", e.target.value)}
                        >
                          <option value="3">High</option>
                          <option value="2">Medium</option>
                          <option value="1">Low</option>
                        </select>
                      </div>
                      <div className="record-field">
                        <label>Risk Category</label>
                        <select
                          className="compliance-select w-full p-2"
                          value={formData.category}
                          onChange={(e) => handleChange("category", e.target.value)}
                        >
                          <option value="3">High</option>
                          <option value="2">Medium</option>
                          <option value="1">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="record-field">
                    <label>Tags</label>
                    <input
                      type="text"
                      className="inpt-style"
                      value={formData.tags}
                      onChange={(e) => handleChange('tags', e.target.value)}
                    />
                  </div>
                </div>
              )}
              {step.activeStep === 2 && (
                <div id="step2">
                  <div className="record-field">
                    <label className="">Department</label>
                    <select
                      className="compliance-select w-full p-2"
                      value={formData.teamId}
                      onChange={(e) => handleChange("teamId", e.target.value)}
                    >
                      {teams.map((team) => {
                        return <option value={team.teamId}>{team.teamName}</option>;
                      })}
                    </select>
                  </div>
                  <div className="record-field">
                    <label className="">SPOC</label>
                    <select
                      className="compliance-select w-full p-2"
                      value={formData.ownerId}
                      onChange={(e) => handleChange("ownerId", e.target.value)}
                    >
                      {spocOptions.map((option) => (
                        <option value={option.value} label={option.label}>
                          {option.label}
                        </option>
                      ))}
                      {/* <option>Vishal</option> */}
                    </select>
                  </div>
                </div>
              )}
              {step.activeStep === 3 && (
                <div id="step3">
                  <div className="record-field">
                    <label className="">Tracking Frequency</label>
                    <select
                      className="compliance-select w-full p-2"
                      value={formData.trackingFrequency}
                      onChange={(e) => handleChange("trackingFrequency", Number(e.target.value))}
                    >
                      {frequencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* <div className="record-field pt-3">
                    <div className="flex items-center">
                      <div className="mr-3 fs14">Current Deadline</div>
                    </div>
                    <div className="mt-3">
                      <input
                        type="date"
                        className="inpt-style"
                        value={
                          new Date(
                            formData?.deadlineDate ? formData?.deadlineDate * 1000 : Date.now(),
                          )
                            .toISOString()
                            .split("T")[0]
                        }
                        disabled={true}
                      />
                    </div>
                  </div> */}
                  <div className="record-field pt-3">
                    <div className="flex items-center">
                      <div className="mr-3 fs14">Extend Deadline ?</div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setDeadlineActive(e.target.checked);
                          }}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    {isDeadlineActive && (
                      <div className="mt-3">
                        <input
                          type="date"
                          className="inpt-style"
                          min={new Date().toISOString().split("T")[0]}
                          value={
                            new Date(
                              formData?.deadlineDate ? formData?.deadlineDate * 1000 : Date.now(),
                            )
                              .toISOString()
                              .split("T")[0]
                          }
                          onChange={(e) =>
                            handleChange("deadlineDate", new Date(e.target.value).getTime() / 1000)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {step.activeStep === 4 && (
                <div className="relative" id="step4">
                  <div className="record-field">
                    <label className="font-semibold">Attachment</label>
                    {/* <div className="pt-2">
                      <button className="icon-btn px-3 relative font-semibold">
                        <i className="upload-ic mr-3"></i> Upload File
                        <div className="file-upload-link">
                          <input
                            type="file"
                            onChange={handleFileChange}
                          />
                        </div>
                      </button>
                    </div> */}

                    <div className="mt-3" id="file">
                      <div className="upload-file-box relative">
                        {attachment ? (
                          <>
                            <div className="flex justify-center w-full fs14 font-semibold items-center">
                              {attachment.name}
                            </div>
                            <div className="file-upload-link">
                              <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.png,.csv,.xls,.xlsx"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-center w-full fs14 font-semibold">
                              <i className="upload-ic mr-3"></i> Upload File
                            </div>
                            <div className="file-upload-link">
                              <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.png,.csv,.xls,.xlsx"
                              />
                            </div>
                            <div className="file-type">
                              Acceptable formats - pdf, jpg, png, csv, excel Max file size 10mb
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="record-field">
                    <label className="font-semibold">Notes</label>
                    <textarea
                      className="ob-textarea"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="obligation-modal-footer mt-3">
            <div>
              <button
                className="button-ob rounded-12 mr-3 sm-button tracking-wider font-bold uppercase cursor-pointer"
                onClick={saveAndExit}
                disabled={step.activeStep === 1 || step.activeStep === 2 || step.activeStep === 3}
              >
                Save and Exit
              </button>
              <button
                className="button-ob rounded-12 mr-3 sm-button tracking-wider font-bold uppercase cursor-pointer"
                onClick={handlePrevious}
                disabled={step.activeStep === 1}
              >
                Previous
              </button>
              {step.activeStep === 4 ? (
                <></>
              ) : (
                <button
                  className="button-red rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer"
                  onClick={handleNext}
                  disabled={step.activeStep === 4}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ObligationModal;
