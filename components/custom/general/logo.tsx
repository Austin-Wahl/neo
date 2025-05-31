"use client";
import { useTheme } from "next-themes";
import Image from "next/image";

const Logo = () => {
  const { theme, systemTheme } = useTheme();

  if (theme === "dark" || theme === undefined || systemTheme === "dark")
    return (
      <Image
        alt="Neo Logo"
        src="/images/logos/logo-light.png"  
        width={40}
        height={40}
      />
    );

  return (
    <Image alt="Neo Logo" src="/images/logos/logo.png" width={40} height={40} />
  );
};

export default Logo;
