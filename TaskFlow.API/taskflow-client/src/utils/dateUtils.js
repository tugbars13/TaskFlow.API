export const formatDateDDMMYYYY = (dateVal) => {
  if (!dateVal) return "";

  const d = new Date(dateVal);

  if (isNaN(d.getTime())) return String(dateVal);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatLongDate = (dateVal = new Date()) => {
  const d = new Date(dateVal);

  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
};
