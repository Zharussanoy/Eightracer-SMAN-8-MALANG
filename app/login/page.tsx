'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Silakan isi username dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal. Periksa username dan kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#D3C4E3] flex justify-center lg:justify-end overflow-hidden font-sans">

      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <Link
          href="/"
          className="flex items-center gap-1.5 md:gap-2 px-3.5 py-2 md:px-4 md:py-2.5 rounded-full bg-white/70 hover:bg-white text-slate-700 hover:text-[#5B0EA6] backdrop-blur-md shadow-xs hover:shadow-md transition-all font-semibold text-[13px] md:text-sm"
        >
          <ArrowLeft className="w-4 h-4 md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">Kembali ke Beranda</span>
          <span className="sm:hidden">Kembali</span>
        </Link>
      </div>

      <div className="absolute inset-0 w-full lg:w-[55%] xl:w-[60%] h-full z-0 pointer-events-none flex flex-col justify-end">

        <motion.img
          src="/images/login/awan.svg"
          alt="Awan Kiri"
          animate={{ x: [-20, 20, -20], y: [-5, 5, -5] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[8%] left-[5%] w-[120px] lg:w-[220px] opacity-85"
        />
        <motion.img
          src="/images/login/awan.svg"
          alt="Awan Kanan"
          animate={{ x: [20, -20, 20], y: [5, -5, 5] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] right-[10%] w-[160px] lg:w-[280px] opacity-75"
        />
        <motion.img
          src="/images/login/awan.svg"
          alt="Awan Tengah"
          animate={{ x: [-15, 15, -15] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[25%] left-[40%] w-[100px] lg:w-[150px] opacity-55"
        />

        <div className="absolute bottom-0 left-0 w-full flex justify-center lg:justify-start">
          <img
            src="/images/login/sekolah.svg"
            alt="Sekolah"
            className="w-full min-w-[800px] lg:min-w-[1200px] h-auto object-bottom"
          />
        </div>

        <div className="absolute bottom-0 left-0 w-full flex justify-center items-end">
          <img
            src="/images/login/pohon.svg"
            alt="Pohon"
            className="absolute bottom-0 -right-[5%] lg:right-[5%] h-[35vh] lg:h-[50vh] object-contain object-bottom"
          />
          <motion.img
            src="/images/login/anak_sekolah.svg"
            alt="Siswa"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 h-[25vh] lg:h-[40vh] object-contain object-bottom -mb-1 lg:-ml-[10%]"
          />
        </div>
      </div>

      <div className="relative z-20 w-full max-w-[90%] sm:max-w-[420px] lg:max-w-none lg:w-[45%] xl:w-[40%] bg-white/95 lg:bg-white backdrop-blur-xl lg:backdrop-blur-none shadow-2xl lg:shadow-[-20px_0_40px_rgba(0,0,0,0.08)] rounded-[2rem] lg:rounded-none my-auto lg:my-0 min-h-[450px] lg:min-h-screen flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-20">

        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center mb-8 lg:mb-10">
            <img src="/images/logo.svg" alt="Logo" className="w-14 h-14 lg:w-16 lg:h-16 object-contain mb-5" />
            <h1 className="text-2xl lg:text-3xl font-bold text-[#1E1B2E] text-center m-0">Masuk ke Akun Anda</h1>
            <p className="text-slate-500 text-sm mt-2 text-center">Gunakan akses yang diberikan oleh sekolah</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-[13px] lg:text-sm text-center font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:gap-5">

            <div className="flex items-center bg-[#F8FAFC] border border-slate-200 focus-within:border-[#5B0EA6] focus-within:ring-1 focus-within:ring-[#5B0EA6] rounded-xl px-4 transition-all">
              <User className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (NISN)"
                className="flex-1 py-3.5 px-3 bg-transparent border-none outline-none text-[#1E293B] text-[15px] w-full placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center bg-[#F8FAFC] border border-slate-200 focus-within:border-[#5B0EA6] focus-within:ring-1 focus-within:ring-[#5B0EA6] rounded-xl px-4 transition-all">
              <Lock className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                className="flex-1 py-3.5 px-3 bg-transparent border-none outline-none text-[#1E293B] text-[15px] w-full placeholder:text-slate-400"
              />
              <div onClick={() => setShowPassword(!showPassword)} className="cursor-pointer flex items-center p-1.5 hover:bg-slate-200 rounded-md transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5 text-slate-500" /> : <Eye className="w-5 h-5 text-slate-500" />}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 lg:mt-4 py-4 bg-[#5B0EA6] text-white font-bold text-[15px] rounded-xl border-none cursor-pointer flex justify-center items-center hover:bg-[#4a0b87] active:scale-[0.98] transition-all shadow-md shadow-purple-900/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}