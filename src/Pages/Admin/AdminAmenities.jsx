import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/adminAmenities.css";
import Cookies from "js-cookie";

function AdminAmenities() {

  const [amenities, setAmenities] = useState([]);
  const [name, setName] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  // 🔥 FETCH ALL AMENITIES
  const fetchAmenities = async () => {
    try {
      const res = await api.get("/amenities/");
      setAmenities(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  // ➕ ADD AMENITY
  const handleAdd = async () => {
    try {
      if (!name.trim()) {
        alert("Enter amenity name");
        return;
      }

      await api.post("/amenities/", {
        name: name,
      });

      setName("");
      fetchAmenities();

    } catch (err) {
      console.log(err.response);
      alert(err.response?.data?.detail || "Error");
    }
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    try {
      await api.delete(`/amenities/${id}`);
      fetchAmenities();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    window.location.href = "/login";
  };

  return (
    <div>

      {/* HEADER */}
      <div className="admin-top-header">

        <div className="admin-header-left">
          <div className="admin-title">Amenities Management</div>
          <div className="admin-subtitle">
            Add and manage room amenities
          </div>
        </div>

        <div className="admin-header-right">

          <div
            className="profile-circle"
            onClick={() => setShowProfile(prev => !prev)}
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

      <div className="amenity-container">

        {/* ADD */}
        <div className="amenity-add-box">
          <input
            type="text"
            placeholder="Enter amenity (e.g., Projector)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button onClick={handleAdd}>
            Add
          </button>
        </div>

        {/* LIST */}
        <div className="amenity-list">
          {amenities.map((a) => (
            <div key={a.id} className="amenity-it">

              <span>{a.name}</span>

              <button
                className="delete-btn"
                onClick={() => handleDelete(a.id)}
              >
                Delete
              </button>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

export default AdminAmenities;