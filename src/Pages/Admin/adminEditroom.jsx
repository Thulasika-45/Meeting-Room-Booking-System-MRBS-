import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/adminEditRoom.css";
import api from "../../api/axios";

function AdminEditRoom() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [room, setRoom] = useState({
    name: "",
    capacity: "",
    location: "", 
    status: "Active",
    amenities: [],
  });

  const [allAmenities, setAllAmenities] = useState([]);

  useEffect(() => {
  const fetchAmenities = async () => {
    try {
      const res = await api.get("/amenities/");
      setAllAmenities(res.data); // [{id, name}]
    } catch (err) {
      console.log(err);
    }
  };

  fetchAmenities();
}, []);


  useEffect(() => {
  const fetchRoom = async () => {
    try {
      const res = await api.get(`/rooms/${id}`);
const amenityRes = await api.get("/amenities/");

const amenityMap = {};
amenityRes.data.forEach(a => {
  amenityMap[a.name.toLowerCase()] = a.id;
});

setRoom({
  name: res.data.name,
  capacity: res.data.capacity,
  location: res.data.location,
  status: res.data.status === "active" ? "Active" : "Inactive",
amenities: (res.data.amenities || [])
  .map(name => amenityMap[name.toLowerCase()])
  .filter(id => typeof id === "number"),  // ✅ IMPORTANT
});
      // console.log(room)

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.detail || "Error fetching room");
    }
  };

  fetchRoom();
}, [id]);

const toggleAmenity = (id) => {
  setRoom((prev) => ({
    ...prev,
    amenities: prev.amenities.includes(id)
      ? prev.amenities.filter((a) => a !== id)
      : [...prev.amenities, id],
  }));
};

console.log(room);
console.log(room.amenities);

const handleSave = async () => {
  try {
    const payload = {};

    if (room.name?.trim()) {
      payload.name = room.name.trim();
    }

    if (room.capacity && Number(room.capacity) > 0) {
      payload.capacity = Number(room.capacity);
    }

    if (room.location) {
      payload.location = room.location.trim().toLowerCase();
    }

    if (room.status) {
      payload.status = room.status.toLowerCase();
    }

    if (room.amenities?.length > 0) {
      payload.amenities = room.amenities.filter(
        (a) => typeof a === "number"
      );
    }

    console.log("FINAL PAYLOAD:", payload); // 🔥 DEBUG

    await api.patch(`/rooms/${id}`, payload);

    alert("Room updated successfully");
    navigate("/admin/rooms");

  } catch (err) {
    console.log("ERROR:", err.response?.data);
    alert(err.response?.data?.detail || "Error updating room");
  }
};

  return (
    <div>
      {/* 🔥 HEADER */}
<div className="editroom-header">
  <div className="editroom-header-left">
    <div className="editroom-title">
      Edit Room - {room?.name}
    </div>

    <div className="editroom-subtitle">
      Update meeting room details
    </div>
  </div>

  <div className="editroom-header-right">
    <div className="editroom-avatar">AU</div>
  </div>
</div>
    <div className="edit-room-container">

      {/* BACK */}
      <div
        className="edit-back"
        onClick={() => navigate("/admin/rooms")}
      >
        ← Back to Room Management
      </div>

      {/* CARD */}
      <div className="edit-card">

        <div className="form-grid">

          <div className="form-group">
            <label>Room Name</label>
            <input
              value={room.name}
              onChange={(e) =>
                setRoom({ ...room, name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              value={room.capacity}
              onChange={(e) =>
                setRoom({ ...room, capacity: e.target.value })
              }
            />
          </div>

<div className="form-group">
  <label>Location</label>
  <input
    value={room.location}
    readOnly
  />
</div>

<div className="form-group">
  <label>Status</label>
  <select
    value={room.status}
    onChange={(e) =>
      setRoom({ ...room, status: e.target.value })
    }
  >
    <option>Active</option>
    <option>Inactive</option>
  </select>
</div>
</div>

        {/* AMENITIES */}
        <div className="form-group full">
          <label>Amenities</label>

          <div className="amenities-grid">
{allAmenities.map((item) => (
  <label key={item.id} className="amenity-box">
    <input
      type="checkbox"
      checked={room.amenities.includes(item.id)}
      onChange={() => toggleAmenity(item.id)}
    />
    {item.name}
  </label>
))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          {/* <div className="save-btn">Delete Room</div> */}
          <div>
          <button
            className="cancel-btn"
            onClick={() => navigate("/admin/rooms")}
          >
            Cancel
          </button>

          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
          </div>
        </div>

      </div>

    </div>
    </div>
  );
}

export default AdminEditRoom;