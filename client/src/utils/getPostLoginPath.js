const getPostLoginPath = (user) => {
  if (!user) {
    return "/login";
  }

  return user.role === "admin" ? "/admin" : "/shop";
};

export default getPostLoginPath;
