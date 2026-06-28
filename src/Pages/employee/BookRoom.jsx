import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "../../styles/empBookroom.css";
import api from "../../api/axios"; 
import Cookies from "js-cookie";

function BookRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
const [user, setUser] = useState(null);
  const room = location.state;
  const profileRef = useRef(null);

  const [date, setDate] = useState("DD-MM-YYYY");
  const [attendees, setAttendees] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [purpose, setPurpose] = useState("");

  // 🔥 GENERATE 30-MIN SLOTS
  const generateTimeOptions = () => {
    const times = [];
    let start = 8;

    while (start < 20) {
      const h = Math.floor(start);
      const m = start % 1 === 0 ? "00" : "30";

      times.push(`${String(h).padStart(2, "0")}:${m}`);
      start += 0.5;
    }

    return times;
  };

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setShowProfile(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  useState(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/users/me");
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  fetchUser();
}, []);

const handleLogout = () => {
  Cookies.remove("token");
  window.location.href = "/login";
};

  const timeOptions = generateTimeOptions();

  // ✅ UPDATED API CALL
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        room_id: Number(id),
        booking_date: date,        // ✅ important (backend expects this)
        start_time: startTime,
        end_time: endTime,
        attendees: Number(attendees),
        purpose: purpose,
      };

      await api.post("/bookings/", payload);
      console.log("hlo2")

      // 👉 redirect to pending bookings
      navigate("/employee/my-bookings?tab=Pending");

    } catch (err) {
      console.log(err.response);
      alert(err.response?.data?.detail || "Error creating booking");
    }
  };

  // fallback
  if (!room) {
    return (
      <div style={{ padding: "20px" }}>
        Room data missing. Go back and try again.
        <br />
        <button onClick={() => navigate("/employee/rooms")}>
          Go to Rooms
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 🔥 HEADER */}
      <div className="book-header-top">

        <div className="book-header-left">
          <div className="book-title">
            Book {room?.name || "Room"}
          </div>

          <div className="book-subtitle">
            Complete the form to reserve this meeting room
          </div>
        </div>

        <div className="book-header-right" ref={profileRef}>

  <div
    className="profile-circle"
    onClick={() => setShowProfile(!showProfile)}
  >
    {user?.name?.charAt(0) || "U"}
  </div>

  {showProfile && (
    <div className="profile-dropdown">

      <div className="profile-info">
        <div className="profile-name">{user?.name}</div>
        <div className="profile-email">{user?.email}</div>
        <span className="profile-role">Employee</span>
      </div>

      <div className="profile-divider"></div>

      <div className="profile-logout" onClick={handleLogout}>
        Logout
      </div>

    </div>
  )}

</div>

      </div>

      <div className="book-container">

        {/* BACK */}
        <div
          className="book-back"
          onClick={() => navigate(-1)}
        >
          ← Back to Room Details
        </div>

        {/* CARD */}
        <div className="book-card">

          <form onSubmit={handleSubmit}>

            {/* ROW 1 */}
            <div className="form-row">

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Number of Attendees</label>
                <input
                  type="number"
                  placeholder="Enter number of attendees"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                />
              </div>

            </div>

            {/* ROW 2 */}
            <div className="form-row">

              <div className="form-group">
                <label>Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {timeOptions.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {timeOptions.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* PURPOSE */}
            <div className="form-group">
              <label>Meeting Purpose</label>
              <textarea
                placeholder="Describe the purpose of this meeting"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            {/* BUTTONS */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>

              <button type="submit" className="confirm-btn">
                Confirm Booking
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default BookRoom;