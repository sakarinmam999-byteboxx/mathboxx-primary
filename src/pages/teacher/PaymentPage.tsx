import React, { useState, useEffect } from 'react';
import { CreditCard, Upload, Send, Building, Clock, Tag, AlertCircle, CheckCircle, QrCode, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { paymentService } from '../../services/payment.service';
import { supabase } from '../../lib/supabase';
import { PageProps } from '../public/LandingPage';

export const PaymentPage: React.FC<PageProps> = () => {
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('premium');
  const [userCreatedAt, setUserCreatedAt] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isUserLoaded, setIsUserLoaded] = useState<boolean>(false);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);

  // Fetch authenticated user's exact registration time from profiles / auth
  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUserId(data.user.id);

          // Fetch created_at from profiles table for accurate timestamp
          const { data: prof } = await supabase
            .from('profiles')
            .select('created_at')
            .eq('id', data.user.id)
            .maybeSingle();

          const createdTimeStr = prof?.created_at || data.user.created_at;
          if (createdTimeStr) {
            setUserCreatedAt(new Date(createdTimeStr));
          }
        }
      } catch (err) {
        console.error('Error fetching user for payment page:', err);
      } finally {
        setIsUserLoaded(true);
      }
    }
    loadUser();
  }, []);

  // Real-Time 1-Second Timer Interval to trigger seamless live UI & QR code updates
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute pricing, HH:MM:SS countdown, and Bank info dynamically from environment configuration
  const priceInfo = paymentService.calculatePlanPrice(selectedPlanCode, userCreatedAt);
  const bankInfo = paymentService.getBankAccountInfo();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          currentUserId = userData.user.id;
          setUserId(currentUserId);
        }
      }

      if (!currentUserId) {
        setErrorMessage('ไม่พบข้อมูลบัญชีผู้ใช้ที่เข้าสู่ระบบ กรุณาเข้าสู่ระบบอีกครั้งก่อนส่งแจ้งชำระเงิน');
        setIsSubmitting(false);
        return;
      }

      if (!slipFile) {
        setErrorMessage('กรุณาเลือกไฟล์รูปภาพสลิปการโอนเงินก่อนส่งข้อมูล');
        setIsSubmitting(false);
        return;
      }

      // Step 1: Upload slip image to Supabase Storage
      let finalSlipUrl = '';
      const fileExt = slipFile.name.split('.').pop() || 'jpg';
      const fileName = `${currentUserId}_${Date.now()}.${fileExt}`;
      const filePath = `slips/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-slips')
        .upload(filePath, slipFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        const { error: fallbackError } = await supabase.storage
          .from('slips')
          .upload(filePath, slipFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (fallbackError) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์สลิปได้'));
            reader.readAsDataURL(slipFile);
          });

          try {
            finalSlipUrl = await base64Promise;
          } catch (bErr: any) {
            setErrorMessage('เกิดข้อผิดพลาดในการประมวลผลไฟล์สลิป กรุณาลองใหม่อีกครั้ง');
            setIsSubmitting(false);
            return;
          }
        } else {
          const { data: publicUrlData } = supabase.storage.from('slips').getPublicUrl(filePath);
          finalSlipUrl = publicUrlData.publicUrl;
        }
      } else {
        const { data: publicUrlData } = supabase.storage.from('payment-slips').getPublicUrl(filePath);
        finalSlipUrl = publicUrlData.publicUrl;
      }

      if (!finalSlipUrl || finalSlipUrl.startsWith('blob:')) {
        setErrorMessage('ไม่สามารถสร้าง URL รูปภาพสลิปได้ กรุณาเลือกไฟล์สลิปใหม่อีกครั้ง');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Insert payment_requests with verified price
      const result = await paymentService.submitPaymentRequest({
        userId: currentUserId,
        planId: selectedPlanCode,
        planCode: selectedPlanCode,
        amount: priceInfo.currentPrice,
        slipUrl: finalSlipUrl,
        userCreatedAt: userCreatedAt,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'เกิดข้อผิดพลาดในการส่งข้อมูลแจ้งชำระเงิน');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('แจ้งชำระเงินสำเร็จ! เจ้าหน้าที่จะตรวจสอบสลิปและอนุมัติสิทธิ์ให้ภายใน 15-30 นาที');
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-emerald-600" />
          <span>แจ้งชำระเงิน / อัปโหลด Slip โอนเงิน</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">สแกน QR Code หรือโอนเงินผ่านบัญชีธนาคาร แล้วแนบหลักฐานสลิปการโอนเงินเพื่ออนุมัติใช้งาน</p>
      </div>

      {/* Real-Time 24-Hour Launch Price Banner & HH:MM:SS Countdown */}
      {!isUserLoaded ? (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>กำลังตรวจสอบสิทธิ์ราคาพิเศษสำหรับบัญชีของคุณ...</span>
        </div>
      ) : priceInfo.isLaunchPrice ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-sm shrink-0">
              <Tag className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">สิทธิ์ราคาเปิดตัวพิเศษ (24-Hour Launch Price)</span>
                <Badge variant="coral">รับส่วนลด 50%</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Premium ฿99 (ปกติ ฿199) • Premium Pro ฿199 (ปกติ ฿399)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-xl border border-rose-200 text-xs font-black text-rose-700 shrink-0 shadow-2xs">
            <Clock className="w-4 h-4 text-rose-600 animate-spin" />
            <div className="flex items-center gap-1">
              <span>นับถอยหลัง:</span>
              <span className="font-mono text-sm tracking-wider text-rose-900 font-extrabold">{priceInfo.formattedCountdown}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>ระยะเวลา Launch Price 24 ชั่วโมงแรกสิ้นสุดแล้ว (ระบบคำนวณตามราคาปกติ)</span>
        </div>
      )}

      {/* Bank & PromptPay QR Payment Details Card */}
      <Card className="p-6 bg-slate-50 border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Building className="w-5 h-5 text-emerald-600" />
            <span>ช่องทางการชำระเงิน (PromptPay QR & Bank Transfer)</span>
          </div>
          <Badge variant="mint">ยอดชำระสุทธิ: ฿{priceInfo.currentPrice}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Dynamic PromptPay QR Code Display */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 text-center space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>สแกนจ่ายผ่าน PromptPay QR (฿{priceInfo.currentPrice})</span>
            </div>
            <div className="relative p-2 bg-white rounded-xl border border-slate-200 shadow-inner">
              <img
                src={priceInfo.qrUrl}
                alt={`PromptPay QR Code ฿${priceInfo.currentPrice}`}
                className="w-44 h-44 object-contain mx-auto rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              สแกนด้วยแอปธนาคารใดก็ได้ • ยอดเงิน <strong>฿{priceInfo.currentPrice}</strong> ตรงตามระบบ
            </p>
          </div>

          {/* Bank Account Credentials */}
          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-500 block">ธนาคาร:</span>
              <strong className="text-sm text-slate-900">{bankInfo.bankName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">ชื่อบัญชี:</span>
              <strong className="text-sm text-slate-900">{bankInfo.accountName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">เลขที่บัญชี:</span>
              <strong className="text-sm font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                {bankInfo.accountNo}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">รหัสพร้อมเพย์ (PromptPay ID):</span>
              <strong className="text-sm font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                {bankInfo.formattedPromptPayId}
              </strong>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 space-y-6 shadow-sm border-slate-200/90">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="เลือกแพ็กเกจที่ต้องการสมัคร"
            value={selectedPlanCode}
            onChange={(e) => setSelectedPlanCode(e.target.value)}
            options={[
              {
                value: 'premium',
                label: priceInfo.isLaunchPrice
                  ? 'Premium Teacher — ฿99 / เดือน (ราคาพิเศษ 24 ชม. แรก จากปกติ ฿199)'
                  : 'Premium Teacher — ฿199 / เดือน (ราคาปกติ)',
              },
              {
                value: 'premium_pro',
                label: priceInfo.isLaunchPrice
                  ? 'Premium Pro — ฿199 / เดือน (ราคาพิเศษ 24 ชม. แรก จากปกติ ฿399)'
                  : 'Premium Pro — ฿399 / เดือน (ราคาปกติ)',
              },
            ]}
          />

          {/* Locked Amount Field */}
          <div className="space-y-1">
            <Input
              label="จำนวนเงินที่ต้องโอน (บาท) — ล็อกการแก้ไขตามสิทธิ์ล่าสุด"
              type="text"
              value={`฿${priceInfo.currentPrice}`}
              readOnly={true}
              className="bg-slate-100/90 cursor-not-allowed font-extrabold text-lg text-emerald-800 border-emerald-300"
              helperText={
                priceInfo.isLaunchPrice
                  ? `รับส่วนลด 24 ชั่วโมงแรก ฿${priceInfo.normalPrice - priceInfo.currentPrice} บาท (จากราคาปกติ ฿${priceInfo.normalPrice})`
                  : `ราคาปกติประจำแพ็กเกจ ฿${priceInfo.currentPrice} บาท`
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">อัปโหลดสลิปการโอนเงิน (Slip Upload)</label>
            <label className="border-2 border-dashed border-slate-200/90 rounded-2xl p-6 text-center space-y-2 bg-slate-50 hover:bg-slate-100/80 cursor-pointer block transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
              {slipFile ? (
                <p className="text-xs text-emerald-800 font-bold">เลือกไฟล์: {slipFile.name}</p>
              ) : (
                <p className="text-xs text-slate-600 font-medium">คลิกเพื่อเลือกไฟล์รูปภาพสลิปการโอนเงิน</p>
              )}
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              ส่งข้อมูลแจ้งชำระเงิน (฿{priceInfo.currentPrice})
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
