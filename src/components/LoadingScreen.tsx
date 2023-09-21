import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

export const LoadingScreen: React.FC = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    }}
  >
    <CircularProgress color="primary" />
    <p style={{ marginTop: "16px" }}>Cargando...</p>
  </div>
);
