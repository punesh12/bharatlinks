/**
 * Plan Configuration and Utilities
 * Defines plan tiers, limits, and feature access
 */

export type PlanTier = "free" | "starter" | "pro" | "organization";

export interface PlanLimits {
  monthlyLinks: number | null; // null = unlimited
  workspaces: number | null; // null = unlimited
  customDomains: number | null; // null = unlimited
  teamMembers: number | null; // null = unlimited
  advancedAnalytics: boolean;
  deepLinking: boolean;
  whatsappCustomization: boolean;
  qrCustomization: boolean;
  dataExport: boolean;
  apiAccess: boolean;
  ads: boolean; // Show ads on redirect page
  analyticsRetentionDays: number | null; // null = unlimited
}

export interface PlanConfig {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  limits: PlanLimits;
  features: string[];
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  free: {
    name: "Free Forever",
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      monthlyLinks: 50,
      workspaces: 1,
      customDomains: 0,
      teamMembers: 1,
      advancedAnalytics: false,
      deepLinking: false,
      whatsappCustomization: false,
      qrCustomization: false,
      dataExport: false,
      apiAccess: false,
      ads: true,
      analyticsRetentionDays: 7,
    },
    features: [
      "50 links/month",
      "1 workspace",
      "Basic analytics (click count only)",
      "QR codes",
      "UTM templates",
      "Tags & search",
    ],
  },
  starter: {
    name: "Starter",
    price: {
      monthly: 199,
      yearly: 1999,
    },
    limits: {
      monthlyLinks: 500,
      workspaces: 3,
      customDomains: 1,
      teamMembers: 5,
      advancedAnalytics: false,
      deepLinking: false,
      whatsappCustomization: false,
      qrCustomization: true,
      dataExport: false,
      apiAccess: false,
      ads: false,
      analyticsRetentionDays: 30,
    },
    features: [
      "500 links/month",
      "3 workspaces",
      "1 custom domain",
      "Team members (up to 5)",
      "QR code customization",
      "Last 30 days analytics",
      "No ads",
      "UTM templates",
      "Tags & search",
    ],
  },
  pro: {
    name: "Pro",
    price: {
      monthly: 999,
      yearly: 9999,
    },
    limits: {
      monthlyLinks: null, // unlimited
      workspaces: null, // unlimited
      customDomains: 5,
      teamMembers: 20,
      advancedAnalytics: true,
      deepLinking: true,
      whatsappCustomization: true,
      qrCustomization: true,
      dataExport: true,
      apiAccess: false,
      ads: false,
      analyticsRetentionDays: null, // unlimited
    },
    features: [
      "Unlimited links",
      "Unlimited workspaces",
      "5 custom domains",
      "Deep linking (app routing)",
      "WhatsApp preview customization",
      "Advanced analytics",
      "Team members (up to 20)",
      "Data export (CSV/PDF)",
      "QR code customization",
      "No ads",
    ],
  },
  organization: {
    name: "Organization",
    price: {
      monthly: 5000,
      yearly: 50000,
    },
    limits: {
      monthlyLinks: null, // unlimited
      workspaces: null, // unlimited
      customDomains: null, // unlimited
      teamMembers: null, // unlimited
      advancedAnalytics: true,
      deepLinking: true,
      whatsappCustomization: true,
      qrCustomization: true,
      dataExport: true,
      apiAccess: true,
      ads: false,
      analyticsRetentionDays: null, // unlimited
    },
    features: [
      "Unlimited links",
      "Unlimited custom domains",
      "API access",
      "SSO support",
      "Dedicated account manager",
      "SLA guarantee",
      "All Pro features",
    ],
  },
};

/**
 * Get plan configuration for a tier
 */
export const getPlan = (tier: PlanTier): PlanConfig => {
  return PLANS[tier];
};

/**
 * Check if plan has access to a feature
 */
export const hasFeature = (tier: PlanTier, feature: keyof PlanLimits): boolean => {
  return PLANS[tier].limits[feature] === true;
};

/**
 * Get limit value for a plan
 */
export const getLimit = (tier: PlanTier, limit: keyof PlanLimits): number | null => {
  const value = PLANS[tier].limits[limit];
  return typeof value === "number" ? value : value === true ? 1 : null;
};

/**
 * Check if plan allows unlimited for a limit
 */
export const isUnlimited = (tier: PlanTier, limit: keyof PlanLimits): boolean => {
  const value = PLANS[tier].limits[limit];
  return value === null || value === true;
};

/**
 * Get upgrade suggestions based on current plan and usage
 */
export const getUpgradeSuggestion = (
  currentTier: PlanTier,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _reason?: "links" | "domains" | "team" | "analytics" | "features"
): PlanTier | null => {
  const tierOrder: PlanTier[] = ["free", "starter", "pro", "organization"];
  const currentIndex = tierOrder.indexOf(currentTier);

  if (currentIndex === tierOrder.length - 1) {
    return null; // Already on highest plan
  }

  // Suggest next tier up
  return tierOrder[currentIndex + 1];
};
