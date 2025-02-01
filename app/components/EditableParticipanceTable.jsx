"use client";
import { useState } from "react";

const EditableParticipanceTable = ({ data, onSave, onCancel }) => {
    const [updatedData, setUpdatedData] = useState([...data]); // Local copy of data for editing

    // Handle changes to attended hours
    const handleInputChange = (index, value) => {
        const newData = [...updatedData];
        newData[index].attended_hours = value; // Update the specific record
        setUpdatedData(newData);
    };

    return (
        <div>
            <table className="min-w-full bg-white dark:bg-gray-900 shadow-md rounded-lg">
                <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b">Date</th>
                        <th className="py-2 px-4 border-b">Time</th>
                        <th className="py-2 px-4 border-b">Room</th>
                        <th className="py-2 px-4 border-b">Attended Hours</th>
                        <th className="py-2 px-4 border-b">Total Hours</th>
                    </tr>
                </thead>
                <tbody>
                    {updatedData.length > 0 ? (
                        updatedData.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                <td className="py-2 px-4 border-b text-center text-gray-800 dark:text-gray-200">
                                    {`${record.date}`}
                                </td>
                                <td className="py-2 px-4 border-b text-center text-gray-800 dark:text-gray-200">
                                    {`${record.start_time} - ${record.end_time}`}
                                </td>
                                <td className="py-2 px-4 border-b text-center text-gray-800 dark:text-gray-200">
                                    {record.room}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                    <input
                                        type="number"
                                        className="border dark:border-gray-600 rounded px-2 py-1 text-center w-16 dark:bg-gray-800 dark:text-gray-200"
                                        value={record.attended_hours}
                                        min={0}
                                        max={record.total_hours}
                                        onChange={(e) =>
                                            handleInputChange(index, parseInt(e.target.value, 10) || 0)
                                        }
                                    />
                                </td>
                                <td className="py-2 px-4 border-b text-center text-gray-800 dark:text-gray-200">
                                    {record.total_hours}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="py-2 px-4 text-center text-gray-700 dark:text-gray-300" colSpan="5">
                                No participation records available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="mt-4 flex justify-end space-x-4">
                <button
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => onSave(updatedData)}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );

};

export default EditableParticipanceTable;
