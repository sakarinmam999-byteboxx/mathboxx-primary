import { PlanCode, SubscriptionStatus } from './database.types';

export interface PlanFeatureInfo {
  code: PlanCode;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  worksheetLimit: number; // -1 for unlimited
  questionLimit: number;
  pdfLimit: number;
  customLogo: boolean;
  customWatermark: boolean;
  badge?: string;
  features: string[];
}

export interface UserQuotaUsage {
  worksheetsUsedMonth: number;
  worksheetsLimitMonth: number;
  pdfDownloadsMonth: number;
  pdfLimitMonth: number;
  status: SubscriptionStatus;
  currentPlanName: string;
  currentPlanCode: PlanCode;
  daysRemaining?: number;
}
