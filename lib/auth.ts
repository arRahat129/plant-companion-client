import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Prevent connecting multiple times in development
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
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string || "PLACEHOLDER_CLIENT_ID",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string || "PLACEHOLDER_CLIENT_SECRET",
        }
    }
});
