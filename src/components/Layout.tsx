import { ReactNode } from "react";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => {
  return (
    <div
      style={{
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Navbar />
      <div style={{ padding: "2em 2em" }}>{children}</div>
    </div>
  );
};
