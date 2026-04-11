import { ImagePlus } from "lucide-react";
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
    <section className="mx-auto max-w-4xl rounded-[10px] border border-white/10 bg-[#171c24] p-8 shadow-soft">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Profile</p>
        <h1 className="text-3xl font-black text-white">Manage your account</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <StatusMessage type="error" message={error} />
        <StatusMessage type="success" message={successMessage} />

        <div className="panel-muted flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-white/10">
            {formData.avatar ? (
              <img src={formData.avatar} alt={formData.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white/80">Profile image</p>
            <label className="btn-secondary inline-flex cursor-pointer gap-2">
              <ImagePlus size={16} />
              Upload avatar
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-white/80">Name</span>
            <input name="name" value={formData.name} onChange={handleChange} className="field" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-white/80">Phone</span>
            <input name="phone" value={formData.phone} onChange={handleChange} className="field" />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-white/80">New password</span>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="field" placeholder="Leave blank to keep your current password" />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-white/80">Receiver name</span>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="field" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-white/80">Receiver phone</span>
            <input name="shippingPhone" value={formData.shippingPhone} onChange={handleChange} className="field" />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-white/80">Street</span>
          <input name="street" value={formData.street} onChange={handleChange} className="field" />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-white/80">City</span>
            <input name="city" value={formData.city} onChange={handleChange} className="field" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-white/80">State</span>
            <input name="state" value={formData.state} onChange={handleChange} className="field" />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-white/80">Postal code</span>
            <input name="postalCode" value={formData.postalCode} onChange={handleChange} className="field" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-white/80">Country</span>
            <input name="country" value={formData.country} onChange={handleChange} className="field" />
          </label>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}

export default ProfilePage;
