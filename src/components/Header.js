import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="left">
        <div className="logo">KlimateNet</div>
      </div>
      <div className="right">
        <div
          className="profile"
          onClick={() => setOpen(!open)}
          ref={dropdownRef}
        >
          <img
            src={user?.additionalUserInfo?.profilePicture}
            alt="user"
            style={{ objectFit: 'cover' }}
          />
          <span className="caret">▼</span>
          {open && (
            <div className="dropdown">
              <div className="dropdownUser">
                <img
                  src={user?.additionalUserInfo?.profilePicture}
                  alt="user"
                  style={{ objectFit: 'cover' }}
                />
                <span>{user?.additionalUserInfo?.username}</span>
              </div>
              <span style={{ fontSize: '14px', padding: '0px 15px' }}>{user?.email}</span>
              <div className="divider" />
              <div className="dropdownItem logout" onClick={handleLogout}>
                Sign out of KlimateNet
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
