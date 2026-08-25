import React, { useRef, useEffect } from "react";

export function ContentEditable({ value, onChange, className, onKeyDown, placeholder, dataBlockId }) {
  const ref = useRef(null);
  const lastEmittedValue = useRef(value || "");

  useEffect(() => {
    // Only update the DOM if the value changes from the OUTSIDE 
    // (not from our own onInput). This prevents ALL cursor jump issues.
    if (ref.current && value !== lastEmittedValue.current) {
      // Safely set text content
      ref.current.innerText = value || "";
      lastEmittedValue.current = value || "";
    }
  }, [value]);

  const handleInput = (e) => {
    const newVal = e.currentTarget.innerText;
    lastEmittedValue.current = newVal;
    onChange(newVal);
  };

  return (
    <div
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      data-block-id={dataBlockId}
    />
  );
}
