import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import useDebouncedValue from "../../hooks/useDebouncedValue";

function SearchableSelect({
  label,
  placeholder,
  emptyMessage = "No results found.",
  options = [],
  value,
  onChange,
  disabled = false,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 250);

  const selectedOption = options.find((option) => option.value === value) || null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return options.slice(0, 8);
    }

    return options
      .filter((option) =>
        `${option.label} ${option.description || ""}`.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 8);
  }, [debouncedQuery, options]);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <div ref={wrapperRef} className="relative">
        <div className="flex items-center gap-2 rounded-[10px] border border-white/10 bg-[#10141b] px-3">
          <Search size={16} className="text-white/35" />
          <input
            type="text"
            value={isOpen ? query : selectedOption?.label || query}
            onFocus={() => {
              setIsOpen(true);
              setQuery("");
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            placeholder={selectedOption?.label || placeholder}
            disabled={disabled}
            className="w-full bg-transparent px-0 py-3 text-sm text-white outline-none placeholder:text-white/30"
          />
          {selectedOption ? (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setQuery("");
              }}
              className="text-white/35 transition hover:text-white/60"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {isOpen ? (
          <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-[10px] border border-white/10 bg-[#10141b] shadow-lg">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-white/45">{emptyMessage}</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setQuery(option.label);
                    setIsOpen(false);
                  }}
                  className="block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/5"
                >
                  <p className="text-sm font-semibold text-white">{option.label}</p>
                  {option.description ? (
                    <p className="mt-1 text-xs text-white/45">{option.description}</p>
                  ) : null}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </label>
  );
}

export default SearchableSelect;
