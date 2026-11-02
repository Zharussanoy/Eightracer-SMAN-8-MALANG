import Image from "next/image";
import type { FaktorKelulusan } from "../types";
import FaktorProgressItem from "./FaktorProgressItem";

interface FaktorKelulusanCardProps {
  faktorList: FaktorKelulusan[];
}

export default function FaktorKelulusanCard({ faktorList }: FaktorKelulusanCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      {/* Left: Illustration */}
      <div className="flex justify-center lg:justify-start">
        <div className="w-64 h-64 sm:w-72 sm:h-72">
          <Image
            src="/images/student.svg"
            alt="Ilustrasi siswa merayakan kelulusan"
            width={288}
            height={288}
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      </div>

      {/* Right: Card */}
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
