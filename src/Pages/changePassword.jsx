import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/changePassword.css";
import api from "../api/axios";
import Cookies from "js-cookie";

function ChangePassword() {
  const navigate = useNavigate();

  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showTemp, setShowTemp] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    // ✅ CORRECT API CALL (MATCHES BACKEND)
    await api.post("/auth/change-password", {
      old_password: tempPassword,   
      new_password: newPassword,
      confirm_password:confirmPassword
    });

    // after success
alert("Password changed successfully");

// 🔥 REMOVE OLD TOKEN (VERY IMPORTANT)
Cookies.remove("token");

// redirect
navigate("/login");


  } catch (err) {
    alert(err.response?.data?.detail || "Error changing password");
  }
};

  return (
    <div className="change-page">

      <div className="change-card">
        <h2>Change Password</h2>
        <p>Please change your temporary password to continue</p>

        <form onSubmit={handleSubmit}>

          {/* TEMP PASSWORD */}
          <div className="form-group">
            <label>Temporary Password</label>
            <div className="input-wrapper">
              <input
                type={showTemp ? "text" : "password"}
                placeholder="Enter temporary password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowTemp(!showTemp)}>
                {showTemp ? "X" : "👁"}
              </span>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowNew(!showNew)}>
                {showNew ? "X" : "👁"}
              </span>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? "X" : "👁"}
              </span>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="btn-group">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/login")}
            >
              Cancel
            </button>

            <button type="submit" className="confirm-btn">
              Confirm Changes
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

export default ChangePassword;