const requiredEnvVariables = [
  "JWT_SECRET",
  "DATABASE_URL",
];

function validateEnv() {
  let hasError = false;

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      hasError = true;
    }
  });

  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠ Warning: GEMINI_API_KEY not found. AI features may not work.");
  }

  if (hasError) {
    console.error("❌ Environment validation failed. Fix the above errors and restart.");
    process.exit(1); // stop the server
  }

  console.log("✅ Environment variables validated successfully.");
}

module.exports = validateEnv;