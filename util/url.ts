export const safeUrlCleanup = (urlStr: string) => {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace("www.", "");
  } catch (e) {
    return urlStr;
  }
};
