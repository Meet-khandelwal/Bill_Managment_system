// src/components/Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const linkClass =
    "px-4 py-2 rounded hover:bg-blue-100 transition duration-200";

  const activeClass = "bg-blue-500 text-white";

  return (
    <nav className="bg-white shadow mb-4">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex gap-4">
          <NavLink
            to="/bill"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Bill
          </NavLink>
          <NavLink
            to="/custom-order"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Custom Order
          </NavLink>
          <NavLink
            to="/transaction"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Transaction
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            History
          </NavLink>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
