import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/adminRooms.css";
import api from "../../api/axios";
import Cookies from "js-cookie";

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms/");
        console.log(res)

        const formatted = res.data.map((room) => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          amenities: room.amenities || [],
          active: room.status === "active",
          location:room.location
        }));
        console.log(formatted)

        setRooms(formatted);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRooms();
  }, []);

  // 🔥 TOGGLE ACTIVE / INACTIVE
  const handleToggleStatus = async (room) => {
    try {
      const newStatus = room.active ? "inactive" : "active";

      await api.patch(`/rooms/${room.id}`, {
        status: newStatus,
      });

      // ✅ update UI based on backend
      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id ? { ...r, active: !r.active } : r
        )
      );
    } catch (err) {
      console.log(err.response);
      alert(err.response?.data?.detail || "Error updating room");
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
  Cookies.remove("token");
  window.location.href = "/login";
};

  return (
    <div>
      {/* 🔥 HEADER */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-title">Room Management</div>
          <div className="admin-subtitle">
            Add, edit, and manage meeting rooms
          </div>
        </div>

        <div className="admin-header-right">
  <button
    className="add-room-btn"
    onClick={() => navigate("/admin/rooms/add")}
  >
    + Add New Room
  </button>
  
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

      <div className="admin-rooms-container">

        {/* SEARCH */}
        <div className="rooms-search">
          <input
            type="text"
            placeholder="Search rooms by name or amenities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* COUNT */}
        <div className="rooms-count">
          Showing {filteredRooms.length} rooms
        </div>

        {/* ROOMS */}
        <div className="rooms-list">
          {filteredRooms.map((room) => (
            <div key={room.id} className="room-card-admin">

              {/* HEADER */}
              <div className="room-header-admin">
                <div className="room-title-admin">
                  {room.name}
                  <span className="status-badge-admin">
                    {room.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="room-actions-admin">
                  <button
                    className="edit-btn-admin"
                    onClick={() =>
                      navigate(`/admin/rooms/${room.id}/edit`)
                    }
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* DETAILS */}
              <div className="room-details-admin">
                <div>
                  <span>Capacity</span>
                  <b>{room.capacity} people</b>
                </div>

                <div>
                  <span>Location</span>
                  <b>{room.location}</b>
                </div>
              </div>

              {/* AMENITIES */}
              <div className="room-amenities-admin">
                <span className="label">Amenities</span>

                <div className="tags">
                  {room.amenities.map((a, i) => (
                    <span key={i}>{a}</span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AdminRooms;