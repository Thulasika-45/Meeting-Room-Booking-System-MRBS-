import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'

import Login from '../Pages/Login'
import ProtectedRoute from '../components/ProtectedRoute'

import EmployeeLayout from '../Layouts/EmployeeLayout'
import AdminLayout from '../Layouts/AdminLayout'

import EmpDashboard from '../Pages/employee/Dashboard'
import AdminDashboard from '../Pages/Admin/Dashboard'

import Rooms from '../Pages/employee/rooms'
import MyBooking from '../Pages/employee/myBooking'

import Approvals from '../Pages/Admin/Approvals'
import Bookings from '../Pages/Admin/Bookings'

import AdminRooms from '../Pages/Admin/AdminRooms'
import Users from '../Pages/Admin/users'

import RoomDetails from '../Pages/employee/empRoomDetails'
import BookRoom from '../Pages/employee/BookRoom'

import AdminEditRoom from '../Pages/Admin/adminEditroom'
import ChangePassword from '../Pages/changePassword'

import AddRoom from '../Pages/Admin/addNewroom'
import AdminAmenities from '../Pages/Admin/AdminAmenities'

import EditBooking from '../Pages/employee/EditBooking'

function AppRoutes(){
    return(
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            <Route path='/login' element={<Login />} />
            <Route path='/change-password' element={<ChangePassword />} />

            <Route element={<ProtectedRoute role="user" />}>
            <Route path='/employee' element={<EmployeeLayout />}>
            <Route path='dashboard' element={<EmpDashboard />} />
            <Route path='rooms'>
                <Route index element={<Rooms />} />
                <Route path=':id' element={<RoomDetails />} />
                <Route path=':id/book' element={<BookRoom />} />
            </Route>
            <Route path='my-bookings' element={<MyBooking />} />
            <Route path="edit-booking/:id" element={<EditBooking />} />
            </Route>
            </Route>

            <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='bookings' element={<Bookings />} />
            <Route path="rooms">
                <Route index element={<AdminRooms />} />
                <Route path="add" element={<AddRoom />} />
                <Route path=":id/edit" element={<AdminEditRoom />} />
            </Route>

            <Route path='users' element={<Users />} />
            <Route path='amenities' element={<AdminAmenities />} />
            <Route path='approvals' element={<Approvals />} />
            </Route>
            </Route>
        </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes