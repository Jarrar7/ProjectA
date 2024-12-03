"use client";
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';


import SidebarStudentTeacher from '../components/SidebarStudentTeacher';
import Header from '../components/Header';

import CourseScheduleTable from '../components/CourseScheduleTable';
import YearSemesterFilter from '../components/YearSemesterFilter';
import withRoleProtection from "../components/hoc/withRoleProtection";

import Messages from '../components/Messages'
import CalendarComponent from '../components/CalendarComponent';
import Profile from '../components/Profile';
import Settings from '../components/Settings';

import { useUser } from "../context/UserContext"
import withRoleProtection from "../components/hoc/withRoleProtection";

function TeacherDashboard() {
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
                attendedHours: 2,
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
                attendedHours: 0,
                totalHours: 3
            }
        ],
        // Add more courses and their schedule details here
    });


    const [courseParticipants, setParticipants] = useState({
        'Algorithms': [
            { id: 111111111, name: 'John Doe', attendance: '3/13' },
            { id: 222222222, name: 'Jane Smith', attendance: '2/13' },
            { id: 333333333, name: 'Alice Johnson', attendance: '4/13' },
            { id: 444444444, name: 'Bob Brown', attendance: '0/13' }
        ],
        // Add more participants
    });


    // Define the handleDateChange function here
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleCourseClick = (item) => {
        setSelectedCourse(item);
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
                            <CourseScheduleTable
                                schedule={courseSchedule[selectedCourse] || []}
                                participants={courseParticipants[selectedCourse] || []}
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
                                <Settings />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </main>
    )
}

export default withRoleProtection(TeacherDashboard, ["teacher"]);