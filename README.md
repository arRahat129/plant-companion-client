# 🌿 PlantCompanion — AI-Powered Plant Care & Marketplace

PlantCompanion is a premium, feature-rich web application built to help gardening enthusiasts scan, diagnose, list, and trade domestic plants. With state-of-the-art AI-powered image analysis, custom bot diagnostics, interactive visual dashboards, and a user-to-user purchase request broker, managing your plants has never been easier.

## 🚀 Live Deployments

- **Live Client Web App**: [https://plant-companion-client.vercel.app](https://plant-companion-client.vercel.app)
- **Live Express Server API**: [https://plant-companion-server.vercel.app](https://plant-companion-server.vercel.app)

---

## 📂 Repositories

- **Client Codebase (Next.js)**: [https://github.com/arRahat129/plant-companion-client](https://github.com/arRahat129/plant-companion-client)
- **Server Codebase (Express/Node.js)**: [https://github.com/arRahat129/plant-companion-server](https://github.com/arRahat129/plant-companion-server)

---

## ✨ Features

### 🌿 1. Public Marketplace & Listings
- Browse listings from trusted community sellers.
- Filter plants by pot size, category, price, and pet safety options.
- User-to-seller request system specifying pickup schedules and contact detail handshakes.

### 🔬 2. AI Disease Diagnosis
- Upload plant leaves directly and perform diagnostics using **Hugging Face** image classification (`linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`).
- Automated pathology reports (Diagnosis, symptoms, causes, biological/chemical treatments) compiled using the **Hugging Face Router** model (`openai/gpt-oss-20b:groq`).

### 🩺 3. AI Plant Doctor Chatbot
- Context-aware chatbot grounded on the user's latest plant diagnostic report.
- Standard typing indicators, markdown render support, and bot responses powered by the Hugging Face Router.

### 📈 4. Interactive Dashboards & Analytics
- **User Dashboard**: Real-time Area charts (powered by **Recharts**) to track scan logs, trades, and newly added plants.
- **Admin Dashboard**: Visual insights regarding platform user growth, scans count over time, new listings, and trade analytics.

### 👥 5. Admin Panel User Management
- View all platform user profiles in responsive viewports (lg: Table, md: 2-column cards, sm: 1-column card).
- Promote/demote user roles (User ⇄ Admin) and delete database accounts.

### ⚙️ 6. Profile Settings
- Upload customized avatars directly to **ImgBB** and update name and email.
- Built natively using the **Better-Auth** React SDK for session propagation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Next.js 16 (App Router), Tailwind CSS v4, Framer Motion, Lenis (Smooth Scroll) |
| **State & Auth** | Better-Auth, Context |
| **Charts** | Recharts |
| **Backend** | Node.js, Express, MongoDB (Native Client) |
| **AI / ML** | Hugging Face Inference client (`@huggingface/inference`) |

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB connection string

### 2. Client Setup
1. Clone the client repository:
   ```bash
   git clone https://github.com/arRahat129/plant-companion-client.git
   cd plant-companion-client
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Configure environment variables in `.env`:
   ```env
   # Frontend URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Backend Server URL
   NEXT_PUBLIC_SERVER_URL=http://localhost:5000

   # Better-Auth settings
   BETTER_AUTH_SECRET=your_better_auth_secret_here
   BETTER_AUTH_URL=http://localhost:3000
   
   # Database Connection
   MONGODB_URI=your_mongodb_uri
   DB_NAME=plant_companion
   ```
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```

### 3. Server Setup
1. Clone the server repository:
   ```bash
   git clone https://github.com/arRahat129/plant-companion-server.git
   cd plant-companion-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   DB_NAME=plant_companion

   # Client URL for CORS
   CLIENT_URL=http://localhost:3000

   # Hugging Face Access Token
   HF_INFERENCE_TOKEN=your_hugging_face_token
   ```
4. Run the Express development server:
   ```bash
   npm run dev
   ```
