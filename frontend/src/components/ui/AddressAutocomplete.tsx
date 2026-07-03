import { useState, useEffect, useRef } from "react";
import Input from "./Input";

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  required?: boolean;
}

export default function AddressAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  required = false,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || query.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Nominatim fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        label={label}
        placeholder={placeholder}
        value={query}
        required={required}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (query.length >= 3) setIsOpen(true);
        }}
      />
      {isOpen && (suggestions.length > 0 || isLoading) && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg overflow-hidden text-sm">
          {isLoading && <li className="px-4 py-2 text-gray-500">Searching...</li>}
          {!isLoading &&
            suggestions.map((s) => (
              <li
                key={s.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0 truncate"
                onClick={() => {
                  setQuery(s.display_name);
                  onChange(s.display_name, parseFloat(s.lat), parseFloat(s.lon));
                  setIsOpen(false);
                }}
              >
                {s.display_name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
