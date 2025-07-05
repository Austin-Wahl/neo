import { PuffLoader } from "react-spinners";

const ConnectionWindowLoadingPage = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <PuffLoader size={16} color="white" />
    </div>
  );
};

export default ConnectionWindowLoadingPage;
