import React, { useState } from "react";
import { TimelineIndicator } from "./TimelineIndicator";

// Data simulasi untuk linimasa
const MOCK_DATA = [
  {
    id: 1,
    title: "Pendaftaran Akun",
    time: "09:00 AM",
    description: "Lengkapi semua detail pribadi dan kontak Anda.",
  },
  {
    id: 2,
    title: "Verifikasi Identitas",
    time: "10:30 AM",
    description: "Unggah dokumen identitas dan tunggu persetujuan.",
  },
  {
    id: 3,
    title: "Pilih Paket Layanan",
    time: "12:00 PM",
    description: "Pilih antara paket Basic, Pro, atau Enterprise.",
  },
  {
    id: 4,
    title: "Konfigurasi Awal",
    time: "02:00 PM",
    description: "Atur preferensi dan notifikasi akun Anda.",
  },
  {
    id: 5,
    title: "Selesai",
    time: "04:30 PM",
    description: "Anda siap menggunakan platform kami sepenuhnya!",
  },
];

/**
 * Komponen pembungkus untuk mendemonstrasikan TimelineIndicator.
 * Komponen ini menyediakan struktur DOM yang dicari oleh TimelineIndicator (kelas .relative.flex.gap-1
 * dan elemen anak dengan kelas .time-text).
 */
export const TimelineExample = ({
  initialData = MOCK_DATA,
  initialCurrentIndex = 1,
  initialCompletedUpTo = 0,
}) => {
  const [data, setData] = useState(initialData);
  const [currentIndex, setCurrentIndex] = useState(initialCurrentIndex);
  const [completedUpTo, setCompletedUpTo] = useState(initialCompletedUpTo);

  const handleIndicatorClick = (index) => {
    setCurrentIndex(index);
    // Logika sederhana: jika mengklik item yang belum selesai, tandai sebagai selesai.
    if (index > completedUpTo) {
      setCompletedUpTo(index - 1); // Tandai yang sebelumnya sebagai completed
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">
        Proses Aktivasi Akun
      </h1>

      {/* Container utama yang dicari oleh TimelineIndicator 
        Perhatikan kelas MANDATORI: "relative flex gap-1"
      */}
      <div className="relative flex gap-1">
        {/* Kolom Indikator (kiri) */}
        <div className="shrink-0">
          <TimelineIndicator
            data={data}
            currentIndex={currentIndex}
            completedUpTo={completedUpTo}
            onClick={handleIndicatorClick}
          />
        </div>

        {/* Kolom Konten (kanan) */}
        <div className="grow space-y-4 pt-4">
          {data.map((item, index) => {
            const isCompleted = index <= completedUpTo;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={item.id}
                className={`flex flex-col rounded-lg p-4 transition-colors duration-300 ${
                  isCurrent
                    ? "border-l-4 border-violet-600 bg-violet-50 shadow-md"
                    : "bg-gray-50"
                }`}
              >
                {/* Elemen Waktu yang dicari oleh TimelineIndicator untuk menghitung posisi.
                  Perhatikan kelas MANDATORI: "time-text"
                */}
                <p
                  className={`time-text mb-1 text-sm font-semibold ${isCompleted ? "text-violet-600" : "text-gray-500"}`}
                >
                  {item.time}
                </p>
                <h3
                  className={`text-xl font-bold ${isCurrent ? "text-violet-800" : "text-gray-900"}`}
                >
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>

                {/* Menambahkan sedikit padding untuk menguji perubahan posisi/ukuran DOM */}
                {isCurrent && <div className="h-4 bg-transparent"></div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 rounded-lg border bg-gray-100 p-4">
        <p>Status Saat Ini:</p>
        <p>
          Current Index:{" "}
          <span className="font-bold text-violet-600">{currentIndex}</span>{" "}
          (Langkah Aktif)
        </p>
        <p>
          Completed Up To:{" "}
          <span className="font-bold text-green-600">{completedUpTo}</span>{" "}
          (Langkah Terakhir yang Selesai)
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Klik indikator di sebelah kiri untuk mengubah status dan melihat
          indikator bergerak.
        </p>
      </div>
    </div>
  );
};
