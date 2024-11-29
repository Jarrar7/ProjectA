"use client";
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';
import { useUser } from "../context/UserContext"


import SidebarAdmin from '../components/SidebarAdmin';
import Header from '../components/Header';

import ManageUsers from '../components/ManageUsers';
import ManageCourses from '../components/ManageCourses';
import withRoleProtection from "../components/hoc/withRoleProtection";
import CalendarComponent from '../components/CalendarComponent';
import Profile from '../components/Profile';
import Settings from '../components/Settings';




function AdminDashboard() {
    const [activeSection, setActiveSection] = useState('manageUsers');
    const { logout } = useUser();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState({
        '2024-08-23': ['Meeting with team']
    });

    // Define the handleDateChange function here
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <main>
            <div className="flex h-screen">
                <SidebarAdmin
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    logout={logout}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <Header />

                    {/* Content Area */}
                    <main className="flex-1 bg-gray-100 p-6 overflow-auto">
                        {/* Conditionally render the grid based on dashboard selection */}
                        {activeSection === 'manageUsers' && (
                            <ManageUsers />
                        )}

                        {activeSection === 'manageCourses' && (
                            <ManageCourses />
                        )}

                        {activeSection === 'calendar' && (
                            <CalendarComponent
                                events={events}
                                selectedDate={selectedDate}
                                onDateChange={handleDateChange}
                            />
                        )}

                        {activeSection === 'profile' && (
                            <div className="flex-1 overflow-auto">
                                <Profile />
                            </div>
                        )}

                        {activeSection === 'settings' && (
                            <div className="flex-1 overflow-auto">
                                <Settings />
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </main>
    )
}



export default withRoleProtection(AdminDashboard, ["admin"]);