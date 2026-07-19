import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Prevent connecting multiple times in development (HMR protection)
const globalForMongo = global as unknown as { mongoClient: MongoClient };

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const client = globalForMongo.mongoClient || new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
}

const db = client.db(process.env.DB_NAME || "plant_companion");

export const auth = betterAuth({
    // The URL where this Next.js app (and its /api/auth handler) is running
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

    // Allow the frontend origin to make auth requests
    trustedOrigins: [
        process.env.BETTER_AUTH_URL || "http://localhost:3000",
    ],

    secret: process.env.BETTER_AUTH_SECRET,

    database: mongodbAdapter(db),

    emailAndPassword: {
        enabled: true,
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false, // Never let the client set role — only admins can promote
            },
        },
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});
