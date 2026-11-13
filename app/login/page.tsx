'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { ApiError } from '@/lib/eightracer-api';
import { loginDestination, loginIdentifier } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, currentUser, authStatus, authMessage, refreshSession } = useUser();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const submitting = useRef(false);

  useEffect(() => {
    if (isLoggedIn) router.replace(loginDestination(currentUser));
  }, [isLoggedIn, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current || authStatus === 'loading') return;
    setErrorMessage('');

    const identity = loginIdentifier(identifier);
    if (!identity || !password) {
      setErrorMessage('Isi email yang valid atau NISN 10 digit, lalu kata sandi akun.');
      return;
    }

    submitting.current = true;
    setIsLoading(true);
    try {
      await login({ ...identity, password });
      setPassword('');
    } catch (error) {
      if (error instanceof ApiError) {
        const fields = Object.values(error.errors).flat().filter((value) => typeof value === 'string');
        setErrorMessage(fields.length ? fields.join(' ') : error.message);
      } else setErrorMessage('Login belum berhasil. Silakan coba lagi.');
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', backgroundColor: '#D3C4E3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>

      {/* ================= 0. LAPISAN AWAN ANIMASI (Z-0) ================= */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
        <motion.img
          src="/images/login/awan.svg"
          alt="Awan Kiri"
          animate={{ x: [-20, 20, -20], y: [-5, 5, -5] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '8%', left: '4%', width: '220px', opacity: 0.85 }}
        />
        <motion.img
          src="/images/login/awan.svg"
          alt="Awan Kanan"
          animate={{ x: [20, -20, 20], y: [5, -5, 5] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '12%', right: '6%', width: '280px', opacity: 0.75 }}
        />
        <motion.img
          src="/images/login/awan.svg"
          alt="Awan Tengah"
          animate={{ x: [-15, 15, -15] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '22%', left: '40%', width: '150px', opacity: 0.55 }}
        />
      </div>

      {/* ================= 1. LAPISAN BELAKANG SEKOLAH (Z-0) ================= */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 0, display: 'flex', justifyContent: 'center' }}>
        <img
          src="/images/login/sekolah.svg"
          alt="Sekolah"
          style={{ width: '100%', minWidth: '1000px', height: 'auto', display: 'block' }}
        />
      </div>

      {/* ================= 2. LAPISAN TENGAH (Card Login) Z-10 ================= */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px', padding: '0 16px', marginBottom: '12vh' }}>

        {/* Ornamen Bintang */}
        <motion.svg animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} viewBox="0 0 24 24" fill="#FBBF24" style={{ position: 'absolute', left: '-10px', top: '40px', width: '32px', height: '32px', zIndex: 0, pointerEvents: 'none' }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </motion.svg>
        <motion.svg animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} viewBox="0 0 24 24" fill="#FBBF24" style={{ position: 'absolute', right: '-30px', top: '-15px', width: '56px', height: '56px', zIndex: 0, pointerEvents: 'none' }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </motion.svg>

        {/* Kotak Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '40px 32px 48px', position: 'relative', zIndex: 10 }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/images/logo.svg" alt="Logo Eightracer" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E1B2E', margin: 0 }}>Masuk ke Akun Anda</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>Gunakan email atau NISN dan kata sandi akun sekolah.</p>
          </div>

          {(errorMessage || authMessage) && (
            <div role="alert" style={{ marginBottom: '16px', padding: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '12px', textAlign: 'center' }}>
              {errorMessage || authMessage}
            </div>
          )}
          {authStatus === 'loading' && <p role="status" style={{ fontSize: '13px', marginBottom: '12px' }}>Memeriksa sesi akun…</p>}
          {authStatus === 'unavailable' && <button type="button" onClick={() => void refreshSession()} style={{ color: '#6500ad', marginBottom: '12px' }}>Periksa sesi lagi</button>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F4F4F5', borderRadius: '12px', padding: '0 16px' }}>
              <User size={18} color="#9CA3AF" />
              <input
                type="text"
                required
                name="identifier"
                aria-label="Email atau NISN"
                autoComplete="username"
                maxLength={254}
                disabled={isLoading}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email atau NISN"
                style={{ flex: 1, padding: '14px 12px', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#1E293B', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F4F4F5', borderRadius: '12px', padding: '0 16px' }}>
              <Lock size={18} color="#9CA3AF" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                name="password"
                aria-label="Kata sandi"
                autoComplete="current-password"
                maxLength={256}
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                style={{ flex: 1, padding: '14px 12px', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#1E293B', fontSize: '14px' }}
              />
              <button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', border: 0, background: 'transparent' }}>
                {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || authStatus === 'loading' || isLoggedIn}
              style={{ width: '100%', marginTop: '8px', padding: '14px', backgroundColor: '#5B0EA6', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
            >
              {isLoading ? <span role="status">Memeriksa akun…</span> : 'Masuk'}
            </button>
          </form>
        </motion.div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 0, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>

        <img
          src="/images/login/pohon.svg"
          alt="Pohon"
          style={{ position: 'absolute', bottom: 0, right: '-3%', height: '55vh', minHeight: '300px', objectFit: 'contain', objectPosition: 'bottom' }}
        />

        <motion.img
          src="/images/login/anak_sekolah.svg"
          alt="Siswa"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ height: '38vh', minHeight: '280px', objectFit: 'contain', objectPosition: 'bottom', marginBottom: '-5px' }}
        />
      </div>

    </div>
  );
}
