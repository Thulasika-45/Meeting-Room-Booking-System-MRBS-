import "../../styles/adminDashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Cookies from "js-cookie";


function AdminDashboard() {

  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [user, setUser] = useState(null);

useEffect(() => {
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
  try {
    Cookies.remove("token");
  } catch (e) {
    console.log("Cookie error:", e);
  }
  window.location.href = "/login";
};

  useEffect(() => {
    const fetchData = async () => {
      try {

        const roomsRes = await api.get("/rooms/");
        setRooms(roomsRes.data);

        // ✅ IMPORTANT CHANGE
        const bookingsRes = await api.get("/bookings/all");
        console.log(bookingsRes)
        setBookings(bookingsRes.data);

      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  // ✅ DERIVED DATA (NO UI CHANGE)
  const pending = bookings.filter(b => b.status === "pending");

  const recent = [...bookings]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  
  const handleStatusUpdate = async (id, status) => {
  try {
    await api.put(`/bookings/${id}/status`, null, {
      params: { status },
    });

    // ✅ update UI instantly
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, status } : b
    );
    
    setBookings(updated);
    

  } catch (err) {
    console.log(err);
  }
};

  return (
    <div>
      {/* 🔥 TOP HEADER */}
<div className="admin-top-header">

  <div className="admin-top-left">
    Welcome back, {user?.name}
  </div>

  <div className="admin-top-right">

  <div
    className="profile-circle"
    onClick={() => setShowProfile(prev => !prev)}
  >
    {user?.name?.charAt(0) || "A"}
  </div>

  {showProfile && (
    <div className="profile-dropdown">

      <div className="profile-info">
        <div className="profile-name">{user?.name}</div>
        <div className="profile-email">{user?.email}</div>
        <span className="profile-role">Admin</span>
      </div>

      <div className="profile-divider"></div>

      <div className="profile-logout" onClick={handleLogout}>
        Logout
      </div>

    </div>
  )}

</div>

</div>
    <div className="adminDash-container">

      <h2>Admin Dashboard</h2>
      <p className="adminDash-sub">
        Monitor and manage meeting room bookings
      </p>

      {/* STATS */}
      <div className="adminDash-stats">

        <div className="adminDash-statCard">
          <div className="icon">🏢</div>
          <h3>{rooms.length}</h3>
          <p>Total Rooms</p>
        </div>

        <div className="adminDash-statCard">
          <div className="icon">✔️</div>
          <h3>{rooms.filter(r => r.status === "active").length}</h3>
          <p>Active Rooms</p>
        </div>

        <div className="adminDash-statCard">
          <div className="icon">📅</div>
          <h3>{bookings.length}</h3>
          <p>Total Bookings</p>
        </div>

        <div className="adminDash-statCard">
          <div className="icon">📊</div>
          <h3>0%</h3>
          <p>Utilization</p>
        </div>

      </div>

      {/* PENDING APPROVALS */}
      <div className="adminDash-card">
        <div className="card-header">
          <h3>Pending Approvals</h3>
          <span className="view-all" onClick={() => navigate("/admin/approvals")}>View All →</span>
        </div>

        {pending.map((p, i) => (
          <div className="pending-item" key={i}>
            <div>
              <div className="pending-title">
                {p.room_name} <span className="badge pending">Pending</span>
              </div>
              <div className="pending-sub">
                {p.user_name} • {p.booking_date} • {p.start_time.slice(0,5)} - {p.end_time.slice(0,5)}
              </div>
            </div>

            <div className="pending-actions">
              <button
                className="approve"
                onClick={() => handleStatusUpdate(p.id, "approved")}
              >
                Approve
              </button>

              <button
                className="reject"
                onClick={() => handleStatusUpdate(p.id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT BOOKINGS */}
      <div className="adminDash-card">
        <div className="card-header">
          <h3>Recent Bookings</h3>
          <span className="view-all" onClick={() => navigate("/admin/bookings")}>View All →</span>
        </div>

        <table className="recent-table">
          <thead>
            <tr>
              <th>ROOM</th>
              <th>BOOKED BY</th>
              <th>DATE</th>
              <th>TIME</th>
              <th>PURPOSE</th>
            </tr>
          </thead>

          <tbody>
            {recent.map((r, i) => (
              <tr key={i}>
                <td>{r.room_name}</td>
                <td>{r.user_name}</td>
                <td>{r.booking_date}</td>
                <td>{r.start_time.slice(0,5)} - {r.end_time.slice(0,5)}</td>
                <td>{r.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      </div>
    </div>
  );
}

export default AdminDashboard;