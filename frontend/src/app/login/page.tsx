"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;
      
      router.push('/profile');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  return (
    <div className="fade-in flex flex-col min-h-screen">
      <div className="container mx-auto py-20 px-4 flex-grow flex items-center justify-center">
        
        <div className="bg-[#eef1f3] rounded-2xl p-10 shadow-lg max-w-md w-full border border-white">
          <h1 className="font-serif text-4xl font-bold mb-8 text-center">Uniformly</h1>
          
          <h2 className="font-bold text-xl mb-6">Login to your account</h2>
          
          <form onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Email
              </label>
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
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Password
                </label>
                <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  className="w-full bg-white border border-gray-200 rounded-lg py-3 px-12 outline-none focus:ring-2 focus:ring-black" 
                  placeholder="Enter your password" 
                  value={form.password}
                  onChange={handleChange}
                  required 
                />
                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 mb-6"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login now'}
            </button>
            
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-blue-50 text-blue-800 font-bold py-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 mb-8"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
            
            <div className="text-center text-sm text-gray-500">
              Don't have an account? <Link href="/register" className="font-bold text-blue-600 hover:underline">Sign Up</Link>
            </div>
          </form>
        </div>

      </div>
      <Footer />
    </div>
  );
}
