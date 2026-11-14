"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getB4HomeHref } from "@/lib/b4-navigation";
import FigmaIcon from "./FigmaIcon";
import "./capstone.css";

export default function CapstoneNavbar({ pathname }: { pathname: string }) {
  const { currentUser, isLoggedIn, getDisplayRole, logout } = useUser();
  const [menu, setMenu] = useState<"services" | "account" | "mobile" | null>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    function close(event: PointerEvent) { if (event.target instanceof Node && !root.current?.contains(event.target)) setMenu(null); }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const close = () => setMenu(null);
  const home = getB4HomeHref(pathname, currentUser.role, currentUser.schoolStaff);
  return <header className="b4-capstoneNav" ref={root} onKeyDown={event => {
    if (event.key === "Escape") { root.current?.querySelector<HTMLButtonElement>(`[aria-controls="b4-${menu}-menu"]`)?.focus(); close(); }
  }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <div className="b4-capstoneNavInner">
      <Link href="/" className="b4-capstoneBrand" aria-label="Eightracer, beranda" onClick={close}><Image src="/images/b4/figma/c5964.png" width={47} height={41} alt="" /><span><b>Eight</b>racer</span></Link>
      <nav className="b4-capstoneMainNav" aria-label="Navigasi utama">
        <Link href="/" onClick={close}>Beranda</Link>
        <div className="b4-capstoneMenu">
          <button type="button" className="b4-capstoneActive" aria-expanded={menu === "services"} aria-controls="b4-services-menu" onClick={() => setMenu(menu === "services" ? null : "services")}>Layanan <FigmaIcon name="caret" size={20} /></button>
          {menu === "services" && <div id="b4-services-menu" className="b4-capstoneDropdown"><Link href="/#layanan" onClick={close}>Pemetaan Profil Nilai</Link><Link href="/#layanan" onClick={close}>Kelolosan Seleksi PTN</Link><Link href="/alumni?tab=direktori" onClick={close}>Data Kelulusan &amp; Kampus</Link><Link href="/#layanan" onClick={close}>Perkembangan &amp; Karier Alumni</Link><Link className="b4-capstoneSelected" href={home} onClick={close}>Alumni dan Beasiswa</Link></div>}
        </div>
        <Link href="/#tentang" onClick={close}>Tentang Kami</Link><Link href="/tim-pengembang" onClick={close}>Pengembang</Link>
      </nav>
      <div className="b4-capstoneAccount b4-capstoneMenu">{isLoggedIn ? <>
        <button type="button" aria-expanded={menu === "account"} aria-controls="b4-account-menu" onClick={() => setMenu(menu === "account" ? null : "account")}><FigmaIcon name="account" size={36} /><span><span>{currentUser.name}</span><small>{getDisplayRole().label}</small></span><FigmaIcon name="caret" size={20} /></button>
        {menu === "account" && <div id="b4-account-menu" className="b4-capstoneDropdown"><Link href="/profile" onClick={close}>Profil saya</Link><button type="button" onClick={() => { close(); void logout(); }}>Keluar</button></div>}
      </> : <Link href="/login" className="b4-capstoneLogin">Masuk</Link>}</div>
      <button className="b4-capstoneMobileToggle" type="button" aria-label={menu === "mobile" ? "Tutup navigasi" : "Buka navigasi"} aria-expanded={menu === "mobile"} aria-controls="b4-mobile-menu" onClick={() => setMenu(menu === "mobile" ? null : "mobile")}>{menu === "mobile" ? <X /> : <Menu />}</button>
    </div>
    {menu === "mobile" && <nav id="b4-mobile-menu" className="b4-capstoneMobile" aria-label="Navigasi seluler"><Link href="/" onClick={close}>Beranda</Link><Link href={home} onClick={close}>Alumni dan Beasiswa</Link><Link href="/#tentang" onClick={close}>Tentang Kami</Link><Link href="/tim-pengembang" onClick={close}>Pengembang</Link><Link href={isLoggedIn ? "/profile" : "/login"} onClick={close}>{isLoggedIn ? `${currentUser.name} · ${getDisplayRole().label}` : "Masuk"}</Link></nav>}
  </header>;
}
