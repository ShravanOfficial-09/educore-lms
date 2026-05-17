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

export const getUserRole = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  const decodedToken = parseJwt(token);

  return decodedToken?.role || null;
};

export const isAdmin = () => {
  return getUserRole() === "ADMIN";
};
