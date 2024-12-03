import React from 'react';

const MessageSidebar = ({ selectedSection, setSelectedSection, setActiveMessage }) => {
  const sections = ['Inbox', 'Sent', 'Drafts', 'New Message'];

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setActiveMessage(null); // Reset the active message
  };

  return (
    <div className="w-1/4 bg-gray-100 h-full border-r p-4">
      <ul>
        {sections.map((section) => (
          <li
            key={section}
            className={`py-2 px-4 cursor-pointer rounded-lg ${
              selectedSection === section ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
            }`}
            onClick={() => handleSectionClick(section)}
          >
            {section}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageSidebar;
