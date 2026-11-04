import Image from "next/image";
import type { FaktorKelulusan } from "../types";
import FaktorProgressItem from "./FaktorProgressItem";

interface FaktorKelulusanCardProps {
  faktorList: FaktorKelulusan[];
}

export default function FaktorKelulusanCard({ faktorList }: FaktorKelulusanCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      {/* Left: Illustration Anak-Anak Lulus */}
      <div className="flex justify-center items-center lg:justify-start">
        <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-[542/428]">
          <Image
            src="/images/ai-strategi-jurusan/anak-anakLulus.svg"
            alt="Ilustrasi siswa merayakan kelulusan"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      {/* Right: Card Faktor Penentu Kelulusan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
        <div className="space-y-1">
          <h4 className="text-base font-black text-slate-900">Faktor Penentu Kelulusan</h4>
          <p className="text-xs text-slate-500">Bobot faktor berdasarkan analisis AI</p>
        </div>
        <div className="space-y-5">
          {faktorList.map((faktor, index) => (
            <FaktorProgressItem key={index} faktor={faktor} />
          ))}
        </div>
      </div>
    </div>
  );
}
