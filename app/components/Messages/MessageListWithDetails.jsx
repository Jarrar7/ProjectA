import React from 'react';

const MessageListWithDetails = ({ messages, activeMessage, setActiveMessage, selectedSection }) => {
  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().replace('T', ' ').slice(0, 19); // "2024-12-06 11:15:00"
  };

  if (!messages || messages.length === 0) {
    return <div className="text-gray-500">No messages available.</div>; // Show this message if no messages are available
  }

  return (
    <div className="flex-1 h-full p-6 bg-white border border-gray-200 rounded-lg shadow-md overflow-y-auto">
      <table className="w-full table-auto mb-6">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-800"> 
              {selectedSection === 'Inbox' ? 'Sender' : 'Recipient'}
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-800">Subject</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-800">Date</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message, index) => (
            <tr
              key={message.id}
              className={`${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              } hover:bg-blue-100 cursor-pointer transition-all duration-200 ease-in-out ${
                activeMessage?.id === message.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setActiveMessage(message)}
            >
              <td className="px-6 py-4 text-sm text-gray-700">
                {selectedSection === 'Inbox' ? message.senderName : message.receiverName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{message.subject || 'No Subject'}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {message.timestamp ? formatTimestamp(message.timestamp) : 'No Date'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeMessage && (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-md mt-6">
          <h2 className="text-2xl font-bold text-gray-800">{activeMessage.subject}</h2>
          <p className="text-sm text-gray-600 mt-1">
            From: {activeMessage.senderName} | To: {activeMessage.receiverName} |{' '}
            {formatTimestamp(activeMessage.timestamp)}
          </p>
          <div className="mt-4 text-gray-800">{activeMessage.content || 'No Content Available'}</div>
        </div>
      )}
    </div>
  );
};

export default MessageListWithDetails;
