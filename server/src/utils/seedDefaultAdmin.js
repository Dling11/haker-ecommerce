const User = require("../models/User");

const seedDefaultAdmin = async () => {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  const adminName = process.env.DEFAULT_ADMIN_NAME || "Haker Admin";

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

  if (existingAdmin) {
    return;
  }

  await User.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: adminPassword,
    role: "admin",
  });

  console.log(`Default admin created for ${adminEmail}`);
};

module.exports = seedDefaultAdmin;
