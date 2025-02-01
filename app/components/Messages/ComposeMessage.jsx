import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabaseClient";
import { useUser } from '@/app/context/UserContext';

const ComposeMessage = ({ senderId }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleSendClick = async () => {
    if (!subject || !body || !recipientId) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    const message = {
      id: uuidv4(), // Generate a unique ID for the message
      sender_id: user.id,
      receiver_id: recipientId,
      subject,
      content: body,
      timestamp: new Date().toISOString(),
      read_status: false
    };

    try {
      const { error } = await supabase.from('messages').insert([message]);
      if (error) throw error;

      alert('Message sent successfully!');
      setSubject('');
      setBody('');
      setRecipientId('');
    } catch (error) {
      console.error('Error sending message:', error.message);
      alert('Failed to send the message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
        Compose Message
      </h2>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">To</label>
        <input
          type="text"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200"
          placeholder="Enter recipient's ID"
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200"
          placeholder="Enter subject"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200"
          rows="6"
          placeholder="Write your message here"
        />
      </div>

      <button
        onClick={handleSendClick}
        disabled={loading}
        className={`w-full ${loading ? "bg-gray-400 dark:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
          } text-white py-3 rounded-md text-lg transition duration-200`}
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </div>
  );

};

export default ComposeMessage;

