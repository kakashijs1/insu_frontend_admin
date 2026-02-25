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
      <body className="flex min-h-screen items-center justify-center bg-bg-light p-6">
        <div className="max-w-md text-center">
          <h2 className="text-lg font-bold text-text-dark mb-2">
            เกิดข้อผิดพลาดร้ายแรง
          </h2>
          <p className="text-sm text-text-medium mb-6">
            {error.message || "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง"}
          </p>
          <button
            onClick={reset}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary"
          >
            ลองใหม่
          </button>
        </div>
      </body>
    </html>
  );
}
