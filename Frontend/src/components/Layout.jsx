// src/components/Layout.jsx
import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Layout;
