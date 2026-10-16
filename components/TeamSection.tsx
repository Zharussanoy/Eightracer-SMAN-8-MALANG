"use client";

interface Member {
  name: string;
  role: string;
  sub: string;
  image?: string;
}

interface TeamGroup {
  id: string;
  name: string;
  members: Member[];
  layoutType: "diamond" | "grid-3-2";
}

const teamGroups: TeamGroup[] = [
  {
    id: "kelompok-B1",
    name: "Kelompok B1",
    layoutType: "diamond",
    members: [
      {
        name: "Naysilla Salsa Ardiyati",
        role: "Project Manager",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b1-naysilla.png",
      },
      {
        name: "Amalia Mayasari",
        role: "Back-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b1-amalia-mayasari.png",
      },
      {
        name: "Amalia Rizqi Kurniawati",
        role: "Front-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b1-amalia-rizqi.png",
      },
      {
        name: "Rusyda Octa Amalia",
        role: "UI/UX Designer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b1-rusyda.png",
      },
    ],
  },
  {
    id: "kelompok-B2",
    name: "Kelompok B2",
    layoutType: "diamond",
    members: [
      {
        name: "Mohammad Yan Hasby",
        role: "Project Manager",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b2-yan-hasby.png",
      },
      {
        name: "Aghnian Maela Darissa'adah",
        role: "Back-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b2-aghnian.png",
      },
      {
        name: "Iwang Evelyna Fa'azzaylanti",
        role: "Front-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b2-iwang.png",
      },
      {
        name: "Hilmiy Rukmana S",
        role: "UI/UX Designer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b2-hilmiy.png",
      },
    ],
  },
  {
    id: "kelompok-B3",
    name: "Kelompok B3",
    layoutType: "grid-3-2",
    members: [
      {
        name: "Hafiidz RIfqiy Syafera",
        role: "Front-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b3-hafiidz.png",
      },
      {
        name: "Muhammad Azharus Tsani",
        role: "Front-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b3-azharus.png",
      },
      {
        name: "Mashkaror Amnan Nidhom",
        role: "Back-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b3-mashkaror.png",
      },
      {
        name: "Ismail Tegar Rwatma Bhumi",
        role: "Back-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b3-ismail.png",
      },
      {
        name: "Rasya Fariz Cahyo Pratama",
        role: "UI/UX Designer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b3-rasya.png",
      },
    ],
  },
  {
    id: "kelompok-B4",
    name: "Kelompok B4",
    layoutType: "grid-3-2",
    members: [
      {
        name: "Ossa Amelia Zuhra Lubis",
        role: "Back-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b4-ossa.png",
      },
      {
        name: "Shelfina Khayla Anindita",
        role: "Project Manager",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b4-shelfina.png",
      },
      {
        name: "Muhammad Ahmad Rofi’us Su’ud",
        role: "Front-end Developer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b4-rofi.png",
      },
      {
        name: "Nashifa Zulfa Insani",
        role: "Quality Assurance",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b4-nashifa.png",
      },
      {
        name: "Syifa Zahra Amelia Shofa",
        role: "UI/UX Designer",
        sub: "Pendidikan Teknologi Informasi",
        image: "/team/b4-syifa.png",
      },
    ],
  },
];

function MemberCard({ member }: { member: Member }) {
  return (
    <div className="relative flex flex-col items-center w-full max-w-[270px] mx-auto group">
      {/* Arch Card Container */}
      <div className="w-full h-[320px] sm:h-[350px] rounded-t-[60px] rounded-b-2xl border-2 border-[#5F089E]/40 bg-gradient-to-b from-[#f3ebfa] via-[#be98dc] to-[#7322a3] shadow-md group-hover:shadow-xl group-hover:border-[#5F089E]/70 group-hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-end p-5 text-center relative">
        {/* Member Photo Area with Avatar Fallback */}
        <div className="absolute inset-x-0 bottom-16 top-6 flex items-center justify-center overflow-hidden">
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-contain object-bottom drop-shadow-md z-10 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}

          {/* Dummy Avatar Silhouette (tampil di latar belakang kartu) */}
          <div className="absolute inset-x-0 top-6 bottom-4 flex items-center justify-center opacity-25 group-hover:opacity-35 transition-opacity pointer-events-none">
            <svg
              className="w-24 h-24 text-[#5F089E]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        {/* Nama & Subtitle */}
        <div className="relative z-10 pb-4">
          <h4 className="font-extrabold text-white text-sm sm:text-base tracking-tight leading-snug drop-shadow-md line-clamp-2">
            {member.name}
          </h4>
          <p className="text-[11px] text-purple-100 font-medium tracking-wide mt-1 drop-shadow-sm">
            {member.sub}
          </p>
        </div>
      </div>

      {/* Role */}
      <div className="relative -mt-4 z-20 px-5 py-1.5 rounded-full bg-[#FCC850] text-slate-900 font-bold text-xs shadow-md shadow-amber-500/25 tracking-wide whitespace-nowrap group-hover:scale-105 transition-all">
        {member.role}
      </div>
    </div>
  );
}

export default function TeamSection() {
  return (
    <section id="tim-pengembang" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bagian */}
        <div className="max-w-3xl mb-16 text-left">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#5F089E] uppercase block mb-2">
            TIM PENGEMBANG
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Siapa Dibalik Berdirinya Website Ini?
          </h2>
          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Sistem ini dirancang dan dikembangkan bersama oleh tim B1 hingga B4.
            Mahasiswa program studi Pendidikan Teknologi Informasi 2024,
            Universitas Brawijaya.
          </p>
        </div>

        {/* Team Groups */}
        <div className="space-y-24">
          {teamGroups.map((group) => (
            <div key={group.id} className="relative">
              <div className="mb-10 flex items-center gap-4">
                <span className="inline-block px-6 py-2 rounded-full bg-[#FCC850] text-slate-900 font-extrabold text-sm shadow-sm">
                  {group.name}
                </span>
                <div className="flex-1 h-[1.5px] bg-[#FCC850]/50 hidden sm:block" />
              </div>

              {/* Layout Anggota Tim */}
              {group.layoutType === "diamond" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 lg:gap-12 max-w-5xl mx-auto">
                  {/* Kiri: Backend Developer (group.members[1]) */}
                  <div className="flex justify-center items-center">
                    <MemberCard member={group.members[1]} />
                  </div>

                  {/* Tengah: Top PM (group.members[0]) + Bottom UI/UX (group.members[3]) */}
                  <div className="flex flex-col items-center gap-10 justify-center">
                    <MemberCard member={group.members[0]} />
                    <MemberCard member={group.members[3]} />
                  </div>

                  {/* Kanan: Frontend Developer (group.members[2]) */}
                  <div className="flex justify-center items-center">
                    <MemberCard member={group.members[2]} />
                  </div>
                </div>
              ) : (
                /* 3 - 2 Grid Layout */
                <div className="space-y-10">
                  {/* Atas: 3 members */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto justify-items-center">
                    {group.members.slice(0, 3).map((member) => (
                      <MemberCard key={member.name} member={member} />
                    ))}
                  </div>

                  {/* Bawah: 2 members */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto justify-items-center">
                    {group.members.slice(3).map((member) => (
                      <MemberCard key={member.name} member={member} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
