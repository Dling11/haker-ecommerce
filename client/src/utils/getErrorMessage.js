const getErrorMessage = (error) => {
  const message =
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again.";

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("jwt expired") ||
    normalizedMessage.includes("jwt malformed") ||
    normalizedMessage.includes("invalid token") ||
    normalizedMessage.includes("token is missing") ||
    normalizedMessage.includes("not authorized")
  ) {
    return "Your session has expired. Please log in again.";
  }

  return message;
};

export default getErrorMessage;
