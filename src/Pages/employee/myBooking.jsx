import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/myBooking.css";
import api from "../../api/axios"; // ✅ added
import Cookies from "js-cookie";

function MyBookings() {

  const location = useLocation();
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
const [user, setUser] = useState(null);
const [showCancelModal, setShowCancelModal] = useState(false);
const [bookingToCancel, setBookingToCancel] = useState(null);
const getInitialTab = () => {
  const params = new URLSearchParams(location.search);
  return params.get("tab") || "Upcoming";
};
const [activeTab, setActiveTab] = useState(getInitialTab());
  const [bookings, setBookings] = useState([]); // ✅ from API

  const tabs = ["Pending", "Upcoming", "History", "Cancelled", "Rejected", "All"];

  // ✅ FETCH BOOKINGS

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const tab = params.get("tab");

  if (tab) {
    setActiveTab(tab);
  }
}, [location.search]);

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


  const fetchBookings = async () => {
  try {
    const res = await api.get("/bookings/");

    const formatted = res.data.map((b) => ({
      id: b.id,
      room: b.room_name || "Room",
      status:
        b.status === "approved"
          ? "Confirmed"
          : b.status.charAt(0).toUpperCase() + b.status.slice(1),
      date: new Date(b.booking_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: `${b.start_time.slice(0,5)} - ${b.end_time.slice(0,5)}`,
      attendees: b.attendees,
      purpose: b.purpose,
    }));

    setBookings(formatted);

  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  fetchBookings();
}, []);

  const handleLogout = () => {
  Cookies.remove("token");
  window.location.href = "/login";
};

  // FILTER LOGIC
  const filteredBookings =
    activeTab === "All"
      ? bookings
      : bookings.filter((b) => 
          b.status === activeTab || 
          (activeTab === "Upcoming" && b.status === "Confirmed")
        );

        
  // STATUS STYLE
  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "status confirmed";
      case "Pending":
        return "status pending";
      case "Rejected":
        return "status rejected";
      case "Cancelled":
        return "status cancelled";
      default:
        return "status";
    }
  };

  return (
    <div>
      {/* 🔥 PAGE HEADER */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-title">My Bookings</div>
          <div className="header-subtitle">
            Track your room booking requests and reservation status
          </div>
        </div>

        <div className="header-right" ref={profileRef}>

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

      <div className="booking-container">

        {/* CARD */}
        <div className="tabs-container">

          {/* TABS */}
          <div className="tabs">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* CONTENT */}
          <div className="tab-content">

            {filteredBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"></div>
                <h3>No bookings found</h3>
                <p>You don't have any bookings in this category.</p>
                <button
                  className="empty-btn"
                  onClick={() => navigate("/employee/rooms")}
                >
                  Book a Room
                </button>
              </div>
            ) : (
              <div className="booking-list">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="booking-card">

                    <div className="booking-header">
  <div className="booking-title">
    <h3>{b.room}</h3>
    <span className={getStatusClass(b.status)}>
      {b.status}
    </span>
  </div>

  {(b.status === "Pending" || b.status === "Confirmed") && (
    <div className="booking-actions">

  {/* Pending → Edit + Cancel */}
  {b.status === "Pending" && (
    <>
<button
  className="edit-btn"
  onClick={() =>
    navigate(`/employee/edit-booking/${b.id}`)
  }
>
  Edit
</button>
      <button
  className="cancel-btn-red"
  onClick={() => {
    setBookingToCancel(b.id);
    setShowCancelModal(true);
  }}
>
  Cancel
</button>
    </>
  )}

  {/* Upcoming (Confirmed) → ONLY Cancel */}
  {b.status === "Confirmed" && (
    <button
  className="cancel-btn-red"
  onClick={() => {
    setBookingToCancel(b.id);
    setShowCancelModal(true);
  }}
>
  Cancel
</button>
  )}

</div>
  )}
</div>

                    <div className="booking-details">

                      <div>
                        <p className="label">Date</p>
                        <p>{b.date}</p>

                        <p className="label">Purpose</p>
                        <p>{b.purpose}</p>
                      </div>

                      <div>
                        <p className="label">Time</p>
                        <p>{b.time}</p>
                      </div>

                      <div>
                        <p className="label">Attendees</p>
                        <p>{b.attendees} people</p>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
      {/* 🔴 CANCEL MODAL */}
{showCancelModal && (
  <div className="mb-modal-overlay">
    <div className="mb-modal-box">

      <div className="mb-modal-header">
        <h3>Cancel Booking</h3>
      </div>

      <div className="mb-modal-body">
        <p>Are you sure you want to cancel this booking?</p>
      </div>

      <div className="mb-modal-actions">
        <button
          className="mb-modal-btn cancel"
          onClick={() => setShowCancelModal(false)}
        >
          No, Keep
        </button>

        <button
          className="mb-modal-btn confirm"
          onClick={async () => {
  try {
    await api.put(`/bookings/${bookingToCancel}/cancel`);

    alert("Booking cancelled");

    await fetchBookings();   // 🔥 correct way

    setShowCancelModal(false);
    setBookingToCancel(null);

  } catch (err) {
    console.log(err);
    alert("Failed to cancel");
  }
}}
        >
          Yes, Cancel
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}

export default MyBookings;