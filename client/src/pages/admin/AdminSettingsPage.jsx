import { LoaderCircle, ShieldCheck, Store, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import StatusMessage from "../../components/common/StatusMessage";
import {
  fetchAdminSiteSettings,
  updateAdminSiteSettings,
} from "../../features/admin/adminSlice";

const defaultForm = {
  maintenanceMode: false,
  maintenanceMessage: "",
  allowCustomerRegistration: true,
  allowCustomerLogin: true,
  emailSystemEnabled: true,
  smsSystemEnabled: false,
  allowCheckout: true,
  allowCashOnDelivery: true,
  allowGCash: true,
  allowReviews: true,
};

function ToggleCard({ title, description, checked, onChange, disabled = false }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-[10px] border border-white/10 bg-surface-muted/60 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/55">{description}</p>
      </div>

      <span className="relative mt-1 inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
        />
        <span className="h-7 w-12 rounded-full bg-white/15 transition peer-checked:bg-emerald-500/90 peer-disabled:opacity-50" />
        <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function AdminSettingsPage() {
  const dispatch = useDispatch();
  const { siteSettings, isLoading, error } = useSelector((state) => state.admin);
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    dispatch(fetchAdminSiteSettings());
  }, [dispatch]);

  useEffect(() => {
    if (siteSettings) {
      setFormData({
        maintenanceMode: siteSettings.maintenanceMode,
        maintenanceMessage: siteSettings.maintenanceMessage,
        allowCustomerRegistration: siteSettings.allowCustomerRegistration,
        allowCustomerLogin: siteSettings.allowCustomerLogin,
        emailSystemEnabled: siteSettings.emailSystemEnabled,
        smsSystemEnabled: siteSettings.smsSystemEnabled ?? false,
        allowCheckout: siteSettings.allowCheckout,
        allowCashOnDelivery: siteSettings.allowCashOnDelivery,
        allowGCash: siteSettings.allowGCash,
        allowReviews: siteSettings.allowReviews,
      });
    }
  }, [siteSettings]);

  const handleToggle = (key) => {
    setFormData((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(updateAdminSiteSettings(formData));

    if (updateAdminSiteSettings.fulfilled.match(result)) {
      toast.success("Control center updated.");
    } else {
      toast.error(result.payload || "Failed to update settings.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              Control Center
            </p>
            <h1 className="mt-2 text-2xl font-black text-white">Platform access controls</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
              Manage customer-facing access safely. These controls only affect customer
              access and storefront features. Admin authentication and admin routes stay
              available to prevent lockout.
            </p>
          </div>
          {isLoading ? (
            <span className="inline-flex items-center gap-2 text-sm text-white/55">
              <LoaderCircle size={16} className="animate-spin" />
              Syncing settings...
            </span>
          ) : null}
        </div>
      </div>

      <StatusMessage type="error" message={error} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <Wrench size={18} className="text-cyan-300" />
            <div>
              <h2 className="text-xl font-bold text-white">Storefront access</h2>
              <p className="text-sm text-white/55">
                Decide when customer access should be paused or restricted.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleCard
              title="Maintenance mode"
              description="Temporarily block customer access to protected storefront actions while keeping admin access available."
              checked={formData.maintenanceMode}
              onChange={() => handleToggle("maintenanceMode")}
            />

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/75">Maintenance message</span>
              <textarea
                rows="3"
                value={formData.maintenanceMessage}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    maintenanceMessage: event.target.value,
                  }))
                }
                className="field"
                placeholder="Explain why customer access is paused."
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="panel p-6">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck size={18} className="text-emerald-300" />
              <div>
                <h2 className="text-xl font-bold text-white">Account access</h2>
                <p className="text-sm text-white/55">
                  Manage who can sign up and sign in on the customer side.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ToggleCard
                title="Allow customer registration"
                description="Disable this when you want to stop new customer signups without affecting admins."
                checked={formData.allowCustomerRegistration}
                onChange={() => handleToggle("allowCustomerRegistration")}
              />
              <ToggleCard
                title="Allow customer login"
                description="Disable this to block new customer sign-ins. Admin login remains available."
                checked={formData.allowCustomerLogin}
                onChange={() => handleToggle("allowCustomerLogin")}
              />
              <ToggleCard
                title="Enable email system"
                description="Turn email verification, forgot-password emails, and order emails on or off for testing. When this is off, customer logins skip email verification."
                checked={formData.emailSystemEnabled}
                onChange={() => handleToggle("emailSystemEnabled")}
              />
              <ToggleCard
                title="Enable SMS system"
                description="Turn ClickSend order-status texts on or off for testing. SMS currently covers out-for-delivery, delivered, and cancelled updates."
                checked={formData.smsSystemEnabled}
                onChange={() => handleToggle("smsSystemEnabled")}
              />
            </div>
          </div>

          <div className="panel p-6">
            <div className="mb-4 flex items-center gap-3">
              <Store size={18} className="text-violet-300" />
              <div>
                <h2 className="text-xl font-bold text-white">Commerce features</h2>
                <p className="text-sm text-white/55">
                  Control checkout and payment availability without changing code.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ToggleCard
                title="Allow checkout"
                description="Turn this off during maintenance or inventory audits."
                checked={formData.allowCheckout}
                onChange={() => handleToggle("allowCheckout")}
              />
              <ToggleCard
                title="Allow Cash on Delivery"
                description="Disable COD if local delivery or fulfillment rules change."
                checked={formData.allowCashOnDelivery}
                onChange={() => handleToggle("allowCashOnDelivery")}
              />
              <ToggleCard
                title="Allow GCash"
                description="Disable GCash temporarily while payment verification is unavailable."
                checked={formData.allowGCash}
                onChange={() => handleToggle("allowGCash")}
              />
              <ToggleCard
                title="Allow reviews"
                description="Pause customer reviews if moderation is needed."
                checked={formData.allowReviews}
                onChange={() => handleToggle("allowReviews")}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="submit" disabled={isLoading} className="btn-primary gap-2">
            {isLoading ? <LoaderCircle size={16} className="animate-spin" /> : null}
            {isLoading ? "Saving..." : "Save controls"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminSettingsPage;
