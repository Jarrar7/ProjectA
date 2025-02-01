import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabaseClient";

export default function CsvUploader({ courseId, onStudentsAdded }) {
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) {
            setErrorMessage("Please select an Excel file.");
            return;
        }
        setFile(selectedFile);
        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleProcessExcel = async () => {
        if (!file) {
            setErrorMessage("Please select an Excel file first.");
            return;
        }

        setIsUploading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);

            // Extract human_ids
            const humanIds = parsedData.map((row) => row.human_id).filter(Boolean);
            if (humanIds.length === 0) {
                setErrorMessage("The file is empty or does not contain 'human_id' values.");
                setIsUploading(false);
                return;
            }

            try {
                // Step 1: Get the actual student IDs from the profiles table using human_ids
                const { data: profiles, error: profilesError } = await supabase
                    .from("profiles")
                    .select("id, human_id")
                    .in("human_id", humanIds);

                if (profilesError || !profiles) {
                    throw new Error("Error fetching student profiles.");
                }

                const studentMappings = new Map(profiles.map((p) => [p.human_id, p.id]));
                const studentIds = humanIds.map((human_id) => studentMappings.get(human_id)).filter(Boolean);

                if (studentIds.length === 0) {
                    throw new Error("No valid student IDs found for the given human_ids.");
                }

                // Step 2: Insert the enrollments using the correct student IDs
                const { data: insertedData, error: insertError } = await supabase
                    .from("enrollments")
                    .insert(studentIds.map((id) => ({
                        course_id: courseId,
                        student_id: id,
                    })));

                if (insertError) {
                    throw new Error("Error adding students.");
                }

                // Step 3: Fetch updated enrolled students immediately after inserting
                const { data: updatedEnrollments, error: enrollmentsError } = await supabase
                    .from("enrollments")
                    .select("student_id")
                    .eq("course_id", courseId);

                if (enrollmentsError || !updatedEnrollments) {
                    throw new Error("Error fetching updated enrollments.");
                }

                const updatedStudentIds = updatedEnrollments.map((e) => e.student_id);

                // Step 4: Fetch the corresponding profile details
                const { data: updatedStudents, error: updatedProfilesError } = await supabase
                    .from("profiles")
                    .select("id, firstName, lastName, human_id")
                    .in("id", updatedStudentIds);

                if (updatedProfilesError) {
                    throw new Error("Error fetching updated student profiles.");
                }

                // Step 5: Call onStudentsAdded with the updated list of students
                onStudentsAdded(updatedStudents);

                setSuccessMessage(`${updatedStudents.length} students added successfully.`);
            } catch (error) {
                setErrorMessage(error.message || "An unexpected error occurred while adding students.");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };


    return (
        <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Upload Student List (Excel)
            </label>

            {/* Hidden file input */}
            <input
                type="file"
                accept=".xlsx, .xls"
                id="excelFile"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
            />

            {/* Custom File Upload Button */}
            <label
                htmlFor="excelFile"
                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 inline-block"
            >
                Choose File
            </label>

            {/* Upload Button */}
            <button
                onClick={handleProcessExcel}
                disabled={!file || isUploading}
                className={`bg-green-500 text-white px-4 py-2 rounded ml-4 ${!file || isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
                    }`}
            >
                {isUploading ? "Uploading..." : "Upload and Process Excel"}
            </button>

            {/* Display Selected File Name */}
            {file && (
                <p className="ml-2 text-gray-700 dark:text-gray-300">{file.name}</p>
            )}

            {isUploading && <p className="text-blue-500 dark:text-blue-400 mt-2">Uploading...</p>}
            {errorMessage && <p className="text-red-500 dark:text-red-400 mt-2">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 dark:text-green-400 mt-2">{successMessage}</p>}
        </div>
    );

}
