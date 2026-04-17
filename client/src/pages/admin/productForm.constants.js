import { serializeColorOption } from "../../utils/colorOptions";

export const initialFormState = {
  name: "",
  description: "",
  brand: "",
  category: "",
  price: "",
  comparePrice: "",
  stock: "",
  images: [],
  colors: [],
  sizes: [],
  isFeatured: false,
  isPublished: true,
};

export const defaultColorOptions = [
  { name: "Black", swatch: "#111827" },
  { name: "White", swatch: "#F8FAFC" },
  { name: "Red", swatch: "#EF4444" },
  { name: "Blue", swatch: "#3B82F6" },
  { name: "Green", swatch: "#22C55E" },
].map((color) => ({
  ...color,
  value: serializeColorOption(color.name, color.swatch),
}));

export const defaultSizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
