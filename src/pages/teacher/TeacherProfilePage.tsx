import React, { useState, useEffect, useRef } from 'react';
import { User, School, Upload, Save, Mail, Crown, Lock, ArrowRight, Clock, Tag, CheckCircle2, RefreshCw, Calendar, Image as ImageIcon, Trash2, Sparkles, MessageCircle, Edit3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageProps } from '../public/LandingPage';
import { useUserContext } from '../../hooks/useUserContext';
import { supabase } from '../../lib/supabase';

export const TeacherProfilePage: React.FC<PageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'plan'>('profile');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<boolean>(false);

  const userCtx = useUserContext();
  const perms = userCtx.permissions;

  const [teacherNameInput, setTeacherNameInput] = useState<string>('');
  const [schoolNameInput, setSchoolNameInput] = useState<string>('');
  const [watermarkInput, setWatermarkInput] = useState<string>('');
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userCtx.isLoading) {
      setTeacherNameInput(userCtx.teacherName !== '—' ? userCtx.teacherName : '');
      setSchoolNameInput(userCtx.schoolName !== '—' ? userCtx.schoolName : '');
      setSchoolLogoUrl(userCtx.schoolLogoUrl);
      setLogoPreview(userCtx.schoolLogoUrl);

      if (perms.effectivePlanCode === 'free') {
        setWatermarkInput('MathBoxx');
      } else if (perms.effectivePlanCode === 'premium') {
        setWatermarkInput('(ไม่มีลายน้ำ)');
      } else {
        setWatermarkInput(`MathBoxx Primary — ${userCtx.teacherName}`);
      }
    }
  }, [userCtx.isLoading, userCtx.teacherName, userCtx.schoolName, userCtx.schoolLogoUrl, perms.effectivePlanCode]);

  // Handle Logo File Selection
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!perms.canUploadLogo) {
      alert('สิทธิ์การอัปโหลดและแสดงโลโก้โรงเรียน สงวนสิทธิ์เฉพาะแพ็กเกจ Premium Pro เท่านั้น');
      return;
    }

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพเกิน 2MB กรุณาเลือกไฟล์ที่มีขนาดเล็กกว่า 2MB');
        return;
      }
      setLogoFile(file);

      // Create preview object URL
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  // Remove Logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setSchoolLogoUrl(null);
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCtx.userId) return;

    setIsSavingProfile(true);
    try {
      let finalLogoUrl = schoolLogoUrl;

      // Upload file to Supabase storage if selected
      if (logoFile && perms.canUploadLogo) {
        const fileExt = logoFile.name.split('.').pop() || 'png';
        const fileName = `${userCtx.userId}_logo_${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        // Upload exclusively to school-logos bucket
        const { error: uploadErr } = await supabase.storage
          .from('school-logos')
          .upload(filePath, logoFile, { cacheControl: '3600', upsert: true });

        if (!uploadErr) {
          const { data: pubUrlData } = supabase.storage.from('school-logos').getPublicUrl(filePath);
          finalLogoUrl = pubUrlData.publicUrl;
        } else {
          console.warn('Upload to school-logos storage failed, falling back to Base64 Data URL:', uploadErr);
          const reader = new FileReader();
          reader.readAsDataURL(logoFile);
          await new Promise((resolve) => {
            reader.onloadend = () => {
              finalLogoUrl = reader.result as string;
              resolve(null);
            };
          });
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          teacher_name: teacherNameInput.trim(),
          school_name: schoolNameInput.trim(),
          school_logo_url: finalLogoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userCtx.userId);

      if (error) throw error;

      setSchoolLogoUrl(finalLogoUrl);
      setSaveSuccessMessage(true);
      setTimeout(() => setSaveSuccessMessage(false), 3000);
      userCtx.refetch();
    } catch (err: any) {
      alert(`ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้: ${err?.message || err}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const formattedStartDate = userCtx.startDate
    ? new Date(userCtx.startDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  const formattedEndDate = userCtx.endDate
    ? new Date(userCtx.endDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  const isExpired = userCtx.daysRemaining !== null && userCtx.daysRemaining <= 0;
  const isExpiringSoon = userCtx.daysRemaining !== null && userCtx.daysRemaining <= 7 && userCtx.daysRemaining > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Direct Reference Alignment Hero Banner Card */}
      <Card className="p-8 border-2 border-amber-200/90 bg-[#FEF9E7] rounded-3xl space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="yellow" icon={<Sparkles className="w-3.5 h-3.5" />}>
            ยินดีต้อนรับครับ คุณครู
          </Badge>
          <Badge variant="mint" icon={<User className="w-3.5 h-3.5" />}>
            User Role: {userCtx.role === 'admin' ? 'System Administrator' : 'ครูผู้สอน'}
          </Badge>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            สวัสดีคุณครู, {userCtx.isLoading ? '...' : userCtx.teacherName}!
          </h1>
          <p className="text-sm text-slate-700 font-semibold max-w-2xl leading-relaxed">
            พร้อมสร้างใบงานคณิตศาสตร์ประถมศึกษาที่สวยงามแล้วหรือยัง? สร้างและพิมพ์ใบงานคณิตศาสตร์ได้ อย่างง่ายดายด้วยข้อสอบจากฐานข้อมูล
          </p>
        </div>

        {/* Hero Quick Action Buttons System */}
        <div className="flex flex-wrap items-center gap-3.5 pt-2">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => onNavigate('/app/builder')}
          >
            สร้างใบงานใหม่
          </Button>

          <Button
            variant="sky"
            size="lg"
            leftIcon={<User className="w-4 h-4" />}
            onClick={() => setActiveTab('profile')}
          >
            โปรไฟล์ครู
          </Button>

          <Button
            variant="mint"
            size="lg"
            leftIcon={<Crown className="w-4 h-4" />}
            onClick={() => onNavigate('/app/subscription')}
          >
            อัปเกรดแพ็กเกจ
          </Button>

          <a
            href="https://lin.ee/pDK0KwT"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              leftIcon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
            >
              ติดต่อ Admin
            </Button>
          </a>
        </div>
      </Card>

      {/* Grid Section: Profile Details (Left) & Quota Usage (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Profile Card (Pastel Mint Tint) */}
        <Card className="p-6 border border-emerald-200 bg-[#F0FDF4] space-y-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <h3 className="font-extrabold text-slate-900 text-base">โปรไฟล์ครู</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setActiveTab('profile')}
            >
              แก้ไข ➔
            </Button>
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
              {userCtx.teacherName ? userCtx.teacherName.charAt(0) : 'U'}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">{userCtx.teacherName}</h4>
              <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mt-0.5">
                <School className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{userCtx.schoolName}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Right: Usage Quota Card (Pastel Warm Yellow Tint) */}
        <Card className="p-6 border border-amber-200 bg-[#FFFBEB] space-y-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-700" />
              <h3 className="font-extrabold text-slate-900 text-base">สิทธิ์การใช้งาน ({userCtx.planName})</h3>
            </div>
            <Badge variant="yellow">
              ใช้งานแล้ว 1 / {userCtx.worksheetLimit === -1 ? 'ไม่จำกัด' : `${userCtx.worksheetLimit}`} ชุด
            </Badge>
          </div>

          <p className="text-xs text-slate-700 font-semibold">
            เหลืออีก <span className="font-black text-amber-900">{userCtx.worksheetLimit === -1 ? 'ไม่จำกัด' : `${Math.max(0, (userCtx.worksheetLimit || 5) - 1)}`} ชุด</span> (จากโควต้า {userCtx.worksheetLimit === -1 ? 'ไม่จำกัด' : userCtx.worksheetLimit} ชุด)
          </p>

          <div
            onClick={() => onNavigate('/app/builder')}
            className="p-3.5 rounded-xl border border-dashed border-orange-300 bg-white hover:bg-orange-50/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 font-bold text-orange-950">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>สร้าง Worksheet ใหม่</span>
            </div>
            <span className="font-black text-orange-500 text-base">+</span>
          </div>
        </Card>
      </div>

      {/* Main Profile Edit & Plan Tab Section */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 text-sm font-extrabold transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ตั้งค่าโปรไฟล์ & โลโก้โรงเรียน
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`pb-2 text-sm font-extrabold transition-colors border-b-2 ${
              activeTab === 'plan'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            รายละเอียดสิทธิ์แพ็กเกจ
          </button>
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {saveSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>บันทึกข้อมูลโปรไฟล์ครูและโลโก้โรงเรียนเรียบร้อยแล้ว</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ชื่อ - นามสกุลครูผู้สอน"
                value={teacherNameInput}
                onChange={(e) => setTeacherNameInput(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="ชื่อโรงเรียน"
                value={schoolNameInput}
                onChange={(e) => setSchoolNameInput(e.target.value)}
                leftIcon={<School className="w-4 h-4" />}
                required
              />
            </div>

            {/* School Logo Section (Premium Pro) */}
            <div className="space-y-3 pt-2 border-t border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-bold text-slate-900">โลโก้โรงเรียน (สำหรับแสดงบนหัวกระดาษ A4)</label>
                  <p className="text-xs text-slate-500 font-semibold">รองรับไฟล์ PNG, JPG ขนาดไม่เกิน 2MB</p>
                </div>
                {!perms.canUploadLogo && (
                  <Badge variant="purple" icon={<Lock className="w-3.5 h-3.5" />}>
                    🔒 Premium Pro Only
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-amber-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="School Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoFileSelect}
                    accept="image/*"
                    className="hidden"
                    disabled={!perms.canUploadLogo}
                  />

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={perms.canUploadLogo ? 'outline' : 'secondary'}
                      size="sm"
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                      disabled={!perms.canUploadLogo}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      เลือกไฟล์โลโก้
                    </Button>

                    {logoPreview && perms.canUploadLogo && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={handleRemoveLogo}
                      >
                        ลบโลโก้
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-amber-100">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSavingProfile}
                leftIcon={<Save className="w-4 h-4" />}
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <h4 className="font-black text-slate-900 text-sm">สิทธิ์การใช้งานปัจจุบัน: {userCtx.planName}</h4>
              <p className="text-slate-700 font-semibold">โควตาใบงาน: {userCtx.worksheetLimit === -1 ? 'ไม่จำกัด' : `${userCtx.worksheetLimit} ใบงาน/เดือน`}</p>
              <p className="text-slate-700 font-semibold">ข้อสอบสูงสุดต่อชุด: {userCtx.questionLimit} ข้อ</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
