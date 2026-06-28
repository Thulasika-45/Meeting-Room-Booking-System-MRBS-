import { NavLink, Link, Outlet } from "react-router-dom"
import '../styles/adminLayout.css'

function AdminLayout(){
    return(
    
        <div className="sidepanel"> 
            <div className="left">
                <div className="left-top">
                    <div className="tl-bold"><b>Meeting room</b></div>
                    <div className="tl-small" >Booking System</div>
                </div>
                <div className="leftbottom">
                    <div className="sidebarRoute">
                        <NavLink to="/admin/dashboard">Dashboard</NavLink>
                    </div>
                    <div className="sidebarRoute">
                        <NavLink to="/admin/bookings">All Bookings</NavLink>
                    </div>
                    <div className="sidebarRoute">
                        <NavLink to="/admin/rooms">Room Management</NavLink>
                    </div>
                    <div className="sidebarRoute">
                        <NavLink to="/admin/amenities">Amenities</NavLink>
                    </div>
                     <div className="sidebarRoute">
                        <NavLink to="/admin/users">User Management</NavLink>
                    </div>
                     <div className="sidebarRoute">
                        <NavLink to="/admin/approvals">Admin Approvals</NavLink>
                    </div>
                </div>
            </div>

            <div className="right">
                <div className="content"> 
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
export default AdminLayout