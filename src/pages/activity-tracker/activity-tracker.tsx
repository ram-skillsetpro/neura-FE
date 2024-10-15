import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { fetchAllUserList, teamReducer } from "../manage-team/team.redux";
import { activityTrackerReducer, fetchActionList } from "./activity-tracker.redux";

interface ActivityTrackerType {}

const ActivityTracker: React.FC<ActivityTrackerType> = () => {
  const dispatch = useAppDispatch();

  const { actionList } = useAppSelector((state) => state.activityTracker);
  const { allActiveUserList } = useAppSelector((state) => state.team);
  console.log(actionList, allActiveUserList);

  useEffect(() => {
    dispatch(fetchActionList());
    dispatch(fetchAllUserList());
  }, []);

  return <div>activity-tracker</div>;
};

export default ActivityTracker;

export const reducer = {
  activityTracker: activityTrackerReducer,
  team: teamReducer,
};
