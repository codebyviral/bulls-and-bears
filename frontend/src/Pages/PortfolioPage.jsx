import { CustomSidebar, Portfolio } from "../Components";

const PortfolioPage = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <CustomSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <Portfolio />
      </main>
    </div>
  );
};

export default PortfolioPage;
