import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../../styles/empRoomdetails.css";
import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import Cookies from "js-cookie";

function RoomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [showProfile, setShowProfile] = useState(false);
const [user, setUser] = useState(null);
const profileRef = useRef(null);
// console.log(location.state)
  const [room, setRoom] = useState(location.state || null);
  // console.log(room)
  const [loading, setLoading] = useState(!location.state);

  // ✅ NEW STATE
  const [availability, setAvailability] = useState([]);
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
  Cookies.remove("token");
  window.location.href = "/login";
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
    const fetchRoom = async () => {
      try {
        console.log(room)
        

        if (!room) {
          const res = await api.get(`/rooms/${id}`);
          
          

          setRoom({
            id: res.data.id,
            name: res.data.name,
            capacity: res.data.capacity,
            floor: res.data.floor,
            building: res.data.building,
            available: res.data.status === "active",
            features: res.data.amenities || [],
          });
          
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

useEffect(() => {
  const fetchAvailability = async () => {
    try {
      const res = await api.get(`/bookings/room/${id}`);

      const today = new Date().toISOString().split("T")[0];

      const todaysBookings = res.data.filter(
        (b) => b.booking_date === today
      );

      setAvailability(todaysBookings);

    } catch (err) {
      console.log(err);
    }
  };

  fetchAvailability();
}, [id]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!room) {
    return (
      <div style={{ padding: "20px" }}>
        Room not found. Please go back.
        <br />
        <button onClick={() => navigate("/employee/rooms")}>
          Go to Rooms
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="room-header-top">
        <div className="room-header-left">
          <div className="room-title">{room?.name || "Room Name"}</div>

          <div className="room-subtitle">
            {room?.floor} • {room?.building || "Main Building"}
          </div>
        </div>

        <div className="room-header-right" ref={profileRef}>

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

      <div className="details-container">

        <div className="details-back" onClick={() => navigate(-1)}>
          ← Back to Rooms
        </div>

        <div className="details-card">

          <div className="details-badge">
            {room?.status ? "Available" : "Unavailable"}
          </div>

          <div className="details-flex">

            <div className="details-left">
              <h3>Room Details</h3>
              <div>Capacity: {room?.capacity} people</div>
              <div>{room?.location}</div>
            </div>

            <div className="details-right">
              <h3>Amenities</h3>
              <div className="details-tags">
                {room?.amenities ?.map((a, i) => (
                  <span key={i}>{a}</span>
                ))}
              </div>
            </div>

          </div>

          <div className="details-btn-wrap">
            <button
              className="details-btn"
              onClick={() =>
                navigate(`/employee/rooms/${room.id}/book`, { state: room })
              }
            >
              Book This Room
            </button>
          </div>

        </div>

        {/* ✅ UPDATED SCHEDULE */}
        <div className="details-schedule">
          <h3>Today's Schedule</h3>

          {availability.length === 0 ? (
  <div>No bookings for today</div>
) : (
  <div className="schedule-slots">
    {availability.map((slot, index) => (
      <div key={index} className="slot booked">
        {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
      </div>
    ))}
  </div>
)}

        </div>

      </div>

      
    </div>
  );
}

export default RoomDetails;