const validateEnv = (requiredKeys: string[]) => {
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);
  if (missingKeys.length) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }
};

export default validateEnv;


