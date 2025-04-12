export async function checkRateLimit() {
  try {
    const response = await fetch("/api/rate-limit", {
      method: "POST",
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return false;
  }
}
