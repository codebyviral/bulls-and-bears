import { CustomSidebar, ViewStock } from "../Components";

const ViewStockPage = () => {
  return (
    <>
      <div className="flex h-screen">
        <div className="flex-shrink-0">
          <CustomSidebar />
        </div>
        <div className="flex-1 overflow-auto">
          <ViewStock />
        </div>
      </div>
    </>
  );
};

export default ViewStockPage;
