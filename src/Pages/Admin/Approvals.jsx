import { useState, useEffect } from "react";
import "../../styles/adminApprovals.css";
import Cookies from "js-cookie";
import api from "../../api/axios";

function Approvals() {
  const [activeTab, setActiveTab] = useState("all");
  const [showProfile, setShowProfile] = useState(false);
  const [data, setData] = useState([]);

  

  // ✅ FETCH BOOKINGS (ADMIN)
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/all");

        console.log(res.data)

        const formatted = res.data.map((b) => ({
          id: b.id,
          empId: b.employee_id,
          name: b.employee_name,
          room: b.room_name,
          date: new Date(b.booking_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: `${b.start_time} - ${b.end_time}`,
          status: b.status, // pending / approved / rejected
        }));

        setData(formatted);

      } catch (err) {
        console.log(err.response);
      }
    };

    fetchBookings();
  }, []);

  // ✅ FILTER
  const filtered = data.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  // ✅ APPROVE / REJECT
  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, null, {
  params: { status: status },
});
      // update UI instantly
      const updated = data.map((item) =>
        item.id === id ? { ...item, status } : item
      );

      setData(updated);

    } catch (err) {
      console.log(err.response);
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
          <div className="admin-title">Admin Approval</div>
          <div className="admin-subtitle">
            Review and approve booking requests
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

      <div className="admin-approval-container">

        {/* ALERT */}
        <div className="approval-alert">
          ⚠ You have {data.filter(d => d.status === "pending").length} pending approvals awaiting review
        </div>

        {/* CARD */}
        <div className="approval-card">

          {/* TABS */}
          <div className="approval-tabs">
            <button
              className={activeTab === "all" ? "active" : ""}
              onClick={() => setActiveTab("all")}
            >
              All ({data.length})
            </button>

            <button
              className={activeTab === "pending" ? "active" : ""}
              onClick={() => setActiveTab("pending")}
            >
              Pending ({data.filter(d => d.status === "pending").length})
            </button>

            <button
              className={activeTab === "approved" ? "active" : ""}
              onClick={() => setActiveTab("approved")}
            >
              Approved ({data.filter(d => d.status === "approved").length})
            </button>

            <button
              className={activeTab === "rejected" ? "active" : ""}
              onClick={() => setActiveTab("rejected")}
            >
              Rejected ({data.filter(d => d.status === "rejected").length})
            </button>
          </div>

          {/* TABLE */}
          <table className="approval-table">
            <thead>
              <tr>
                <th>REQUEST ID</th>
                <th>EMPLOYEE ID</th>
                <th>EMPLOYEE NAME</th>
                <th>ROOM NAME</th>
                <th>DATE</th>
                <th>TIME</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td className="emp-id">{item.empId}</td>
                  <td>{item.name}</td>
                  <td>{item.room}</td>
                  <td>{item.date}</td>
                  <td>{item.time}</td>

                  <td>
                    <span className={`status ${item.status}`}>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    {item.status === "pending" ? (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => handleStatusUpdate(item.id, "approved")}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() => handleStatusUpdate(item.id, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      "-"
                    )}
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

export default Approvals;