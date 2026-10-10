
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <span className="brand-icon">AI</span>
        <span>InterviewMate</span>
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/interview">Practice</NavLink>
      </nav>

      <div className="profile">
        <span className="profile-avatar">S</span>
        <span>Student</span>
      </div>
    </header>
  );
}
