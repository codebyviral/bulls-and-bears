import { CustomSidebar } from "../Components";
import Ipo from "../Components/Ipo";

const IpoPage = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <CustomSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <Ipo />
      </main>
    </div>
  );
};

export default IpoPage;
