const SiteSettings = require("../models/SiteSettings");

const defaultSettings = {
  maintenanceMode: false,
  maintenanceMessage: "The shop is temporarily unavailable while we perform maintenance.",
  allowCustomerRegistration: true,
  allowCustomerLogin: true,
  allowCheckout: true,
  allowCashOnDelivery: true,
  allowGCash: true,
  allowReviews: true,
};

const getSiteSettings = async () => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create(defaultSettings);
  }

  return settings;
};

const buildPublicSiteSettings = (settings) => ({
  maintenanceMode: settings.maintenanceMode,
  maintenanceMessage: settings.maintenanceMessage,
  allowCustomerRegistration: settings.allowCustomerRegistration,
  allowCustomerLogin: settings.allowCustomerLogin,
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
