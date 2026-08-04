import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Eye, RefreshCw, AlertCircle, Tag, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { PageProps } from '../public/LandingPage';

export interface PaymentRequestItem {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  slip_url: string;
  status: string;
  user_note?: string;
  created_at: string;
  profiles?: {
    teacher_name?: string;
    email?: string;
    school_name?: string;
  };
}

export const AdminPaymentsPage: React.FC<PageProps> = () => {
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [plansMap, setPlansMap] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchPaymentRequests = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Subscription Plans dictionary
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*');

      const pMap = new Map<string, any>();
      (plansData || []).forEach((p) => {
        if (p.id) pMap.set(p.id, p);
        if (p.code) pMap.set(p.code, p);
      });
      setPlansMap(pMap);

      // 2. Fetch Payment Requests joined with profiles
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*, profiles:user_id(teacher_name, email, school_name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment requests:', error.message);
        const { data: fallbackData } = await supabase
          .from('payment_requests')
          .select('*')
          .order('created_at', { ascending: false });
        setRequests(fallbackData || []);
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error('Fetch payment requests failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  // Parse user_note JSON metadata safely
  const parseMetadata = (note?: string) => {
    if (!note) return { user_note: '', price_type: null, promo_expires_at: null };
    try {
      const obj = JSON.parse(note);
      if (typeof obj === 'object' && obj !== null) {
        return {
          user_note: obj.user_note || '',
          price_type: obj.price_type || null,
          promo_expires_at: obj.promo_expires_at || null,
        };
      }
    } catch (e) {
      // Plain text fallback
    }
    return { user_note: note, price_type: null, promo_expires_at: null };
  };

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      setActionMessage(null);

      // If rejected, simply update status to 'rejected'
      if (newStatus === 'rejected') {
        const { data: currentUserData } = await supabase.auth.getUser();
        const reviewerId = currentUserData?.user?.id || null;

        const { error: rejectErr } = await supabase
          .from('payment_requests')
          .update({
            status: 'rejected',
            reviewed_by: reviewerId,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (rejectErr) {
          setActionMessage(`เกิดข้อผิดพลาดในการปฏิเสธคำขอ: ${rejectErr.message}`);
          return;
        }

        setActionMessage('ปฏิเสธคำขอชำระเงินเรียบร้อยแล้ว');
        fetchPaymentRequests();
        return;
      }

      // Step 1: Read existing payment_request record
      const { data: reqItem, error: reqFetchError } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (reqFetchError || !reqItem) {
        setActionMessage(`ไม่สามารถอ่านข้อมูลคำขอชำระเงินได้: ${reqFetchError?.message}`);
        return;
      }

      // Step 2: Query matching plan ID from subscription_plans
      let resolvedPlanId = reqItem.plan_id;
      const { data: planRow } = await supabase
        .from('subscription_plans')
        .select('id, name_th, code')
        .or(`id.eq.${resolvedPlanId},code.eq.${resolvedPlanId}`)
        .maybeSingle();

      if (planRow?.id) {
        resolvedPlanId = planRow.id;
      }

      // Calculate start_date & end_date (1 month from now)
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Step 3: Check existing subscription row for this user
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', reqItem.user_id)
        .maybeSingle();

      let subscriptionId = existingSub?.id;

      if (subscriptionId) {
        const { error: subUpdateErr } = await supabase
          .from('subscriptions')
          .update({
            plan_id: resolvedPlanId,
            status: 'active',
            billing_cycle: reqItem.billing_cycle || 'monthly',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionId);

        if (subUpdateErr) {
          setActionMessage(`เกิดข้อผิดพลาดในการอัปเดตสิทธิ์สมาชิก (subscriptions): ${subUpdateErr.message}`);
          return;
        }
      } else {
        const { data: newSub, error: subInsertErr } = await supabase
          .from('subscriptions')
          .insert({
            user_id: reqItem.user_id,
            plan_id: resolvedPlanId,
            status: 'active',
            billing_cycle: reqItem.billing_cycle || 'monthly',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (subInsertErr || !newSub) {
          setActionMessage(`เกิดข้อผิดพลาดในการสร้างสิทธิ์สมาชิกใหม่ (subscriptions): ${subInsertErr?.message}`);
          return;
        }
        subscriptionId = newSub.id;
      }

      // Step 4: Create audit transaction in public.payment_transactions
      const txRef = `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const { data: existingTx } = await supabase
        .from('payment_transactions')
        .select('id')
        .eq('payment_request_id', reqItem.id)
        .maybeSingle();

      if (!existingTx) {
        const { error: txErr } = await supabase
          .from('payment_transactions')
          .insert({
            payment_request_id: reqItem.id,
            user_id: reqItem.user_id,
            subscription_id: subscriptionId,
            amount: reqItem.amount,
            transaction_ref: txRef,
            payment_date: new Date().toISOString(),
          });

        if (txErr) {
          setActionMessage(`เกิดข้อผิดพลาดในการบันทึกประวัติชำระเงิน (payment_transactions): ${txErr.message}`);
          return;
        }
      }

      // Step 5: Grant/Update user app access in public.user_app_access
      const { data: appRow } = await supabase
        .from('apps')
        .select('id')
        .eq('code', 'mathboxx_primary')
        .maybeSingle();

      if (appRow?.id) {
        const { error: accessErr } = await supabase
          .from('user_app_access')
          .upsert({
            user_id: reqItem.user_id,
            app_id: appRow.id,
            subscription_id: subscriptionId,
            is_enabled: true,
          }, { onConflict: 'user_id,app_id' });

        if (accessErr) {
          console.warn('User app access warning:', accessErr.message);
        }
      }

      // Step 6: Update profiles timestamp safely
      await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', reqItem.user_id);

      // Step 7: Update payment_requests status to 'approved'
      const { data: currentUserData } = await supabase.auth.getUser();
      const reviewerId = currentUserData?.user?.id || null;

      const { error: reqUpdateErr } = await supabase
        .from('payment_requests')
        .update({
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (reqUpdateErr) {
        setActionMessage(`เกิดข้อผิดพลาดในการอัปเดตสถานะคำขอ: ${reqUpdateErr.message}`);
        return;
      }

      setActionMessage(`อนุมัติคำขอชำระเงินและเปิดสิทธิ์แพ็กเกจเรียบร้อยแล้ว (${planRow?.name_th || 'Premium'})`);
      fetchPaymentRequests();
    } catch (err: any) {
      setActionMessage(`เกิดข้อผิดพลาดในการปรับสถานะคำขอ: ${err?.message || err}`);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="mint">อนุมัติแล้ว (Approved)</Badge>;
      case 'rejected':
        return <Badge variant="coral">ปฏิเสธ (Rejected)</Badge>;
      case 'pending':
      default:
        return <Badge variant="coral">รอตรวจสอบ (Pending)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-pastel-coral-400" />
            <span>ตรวจสอบและอนุมัติสลิปการชำระเงิน</span>
          </h1>
          <p className="text-xs text-slate-500">ตรวจสอบประเภทราคาเปิดตัว 24 ชั่วโมง สลิปโอนเงิน และอนุมัติสิทธิ์สมาชิก</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={fetchPaymentRequests}
        >
          รีเฟรชข้อมูล
        </Button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
      )}

      <Card className="p-6 space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p>กำลังโหลดรายการคำขอชำระเงินจากตาราง payment_requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">ยังไม่มีคำขอชำระเงินในระบบ</p>
            <p className="text-xs text-slate-500">เมื่อผู้ใช้งานส่งสลิปชำระเงิน รายการจะมาปรากฏในหน้านี้ทันที</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b">
                <tr>
                  <th className="p-3">ครูผู้สอน / อีเมล</th>
                  <th className="p-3">แพ็กเกจที่ชำระ</th>
                  <th className="p-3">จำนวนเงินที่ต้องโอน</th>
                  <th className="p-3">ประเภทราคา</th>
                  <th className="p-3">วันหมดโปร 24 ชม.</th>
                  <th className="p-3">วันที่ส่งสลิป</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((item) => {
                  const planObj = plansMap.get(item.plan_id);
                  const planName = planObj?.name_th || (item.plan_id.includes('pro') ? 'Premium Pro' : 'Premium Teacher');
                  const meta = parseMetadata(item.user_note);

                  const isPromo = meta.price_type === 'launch_promo' || Number(item.amount) === 99 || (Number(item.amount) === 199 && planObj?.code === 'premium_pro');
                  const formattedPromoExp = meta.promo_expires_at
                    ? new Date(meta.promo_expires_at).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—';

                  return (
                    <tr key={item.id}>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">
                          {item.profiles?.teacher_name || 'ผู้ใช้งาน'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {item.profiles?.email || item.user_id}
                        </p>
                      </td>

                      <td className="p-3 font-bold text-slate-900">{planName}</td>

                      <td className="p-3 font-mono font-extrabold text-emerald-700 text-sm">
                        ฿{Number(item.amount).toFixed(2)}
                      </td>

                      <td className="p-3">
                        {isPromo ? (
                          <Badge variant="coral" icon={<Tag className="w-3 h-3" />}>
                            🎁 ราคาโปรโมชั่น 24 ชั่วโมง
                          </Badge>
                        ) : (
                          <Badge variant="neutral">
                            ราคาปกติ
                          </Badge>
                        )}
                      </td>

                      <td className="p-3 text-slate-600 font-medium">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedPromoExp}</span>
                        </div>
                      </td>

                      <td className="p-3 text-slate-500 font-mono">
                        {new Date(item.created_at).toLocaleString('th-TH')}
                      </td>

                      <td className="p-3">{renderStatusBadge(item.status)}</td>

                      <td className="p-3 text-right space-x-2">
                        {item.slip_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedSlipUrl(item.slip_url)}
                          >
                            ดูสลิป
                          </Button>
                        )}
                        {item.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                              onClick={() => handleUpdateStatus(item.id, 'approved')}
                            >
                              อนุมัติ
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              leftIcon={<XCircle className="w-3.5 h-3.5" />}
                              onClick={() => handleUpdateStatus(item.id, 'rejected')}
                            >
                              ปฏิเสธ
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Slip Modal View */}
      {selectedSlipUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">หลักฐานสลิปการโอนเงิน</h3>
              <button onClick={() => setSelectedSlipUrl(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="rounded-xl overflow-hidden border bg-slate-50 text-center">
              <img src={selectedSlipUrl} alt="Slip Upload" className="max-h-96 mx-auto object-contain" />
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedSlipUrl(null)}>ปิดหน้าต่าง</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
