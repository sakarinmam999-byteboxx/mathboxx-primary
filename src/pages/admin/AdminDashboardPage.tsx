import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CreditCard, Files, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageProps } from '../public/LandingPage';
import { supabase } from '../../lib/supabase';

export const AdminDashboardPage: React.FC<PageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeSubs: number;
    expiringSoonSubs: number;
    expiredSubs: number;
    pendingPayments: number;
    isLoading: boolean;
  }>({
    totalUsers: 0,
    activeSubs: 0,
    expiringSoonSubs: 0,
    expiredSubs: 0,
    pendingPayments: 0,
    isLoading: true,
  });

  const fetchDashboardStats = async () => {
    setStats((prev) => ({ ...prev, isLoading: true }));
    try {
      // 1. Total Users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Pending Payment Requests
      const { count: pendingCount } = await supabase
        .from('payment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // 3. Subscriptions Stats
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('id, status, end_date');

      let activeSubs = 0;
      let expiringSoonSubs = 0;
      let expiredSubs = 0;
      const now = new Date();

      (subs || []).forEach((sub) => {
        const isStatusActive = sub.status === 'active';
        if (sub.end_date) {
          const endDateObj = new Date(sub.end_date);
          const diffTime = endDateObj.getTime() - now.getTime();
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (daysRemaining <= 0 || sub.status === 'expired') {
            expiredSubs += 1;
          } else if (isStatusActive && daysRemaining <= 7) {
            activeSubs += 1;
            expiringSoonSubs += 1;
          } else if (isStatusActive) {
            activeSubs += 1;
          }
        } else if (isStatusActive) {
          activeSubs += 1;
        } else if (sub.status === 'expired') {
          expiredSubs += 1;
        }
      });

      setStats({
        totalUsers: usersCount || 0,
        activeSubs,
        expiringSoonSubs,
        expiredSubs,
        pendingPayments: pendingCount || 0,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setStats((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" />
            <span>Admin Dashboard — ภาพรวมระบบ MathBoxx Primary</span>
          </h1>
          <p className="text-xs text-slate-500">ศูนย์ควบคุมและตรวจสอบสถิติการใช้งาน สิทธิ์สมาชิก และสถิติการหมดอายุแพ็กเกจ</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchDashboardStats}>
          รีเฟรชสถิติ
        </Button>
      </div>

      {/* Subscription Expiration & Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card hoverable onClick={() => onNavigate('/admin/payments')} className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">สลิปรอการตรวจสอบ</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {stats.isLoading ? '—' : stats.pendingPayments} <span className="text-xs font-normal text-slate-400">คำขอ</span>
          </p>
        </Card>

        <Card hoverable onClick={() => onNavigate('/admin/users')} className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Active ทั้งหมด</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-2">
            {stats.isLoading ? '—' : stats.activeSubs} <span className="text-xs font-normal text-slate-400">บัญชี</span>
          </p>
        </Card>

        <Card hoverable onClick={() => onNavigate('/admin/users')} className="p-5 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">ใกล้หมดอายุ (≤ 7 วัน)</span>
            <AlertTriangle className="w-5 h-5 text-sky-500" />
          </div>
          <p className="text-3xl font-black text-sky-700 mt-2">
            {stats.isLoading ? '—' : stats.expiringSoonSubs} <span className="text-xs font-normal text-slate-400">บัญชี</span>
          </p>
        </Card>

        <Card hoverable onClick={() => onNavigate('/admin/users')} className="p-5 border-l-4 border-l-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">หมดอายุแล้ว</span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-600 mt-2">
            {stats.isLoading ? '—' : stats.expiredSubs} <span className="text-xs font-normal text-slate-400">บัญชี</span>
          </p>
        </Card>
      </div>

      {/* Live System Overview Summary */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-bold text-slate-900">สรุปสถิติผู้ใช้งานและสถานะระบบ Live Database</h3>
          <Badge variant={stats.pendingPayments > 0 ? 'coral' : 'mint'}>
            {stats.pendingPayments > 0 ? `${stats.pendingPayments} Pending` : 'ระบบปกติ'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200/80">
            <p className="font-bold text-slate-900 text-sm">การจัดลำดับการดูแลแพ็กเกจสมาชิก</p>
            <p>• <span className="font-bold text-emerald-700">Active ทั้งหมด:</span> {stats.activeSubs} บัญชีผู้ใช้</p>
            <p>• <span className="font-bold text-sky-700">ใกล้หมดอายุภายใน 7 วัน:</span> {stats.expiringSoonSubs} บัญชีผู้ใช้</p>
            <p>• <span className="font-bold text-slate-600">หมดอายุแล้ว:</span> {stats.expiredSubs} บัญชีผู้ใช้</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200/80">
            <p className="font-bold text-slate-900 text-sm">การดำเนินการทางแอดมิน</p>
            <p>• สลิปโอนเงินรอการตรวจสอบอนุมัติ: {stats.pendingPayments} รายการ</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              onClick={() => onNavigate('/admin/payments')}
            >
              ไปหน้าตรวจสอบชำระเงิน
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
