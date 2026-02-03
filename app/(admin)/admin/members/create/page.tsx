"use client";

import React, { useState, useEffect } from 'react';
import {
    UserPlus, ArrowLeft, Save, ShieldCheck, Phone,
    User, CheckCircle2, RefreshCcw, X
} from 'lucide-react';
import Link from 'next/link';

export default function NewMemberPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);

    // ฟังก์ชันจัดการการกรอก OTP ให้เลื่อนไปช่องถัดไปอัตโนมัติ
    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        if (element.nextSibling && element.value !== "") {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // จำลองการส่งข้อมูลและเปิด Modal OTP
        setTimeout(() => {
            setIsLoading(false);
            setShowOtpModal(true);
        }, 1000);
    };

    const handleVerifyOtp = () => {
        setIsLoading(true);
        // Logic ยืนยัน OTP
        console.log("Verifying OTP:", otp.join(''));
        setTimeout(() => {
            setIsLoading(false);
            alert("สร้างบัญชีสมาชิกสำเร็จ!");
            setShowOtpModal(false);
        }, 1500);
    };

    // Timer สำหรับส่งรหัสใหม่
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showOtpModal && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [showOtpModal, timer]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 relative">

            {/* ส่วน Header และ Form เดิม */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900 font-sans">เพิ่มสมาชิกใหม่</h1>
                    <p className="text-sm text-slate-500 font-sans">กรอกข้อมูลเบื้องต้นเพื่อสร้างบัญชีผู้ใช้งาน</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                                <User size={18} className="text-teal-600" />
                                ข้อมูลส่วนบุคคล
                            </h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 ml-1">ชื่อจริง</label>
                                    <input required type="text" placeholder="ชื่อ" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 ml-1">นามสกุล</label>
                                    <input required type="text" placeholder="นามสกุล" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1">เบอร์โทรศัพท์</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input required type="tel" maxLength={10} placeholder="08x-xxx-xxxx" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex gap-3">
                            <ShieldCheck className="text-teal-600 shrink-0" size={20} />
                            <p className="text-xs text-teal-700 leading-relaxed">ระบบจะส่งรหัส OTP ไปยังเบอร์ที่ระบุเพื่อยืนยันตัวตนก่อนสร้างบัญชี</p>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full h-12 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50">
                            {isLoading ? "กำลังส่งข้อมูล..." : "ถัดไป: ยืนยัน OTP"}
                        </button>
                    </div>
                </div>
            </form>

            {/* --- OTP MODAL --- */}
            {showOtpModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-8 relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16" />

                        <div className="relative z-10 text-center space-y-2">
                            <div className="mx-auto w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-4">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 font-sans">ยืนยันรหัส OTP</h3>
                            <p className="text-sm text-slate-500">ระบบได้ส่งรหัส 6 หลักไปที่เบอร์ <br /><span className="font-bold text-slate-700">08x-xxx-5678</span></p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button
                                onClick={handleVerifyOtp}
                                disabled={otp.join('').length < 6 || isLoading}
                                className="w-full h-14 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100"
                            >
                                {isLoading ? "กำลังตรวจสอบ..." : "ยืนยันการสร้างบัญชี"}
                            </button>

                            <div className="text-center">
                                {timer > 0 ? (
                                    <p className="text-xs text-slate-400">ส่งรหัสใหม่อีกครั้งใน <span className="font-bold text-teal-600">{timer}</span> วินาที</p>
                                ) : (
                                    <button onClick={() => setTimer(60)} className="text-xs font-bold text-teal-600 hover:underline flex items-center justify-center gap-1 mx-auto">
                                        <RefreshCcw size={12} /> ส่งรหัสใหม่อีกครั้ง
                                    </button>
                                )}
                            </div>
                        </div>

                        <button onClick={() => setShowOtpModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}