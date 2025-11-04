import React, { useState } from "react";
import {
  MdHome,
  MdChat,
  MdWbSunny,
  MdShowChart,
  MdScience,
  MdPerson,
  MdMenu,
  MdClose,
  MdLogout,
  MdAccountCircle
} from "react-icons/md";
import "./Navbar.css";

export default function Navbar({
  route,
  onNavigate,
  isLoggedIn,
  userName,
  onRequestSignIn,
  onLogout
}) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItem = (name, icon, r) => (
    <button
      className={`nav-btn ${route === r ? "active" : ""}`}
      onClick={() => {
        onNavigate(r);
        setOpen(false);
      }}
    >
      {icon}
      <span>{name}</span>
    </button>
  );

  return (
    <nav className="nav">
      {/* Brand */}
      <div className="nav-left">
        <div className="logo">AM</div>
        <div className="title">AgriMithra</div>
      </div>

      {/* Desktop Menu */}
      <div className="nav-center">
        {navItem("Home", <MdHome />, "home")}
        {navItem("Assistant", <MdChat />, "assistant")}
        {navItem("Weather", <MdWbSunny />, "weather")}
        {navItem("Market", <MdShowChart />, "market")}
        {navItem("Disease", <MdScience />, "disease")}
      </div>

      {/* Profile Section */}
      <div className="nav-right">
        {!isLoggedIn ? (
          <button className="login-btn" onClick={onRequestSignIn}>
            Login
          </button>
        ) : (
          <div className="profile-box">
            <div
              className="profile-icon"
              onClick={() => setProfileOpen((p) => !p)}
            >
              <MdPerson />
            </div>

            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-name">
                  👨‍🌾 Farmer {userName}
                </div>

                <button
                  className="menu-item"
                  onClick={() => alert("Profile page coming soon!")}
                >
                  <MdAccountCircle /> My Profile
                </button>

                <button className="menu-item logout" onClick={onLogout}>
                  <MdLogout /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="hamburger"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        {open ? <MdClose /> : <MdMenu />}
      </button>

      {/* Mobile Menu Popup */}
      {open && (
        <div className="mobile-menu">
          {navItem("Home", <MdHome />, "home")}
          {navItem("Assistant", <MdChat />, "assistant")}
          {navItem("Weather", <MdWbSunny />, "weather")}
          {navItem("Market", <MdShowChart />, "market")}
          {navItem("Disease", <MdScience />, "disease")}

          {!isLoggedIn ? (
            <button className="login-btn mobile" onClick={onRequestSignIn}>
              Login
            </button>
          ) : (
            <>
              <div className="mobile-user">👨‍🌾 {userName}</div>
              <button className="menu-item logout" onClick={onLogout}>
                <MdLogout /> Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
