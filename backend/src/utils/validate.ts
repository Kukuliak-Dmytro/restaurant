import dotenv from "dotenv";

const requiredEns=[
    "SUPABASE_URL",
    "PUBLISH_KEY",
    "SECRET_KEY"
]

dotenv.config();
const config: Record<string, string> = {};
function validateEnv() {
    requiredEns.forEach((env) => {
        if (!process.env[env]) {
            throw new Error(`Missing environment variable: ${env}`);
        }
        config[env] = process.env[env];
    });
}
export { config };
export default validateEnv;