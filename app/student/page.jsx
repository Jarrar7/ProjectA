"use client";
import 'react-calendar/dist/Calendar.css';
import { useState } from 'react';
import { useUser } from "../context/UserContext"


import CalendarComponent from '../components/CalendarComponent';
import Profile from '../components/Profile';
import Notifications from '../components/Notifications';
import ParticipanceTable from '../components/ParticipanceTable.jsx';
import withRoleProtection from "../components/hoc/withRoleProtection";

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
                participation: '3/3'
            },
            {
                date: '2024-09-08',
                dayOfWeek: 'Sunday',
                hours: '10:00 - 12:00',
                room: 'Room 102',
                participation: '0/3'
            },
            {
                date: '2024-09-15',
                dayOfWeek: 'Sunday',
                hours: '10:00 - 12:00',
                room: 'Room 103',
                participation: '1/3'
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
                <aside className="w-64 bg-indigo-600 text-white flex flex-col">
                    {/* Branding */}
                    <div className="flex items-center justify-center h-16 bg-indigo-700 text-xl font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 mr-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                        </svg>

                        AttendEase
                    </div>
                    {/* Navigation Links */}
                    <nav className="flex-1 mt-4">
                        <ul>
                            <li className={`hover:bg-indigo-500 p-4 flex items-center cursor-pointer ${activeSection === 'dashboard' ? 'bg-indigo-500' : ''}`}
                                onClick={() => setActiveSection('dashboard')}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mr-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                </svg>
                                Dashboard
                            </li>
                            <li className={`hover:bg-indigo-500 p-4 flex items-center cursor-pointer ${activeSection === 'calendar' ? 'bg-indigo-500' : ''}`}
                                onClick={() => setActiveSection('calendar')}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mr-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                                Calendar
                            </li>
                            <li className={`hover:bg-indigo-500 p-4 flex items-center cursor-pointer ${activeSection === 'profile' ? 'bg-indigo-500' : ''}`}
                                onClick={() => setActiveSection('profile')}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mr-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                                Your Profile
                            </li>
                            <li className={`hover:bg-indigo-500 p-4 flex items-center cursor-pointer ${activeSection === 'settings' ? 'bg-indigo-500' : ''}`}
                                onClick={() => setActiveSection('settings')}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mr-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                                Settings
                            </li>


                        </ul>
                    </nav>
                    {/* Footer (Settings) */}
                    <button
                        onClick={logout}
                        className="hover:bg-indigo-500 p-4 flex items-center cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6 mr-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                            />
                        </svg>
                        Logout
                    </button>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="h-16 bg-white flex items-center justify-between px-6 shadow">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <img
                                    src="https://via.placeholder.com/150"
                                    alt="User Profile"
                                    className="h-8 w-8 rounded-full"
                                />
                                <span className="font-medium text-gray-700">Tom Cook</span>
                            </div>
                            <button className="p-2 rounded-full hover:bg-gray-100">
                                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.438L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="flex-1 bg-gray-100 p-6 overflow-auto">
                        {/* Conditionally render the grid based on dashboard selection */}
                        {activeSection === 'dashboard' && !selectedCourse && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
                                {/* Filters */}
                                <div className="flex items-center space-x-4 mb-4">
                                    <div>
                                        <label htmlFor="year-select" className="block text-gray-700 font-medium">Year:</label>
                                        <select
                                            id="year-select"
                                            className="block w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-indigo-300"
                                        >
                                            <option value="2025">2025</option>
                                            <option value="2024">2024</option>
                                            <option value="2023">2023</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="semester-select" className="block text-gray-700 font-medium">Semester:</label>
                                        <select
                                            id="semester-select"
                                            className="block w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-indigo-300"
                                        >
                                            <option value="fall">1</option>
                                            <option value="spring">2</option>
                                            <option value="summer">Summer</option>
                                        </select>
                                    </div>
                                </div>
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
