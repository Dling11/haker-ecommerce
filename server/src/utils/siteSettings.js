const SiteSettings = require("../models/SiteSettings");

const defaultSettings = {
  maintenanceMode: false,
  maintenanceMessage: "The shop is temporarily unavailable while we perform maintenance.",
  allowCustomerRegistration: true,
  allowCustomerLogin: true,
  emailSystemEnabled: true,
  emailProvider: "resend",
  smsSystemEnabled: false,
  allowCheckout: true,
  allowCashOnDelivery: true,
  allowGCash: true,
  allowReviews: true,
  allowWishlist: true,
  allowCoupons: true,
  allowPoints: true,
  allowCollections: true,
  allowHomepageBanners: true,
  pointsEarnRate: 1,
  pointRedemptionValue: 1,
};

const getSiteSettings = async () => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create(defaultSettings);
    return settings;
  }

  let shouldSave = false;

  Object.entries(defaultSettings).forEach(([key, value]) => {
    if (typeof settings[key] === "undefined") {
      settings[key] = value;
      shouldSave = true;
    }
  });

  if (shouldSave) {
    await settings.save();
  }

  return settings;
};

const buildPublicSiteSettings = (settings) => ({
  maintenanceMode: settings.maintenanceMode,
  maintenanceMessage: settings.maintenanceMessage,
  allowCustomerRegistration: settings.allowCustomerRegistration,
  allowCustomerLogin: settings.allowCustomerLogin,
  emailSystemEnabled: settings.emailSystemEnabled,
  emailProvider: settings.emailProvider,
  smsSystemEnabled: settings.smsSystemEnabled,
  allowCheckout: settings.allowCheckout,
  allowCashOnDelivery: settings.allowCashOnDelivery,
  allowGCash: settings.allowGCash,
  allowReviews: settings.allowReviews,
  allowWishlist: settings.allowWishlist,
  allowCoupons: settings.allowCoupons,
  allowPoints: settings.allowPoints,
  allowCollections: settings.allowCollections,
  allowHomepageBanners: settings.allowHomepageBanners,
  pointsEarnRate: settings.pointsEarnRate,
  pointRedemptionValue: settings.pointRedemptionValue,
});

module.exports = {
  buildPublicSiteSettings,
  defaultSettings,
  getSiteSettings,
};
