import { LoaderCircle, Upload, X } from "lucide-react";
import { SketchPicker } from "react-color";
import { useEffect, useRef } from "react";

import AppModal from "../common/AppModal";
import StatusMessage from "../common/StatusMessage";
import { parseColorOption, serializeColorOption } from "../../utils/colorOptions";

function ProductFormModal({
  adminError,
  categories,
  closeModal,
  customColorHex,
  customColorInput,
  customSizeInput,
  defaultColorOptions,
  defaultSizeOptions,
  editingProductId,
  error,
  formData,
  handleChange,
  handleImageUpload,
  handleRemoveImage,
  handleSubmit,
  isModalOpen,
  isColorPickerOpen,
  isRemovingImage,
  isSavingProduct,
  productImageInputRef,
  setCustomColorHex,
  setCustomColorInput,
  setIsColorPickerOpen,
  setCustomSizeInput,
  toggleVariantValue,
  addCustomVariantValue,
  removeVariantValue,
  uploadLoading,
}) {
  const colorPickerPopoverRef = useRef(null);

  useEffect(() => {
    if (!isColorPickerOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!colorPickerPopoverRef.current?.contains(event.target)) {
        setIsColorPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isColorPickerOpen, setIsColorPickerOpen]);

  return (
    <AppModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={editingProductId ? "Edit product" : "Add product"}
      description="Use a focused modal to manage products without cluttering the table."
      width="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <StatusMessage type="error" message={adminError || error} />

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="panel-muted space-y-4 p-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-white/75">Product name</span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Minimalist Hoodie"
                  className="field"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-white/75">Description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the product, fabric, fit, and key selling points."
                  className="field"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-white/75">Brand</span>
                  <input
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Haker Studio"
                    className="field"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-white/75">Category</span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-white/75">Price</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="1499"
                    className="field"
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-white/75">Compare price</span>
                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleChange}
                    placeholder="1799"
                    className="field"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-white/75">Stock</span>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="20"
                    className="field"
                    required
                  />
                </label>
              </div>
            </div>

            <div className="panel-muted space-y-4 p-4">
              <p className="text-sm font-semibold text-white/85">Colors</p>

              <div className="flex flex-wrap gap-2">
                {defaultColorOptions.map((color) => {
                  const isActive = formData.colors.includes(color.value);

                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => toggleVariantValue("colors", color.value)}
                      className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                          : "border-white/10 bg-white/5 text-white/75 hover:border-white/20"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: color.swatch }}
                      />
                      {color.name}
                    </button>
                  );
                })}
              </div>

              <div className="relative space-y-3 rounded-[12px] border border-white/10 bg-black/10 p-3">
                <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
                  <button
                    type="button"
                    onClick={() => setIsColorPickerOpen((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 transition hover:border-white/20"
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: customColorHex || "#FFFFFF" }}
                    />
                    {isColorPickerOpen ? "Close Picker" : "Pick Color"}
                  </button>
                  <input
                    value={customColorInput}
                    onChange={(event) => setCustomColorInput(event.target.value)}
                    placeholder="Color name"
                    className="field"
                  />
                </div>

                {isColorPickerOpen ? (
                  <div
                    ref={colorPickerPopoverRef}
                    className="absolute right-0 top-[calc(100%+0.5rem)] z-20 rounded-[16px] border border-white/10 bg-[#111827] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
                  >
                    <div className="rounded-[12px] bg-white p-3">
                      <SketchPicker
                        color={customColorHex}
                        onChange={(color) => setCustomColorHex(color.hex.toUpperCase())}
                        disableAlpha
                      />
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    value={customColorHex}
                    onChange={(event) => setCustomColorHex(event.target.value.toUpperCase())}
                    placeholder="#F97316"
                    className="field uppercase"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      addCustomVariantValue(
                        "colors",
                        serializeColorOption(customColorInput, customColorHex),
                        () => {
                          setCustomColorInput("");
                          setCustomColorHex("#F97316");
                        }
                      )
                    }
                    className="btn-secondary whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>

              {formData.colors.length ? (
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color) => {
                    const parsedColor = parseColorOption(color);

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => removeVariantValue("colors", color)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85"
                      >
                        {parsedColor.hex ? (
                          <span
                            className="h-3 w-3 rounded-full border border-black/10"
                            style={{ backgroundColor: parsedColor.hex }}
                          />
                        ) : null}
                        {parsedColor.label}
                        <X size={12} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-white/40">No colors selected yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="panel-muted space-y-4 p-4">
              <div>
                <p className="text-sm font-semibold text-white/85">Sizes</p>
                <p className="mt-1 text-xs text-white/45">
                  Use standard sizes or add your own label.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {defaultSizeOptions.map((size) => {
                  const isActive = formData.sizes.includes(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleVariantValue("sizes", size)}
                      className={`rounded-[10px] border px-4 py-2 text-sm font-bold transition ${
                        isActive
                          ? "border-violet-400 bg-violet-500/20 text-violet-100"
                          : "border-white/10 bg-white/5 text-white/75 hover:border-white/20"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  value={customSizeInput}
                  onChange={(event) => setCustomSizeInput(event.target.value)}
                  placeholder="Custom size"
                  className="field"
                />
                <button
                  type="button"
                  onClick={() =>
                    addCustomVariantValue("sizes", customSizeInput, setCustomSizeInput)
                  }
                  className="btn-secondary whitespace-nowrap"
                >
                  Add Size
                </button>
              </div>

              {formData.sizes.length ? (
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => removeVariantValue("sizes", size)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85"
                    >
                      {size}
                      <X size={12} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/40">No sizes selected yet.</p>
              )}
            </div>

            <div
              className="panel-muted space-y-3 border border-dashed border-white/15 p-4"
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleImageUpload(Array.from(event.dataTransfer.files || []));
              }}
            >
              <input
                ref={productImageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-white/10 bg-white/5 px-6 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
                  <Upload size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/85">Drop product images here</p>
                  <p className="mt-1 text-xs text-white/45">
                    Upload one or more images. The first image becomes the main product image.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => productImageInputRef.current?.click()}
                  className="rounded-[10px] border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Browse Images
                </button>
              </div>
              {uploadLoading ? <p className="text-sm text-white/50">Uploading image...</p> : null}
              {isRemovingImage ? <p className="text-sm text-white/50">Removing image...</p> : null}
            </div>

            {formData.images.length ? (
              <div className="panel-muted space-y-3 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {formData.images.map((image, index) => (
                    <div key={`${image.publicId || image.url}-${index}`} className="space-y-3">
                      <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className="h-44 w-full rounded-[10px] object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image)}
                        disabled={isRemovingImage}
                        className="inline-flex items-center gap-2 rounded-[10px] border border-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
                      >
                        <X size={16} />
                        Remove image
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="panel-muted p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white/85">Status</p>
                <div className="inline-flex rounded-[12px] border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: { name: "isPublished", type: "checkbox", checked: true },
                      })
                    }
                    className={`rounded-[9px] px-4 py-2 text-sm font-semibold transition ${
                      formData.isPublished
                        ? "bg-emerald-500/15 text-emerald-100"
                        : "text-white/60 hover:text-white/85"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: { name: "isPublished", type: "checkbox", checked: false },
                      })
                    }
                    className={`rounded-[9px] px-4 py-2 text-sm font-semibold transition ${
                      !formData.isPublished
                        ? "bg-amber-500/15 text-amber-100"
                        : "text-white/60 hover:text-white/85"
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>

            <div className="panel-muted p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white/85">Featured</p>
                <select
                  value={formData.isFeatured ? "yes" : "no"}
                  onChange={(event) =>
                    handleChange({
                      target: {
                        name: "isFeatured",
                        type: "checkbox",
                        checked: event.target.value === "yes",
                      },
                    })
                  }
                  className="field w-auto min-w-[110px]"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={closeModal} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSavingProduct}
            className="btn-primary gap-2 disabled:cursor-not-allowed"
          >
            {isSavingProduct ? <LoaderCircle size={16} className="animate-spin" /> : null}
            {isSavingProduct
              ? editingProductId
                ? "Saving..."
                : "Creating..."
              : editingProductId
                ? "Save Changes"
                : "Create Product"}
          </button>
        </div>
      </form>
    </AppModal>
  );
}

export default ProductFormModal;
