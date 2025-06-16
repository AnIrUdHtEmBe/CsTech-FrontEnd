import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AddAgent from "./components/AddAgent";
import ViewAgents from "./components/ViewAgents";
import UploadCSV from "./components/UploadCSV";
import ViewTasks from "./components/ViewTasks";
import { isLoggedIn, removeToken } from "./utils/auth";
import './index.css';
import User from "./components/User";

function PrivateRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
 

  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/agents/add"
          element={
            <PrivateRoute>
              <AddAgent />
            </PrivateRoute>
          }
        />
        <Route
          path="/agents/view"
          element={
            <PrivateRoute>
              <ViewAgents />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/upload"
          element={
            <PrivateRoute>
              <UploadCSV />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/view"
          element={
            <PrivateRoute>
              <ViewTasks />
            </PrivateRoute>
          }
        />

        <Route 
          path="/user/profile"
          element={
            <PrivateRoute>
              <User />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
