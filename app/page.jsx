"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken'; // Add jwt to decode token
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();

  const notify = (message, type = 'info') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Ensure cookies are included
    });

    const result = await res.json();

    if (!res.ok) {
      notify(result.error || 'Login failed', 'error');
      return;
    }

    // The token should now be in the cookies, no need to fetch it from the response
    notify('Login successful!', 'success');

    // Check for the token in cookies and decode it for redirection
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='));

    if (!cookie) {
      notify('Token not found in cookies!', 'error');
      return;
    }

    const token = cookie.split('=')[1];
    try {
      const payload = jwt.decode(token); // Decode without verifying
      console.log('Payload:', payload); // Debugging

      if (payload) {
        const userRole = payload.role;

        // Redirect based on role
        if (userRole === 'student') {
          router.push('/student');
        } else if (userRole === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/administration');
        }
      } else {
        notify('Invalid token payload!', 'error');
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      notify('Invalid token!', 'error');
    }

  };



  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      notify('Password must be at least 6 characters long.', 'error');
      return;
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || 'Failed to reset password');
      notify(result.error || 'Failed to reset password', 'error');
      return;
    }

    setError(null);
    notify('Password reset successful. Please log in with your new password.', 'success');
    setShowResetPassword(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <ToastContainer />
      <div className="w-full max-w-md px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto h-12 w-12 text-indigo-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Login to Your Account</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Login
            </button>
          </div>
        </form>

      </div>
    </main>
  )
}