import React from 'react';
import { Crown, Sparkles, CheckCircle2, FileText, Sun, Gem, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';
import { useUserContext } from '../../hooks/useUserContext';
import { paymentService } from '../../services/payment.service';

export const SubscriptionPage: React.FC<PageProps> = ({ onNavigate }) => {
  const userCtx = useUserContext();
  const premPriceInfo = paymentService.calculatePlanPrice('premium', userCtx.createdAt);
  const proPriceInfo = paymentService.calculatePlanPrice('premium_pro', userCtx.createdAt);

  const [paymentRequests, setPaymentRequests] = React.useState<any[]>([]);
  const [formattedCountdown, setFormattedCountdown] = React.useState<string>('');

  React.useEffect(() => {
    if (userCtx.userId) {
      paymentService.getMyPaymentRequests(userCtx.userId).then((reqs) => {
        setPaymentRequests(reqs || []);
      });
    }
  }, [userCtx.userId]);

  // Live 1-Second Countdown Timer Effect
  React.useEffect(() => {
    if (!userCtx.createdAt) return;

    const createdTime = new Date(userCtx.createdAt).getTime();
    if (isNaN(createdTime)) return;

    const promoWindowMs = 24 * 60 * 60 * 1000;
    const targetTime = createdTime + promoWindowMs;

    const updateCountdown = () => {
      const now = Date.now();
      const diffMs = Math.max(0, targetTime - now);

      if (diffMs <= 0) {
        setFormattedCountdown('00:00:00');
        return true;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setFormattedCountdown(formatted);
      return false;
    };

    const isExpired = updateCountdown();
    if (isExpired) return;

    const intervalId = setInterval(() => {
      const expired = updateCountdown();
      if (expired) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [userCtx.createdAt]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner Status Section */}
      <Card className="p-6 border border-sky-100 bg-[#F4F9FD] rounded-3xl space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-200/60 pb-3">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">การจัดการแพ็กเกจ & ความช่วยเหลือ</h2>
            <p className="text-xs text-slate-500 font-medium">หากมีข้อสงสัย หรือต้องการแจ้งข้อมูลเพิ่มเติม สามารถติดต่อทีมงาน Admin ได้ตลอดเวลา</p>
          </div>
          <a
            href="https://lin.ee/pDK0KwT"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              variant="mint"
              size="sm"
              leftIcon={<MessageCircle className="w-4 h-4" />}
            >
              ติดต่อ Admin
            </Button>
          </a>
        </div>

        {/* Real Dynamic Payment Requests (Renders only if user has submitted payment requests) */}
        {paymentRequests.length > 0 && (
          <div className="space-y-3">
            {paymentRequests.map((req) => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-2xl flex items-center justify-between gap-4 border ${
                    isApproved
                      ? 'bg-emerald-50/80 border-emerald-200/90'
                      : isPending
                      ? 'bg-amber-50/80 border-amber-200/90'
                      : 'bg-rose-50/80 border-rose-200/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className={`w-5 h-5 shrink-0 ${isApproved ? 'text-emerald-600' : isPending ? 'text-amber-600' : 'text-rose-600'}`} />
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">
                        คำขอชำระเงิน (฿{req.amount})
                      </span>
                      <Badge variant={isApproved ? 'mint' : isPending ? 'yellow' : 'coral'} className="ml-2">
                        {isApproved ? 'อนุมัติแล้ว' : isPending ? 'รอดำเนินการตรวจสอบ' : 'ไม่อนุมัติ / ยกเลิก'}
                      </Badge>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        วันที่แจ้งโอน: {new Date(req.created_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FileText className="w-3.5 h-3.5" />}
                    onClick={() => onNavigate('/app/payment')}
                  >
                    ดูสลิปที่แนบ
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Side-by-Side Package Selection Cards (Direct Reference Image 2 Alignment) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
        {/* Left Card: Premium (Yellow/Mint Accent) */}
        <Card className="p-8 border-2 border-emerald-300 bg-white rounded-3xl flex flex-col justify-between space-y-6 shadow-2xs">
          <div className="space-y-6">
            <Badge variant="mint" icon={<Sun className="w-3.5 h-3.5" />}>
              แผนพรีเมียม (Premium)
            </Badge>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-900">฿{premPriceInfo.currentPrice}</span>
                <span className="text-xs font-bold text-emerald-700">
                  {premPriceInfo.isLaunchPrice ? '/ เดือน (24 ชม. แรก)' : '/ เดือน'}
                </span>
              </div>
              {premPriceInfo.isLaunchPrice && (
                <p className="text-xs text-rose-600 font-bold">
                  ราคาโปรโมชั่น (ปกติ ฿{premPriceInfo.normalPrice}) • เหลือเวลาโปรโมชั่น {formattedCountdown || premPriceInfo.formattedCountdown}
                </p>
              )}
              <p className="text-xs text-slate-500 font-semibold">ชำระผ่าน QR Code พร้อมเพย์</p>
            </div>

            <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>สร้างแบบฝึกหัดสูงสุด 50 ชุดต่อเดือน</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>สร้างคำถามกำหนดเอง (Custom Questions)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ดาวน์โหลด / บันทึกไฟล์ PDF & พิมพ์</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>แสดงชื่อคุณครูและชื่อโรงเรียนบนใบงาน</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              variant="mint"
              size="lg"
              className="w-full font-bold text-sm"
              onClick={() => onNavigate('/app/payment')}
            >
              เลือกแผนพรีเมียม ({premPriceInfo.currentPrice} บาท)
            </Button>
          </div>
        </Card>

        {/* Right Card: Premium Pro (Pastel Purple Accent) */}
        <Card className="relative p-8 border-2 border-purple-300 bg-white rounded-3xl flex flex-col justify-between space-y-6 shadow-2xs">
          <div className="absolute -top-3.5 right-6">
            <Badge variant="purple">
              คุ้มค่าที่สุด
            </Badge>
          </div>

          <div className="space-y-6">
            <Badge variant="purple" icon={<Gem className="w-3.5 h-3.5" />}>
              แผนพรีเมียมโปร (Premium Pro)
            </Badge>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-900">฿{proPriceInfo.currentPrice}</span>
                <span className="text-xs font-bold text-purple-700">
                  {proPriceInfo.isLaunchPrice ? '/ เดือน (24 ชม. แรก)' : '/ เดือน'}
                </span>
              </div>
              {proPriceInfo.isLaunchPrice && (
                <p className="text-xs text-rose-600 font-bold">
                  ราคาโปรโมชั่น (ปกติ ฿{proPriceInfo.normalPrice}) • เหลือเวลาโปรโมชั่น {formattedCountdown || proPriceInfo.formattedCountdown}
                </p>
              )}
              <p className="text-xs text-slate-500 font-semibold">ชำระผ่าน QR Code พร้อมเพย์</p>
            </div>

            <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>สร้างแบบฝึกหัดสูงสุด 100 ชุดต่อเดือน</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>อัปโหลดโลโก้โรงเรียน & ลายน้ำกำหนดเอง</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>ระบบแบรนดิ้งโรงเรียนแบบเต็มรูปแบบ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>ฟีเจอร์ระดับพรีเมียมทั้งหมด</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              variant="purple"
              size="lg"
              className="w-full font-bold text-sm"
              onClick={() => onNavigate('/app/payment')}
            >
              เลือกแผนพรีเมียมโปร ({proPriceInfo.currentPrice} บาท)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
