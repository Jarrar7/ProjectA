import { useUser } from "../context/UserContext";
import { useState, useEffect } from "react";
import { Calendar } from "@/app/components/ui/calendar";
import { supabase } from "@/lib/supabaseClient"; 

export default function CalendarComponent({ events, selectedDate, onDateChange }) {
    const { user } = useUser(); // Get user data from context
    const [date, setDate] = useState(new Date());
    const [lectures, setLectures] = useState([]); // State for holding lectures

    useEffect(() => {
        // Function to fetch lectures based on user role
        const fetchLectures = async () => {
            if (!user) return; // Ensure the user exists

            let lecturesData = [];

            if (user.role === "teacher") {
                // Fetch courses for the teacher
                const { data: courses, error: courseError } = await supabase
                    .from("courses")
                    .select("id, course_name") // Fetch course id and name
                    .eq("teacher_id", user.id); // Filter by teacher_id

                if (courseError) {
                    console.error("Error fetching teacher's courses:", courseError);
                } else {
                    // For each course, fetch the corresponding class sessions
                    for (const course of courses) {
                        const { data: classSessions, error: sessionError } = await supabase
                            .from("class_sessions") // Assuming this table holds session details
                            .select("date, start_time, end_time, room") // Fields to display
                            .eq("course_id", course.id); // Filter by course_id

                        if (sessionError) {
                            console.error("Error fetching class sessions:", sessionError);
                        } else {
                            // Format the data and add to lecturesData array
                            classSessions.forEach(session => {
                                lecturesData.push({
                                    course_name: course.course_name,
                                    course_id: course.id,
                                    date: session.date, // Date in yyyy-mm-dd format
                                    start_time: session.start_time,
                                    end_time: session.end_time,
                                    room: session.room
                                });
                            });
                        }
                    }
                }
            } else if (user.role === "student") {
                // Fetch courses the student is enrolled in
                const { data: enrollments, error: enrollmentError } = await supabase
                    .from("enrollments")
                    .select("course_id") // Fetch course_id for the enrolled courses
                    .eq("student_id", user.id); // Filter by student_id

                if (enrollmentError) {
                    console.error("Error fetching student's courses:", enrollmentError);
                } else {
                    // For each course, fetch the course name and class sessions
                    for (const enrollment of enrollments) {
                        // Fetch course details
                        const { data: course, error: courseError } = await supabase
                            .from("courses")
                            .select("course_name, id") // Get course name and id
                            .eq("id", enrollment.course_id); // Filter by course_id

                        if (courseError) {
                            console.error("Error fetching course details:", courseError);
                        } else {
                            // Fetch class sessions for this course
                            const { data: classSessions, error: sessionError } = await supabase
                                .from("class_sessions")
                                .select("date, start_time, end_time, room") // Get session details
                                .eq("course_id", enrollment.course_id); // Filter by course_id

                            if (sessionError) {
                                console.error("Error fetching class sessions:", sessionError);
                            } else {
                                // Add the class sessions and course details to lecturesData
                                classSessions.forEach(session => {
                                    lecturesData.push({
                                        course_name: course[0].course_name, // Course name
                                        course_id: course[0].id, // Course id
                                        date: session.date, // Date in yyyy-mm-dd format
                                        start_time: session.start_time,
                                        end_time: session.end_time,
                                        room: session.room
                                    });
                                });
                            }
                        }
                    }
                }
            }

            setLectures(lecturesData); // Set the fetched lectures data
        };

        fetchLectures();
    }, [user]);

    // Function to format date to dd/mm/yyyy
    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-GB"); // "en-GB" gives you dd/mm/yyyy format
    };

    // Function to combine date and time into a valid Date object
    const combineDateAndTime = (date, time) => {
        const dateTimeString = `${date}T${time}`; // Combine yyyy-mm-dd and hh:mm:ss
        return new Date(dateTimeString); // Returns a Date object
    };

    // Convert lectures into events for the calendar
    const getCalendarEvents = () => {
        return lectures.map(lecture => ({
            date: lecture.date, // Assuming the calendar expects the date in yyyy-mm-dd format
            title: `${lecture.course_name} - ${lecture.room}`, // Event title
            start: combineDateAndTime(lecture.date, lecture.start_time), // Start time
            end: combineDateAndTime(lecture.date, lecture.end_time), // End time
        }));
    };

    // Function to format the time for displaying in the event list
    const formatTime = (time) => {
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes}`; // Format to show hours and minutes
    };

    // Filter the lectures for the selected date
    const filteredLectures = lectures.filter(lecture => formatDate(lecture.date) === formatDate(date));

    return (
        <div className="flex justify-center items-center p-4 bg-gray-100 min-h-screen">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full">
                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                    Select a Date
                </h2>
                <div className="relative">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        events={getCalendarEvents()} // Pass events to the Calendar component
                        className="w-full rounded-lg border border-gray-300 shadow-md focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                {/* Render lectures for the selected date */}
                <div className="mt-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Lectures for {formatDate(date)}</h3>
                    <ul>
                        {filteredLectures.length === 0 ? (
                            <li className="text-gray-500">No lectures for this day.</li>
                        ) : (
                            filteredLectures.map((lecture, index) => (
                                <li key={index} className="text-gray-700">
                                    <strong>{lecture.course_name}</strong>
                                    <br />
                                    <span className="text-gray-600">Room: {lecture.room}</span>
                                    <br />
                                    <span className="text-gray-600">Time: {formatTime(lecture.start_time)} - {formatTime(lecture.end_time)}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
