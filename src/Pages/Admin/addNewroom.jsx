import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../../styles/addRoom.css";

function AddRoom() {
  const navigate = useNavigate();
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  const [form, setForm] = useState({
    name: "",
    capacity: "",
    location: "",   // ✅ renamed
    status: "active",
    amenities: [],
  });


useEffect(() => {
  const fetchData = async () => {
    try {
      // LOCATIONS
      const userRes = await api.get("/auth/users/me");
      const locs = JSON.parse(userRes.data.locations || "[]");
      setAvailableLocations(locs);

      // 🔥 AMENITIES (NEW)
      const amenityRes = await api.get("/amenities/");
      setAmenitiesList(amenityRes.data);

    } catch (err) {
      console.log(err);
    }
  };

  fetchData();
}, []);

const toggleAmenity = (id) => {
  setForm((prev) => ({
    ...prev,
    amenities: prev.amenities.includes(id)
      ? prev.amenities.filter((a) => a !== id)
      : [...prev.amenities, id],
  }));
};

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.capacity || !form.location) {
  alert("Name, Capacity and Location are required");
  return;
}

      const payload = {
        name: form.name,
        capacity: Number(form.capacity),
        location: form.location,   // ✅ updated
        status: form.status,
        amenities: form.amenities,
      };

      await api.post("/rooms/", payload);

      alert("Room added successfully");
      navigate("/admin/rooms");
    } catch (err) {
      console.log("FULL ERROR:", err.response);
      alert(err.response?.data?.detail || "Error creating room");
    }
  };

  return (
    <div>

      {/* HEADER */}
      <div className="addroom-header">
        <div>
          <div className="addroom-title">Add New Room</div>
          <div className="addroom-subtitle">
            Create a new meeting room
          </div>
        </div>

        <div className="avatar">AU</div>
      </div>

      <div className="addroom-container">

        <div
          className="back-link"
          onClick={() => navigate("/admin/rooms")}
        >
          ← Back to Room Management
        </div>

        <div className="form-card">

          <div className="form-grid">

            {/* ROOM NAME */}
            <div className="form-group">
              <label>Room Name</label>
              <input
                placeholder="e.g., Conference Room A"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            {/* CAPACITY */}
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                placeholder="Number of people"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
              />
            </div>

            {/* ✅ LOCATION (REPLACED FLOOR) */}
            <div className="form-group">
              <label>Location</label>
<select
  value={form.location}
  onChange={(e) =>
    setForm({ ...form, location: e.target.value })
  }
>
  <option value="">Select Location</option>

  {availableLocations.map((loc, i) => (
    <option key={i} value={loc}>
      {loc}
    </option>
  ))}

</select>
            </div>

            {/* ✅ STATUS MOVED HERE (REPLACED BUILDING) */}
            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

          </div>

          {/* AMENITIES */}
          <div className="amenities-section">
            <label>Amenities</label>

            <div className="amenities-grid">
{amenitiesList.map((item) => (
  <div
    key={item.id}
    className={`amenity-item ${
      form.amenities.includes(item.id) ? "selected" : ""
    }`}
    onClick={() => toggleAmenity(item.id)}
  >
    <input
      type="checkbox"
      checked={form.amenities.includes(item.id)}
      readOnly
    />
    <span>{item.name}</span>
  </div>
))}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="form-actions">
            <button
              className="cancel-btn"
              onClick={() => navigate("/admin/rooms")}
            >
              Cancel
            </button>

            <button
              className="submit-btn"
              onClick={handleSubmit}
            >
              Add Room
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AddRoom;