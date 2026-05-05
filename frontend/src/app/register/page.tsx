"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      alert('Registration successful! Please check your email for verification.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in flex flex-col min-h-screen">
      <div className="container mx-auto py-20 px-4 flex-grow flex items-center justify-center">
        
        <div className="bg-[#eef1f3] rounded-2xl p-10 shadow-lg max-w-md w-full border border-white">
          <h1 className="font-serif text-4xl font-bold mb-8 text-center">Uniformly</h1>
          
          <h2 className="font-bold text-xl mb-6">Create your account</h2>
          
          <form onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-black" 
                  placeholder="John" 
                  value={form.firstName}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-black" 
                  placeholder="Doe" 
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-black" 
                placeholder="abc@gmail.com" 
                value={form.email}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-black" 
                placeholder="+91..." 
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
              <input 
                type="password" 
                name="password"
                className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-black" 
                placeholder="Create a password" 
                value={form.password}
                onChange={handleChange}
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 mb-6"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            
            <div className="text-center text-sm text-gray-500">
              Already have an account? <Link href="/login" className="font-bold text-blue-600 hover:underline">Log In</Link>
            </div>
          </form>
        </div>

      </div>
      <Footer />
    </div>
  );
}
