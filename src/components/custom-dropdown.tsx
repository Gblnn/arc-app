import { ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "0.5rem 1rem",
          border: "1px solid rgba(100 100 100/ 15%)",
          borderRadius: "0.375rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          fontSize: "0.875rem",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            opacity: value ? 1 : 0.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "calc(100% - 4rem)",
          }}
        >
          {value
            ? options.find((opt) => opt.value === value)?.label
            : placeholder}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {value && (
            <X
              width="0.9rem"
              style={{ opacity: 0.5, cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            />
          )}
          <ChevronDown
            width="1rem"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              opacity: 0.5,
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",

              left: 0,
              right: 0,
              background: "rgb(18 18 18)",
              border: "1px solid rgba(100 100 100/ 15%)",
              borderRadius: "0.375rem",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.15,
                  delay: 0.025,
                  ease: "easeOut",
                }}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  textAlign: "left",
                  background:
                    value === option.value
                      ? "rgba(100 100 100/ 5%)"
                      : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(100 100 100/ 15%)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
