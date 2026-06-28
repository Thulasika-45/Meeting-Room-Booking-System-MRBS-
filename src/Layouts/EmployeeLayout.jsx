import { NavLink, Outlet, Link } from "react-router-dom";
import '../styles/employeeLayout.css'

function EmployeeLayout(){
    return(
    
        <div className="sidepanel"> 
            <div className="left">
                <div className="left-top">
                    <div className="tl-bold"><b>Meeting room</b></div>
                    <div className="tl-small" >Booking System</div>
                </div>
                <div className="leftbottom">
                    <div className="sidebarRoute">
                        <NavLink to="/employee/dashboard">Dashboard</NavLink>
                    </div>
                    <div className="sidebarRoute">
                        <NavLink to="/employee/rooms">Browse Rooms</NavLink>
                    </div>
                    <div className="sidebarRoute">
                        <NavLink to="/employee/my-bookings">My Bookings</NavLink>
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

export default EmployeeLayout;