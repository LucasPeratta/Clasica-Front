import { ReactNode } from "react";
import Navbar from "./Navbar";

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      }}
    >
      <Navbar />
      {/* Quitamos padding y el margen blanco entre navbar y contenido */}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};
