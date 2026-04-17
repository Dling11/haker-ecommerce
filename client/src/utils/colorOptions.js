const COLOR_DELIMITER = "::";

export const serializeColorOption = (label, hex = "") => {
  const normalizedLabel = String(label || "").trim();
  const normalizedHex = String(hex || "").trim().toUpperCase();

  if (!normalizedLabel) {
    return "";
  }

  return normalizedHex
    ? `${normalizedLabel}${COLOR_DELIMITER}${normalizedHex}`
    : normalizedLabel;
};

export const parseColorOption = (value) => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return { label: "", hex: "" };
  }

  const [label, hex = ""] = normalizedValue.split(COLOR_DELIMITER);

  return {
    label: label.trim(),
    hex: hex.trim(),
  };
};

export const getColorOptionLabel = (value) => parseColorOption(value).label || String(value || "");
