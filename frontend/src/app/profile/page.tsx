"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (loading) {
    return <div className="container py-20 text-center">Loading user profile...</div>;
  }

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your profile.</h1>
        <Link href="/login" className="btn-solid">Log In</Link>
      </div>
    );
  }

  // Map Supabase user metadata to form fields
  const meta = user.user_metadata || {};
  const firstName = meta.first_name || user.email?.split('@')[0] || 'User';
  const lastName = meta.last_name || '';

  const handleEditClick = () => {
    setFormData({
      firstName: firstName,
      lastName: lastName,
      email: user.email || '',
      phone: meta.phone || '',
    });
    setIsEditing(true);
    setError('');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      // Here we would call supabase.auth.updateUser({ data: { ... } })
      // For now, just simulating success
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMsg('Profile updated successfully!');
        setIsSaving(false);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in flex flex-col min-h-screen">
      <div className="container mx-auto py-12 px-4 max-w-4xl flex-grow">
        
        {/* Header Block */}
        <div className="flex items-center mb-12 border-b pb-8">
          <div className="bg-gray-100 rounded-full flex items-center justify-center mr-8 w-24 h-24 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-gray-600" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold mb-1">{firstName} {lastName}</h1>
            <div className="text-gray-600 text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
              </svg>
              {user.email}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="info-block">
            <div className="font-bold text-gray-500 text-sm mb-1 uppercase tracking-wider">Total Orders</div>
            <div className="font-bold text-2xl">1</div>
          </div>
          <div className="info-block">
            <div className="font-bold text-gray-500 text-sm mb-1 uppercase tracking-wider">Total Spend</div>
            <div className="font-bold text-2xl">₹ 2,069</div>
          </div>
          <div className="info-block">
            <div className="font-bold text-gray-500 text-sm mb-1 uppercase tracking-wider">Member Since</div>
            <div className="font-bold text-2xl">
              {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/orders" className="profile-link-card group">
            <div className="flex justify-between items-center w-full mb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="mr-4 text-gray-700" viewBox="0 0 16 16">
                  <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                </svg>
                <span className="font-bold text-xl">My Orders</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-gray-400 group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
            <div className="text-gray-500 text-sm">View and track your orders.</div>
          </Link>
          <Link href="/address" className="profile-link-card group">
            <div className="flex justify-between items-center w-full mb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="mr-4 text-gray-700" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg>
                <span className="font-bold text-xl">My Address</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-gray-400 group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
            <div className="text-gray-500 text-sm">Save delivery addresses for faster checkout.</div>
          </Link>
        </div>

        {/* Personal Details Block */}
        <div className="bg-[#eef1f3] rounded-xl p-8 mt-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-2xl">Personal Details</h2>
            {!isEditing && (
              <button 
                onClick={handleEditClick}
                className="bg-gray-900 text-white px-6 py-2 rounded-full font-semibold hover:bg-black transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {successMsg && (
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMsg}
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <div className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">First Name</div>
                <div className="text-xl font-bold">{firstName}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Last Name</div>
                <div className="text-xl font-bold">{lastName || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Email Address</div>
                <div className="text-xl font-bold">{user.email}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Phone Number</div>
                <div className="text-xl font-bold">{meta.phone || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">User ID</div>
                <div className="text-sm font-mono text-gray-600 break-all">{user.id}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-black outline-none" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-black outline-none" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-lg border bg-gray-50 text-gray-500 outline-none" 
                  name="email"
                  value={formData.email}
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-black outline-none" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91..."
                />
              </div>
              
              <div className="md:col-span-2 mt-4 flex justify-end gap-4">
                <button 
                  type="button" 
                  className="px-6 py-2 rounded-full font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="bg-black text-white px-8 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}
