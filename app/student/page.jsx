"use client";
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';
import Calendar from 'react-calendar';

import SidebarStudentTeacher from '../components/SidebarStudentTeacher';
import Header from '../components/Header';

import ParticipanceTable from '../components/ParticipanceTable.jsx';
import YearSemesterFilter from '../components/YearSemesterFilter';

import CalendarComponent from '../components/CalendarComponent';
import Messages from '../components/Messages';
import Profile from '../components/Profile';
import Notifications from '../components/Settings';
import withRoleProtection from "../components/hoc/withRoleProtection";
import { useUser } from "../context/UserContext"

function StudentDashboard() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const { logout } = useUser();
    const [items, setItems] = useState(['Algorithms', 'Object-Oriented Programming', 'Web Development', 'Human-Computer Interaction', 'Cloud Computing', 'Database Systems']);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState({
        '2024-08-23': ['Meeting with team']
    });
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseSchedule, setCourseSchedule] = useState({
        'Algorithms': [
            {
                date: '2024-09-01',
                dayOfWeek: 'Sunday',
                hours: '10:00 - 12:00',
                room: 'Room 101',
                attendedHours: 0,
                totalHours: 3
            },
            {
                date: '2024-09-08',
                dayOfWeek: 'Sunday',
                hours: '10:00 - 12:00',
                room: 'Room 102',
                attendedHours: 3,
                totalHours: 3
            },
            {
                date: '2024-09-15',
                dayOfWeek: 'Sunday',
                hours: '10:00 - 12:00',
                room: 'Room 103',
                attendedHours: 1,
                totalHours: 3
            }
        ],
        // Add more courses and their schedule details here
    });


    // Define the handleDateChange function here
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
    };

    const handleBackClick = () => {
        setSelectedCourse(null);
    };

    return (
        <main>
            <div className="flex h-screen">
                {/* Sidebar */}
                <SidebarStudentTeacher
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
                        {activeSection === 'dashboard' && !selectedCourse && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
                                {/* Filters */}
                                <YearSemesterFilter />

                                <div className="grid grid-cols-3 gap-6">
                                    {items.map((item, index) => (
                                        <div key={index} className="bg-white shadow-md rounded-lg p-6">
                                            <button onClick={() => handleCourseClick(item)}>
                                                {item}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedCourse && (
                            <ParticipanceTable
                                data={courseSchedule[selectedCourse] || []}
                                onBack={handleBackClick}
                            />
                        )}

                        {activeSection === 'messages' && (
                            <Messages />
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
                                <Notifications />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </main>
    )
}
export default withRoleProtection(StudentDashboard, ["student"]);
