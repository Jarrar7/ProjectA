"use client"

import React, { useState } from 'react';
import UserSidebar from '../components/Users/UserSidebar';
import AddIndividualUser from '../components/Users/AddIndividualUser';
import BulkSignup from '../components/Users/BulkSignup';
import EditUser from '../components/Users/EditUser';

const ManageUsers = () => {
    const [selectedSection, setSelectedSection] = useState('Add Individual');

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <UserSidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
            <div className="flex-1 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-y-auto">
                {selectedSection === 'Add Individual' && <AddIndividualUser />}
                {selectedSection === 'Bulk Signup' && <BulkSignup />}
                {selectedSection === 'Edit User' && <EditUser />}
            </div>
        </div>
    );

};

export default ManageUsers;
