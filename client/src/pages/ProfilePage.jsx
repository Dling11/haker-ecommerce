import { ImagePlus, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import api from "../services/api";
import StatusMessage from "../components/common/StatusMessage";
import { updateProfile } from "../features/auth/authSlice";

function ProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    password: "",
    avatar: user?.avatar?.url || "",
    fullName: user?.shippingAddress?.fullName || "",
    shippingPhone: user?.shippingAddress?.phone || "",
    street: user?.shippingAddress?.street || "",
    city: user?.shippingAddress?.city || "",
    state: user?.shippingAddress?.state || "",
    postalCode: user?.shippingAddress?.postalCode || "",
    country: user?.shippingAddress?.country || "Philippines",
  });

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const uploadData = new FormData();
    uploadData.append("image", file);
    uploadData.append("folder", "haker-ecommerce/users");

    try {
      setIsUploadingAvatar(true);
      const { data } = await api.post("/uploads/image", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData((current) => ({
        ...current,
        avatar: data.image.url,
      }));
      toast.success("Profile image uploaded.");
    } catch (uploadError) {
      toast.error(uploadError.response?.data?.message || "Failed to upload image.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(
      updateProfile({
        name: formData.name,
        phone: formData.phone,
        password: formData.password || undefined,
        avatar: {
          url: formData.avatar,
          publicId: user?.avatar?.publicId || "",
        },
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.shippingPhone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      setSuccessMessage("Profile saved successfully.");
      setFormData((current) => ({
        ...current,
        password: "",
      }));
    }
  };

  return (
    <section className="mx-auto max-w-4xl rounded-[10px] border border-violet-100 bg-white p-8 shadow-soft">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-500">Profile</p>
        <h1 className="text-3xl font-black text-slate-900">Manage your account</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <StatusMessage type="error" message={error} />
        <StatusMessage type="success" message={successMessage} />

        <div className="flex flex-col gap-4 rounded-[10px] border border-violet-100 bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)] p-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-100">
            {formData.avatar ? (
              <img src={formData.avatar} alt={formData.name} className="h-full w-full object-cover" />
            ) : null}
            {isUploadingAvatar ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-white">
                <LoaderCircle size={20} className="animate-spin" />
              </div>
            ) : null}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Profile image</p>
            <p className="text-sm text-slate-500">
              Upload a clear square image for the best result.
            </p>
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-[10px] border px-4 py-3 text-sm font-semibold transition ${
                isUploadingAvatar
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : "border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
              }`}
            >
              {isUploadingAvatar ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
              {isUploadingAvatar ? "Uploading..." : "Upload avatar"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Name</span>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Phone</span>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="Enter your phone number"
            />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">New password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder="Leave blank to keep your current password"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Receiver name</span>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="Enter your full name"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Receiver phone</span>
            <input
              name="shippingPhone"
              value={formData.shippingPhone}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="Enter your phone number"
            />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">Street</span>
          <input
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder="Enter your street address"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">City</span>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="Enter your city"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">State</span>
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="Enter your state"
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Postal code</span>
            <input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="Enter your postal code"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Country</span>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || isUploadingAvatar}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? <LoaderCircle size={18} className="animate-spin" /> : null}
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}

export default ProfilePage;
