/**
  Utility function to conditionally combine CSS class names.
  Filters out falsy values (null, undefined, false, empty strings).
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
