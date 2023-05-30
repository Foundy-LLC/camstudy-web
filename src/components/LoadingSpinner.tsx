import { CircularProgress } from "@mui/material";
import React from "react";

export function LoadingSpinner() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <CircularProgress
        style={{
          alignItems: "center",
          verticalAlign: "middle",
          margin: "auto",
        }}
      />
    </div>
  );
}
