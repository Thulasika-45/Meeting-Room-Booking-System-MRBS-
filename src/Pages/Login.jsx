import { useState } from "react";
import api from "../api/axios";
import Cookies from "js-cookie";
import "../styles/login.css";
import LeftImage from "../assets/Left_Panel.png";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ NEW

  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/auth/login", {
      email: email.trim(),
      password: password.trim(),
    });
if (res.data.access_token) {
  Cookies.set("token", res.data.access_token, {
    expires: 1,
  });
}

await new Promise((resolve) => setTimeout(resolve, 0));

if (res.data.force_change) {
  navigate("/change-password");
  return;
}

if (res.data.role === "admin") {
  navigate("/admin/dashboard");
} else {
  navigate("/employee/dashboard");
}

  } catch (err) {
    alert(err.response?.data?.detail || "Login failed");
  }
};

  return (
    <div className="login-page">
      <div className="image-half">
        <img src={LeftImage} alt="" />
        <div className="left-bottom">
          <div className="meetbold">
            <b>Meet without the mess</b>
          </div>
          <div className="smallleft">
            See what's free. Book instantly. Stay conflict-free
          </div>
        </div>
      </div>

      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h3>Log in</h3>

          <div className="form-group">
            <label>Email</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
          </div>

          {/* 🔥 UPDATED PASSWORD FIELD */}
          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}   // ✅ toggle
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              required
            />

            <span
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "X" : "👁"}
            </span>
          </div>

          <button className="login-button" type="submit">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;