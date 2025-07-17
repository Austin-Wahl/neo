"use client";
import { Button } from "@/components/ui/button";
import useTestConnection from "@/hooks/use-test-connection";
import { Plug } from "lucide-react";
import React from "react";
import { ButtonHTMLAttributes, useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

const TestConnectionButton = ({
  id,
  children,
}: {
  id: string;
  children?: React.ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
}) => {
  const { loading, status, testConnection } = useTestConnection();
  const [flashColor, setFlashColor] = useState<null | string>(null);

  useEffect(() => {
    if (status === "failed") {
      setFlashColor(children ? "text-red-500" : "bg-red-500 text-primary");
      setTimeout(() => {
        setFlashColor(null);
      }, 2000);
    } else if (status === "success") {
      setFlashColor(children ? "text-green-500" : "bg-green-500 text-primary");
      setTimeout(() => {
        setFlashColor(null);
      }, 2000);
    } else {
      setFlashColor(null);
    }
  }, [children, status]);

  if (children) {
    return React.cloneElement(children, {
      onClick: (e) => {
        e.preventDefault();
        testConnection(id);
      },
      disabled: loading,
      className: flashColor ?? "",
      children: (
        <>
          {loading ? (
            <PuffLoader color="white" size={16} />
          ) : (
            React.Children.toArray(children.props.children)[0]
          )}
          {React.Children.toArray(children.props.children)[1]}
        </>
      ),
    });
  }

  return (
    <Button
      onClick={() => testConnection(id)}
      disabled={loading}
      className={`transition-all ${flashColor}`}
    >
      {loading ? <PuffLoader size={20} /> : <Plug />}Test Connection
    </Button>
  );
};

export default TestConnectionButton;
