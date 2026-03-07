const HttpStatus = Object.freeze({
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,

  getLabel(status) {
    const labels = {
      200: "OK",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      500: "SERVER_ERROR"
    };

    return labels[status] || "UNKNOWN_STATUS";
  },

  getMessage(status, customMessage = null) {
    const defaultMessages = {
      200: "Request successful.",
      401: "Authentication required. Please log in.",
      403: "You do not have permission to access this resource.",
      404: "The requested resource was not found.",
      500: "Internal server error. Please try again later."
    };

    return customMessage || defaultMessages[status] || "Unknown status.";
  }
});

module.exports = HttpStatus;