import React from 'react';
import { CheckCircle2, Clock, Sparkles, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from './LandingPage';
import { paymentService } from '../../services/payment.service';
import { useUserContext } from '../../hooks/useUserContext';

export const PricingPage: React.FC<PageProps> = ({ onNavigate }) => {
  const userCtx = useUserContext();
  const premPriceInfo = paymentService.calculatePlanPrice('premium', userCtx.createdAt);
  const proPriceInfo = paymentService.calculatePlanPrice('premium_pro', userCtx.createdAt);

  const plans = [
    {
      code: 'free',
      name: 'Free Starter',
      price: '฿0',
      period: 'ตลอดชีพ',
      desc: 'สำหรับครูที่ต้องการทดลองสร้างใบงานเบื้องต้น',
      limitWorksheets: '5 ใบงาน / เดือน',
      limitQuestions: 'สูงสุด 10 ข้อ / ใบงาน',
      badge: 'แพ็กเกจเริ่มต้น',
      variant: 'mint' as const,
      buttonVariant: 'mint' as const,
      cardBorder: 'border-emerald-300 bg-emerald-50/20',
      iconColor: 'text-emerald-600',
      features: [
        'สร้างใบงาน 5 ใบงาน/เดือน',
        'คลังข้อสอบ ป.1 - ป.6',
        'ดาวน์โหลด PDF & พิมพ์เบราว์เซอร์',
        'ลายน้ำมาตรฐานระบบ',
      ],
      cta: 'เริ่มใช้งานฟรี',
    },
    {
      code: 'premium',
      name: 'Premium Teacher',
      price: `฿${premPriceInfo.currentPrice}`,
      originalPrice: premPriceInfo.isLaunchPrice ? `฿${premPriceInfo.normalPrice}` : undefined,
      period: premPriceInfo.isLaunchPrice ? '/ เดือน (24 ชม. แรก)' : '/ เดือน',
      desc: 'สำหรับครูที่ต้องเตรียมใบงานและแบบทดสอบเป็นประจำ',
      limitWorksheets: '50 ใบงาน / เดือน',
      limitQuestions: 'สูงสุด 30 ข้อ / ใบงาน',
      badge: premPriceInfo.isLaunchPrice ? 'ลดพิเศษ 50%' : 'ยอดนิยม',
      popular: true,
      variant: 'yellow' as const,
      buttonVariant: 'yellow' as const,
      cardBorder: 'border-amber-300 bg-amber-50/30 shadow-md',
      iconColor: 'text-amber-600',
      features: [
        'สร้างใบงาน 50 ใบงาน/เดือน',
        'โจทย์สูงสุด 30 ข้อต่อใบงาน',
        'อัปโหลดโลโก้โรงเรียนส่วนตัว',
        'ปรับแต่งข้อความลายน้ำเองได้',
        'สลับข้อและสุ่มเปลี่ยนโจทย์ได้',
        'พิมพ์เบราว์เซอร์ไม่หัก Quota',
      ],
      cta: `สมัครแพ็กเกจ Premium (฿${premPriceInfo.currentPrice})`,
    },
    {
      code: 'premium_pro',
      name: 'Premium Pro',
      price: `฿${proPriceInfo.currentPrice}`,
      originalPrice: proPriceInfo.isLaunchPrice ? `฿${proPriceInfo.normalPrice}` : undefined,
      period: proPriceInfo.isLaunchPrice ? '/ เดือน (24 ชม. แรก)' : '/ เดือน',
      desc: 'สำหรับครูวิทยฐานะ ชุมชนครู หรือโรงเรียน',
      limitWorksheets: '100 ใบงาน / เดือน',
      limitQuestions: 'สูงสุด 50 ข้อ / ใบงาน',
      badge: 'โปรคุ้มค่าที่สุด',
      variant: 'purple' as const,
      buttonVariant: 'purple' as const,
      cardBorder: 'border-purple-300 bg-purple-50/20',
      iconColor: 'text-purple-600',
      features: [
        'สร้างใบงาน 100 ใบงาน/เดือน',
        'โจทย์สูงสุด 50 ข้อต่อใบงาน',
        'อัปโหลดโลโก้โรงเรียน',
        'ตั้งค่าลายน้ำส่วนตัว',
        'สิทธิ์เข้าถึงคลังข้อสอบทุกวิชาในอนาคต',
        'บริการช่วยเหลือระดับ VIP',
      ],
      cta: `สมัครแพ็กเกจ Pro (฿${proPriceInfo.currentPrice})`,
    },
  ];

  return (
    <div className="space-y-12 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
        {premPriceInfo.isLaunchPrice ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 font-semibold text-xs shadow-2xs">
            <Tag className="w-3.5 h-3.5" />
            <span>ข้อเสนอพิเศษ: ราคาเปิดตัว (Launch Price) 24 ชั่วโมงแรกสำหรับผู้สมัครใหม่! (เหลือเวลา {premPriceInfo.formattedCountdown})</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 font-semibold text-xs shadow-2xs">
            <Tag className="w-3.5 h-3.5" />
            <span>อัตราค่าบริการปกติ (Regular Subscription Rates)</span>
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          แพ็กเกจราคาและโควตาการใช้งาน
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
          {premPriceInfo.isLaunchPrice
            ? 'สมัครสมาชิกใหม่วันนี้ รับสิทธิ์ส่วนลดราคาเปิดตัวพิเศษทันที 24 ชั่วโมงแรกนับจากเวลาลงทะเบียน (หลังจาก 24 ชั่วโมง จะปรับเป็นราคาปกติ ฿199 / ฿399)'
            : 'เลือกแพ็กเกจสมาชิกที่เหมาะกับการใช้งานของคุณเพื่อปลดล็อกโควตาการสร้างใบงานและคลังข้อสอบครบวงจร'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-4">
        {plans.map((plan) => (
          <Card
            key={plan.code}
            className={`relative flex flex-col justify-between p-8 border-2 transition-all ${plan.cardBorder}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge variant="yellow" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  {plan.badge}
                </Badge>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                {!plan.popular && <Badge variant={plan.variant}>{plan.badge}</Badge>}
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">{plan.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{plan.desc}</p>
              </div>

              <div className="space-y-1">
                {plan.originalPrice && (
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <span>ราคาปกติ:</span>
                    <span className="line-through decoration-rose-500 decoration-2">{plan.originalPrice}</span>
                  </div>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className={`text-xs font-bold ${plan.iconColor}`}>{plan.period}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/60 text-xs space-y-1">
                <p className="font-bold text-slate-800">โควตาใบงาน: <span className={`${plan.iconColor} font-extrabold`}>{plan.limitWorksheets}</span></p>
                <p className="text-slate-500 font-semibold">{plan.limitQuestions}</p>
              </div>

              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ฟีเจอร์ในแพ็กเกจ:</p>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                    <CheckCircle2 className={`w-4 h-4 ${plan.iconColor} shrink-0 mt-0.5`} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Button
                variant={plan.buttonVariant}
                className="w-full"
                onClick={() => onNavigate('/register')}
              >
                {plan.cta}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Notice Section */}
      <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-600 text-center space-y-1.5">
        <p className="font-bold text-amber-900 flex items-center justify-center gap-1.5">
          <Clock className="w-4 h-4 text-rose-500" />
          <span>หมายเหตุเงื่อนไขราคาเปิดตัว (Launch Price Rule)</span>
        </p>
        <p className="leading-relaxed font-semibold">
          ราคาเปิดตัว ฿99 (Premium) และ ฿199 (Premium Pro) มีผลบังคับใช้เป็นเวลา 24 ชั่วโมงนับจากเวลาสร้างบัญชีครูผู้สอน
          เมื่อพ้น 24 ชั่วโมงแล้ว ระบบแจ้งชำระเงินจะปรับคำนวณยอดตามราคาปกติ ฿199 / ฿399 โดยอัตโนมัติ
        </p>
      </div>
    </div>
  );
};
