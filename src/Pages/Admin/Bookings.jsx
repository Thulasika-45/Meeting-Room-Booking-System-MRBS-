import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/adminBookings.css";
import Cookies from "js-cookie";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

 useEffect(() => {
  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/all"); // ✅ CORRECT API

      const formatted = res.data.map((b) => ({
        id: b.id,
        room: b.room_name || "Room",
        name: b.employee_name || "User",
        email: b.user?.email || "",
        date: b.booking_date,
        time: `${b.start_time.slice(0,5)} - ${b.end_time.slice(0,5)}`,
        attendees: b.attendees,
        status:
          b.status === "approved"
            ? "confirmed"
            : b.status, // keep same format as your UI
      }));

      setBookings(formatted);
      setFiltered(formatted);

    } catch (err) {
      console.log(err.response);
    }
  };

  fetchBookings();
}, []);

  useEffect(() => {
    let temp = [...bookings];

    // Search filter
    if (search) {
      temp = temp.filter(
        (b) =>
          b.room.toLowerCase().includes(search.toLowerCase()) ||
          b.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (status !== "all") {
      temp = temp.filter((b) => b.status === status);
    }

    // Date filter
    const today = new Date();

    if (dateFilter === "today") {
      temp = temp.filter(
        (b) => new Date(b.date).toDateString() === today.toDateString()
      );
    }

    if (dateFilter === "upcoming") {
      temp = temp.filter((b) => new Date(b.date) > today);
    }

    if (dateFilter === "past") {
      temp = temp.filter((b) => new Date(b.date) < today);
    }

    setFiltered(temp);
  }, [search, status, dateFilter, bookings]);

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status confirmed";
      case "pending":
        return "status pending";
      case "rejected":
        return "status rejected";
      case "cancelled":
        return "status cancelled";
      default:
        return "status";
    }
  };

  const handleLogout = () => {
  Cookies.remove("token");
  window.location.href = "/login";
};

  return (
    <div>
      {/* 🔥 HEADER */}
<div className="admin-top-header">

  <div className="admin-header-left">
    <div className="admin-title">All Bookings</div>
    <div className="admin-subtitle">
      View and manage all meeting room bookings
    </div>
  </div>

  <div className="admin-header-right">

    <div
      className="profile-circle"
      onClick={() => setShowProfile((prev) => !prev)}
    >
      AU
    </div>

    {showProfile && (
      <div className="profile-dropdown">

        <div className="profile-info">
          <div className="profile-name">Admin User</div>
          <div className="profile-email">admin@company.com</div>
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
    <div className="admin-bookings-container">

      {/* FILTERS */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search by name or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* COUNT */}
      <div className="booking-count">
        Showing {filtered.length} bookings
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>BOOKING ID</th>
              <th>ROOM</th>
              <th>BOOKED BY</th>
              <th>DATE</th>
              <th>TIME</th>
              <th>ATTENDEES</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>#{b.id}</td>
                <td>{b.room}</td>

                <td>
                  <div>{b.name}</div>
                  <div className="email">{b.email}</div>
                </td>

                <td>{b.date}</td>
                <td>{b.time}</td>
                <td>{b.attendees}</td>

                <td>
                  <span className={getStatusClass(b.status)}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
    </div>
  );
}

export default Bookings;