import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.log(error);
  }
};

export const comparePassword = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword);
};
