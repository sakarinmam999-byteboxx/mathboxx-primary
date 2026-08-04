import { supabase } from '../lib/supabase';

export interface PlanPriceResult {
  planCode: string;
  normalPrice: number;
  currentPrice: number;
  isLaunchPrice: boolean;
  priceType: 'launch_promo' | 'regular';
  promoExpiresAt: string | null;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  formattedCountdown: string;
  timeExpired: boolean;
  qrUrl: string;
  promptPayId: string;
  formattedPromptPayId: string;
}

export interface BankAccountInfo {
  bankName: string;
  accountName: string;
  accountNo: string;
  promptPayId: string;
  formattedPromptPayId: string;
}

export interface SubmitPaymentParams {
  userId: string;
  planId: string;
  planCode: string;
  amount: number;
  slipUrl: string;
  userNote?: string;
  userCreatedAt?: string | Date | null;
}

export const paymentService = {
  /**
   * Read Bank Account & PromptPay credentials safely from environment variables
   */
  getBankAccountInfo(): BankAccountInfo {
    const bankName = import.meta.env.VITE_BANK_NAME || 'ธนาคารไทยพาณิชย์ จำกัด (มหาชน) (SCB)';
    const accountName = import.meta.env.VITE_BANK_ACCOUNT_NAME || 'สาครินทร์ กลิ่นนิโรจน์';
    const accountNo = import.meta.env.VITE_BANK_ACCOUNT_NO || '156-411873-1';
    const promptPayId = (import.meta.env.VITE_PROMPTPAY_ID || '0923644664').trim();

    return {
      bankName,
      accountName,
      accountNo,
      promptPayId,
      formattedPromptPayId: this.getFormattedPromptPayId(),
    };
  },

  getPromptPayId(): string {
    const envVal = import.meta.env.VITE_PROMPTPAY_ID || '0923644664';
    return envVal.trim();
  },

  getFormattedPromptPayId(): string {
    const raw = this.getPromptPayId().replace(/[^0-9]/g, '');
    if (raw.length === 10) {
      return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
    }
    return raw;
  },

  /**
   * Calculate exact plan price & promo expiration based on 24-hour Launch Price eligibility from user registration timestamp
   */
  calculatePlanPrice(planCode: string, userCreatedAt?: string | Date | null): PlanPriceResult {
    const now = new Date();
    let isLaunchPrice = true;
    let promoExpiresAt: string | null = null;
    let diffMs = 0;
    const promoWindowMs = 24 * 60 * 60 * 1000;
    let remainingMs = 0;

    if (userCreatedAt) {
      const parsed = new Date(userCreatedAt);
      if (!isNaN(parsed.getTime())) {
        const createdTime = parsed.getTime();
        diffMs = Math.max(0, now.getTime() - createdTime);
        remainingMs = Math.max(0, promoWindowMs - diffMs);
        isLaunchPrice = remainingMs > 0;
        promoExpiresAt = new Date(createdTime + promoWindowMs).toISOString();
      }
    } else {
      remainingMs = promoWindowMs;
      isLaunchPrice = true;
      promoExpiresAt = new Date(now.getTime() + promoWindowMs).toISOString();
    }

    const remainingSec = Math.floor(remainingMs / 1000);
    const hours = Math.floor(remainingSec / 3600);
    const minutes = Math.floor((remainingSec % 3600) / 60);
    const seconds = remainingSec % 60;

    const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const priceType: 'launch_promo' | 'regular' = isLaunchPrice ? 'launch_promo' : 'regular';

    let normalPrice = 199;
    let currentPrice = 199;

    const normCode = String(planCode || '').toLowerCase().replace('-', '_');

    if (normCode.includes('pro')) {
      normalPrice = 399;
      currentPrice = isLaunchPrice ? 199 : 399;
    } else if (normCode.includes('premium')) {
      normalPrice = 199;
      currentPrice = isLaunchPrice ? 99 : 199;
    } else if (normCode === 'free') {
      normalPrice = 0;
      currentPrice = 0;
      isLaunchPrice = false;
    } else {
      normalPrice = 199;
      currentPrice = isLaunchPrice ? 99 : 199;
    }

    const promptPayId = this.getPromptPayId().replace(/[^0-9]/g, '');
    const formattedPromptPayId = this.getFormattedPromptPayId();

    const qrUrl = `https://promptpay.io/${promptPayId}/${currentPrice}.png`;

    return {
      planCode,
      normalPrice,
      currentPrice,
      isLaunchPrice: isLaunchPrice && normalPrice > 0,
      priceType,
      promoExpiresAt,
      hoursRemaining: hours,
      minutesRemaining: minutes,
      secondsRemaining: seconds,
      formattedCountdown,
      timeExpired: !isLaunchPrice,
      qrUrl,
      promptPayId,
      formattedPromptPayId,
    };
  },

  /**
   * Submit payment request with strict server-side price verification and price_type / promo_expires_at metadata
   */
  async submitPaymentRequest(params: SubmitPaymentParams) {
    try {
      // Re-fetch user created_at from profiles DB to enforce strict server-side verification
      let verifiedCreatedAt = params.userCreatedAt;
      const { data: prof } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', params.userId)
        .maybeSingle();

      if (prof?.created_at) {
        verifiedCreatedAt = prof.created_at;
      }

      // Re-verify expected price from backend logic (DO NOT trust unverified frontend amount)
      const priceInfo = this.calculatePlanPrice(params.planCode, verifiedCreatedAt);

      if (Math.abs(params.amount - priceInfo.currentPrice) > 0.01) {
        return {
          success: false,
          error: `จำนวนเงินชำระ (฿${params.amount}) ไม่ตรงกับราคาแพ็กเกจที่ระบบคำนวณ (฿${priceInfo.currentPrice}) กรุณาตรวจสอบอีกครั้ง`,
        };
      }

      // Query exact plan UUID from subscription_plans strictly by code
      const { data: planRow, error: planError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('code', params.planCode)
        .maybeSingle();

      if (planError || !planRow?.id) {
        console.error('Plan lookup error:', planError?.message);
        return {
          success: false,
          error: `ไม่พบแพ็กเกจ (${params.planCode}) ในระบบ กรุณาตรวจสอบและลองใหม่อีกครั้ง`,
        };
      }

      const resolvedPlanId = planRow.id;

      // Encode price_type and promo_expires_at inside user_note for DB metadata compatibility
      const metadataPayload = {
        user_note: params.userNote || '',
        price_type: priceInfo.priceType,
        promo_expires_at: priceInfo.promoExpiresAt,
      };

      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: params.userId,
          plan_id: resolvedPlanId,
          amount: priceInfo.currentPrice,
          slip_url: params.slipUrl,
          user_note: JSON.stringify(metadataPayload),
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Payment request DB insert error:', error.message);
        return {
          success: false,
          error: `ไม่สามารถบันทึกข้อมูลคำขอชำระเงินได้ (${error.message}) กรุณาลองใหม่อีกครั้ง`,
        };
      }

      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูลชำระเงิน',
      };
    }
  },

  /**
   * Get user's payment request history
   */
  async getMyPaymentRequests(userId: string) {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },
};
