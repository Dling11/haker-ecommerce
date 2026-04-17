import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { deleteAdminImage, uploadAdminImage } from "../features/admin/adminSlice";
import { createProduct, updateProduct } from "../features/products/productSlice";
import { initialFormState } from "../pages/admin/productForm.constants";

export default function useAdminProductForm({ dispatch }) {
  const [formData, setFormData] = useState(initialFormState);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [originalImages, setOriginalImages] = useState([]);
  const [customColorInput, setCustomColorInput] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#F97316");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [customSizeInput, setCustomSizeInput] = useState("");
  const productImageInputRef = useRef(null);

  const resetForm = () => {
    setEditingProductId(null);
    setOriginalImages([]);
    setCustomColorInput("");
    setCustomColorHex("#F97316");
    setIsColorPickerOpen(false);
    setCustomSizeInput("");
    setFormData(initialFormState);
    if (productImageInputRef.current) {
      productImageInputRef.current.value = "";
    }
  };

  const removeTemporaryImage = async (publicId) => {
    if (!publicId) {
      return true;
    }

    const result = await dispatch(deleteAdminImage(publicId));

    if (deleteAdminImage.rejected.match(result)) {
      toast.error(result.payload || "Failed to remove image.");
      return false;
    }

    return true;
  };

  const closeModal = async ({ cleanupTemporaryImage = true } = {}) => {
    if (cleanupTemporaryImage) {
      const originalPublicIds = new Set(
        originalImages.map((image) => image.publicId).filter(Boolean)
      );
      const temporaryPublicIds = formData.images
        .map((image) => image.publicId)
        .filter((publicId) => publicId && !originalPublicIds.has(publicId));

      await Promise.all(temporaryPublicIds.map(removeTemporaryImage));
    }

    setIsModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const startEditing = (product) => {
    setEditingProductId(product._id);
    setOriginalImages(product.images || []);
    setFormData({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      price: product.price,
      comparePrice: product.comparePrice,
      stock: product.stock,
      images: product.images || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      isFeatured: product.isFeatured,
      isPublished: product.isPublished,
    });
    setIsColorPickerOpen(false);
    setIsModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleVariantValue = (field, value) => {
    setFormData((current) => {
      const exists = current[field].includes(value);

      return {
        ...current,
        [field]: exists
          ? current[field].filter((item) => item !== value)
          : [...current[field], value],
      };
    });
  };

  const addCustomVariantValue = (field, value, reset) => {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return;
    }

    setFormData((current) => ({
      ...current,
      [field]: current[field].includes(normalizedValue)
        ? current[field]
        : [...current[field], normalizedValue],
    }));
    reset("");
    if (field === "colors") {
      setIsColorPickerOpen(false);
    }
  };

  const removeVariantValue = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: current[field].filter((item) => item !== value),
    }));
  };

  const handleImageUpload = async (eventOrFiles) => {
    const files = Array.isArray(eventOrFiles)
      ? eventOrFiles
      : Array.from(eventOrFiles.target.files || []);

    if (!files.length) {
      return;
    }

    const uploadedImages = [];

    for (const file of files) {
      const result = await dispatch(
        uploadAdminImage({ file, folder: "haker-ecommerce/products" })
      );

      if (uploadAdminImage.rejected.match(result)) {
        await Promise.all(
          uploadedImages
            .map((image) => image.publicId)
            .filter(Boolean)
            .map(removeTemporaryImage)
        );
        toast.error(result.payload || "Failed to upload image.");
        if (productImageInputRef.current) {
          productImageInputRef.current.value = "";
        }
        return;
      }

      uploadedImages.push(result.payload);
    }

    setFormData((current) => ({
      ...current,
      images: [...current.images, ...uploadedImages],
    }));
    toast.success(
      uploadedImages.length === 1
        ? "Image uploaded successfully."
        : `${uploadedImages.length} images uploaded successfully.`
    );

    if (productImageInputRef.current) {
      productImageInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (imageToRemove) => {
    if (!imageToRemove?.url) {
      return;
    }

    setIsRemovingImage(true);

    const isOriginalImage = originalImages.some(
      (image) => image.publicId && image.publicId === imageToRemove.publicId
    );

    if (!isOriginalImage && imageToRemove.publicId) {
      const removed = await removeTemporaryImage(imageToRemove.publicId);

      if (!removed) {
        setIsRemovingImage(false);
        return;
      }
    }

    setFormData((current) => ({
      ...current,
      images: current.images.filter((image) => image.url !== imageToRemove.url),
    }));
    if (productImageInputRef.current) {
      productImageInputRef.current.value = "";
    }
    toast.success("Image removed.");
    setIsRemovingImage(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSavingProduct(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      category: formData.category,
      price: Number(formData.price),
      comparePrice: Number(formData.comparePrice || 0),
      stock: Number(formData.stock),
      isFeatured: formData.isFeatured,
      isPublished: formData.isPublished,
      images: formData.images,
      colors: formData.colors,
      sizes: formData.sizes,
    };

    const result = editingProductId
      ? await dispatch(updateProduct({ productId: editingProductId, productData: payload }))
      : await dispatch(createProduct(payload));

    if (updateProduct.fulfilled.match(result) || createProduct.fulfilled.match(result)) {
      toast.success(editingProductId ? "Product updated." : "Product created.");
      await closeModal({ cleanupTemporaryImage: false });
    } else {
      toast.error(result.payload || "Failed to save product.");
    }

    setIsSavingProduct(false);
  };

  return {
    customColorHex,
    customColorInput,
    isColorPickerOpen,
    customSizeInput,
    editingProductId,
    formData,
    isModalOpen,
    isRemovingImage,
    isSavingProduct,
    openCreateModal,
    productImageInputRef,
    removeVariantValue,
    setCustomColorHex,
    setCustomColorInput,
    setIsColorPickerOpen,
    setCustomSizeInput,
    startEditing,
    toggleVariantValue,
    addCustomVariantValue,
    closeModal,
    handleChange,
    handleImageUpload,
    handleRemoveImage,
    handleSubmit,
  };
}
