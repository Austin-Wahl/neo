import { PulseLoader } from "react-spinners";

const SplashScreen = () => {
  return (
    <div className="top-0 left-0 w-screen h-screen min-h-[500px] flex items-center justify-center fixed z-[100] bg-background">
      <div className="flex flex-col gap-6 items-center justify-center">
        <p className="text-8xl font-extralight">Studio</p>
        <PulseLoader color="var(--foreground)" size={12} />
      </div>
    </div>
  );
};

export default SplashScreen;
