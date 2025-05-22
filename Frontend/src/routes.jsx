import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BillPage from "./pages/BillPage";
import CustomOrderPage from "./pages/CustomOrderPage";
import TransactionPage from "./pages/TransactionPage";
import HistoryPage from "./pages/HistoryPage";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

// Guards
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? (
    <Navigate to="/bill" replace />
  ) : (
    <Navigate to="/signup" replace />
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<Root />} />

      {/* Protected with Navbar layout */}
      <Route
        path="/bill"
        element={
          <PrivateRoute>
            <Layout>
              <BillPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/custom-order"
        element={
          <PrivateRoute>
            <Layout>
              <CustomOrderPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/transaction"
        element={
          <PrivateRoute>
            <Layout>
              <TransactionPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <Layout>
              <HistoryPage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
