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
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead>
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
                            <tr key={index}>
                                <td className="py-2 px-4 border-b text-center">{`${record.date} ${record.day}`}</td>
                                <td className="py-2 px-4 border-b text-center">
                                    {`${record.start_time} - ${record.end_time}`}
                                </td>
                                <td className="py-2 px-4 border-b text-center">{record.room}</td>
                                <td className="py-2 px-4 border-b text-center">
                                    <input
                                        type="number"
                                        className="border rounded px-2 py-1 text-center w-16"
                                        value={record.attended_hours}
                                        min={0}
                                        max={record.total_hours}
                                        onChange={(e) =>
                                            handleInputChange(index, parseInt(e.target.value, 10) || 0)
                                        }
                                    />
                                </td>
                                <td className="py-2 px-4 border-b text-center">{record.total_hours}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="py-2 px-4 text-center" colSpan="5">
                                No participation records available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="mt-4 flex justify-end space-x-4">
                <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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
