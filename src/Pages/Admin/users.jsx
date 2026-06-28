import { useEffect, useState } from "react";
import "../../styles/adminusers.css";
import api from "../../api/axios";
import Cookies from "js-cookie";

function Users() {

  const [users, setUsers] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");
const [locations, setLocations] = useState([]);
  const [role, setRole] = useState("user");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddform,setAddform] =useState(false);
  const [empId,setEmpid]=useState("")
  const [employeeName,setEmpname]=useState("")
  const [email,setEmail]=useState("")
  const [showEditform,setEditform]=useState(false);
  const [selectedUser,setSelectedUser]=useState(null)
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [userToDelete, setUserToDelete] = useState(null);

  // ✅ FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users/");
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
  const fetchAdminLocations = async () => {
    try {
      const res = await api.get("/auth/users/me");

      const locs = JSON.parse(res.data.locations || "[]");

      setAvailableLocations(locs);
    } catch (err) {
      console.log(err);
    }
  };

  fetchAdminLocations();
}, []);

  const addLocation = () => {
  if (locationInput.trim() && !locations.includes(locationInput.trim())) {
    setLocations([...locations, locationInput.trim()]);
    setLocationInput("");
  }
};

const resetAddForm = () => {
  setEmpid("");
  setEmpname("");
  setEmail("");
  setRole("user");
  setLocations([]);
  setLocationInput("");
};

const removeLocation = (loc) => {
  setLocations(locations.filter(l => l !== loc));
};

  // ✅ SEARCH FIXED
  const handleSearch = (value) => {
    setSearch(value);

    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase()) ||
      user.employee_id.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  // ✅ ADD USER
  const handleAdding = async () => {
    try {
      await api.post("/users/", {
  employee_id: empId,
  name: employeeName,
  email: email,
  role: role,
  locations: locations   // 🔥 REQUIRED
});
if (!locations.length) {
  alert("At least one location is required");
  return;
}

      resetAddForm();
setAddform(false);

      const res = await api.get("/users/");
      setUsers(res.data);
      setFilteredUsers(res.data);

    } catch (err) {
      console.log(err.response?.data);
    }
  };

  // ✅ UPDATE USER (FIXED)
  const handleUpdating = async () => {
    try {
      await api.put(`/users/${selectedUser.employee_id}`, {
  name: selectedUser.name,
  email: selectedUser.email,
  role: selectedUser.role   // ✅ REQUIRED
});

      setEditform(false);

      const res = await api.get("/users/");
      setUsers(res.data);
      setFilteredUsers(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  const confirmDelete = async () => {
  try {
    await api.delete(`/users/${userToDelete}`);

    const updated = users.filter(u => u.employee_id !== userToDelete);
    setUsers(updated);
    setFilteredUsers(updated);

    setShowDeleteModal(false);
    setUserToDelete(null);

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

      {/* 🔥 HEADER */}
      <div className="admin-top-header">

        <div className="admin-header-left">
          <div className="admin-title">User Management</div>
          <div className="admin-subtitle">
            Manage employee accounts and access
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

      <div className="user-container">

        <div className="top-bar">

          <input
            type="text"
            placeholder="Search by name, employee ID, or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <button className="add-btn" onClick={() => {
  resetAddForm();
  setAddform(true);
}}>
            + Add User
          </button>

        </div>

        <div className="table">

          <div className="table-header">
            <div>EMPLOYEE ID</div>
            <div>NAME</div>
            <div>EMAIL</div>
            <div>EDIT</div>
          </div>

          {filteredUsers.map((user) => (
            <div key={user.employee_id} className="table-row">

              <div>{user.employee_id}</div>
              <div>{user.name}</div>
              <div>{user.email}</div>

              <div>
                <button
                  className="edit-btn"
                  onClick={()=>{
                    setSelectedUser(user);
                    setEditform(true);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

        </div>

        <div className="table-footer">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* ADD USER MODAL */}
        {showAddform && (
          <div className="modal-overlay">
            <div className="modal">

              <h2>Add User</h2>

              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  value={empId}
                  onChange={(e)=>setEmpid(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e)=>setEmpname(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} >
                  <option value="user">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

<div className="form-group">
  <label>Locations</label>

  <select
    onChange={(e) => {
      const value = e.target.value;

      if (value && !locations.includes(value)) {
        setLocations([...locations, value]);
      }
    }}
  >
    <option value="">Select Location</option>

    {availableLocations.map((loc, i) => (
      <option key={i} value={loc}>
        {loc}
      </option>
    ))}
  </select>

  <div className="location-tags">
    {locations.map((loc, index) => (
      <span key={index} className="location-tag">
        {loc}
        <span
          className="remove-tag"
          onClick={() => removeLocation(loc)}
        >
          ✕
        </span>
      </span>
    ))}
  </div>
</div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => {
  resetAddForm();
  setAddform(false);
}}>
                  Cancel
                </button>

                <button className="save-btn" onClick={handleAdding}>
                  Save User
                </button>
              </div>

            </div>
          </div>
        )}

        {/* EDIT USER MODAL */}
{/* EDIT USER MODAL */}
{showEditform && (
  <div className="modal-overlay">
    <div className="modal edit-user-modal">

      <h2>Edit User</h2>

      <div className="form-group">
        <label>Employee ID</label>
        <input
          type="text"
          value={selectedUser?.employee_id || ""}
          readOnly
        />
      </div>

      <div className="form-group">
        <label>Employee Name</label>
        <input
          type="text"
          value={selectedUser?.name || ""}
          onChange={(e) =>
            setSelectedUser({
              ...selectedUser,
              name: e.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="text"
          value={selectedUser?.email || ""}
          onChange={(e) =>
            setSelectedUser({
              ...selectedUser,
              email: e.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Role</label>
        <select
          value={selectedUser?.role || "user"}
          onChange={(e) =>
            setSelectedUser({
              ...selectedUser,
              role: e.target.value,
            })
          }
        >
          <option value="user">Employee</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="form-group">
        <button className="reset-btn">Reset Password</button>
      </div>

      {/* 🔥 PERFECT FOOTER */}
      <div className="edit-footer">

        <button
          className="delete-btn-outline"
          onClick={() => {
            setUserToDelete(selectedUser.employee_id);
            setShowDeleteModal(true);
          }}
        >
          Delete User
        </button>

        <div className="edit-footer-right">
          <button
            className="cancel-btn"
            onClick={() => setEditform(false)}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={handleUpdating}
          >
            Save Changes
          </button>
        </div>

      </div>

    </div>
  </div>
)}

      </div>
      {showDeleteModal && (
  <div className="modal-overlay">
    <div className="modal delete-modal">

      <h2>Delete User</h2>

      <div className="delete-message">
        Are you sure you want to delete this user?
      </div>

      <div className="modal-actions">
        <button
          className="cancel-btn"
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </button>

        <button
          className="delete-confirm-btn"
          onClick={confirmDelete}
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}

export default Users;