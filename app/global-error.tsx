"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            เกิดข้อผิดพลาดร้ายแรง
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {error.message || "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง"}
          </p>
          <button
            onClick={reset}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            ลองใหม่
          </button>
        </div>
      </body>
    </html>
  );
}
