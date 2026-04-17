import bcrypt from "bcrypt";

const generateHash = async () => {
  const hash = await bcrypt.hash("12345", 10);
  console.log(hash);
};

generateHash();