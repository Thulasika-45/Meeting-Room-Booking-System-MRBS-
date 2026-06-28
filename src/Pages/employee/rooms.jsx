import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/empBrowserooms.css";
import api from "../../api/axios";
import Cookies from "js-cookie";


function Rooms() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const profileRef = useRef(null);
  const [filters, setFilters] = useState({
    search: "",
    capacity: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    vacantOnly: false,
  });

  useEffect(() => {
  const fetchUser = async () => {
    const res = await api.get("/auth/users/me");
    setUser(res.data);
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


  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms/");
        // console.log(res.data)

        const formatted = res.data.map((room) => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          location: room.location,
          status: room.status,
          amenities: room.amenities || [],
          slots: [],
        }));

        setRooms(formatted);
        setFilteredRooms(formatted);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
  };

useEffect(() => {
  const filterRooms = async () => {
    try {
      let temp = [...rooms];

      // 🔍 SEARCH
      if (filters.search) {
        temp = temp.filter((room) =>
          room.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // 👥 CAPACITY
      if (filters.capacity) {
        temp = temp.filter(
          (room) => room.capacity >= Number(filters.capacity)
        );
      }

      // 🔥 VACANCY CHECK (REAL API USED)
      if (filters.vacantOnly && filters.date) {
        const availableRooms = [];

        for (let room of temp) {
          const res = await api.get(`/bookings/room/${room.id}`);

          const bookings = res.data;

          const isBooked = bookings.some((b) => {
            if (b.booking_date !== filters.date) return false;

            return !(
              filters.endTime <= b.start_time ||
              filters.startTime >= b.end_time
            );
          });

          if (!isBooked) {
            availableRooms.push(room);
          }
        }

        temp = availableRooms;
      }

      setFilteredRooms(temp);

    } catch (err) {
      console.log(err);
    }
  };

  filterRooms();
}, [filters, rooms]);

  const handleLogout = () => {
  Cookies.remove("token");
  window.location.href = "/login";
};

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
  <div className="header-left">
    <div className="header-title">Browse Meeting Rooms</div>
    <div className="header-subtitle">
      Find and book the perfect room for your meeting
    </div>
  </div>

  <div className="header-right" ref={profileRef}>

    <div
      className="profile-circle"
      onClick={() => setShowProfile(prev => !prev)}
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

      <div className="browse-container">

        {/* FILTER */}
        <div className="filters">
          <div className="filter-row">
            <input
              type="text"
              name="search"
              placeholder="Search by name or amenities..."
              onChange={handleChange}
              className="filter-input search"
            />

            <select name="capacity" onChange={handleChange} className="filter-input">
              <option value="">All Capacities</option>
              <option value="10">Small (1-10)</option>
              <option value="20">Medium (11-25)</option>
              <option value="50">Large (26+)</option>
            </select>

            <input type="date" name="date" onChange={handleChange} className="filter-input" />
          </div>

          <div className="filter-row">
            <div className="time-group">
  <label>Start Time</label>
  <input
    type="time"
    name="startTime"
    value={filters.startTime}
    onChange={handleChange}
  />
</div>

<div className="time-group">
  <label>End Time</label>
  <input
    type="time"
    name="endTime"
    value={filters.endTime}
    onChange={handleChange}
  />
</div>

            {/* <label className="checkbox">
              <input type="checkbox" name="vacantOnly" onChange={handleChange} />
              Vacant Only
            </label> */}
          </div>
        </div>

        {/* COUNT */}
        <div className="room-count">
          Showing {filteredRooms.length} rooms
        </div>

        {/* ROOMS */}
        <div className="rooms-grid">
          {filteredRooms.map((room) => {
            const visibleAmenities = (room.amenities || []).slice(0, 3);
            const extraCount = (room.amenities || []).length - 3;

            return (
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
                  {visibleAmenities.map((item, i) => (
                    <span key={i}>{item}</span>
                  ))}
                  {extraCount > 0 && <span className="extra">+{extraCount}</span>}
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
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Rooms;