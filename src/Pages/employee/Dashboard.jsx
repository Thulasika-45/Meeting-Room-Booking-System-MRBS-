import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import "../../styles/empdashboard.css";
import Cookies from "js-cookie";

function EmpDashboard() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [myBookings, setMyBookings] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login");
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, bookingsRes, userRes] = await Promise.all([
          api.get("/rooms/"),
          api.get("/bookings/"),
          api.get("/auth/users/me")
        ]);
      
        setRooms(roomsRes.data);
        setMyBookings(bookingsRes.data.length);
        setUser(userRes.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-wrapper">

      {/* HEADER */}
      <div className="top-header">
        <div className="header-left">
  <div className="welcome-text">
    Welcome back, {user?.name}
  </div>
  </div>

  <div className="header-right" ref={profileRef}>

    <div
      className="profile-circle"
      onClick={() => setShowProfile((prev) => !prev)}
    >
      {user?.name?.charAt(0) || "U"}
    </div>

    {showProfile && (
      <div className="profile-dropdown">

        <div className="profile-info">
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          <span className="profile-role">{user?.role}</span>
        </div>

        <div className="profile-divider"></div>

        <div className="profile-logout" onClick={handleLogout}>
          Logout
        </div>

      </div>
    )}

  </div>
</div>

      <div className="dashboard-container">

        {/* TITLE */}
        <div className="dashboardtext">
          <div className="dashboardHead">Dashboard</div>
          <div className="dashboardSub">
            Welcome to your meeting room booking dashboard
          </div>
        </div>

        {/* STATS */}
        <div className="stats">

          <div className="stat-card" onClick={() => navigate("/employee/rooms")}>
            <div>
              <div className="stat-title">Available Rooms</div>
              <div className="stat-number">{rooms.length}</div>
            </div>
            <div className="stat-icon">
              <img src="/building.svg" alt="" />
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate("/employee/my-bookings")}>
            <div>
              <div className="stat-title">My Bookings</div>
              <div className="stat-number">{myBookings}</div>
            </div>
            <div className="stat-icon">
              <img src="/calendar.svg" alt="" />
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate("/employee/my-bookings")}>
            <div>
              <div className="stat-title">Today's Bookings</div>
              <div className="stat-number">{myBookings}</div>
            </div>
            <div className="stat-icon orange">
              <img src="/clock.svg" alt="" />
            </div>
          </div>

        </div>

        {/* FILTER */}
        {/* <div className="filter-section">

          <div className="filter-btn" onClick={() => setShowFilter(!showFilter)}>
            <span>Filter by Amenities</span>
            <span className={`arrow ${showFilter ? "open" : ""}`}>⌄</span>
          </div>

          {showFilter && (
            <div className="filter-dropdown">
              <div className="filter-title">Select Amenities</div>

              <div className="filter-options">
                <label className="filter-item"><input type="checkbox" /> Projector</label>
                <label className="filter-item"><input type="checkbox" /> Whiteboard</label>
                <label className="filter-item"><input type="checkbox" /> TV Display</label>
                <label className="filter-item"><input type="checkbox" /> Video Conference</label>
              </div>
            </div>
          )}
        </div> */}

        {/* POPULAR ROOMS */}
        <div className="populardash">

          <div className="popularview">
            <div className="populartext">Popular Rooms</div>
            <Link to="/employee/rooms" className="view-link">
              View All →
            </Link>
          </div>

          <div className="rooms-grid">

            {rooms.map((room) => (
              <div
                key={room.id}
                className="room-card"
                onClick={() =>
                  navigate(`/employee/rooms/${room.id}`, { state: room })
                }
              >

                <div className="room-header">
                  <div className="room-title">{room.name}</div>
                  <span className="badge">Available</span>
                </div>

                <div className="room-info">
                  <div className="room-meta">👥 {room.capacity} people</div>
                  <div className="room-meta">🏢 {room.location}</div>
                </div>

                <div className="room-tags">
                  {(room.amenities || []).slice(0, 3).map((item, i) => (
                    <span key={i}>{item}</span>
                  ))}
                  {(room.amenities || []).length > 2 && (
                    <span>+{room.amenities.length - 3}</span>
                  )}
                </div>

                {/* <div className="time-slots">
                  <span>09:00-10:00 ✓</span>
                  <span>10:00-11:30 ✓</span>
                  <span>12:00-14:00 ✓</span>
                </div> */}

                <button
                  className="book-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/employee/rooms/${room.id}/book`, {
                      state: room,
                    });
                  }}
                >
                  Book Now
                </button>

              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}

export default EmpDashboard;