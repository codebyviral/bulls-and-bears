import React from "react";
import { CustomSidebar, Leaderboard } from "../Components";

const LeaderboardPage = () => {
  return (
    <>
      <div className="flex h-screen">
        <div className="flex-shrink-0">
          <CustomSidebar />
        </div>
        <div className="flex-1 overflow-auto">
          <Leaderboard />
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;
