/**
 * Extracts a user-friendly error message from a FastAPI/Axios error response.
 * Handles both string detail and array of objects (validation errors).
 */
export const getErrorMessage = (err: any, fallback: string = "Đã có lỗi xảy ra. Vui lòng thử lại."): string => {
  const detail = err.response?.data?.detail;
  
  if (typeof detail === "string") {
    return detail;
  }
  
  if (Array.isArray(detail)) {
    // Take the first validation error message if available
    return detail[0]?.msg || fallback;
  }
  
  if (detail && typeof detail === "object") {
    // Some other object format
    return detail.message || JSON.stringify(detail);
  }

  return fallback;
};
