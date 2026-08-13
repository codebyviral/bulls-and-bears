import React from "react";
import { CustomSidebar, TransactionsList } from "../Components";

const Transactions = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <CustomSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <TransactionsList />
      </main>
    </div>
  );
};

export default Transactions;
