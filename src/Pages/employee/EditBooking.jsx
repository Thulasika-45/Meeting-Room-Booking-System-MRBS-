import { useParams, useNavigate } from "react-router-dom";
import { useEffect,useState } from "react";

import api from "../../api/axios"; 
import "../../styles/editBooking.css";

function EditBooking() {
const { id } = useParams();
const [booking, setBooking] = useState(null);
const [loading, setLoading] = useState(true);
const navigate=useNavigate();


const [form, setForm] = useState({
  date: "",
  attendees: "",
  start_time: "",
  end_time: "",
  purpose: "",
});

  useEffect(() => {
  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  fetchBooking();
}, [id]);

useEffect(() => {
  if (booking) {
    setForm({
      date: booking.booking_date,
      attendees: booking.attendees,
      start_time: booking.start_time.slice(0,5),
      end_time: booking.end_time.slice(0,5),
      purpose: booking.purpose,
    });
  }
}, [booking]);


  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

const handleSave = async () => {
  try {
    if (!booking?.room_id) {
      alert("Room ID missing");
      return;
    }

    const payload = {
      room_id: booking.room_id,
      booking_date: form.date,
      start_time: form.start_time.length === 5
        ? form.start_time + ":00"
        : form.start_time,
      end_time: form.end_time.length === 5
        ? form.end_time + ":00"
        : form.end_time,
      attendees: Number(form.attendees),
      purpose: form.purpose,
    };
    await api.put(`/bookings/${booking.id}`, payload);

    alert("Booking updated successfully");

    navigate("/employee/my-bookings?tab=Pending");

  } catch (err) {
    console.log("FULL ERROR:", err);   // 🔥 better debug
    alert("Update failed");
  }
};
  return (
    <div className="edit-booking-page">

      {/* HEADER */}
      <div className="edit-header">
        <div>
          <h2>Edit Booking - {booking?.room_name}</h2>
          <p>Update your booking details</p>
        </div>
        <div className="avatar">JD</div>
      </div>

      {/* BACK */}
      <div
        className="back-link"
        onClick={() => navigate("/employee/my-bookings")}
      >
        ← Back to My Bookings
      </div>

      {/* CARD */}
      <div className="edit-card">

        <div className="form-grid">

          <div>
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          <div>
            <label>Number of Attendees</label>
            <input
              type="number"
              value={form.attendees}
              onChange={(e) => handleChange("attendees", e.target.value)}
            />
          </div>

          <div>
            <label>Start Time</label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => handleChange("start_time", e.target.value)}
            />
          </div>

          <div>
            <label>End Time</label>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => handleChange("end_time", e.target.value)}
            />
          </div>

        </div>

        <div className="full">
          <label>Meeting Purpose</label>
          <textarea
            value={form.purpose}
            onChange={(e) => handleChange(e.target.value)}
            required
          />
        </div>

        {/* ACTIONS */}
        <div className="actions">
          <button
            className="cancel"
            onClick={() => navigate("/employee/my-bookings")}
          >
            Cancel
          </button>

          <button className="save" onClick={handleSave}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditBooking;