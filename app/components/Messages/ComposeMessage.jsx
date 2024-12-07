import React, { useState } from 'react';

const ComposeMessage = ({ onSend }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientId, setRecipientId] = useState('');

  const handleSendClick = () => {
    if (subject && body && recipientId) {
      onSend({ subject, body, recipientId });
      setSubject('');
      setBody('');
      setRecipientId('');
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="flex-1 h-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Compose Message</h2>
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-600 mb-2">To</label>
        <input
          type="text"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter recipient's name or email"
        />
      </div>
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-600 mb-2">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter subject"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="6"
          placeholder="Write your message here"
        />
      </div>
      <button
        onClick={handleSendClick}
        className="w-full bg-blue-600 text-white py-3 rounded-md text-lg hover:bg-blue-700 transition duration-200"
      >
        Send Message
      </button>
    </div>
  );
};

export default ComposeMessage;
