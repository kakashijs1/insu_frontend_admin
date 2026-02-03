"use client";

import React, { useState } from 'react';
import { 
  UserCog, Search, Filter, MoreHorizontal, 
  ShieldCheck, ShieldAlert, UserPlus, Trash2, 
  Edit3, CheckCircle2, XCircle, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUserManagePage() {
  // จำลองข้อมูลเจ้าหน้าที่
  const adminUsers = [
    { id: 1, name: 'อนันต์ สุขสำราญ', username: 'admin_anan', role: 'Super Admin', status: 'active', lastLogin: '2 ชั่วโมงที่แล้ว' },
    { id: 2, name: 'วิภาวี รักงาน', username: 'staff_wipa', role: 'Editor', status: 'active', lastLogin: '1 วันที่แล้ว' },
    { id: 3, name: 'กิตติพงษ์ มั่นคง', username: 'staff_kitti', role: 'Viewer', status: 'inactive', lastLogin: '5 วันที่แล้ว' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-teal-600 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">จัดการ User เจ้าหน้าที่</h1>
            <p className="text-sm text-slate-500">ตรวจสอบและตั้งค่าสิทธิ์การเข้าถึงของทีมงานหลังบ้าน</p>
          </div>
        </div>
        <Link 
          href="/admin/users/create" 
          className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <UserPlus size={18} />
          สร้าง User ใหม่
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อเจ้าหน้าที่ หรือ Username..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            กรองระดับสิทธิ์
          </button>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 uppercase text-[11px] font-bold tracking-[0.1em]">
                <th className="px-8 py-5 border-b border-slate-100">ชื่อเจ้าหน้าที่ / Username</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">ระดับสิทธิ์ (Role)</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">เข้าใช้งานล่าสุด</th>
                <th className="px-6 py-5 border-b border-slate-100 text-center">สถานะ</th>
                <th className="px-8 py-5 border-b border-slate-100 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {adminUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                        <span className="text-xs text-slate-400 font-mono">@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                        user.role === 'Super Admin' 
                        ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {user.role === 'Super Admin' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-xs text-slate-500 font-medium">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {user.status === 'active' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <CheckCircle2 size={12} /> Online
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          <XCircle size={12} /> Inactive
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/admin/users/edit`} // ใช้ Path edit ที่คุณสร้างไว้
                        className="p-2 text-slate-400 hover:bg-white hover:text-teal-600 hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-100"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button className="p-2 text-slate-400 hover:bg-white hover:text-red-500 hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-red-50">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <p>แสดงทั้งหมด 3 บัญชีเจ้าหน้าที่</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">ก่อนหน้า</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">ถัดไป</button>
          </div>
        </div>
      </div>
    </div>
  );
}