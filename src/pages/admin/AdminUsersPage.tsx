import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, RefreshCw, Calendar, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageProps } from '../public/LandingPage';
import { supabase } from '../../lib/supabase';

export const AdminUsersPage: React.FC<PageProps> = () => {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all profiles from public.profiles
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profErr) {
        console.error('Error fetching profiles:', profErr.message);
        setUsersList([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch all subscription_plans to build master dictionary
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*');

      const planMapById = new Map<string, any>();
      const planMapByCode = new Map<string, any>();
      (plansData || []).forEach((p) => {
        if (p.id) planMapById.set(p.id, p);
        if (p.code) planMapByCode.set(p.code, p);
      });

      // 3. Fetch active subscriptions (with joined subscription_plans)
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(id, code, name_th, worksheet_limit, question_limit)')
        .eq('status', 'active');

      const subMapByUser = new Map<string, any>();
      (subsData || []).forEach((sub) => {
        if (sub.user_id) {
          subMapByUser.set(sub.user_id, sub);
        }
      });

      // 4. Fetch enabled user_app_access (with joined subscriptions & subscription_plans)
      const { data: accessData } = await supabase
        .from('user_app_access')
        .select('*, subscriptions(*, subscription_plans(*))')
        .eq('is_enabled', true);

      const accessMapByUser = new Map<string, any>();
      (accessData || []).forEach((acc) => {
        if (acc.user_id) {
          accessMapByUser.set(acc.user_id, acc);
        }
      });

      // 5. Format user profile list with expiration date & days remaining
      const formatted = (profiles || []).map((p) => {
        const activeSub = subMapByUser.get(p.id);
        const appAccess = accessMapByUser.get(p.id);

        let resolvedPlan: any = null;

        if (activeSub?.subscription_plans && (activeSub.subscription_plans.name_th || activeSub.subscription_plans.code)) {
          resolvedPlan = activeSub.subscription_plans;
        }

        if (!resolvedPlan && activeSub?.plan_id) {
          resolvedPlan = planMapById.get(activeSub.plan_id) || planMapByCode.get(activeSub.plan_id);
        }

        if (!resolvedPlan && appAccess) {
          if (appAccess.subscriptions?.subscription_plans) {
            resolvedPlan = appAccess.subscriptions.subscription_plans;
          } else if (appAccess.subscriptions?.plan_id) {
            const subPlanId = appAccess.subscriptions.plan_id;
            resolvedPlan = planMapById.get(subPlanId) || planMapByCode.get(subPlanId);
          }
        }

        const isUserActive = Boolean(activeSub || (appAccess && appAccess.is_enabled && appAccess.subscription_id));
        const planName = resolvedPlan?.name_th || (resolvedPlan?.code === 'premium_pro' ? 'Premium Pro' : resolvedPlan?.code === 'premium' ? 'Premium Teacher' : 'Free Starter');
        const worksheetLimit = resolvedPlan?.worksheet_limit !== undefined ? resolvedPlan.worksheet_limit : (isUserActive ? 50 : 5);

        // Calculate Expiration Date & Days Remaining from subscriptions.end_date
        const rawEndDate = activeSub?.end_date || appAccess?.subscriptions?.end_date;
        let endDateThai = 'ไม่มีวันหมดอายุ';
        let daysRemaining: number | null = null;
        let expiryBadgeLabel = 'ปกติ';
        let expiryBadgeVariant: 'mint' | 'sky' | 'coral' | 'neutral' = 'neutral';

        if (rawEndDate && isUserActive) {
          const endDateObj = new Date(rawEndDate);
          const now = new Date();
          const diffTime = endDateObj.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          endDateThai = endDateObj.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          if (daysRemaining > 7) {
            expiryBadgeLabel = `ปกติ (เหลือ ${daysRemaining} วัน)`;
            expiryBadgeVariant = 'mint';
          } else if (daysRemaining >= 4) {
            expiryBadgeLabel = `ใกล้หมดอายุ (เหลือ ${daysRemaining} วัน)`;
            expiryBadgeVariant = 'sky';
          } else if (daysRemaining >= 1) {
            expiryBadgeLabel = `หมดอายุเร็ว ๆ นี้ (เหลือ ${daysRemaining} วัน)`;
            expiryBadgeVariant = 'coral';
          } else {
            expiryBadgeLabel = 'หมดอายุแล้ว';
            expiryBadgeVariant = 'neutral';
          }
        } else if (!isUserActive) {
          expiryBadgeLabel = 'ไม่มีแพ็กเกจ';
          expiryBadgeVariant = 'neutral';
        }

        return {
          id: p.id,
          name: p.teacher_name || p.email?.split('@')[0] || 'คุณครู',
          email: p.email,
          school: p.school_name || '-',
          role: p.role === 'admin' ? 'Admin' : 'Teacher',
          packageName: isUserActive && !resolvedPlan ? 'Premium Teacher' : planName,
          packageStatus: isUserActive ? 'Active' : 'Free',
          endDateThai,
          daysRemaining,
          expiryBadgeLabel,
          expiryBadgeVariant,
          quota: `0 / ${worksheetLimit === -1 ? 'ไม่จำกัด' : worksheetLimit} ใบงาน`,
          createdWorksheets: 0,
          usedQuestions: 0,
          createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString('th-TH') : '-',
        };
      });

      setUsersList(formatted);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.school.toLowerCase().includes(term) ||
      u.packageName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-pastel-coral-400" />
            <span>จัดการผู้ใช้งานในระบบ (Users Management)</span>
          </h1>
          <p className="text-xs text-slate-500">ตรวจสอบรายละเอียดผู้ใช้งาน อีเมล โรงเรียน แพ็กเกจ วันหมดอายุ และสถานะสิทธิ์ในระบบ</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchUsers}>
          รีเฟรช
        </Button>
      </div>

      <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="ค้นหาตามชื่อครู อีเมล โรงเรียน หรือแพ็กเกจ..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="p-6">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-pastel-coral-400" />
            <span>กำลังโหลดข้อมูลผู้ใช้งาน...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            ยังไม่มีผู้ใช้งานตรงตามเงื่อนไขการค้นหา
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b">
                <tr>
                  <th className="p-3">ชื่อครู / อีเมล</th>
                  <th className="p-3">โรงเรียน</th>
                  <th className="p-3">สิทธิ์ / บทบาท</th>
                  <th className="p-3">แพ็กเกจปัจจุบัน</th>
                  <th className="p-3">วันหมดอายุ</th>
                  <th className="p-3">สถานะอายุ</th>
                  <th className="p-3 text-right">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="p-3 text-slate-600">{u.school}</td>
                    <td className="p-3">
                      <Badge variant={u.role === 'Admin' ? 'coral' : 'neutral'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={u.packageName.includes('Premium') ? 'mint' : 'neutral'}>
                        {u.packageName}
                      </Badge>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.endDateThai}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={u.expiryBadgeVariant}>
                        {u.expiryBadgeLabel}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelectedUser(u)}>
                        เปิดดู
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="max-w-lg w-full p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">รายละเอียดผู้ใช้งาน</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p><span className="font-bold text-slate-900">ชื่อ:</span> {selectedUser.name}</p>
              <p><span className="font-bold text-slate-900">อีเมล:</span> {selectedUser.email}</p>
              <p><span className="font-bold text-slate-900">สิทธิ์ระบบ:</span> {selectedUser.role}</p>
              <p><span className="font-bold text-slate-900">โรงเรียน:</span> {selectedUser.school}</p>
              <p><span className="font-bold text-slate-900">แพ็กเกจปัจจุบัน:</span> {selectedUser.packageName}</p>
              <p><span className="font-bold text-slate-900">วันหมดอายุแพ็กเกจ:</span> {selectedUser.endDateThai}</p>
              <p><span className="font-bold text-slate-900">สถานะอายุการใช้งาน:</span> {selectedUser.expiryBadgeLabel}</p>
              <p><span className="font-bold text-slate-900">โควตาการใช้งาน:</span> {selectedUser.quota}</p>
              <p><span className="font-bold text-slate-900">วันที่สมัครสมาชิก:</span> {selectedUser.createdAt}</p>
            </div>
            <div className="pt-3 flex justify-end border-t">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>ปิด</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
