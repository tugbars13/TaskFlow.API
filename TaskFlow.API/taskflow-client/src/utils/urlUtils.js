export const checkUrlValidity = (url) => {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  let testUrl = trimmed;
  if (!/^(https?):/i.test(trimmed)) {
    testUrl = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(testUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
