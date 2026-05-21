const isJwtLike = (value) => {
  return typeof value === "string" && value.split(".").length === 3;
};

const sanitizeToken = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (
    !trimmedValue ||
    trimmedValue === "undefined" ||
    trimmedValue === "null" ||
    trimmedValue === "[object Object]"
  ) {
    return null;
  }

  return isJwtLike(trimmedValue) ? trimmedValue : null;
};

const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(base64);

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.log("Failed to decode token:", error);
    return null;
  }
};

export const extractTokenFromResponse = (response) => {
  const possibleToken =
    response?.token ||
    response?.data?.token ||
    response?.data?.data?.token ||
    null;

  return sanitizeToken(possibleToken);
};

export const getStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const sanitizedToken = sanitizeToken(storedToken);

  if (!sanitizedToken && storedToken) {
    localStorage.removeItem("token");
  }

  return sanitizedToken;
};

export const storeAuthToken = (response) => {
  const token = extractTokenFromResponse(response);

  if (!token) {
    throw new Error("Token not found in login response");
  }

  localStorage.setItem("token", token);
  return token;
};

export const clearAuthToken = () => {
  localStorage.removeItem("token");
};

export const getUserRole = () => {
  const token = getStoredToken();

  if (!token) {
    return null;
  }

  const decodedToken = parseJwt(token);

  return decodedToken?.role || null;
};

export const isAdmin = () => {
  return getUserRole() === "ADMIN";
};

export const isStudent = () => {
  return getUserRole() === "STUDENT";
};
