import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-light p-6">
      <div className="max-w-md text-center">
        <p className="text-6xl font-bold text-primary mb-4">404</p>
        <h2 className="text-lg font-bold text-text-dark mb-2">
          ไม่พบหน้าที่คุณต้องการ
        </h2>
        <p className="text-sm text-text-medium mb-6">
          URL ที่คุณเข้าถึงอาจไม่ถูกต้องหรือหน้านี้ถูกย้ายแล้ว
        </p>
        <Link
          href="/admin"
          className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
