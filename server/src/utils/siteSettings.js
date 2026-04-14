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
});

module.exports = {
  buildPublicSiteSettings,
  defaultSettings,
  getSiteSettings,
};
