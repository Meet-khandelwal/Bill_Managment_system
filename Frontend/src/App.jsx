// src/App.jsx
import React from "react";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";

const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>
  );
};

export default App;
