import React, { useRef, useEffect } from "react";

export function ContentEditable({
  value,
  onChange,
  className,
  onKeyDown,
  placeholder,
  dataBlockId,
  dataField,
  dataAdvancedInput,
  isRichText = false,
}) {
  const ref = useRef(null);
  const lastEmittedValue = useRef(value || "");

  // Mount-only: populate DOM with initial value.
  // We do this separately so lastEmittedValue stays in sync from the start
  // and the "sync from outside" effect below doesn't fire on first render.
  useEffect(() => {
    if (!ref.current) return;
    if (isRichText) {
      ref.current.innerHTML = value || "";
    } else {
      ref.current.innerText = value || "";
    }
    // Keep lastEmittedValue aligned with what we just wrote.
    lastEmittedValue.current = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount only

  useEffect(() => {
    // Only update the DOM if the value changes from the OUTSIDE
    // (not from our own onInput). This prevents ALL cursor jump issues.
    if (ref.current && value !== lastEmittedValue.current) {
      if (isRichText) {
        if (ref.current.innerHTML !== (value || "")) {
          ref.current.innerHTML = value || "";
        }
      } else {
        if (ref.current.innerText !== (value || "")) {
          ref.current.innerText = value || "";
        }
      }
      lastEmittedValue.current = value || "";
    }
  }, [value, isRichText]);

  const handleInput = (e) => {
    let newVal;
    if (isRichText) {
      newVal = e.currentTarget.innerHTML;
      // If content is empty or only whitespace/br, normalize to ""
      // NOTE: Do NOT forcibly clear innerHTML here — it kills the cursor.
      if (e.currentTarget.innerText.trim() === "") {
        newVal = "";
        // Do not touch innerHTML; the empty:before CSS placeholder handles the visual.
      }
    } else {
      newVal = e.currentTarget.innerText;
    }
    lastEmittedValue.current = newVal;
    onChange(newVal);
  };

  const handleClick = (e) => {
    const a = e.target.closest("a");
    if (a && a.href) {
      const selection = window.getSelection();
      // If user was actively selecting text with drag, do not navigate
      if (selection && !selection.isCollapsed && selection.toString().length > 0) {
        return;
      }

      const href = a.getAttribute("href") || "";
      if (/^(javascript|data|vbscript):/i.test(href.trim())) {
        e.preventDefault();
        return;
      }

      window.open(a.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      ref={ref}
      className={`${className || ""} ${
        isRichText
          ? "[&_a]:text-indigo-600 [&_a]:underline [&_a]:cursor-pointer [&_a]:hover:text-indigo-800 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline"
          : ""
      }`}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={onKeyDown}
      onClick={handleClick}
      data-advanced-input={dataAdvancedInput ? "true" : undefined}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      placeholder={placeholder}
      data-block-id={dataBlockId}
      data-field={dataField || (dataBlockId?.endsWith("-url") ? "url" : "content")}
    />
  );
}

