# 🚀 GigOrbit - Next-Gen Autonomous Service Marketplace

![Hackathon Ready](https://img.shields.io/badge/Status-Hackathon_Ready-success?style=for-the-badge)
![Powered By](https://img.shields.io/badge/Engine-Google_Vertex_AI-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js_|_Tailwind_CSS-black?style=for-the-badge)

**GigOrbit** is an AI-driven, two-sided gig economy platform designed to seamlessly connect customers with verified home service professionals (Plumbers, Electricians, AC Technicians, etc.) using the power of Generative AI. 

![GigOrbit Banner](https://via.placeholder.com/1200x400.png?text=GigOrbit+-+AI+Powered+Service+Marketplace)

## 🌟 The Problem We Solve
Finding reliable, verified, and transparently priced home service workers in the informal sector is a nightmare. Customers face price gouging, while skilled workers struggle to find consistent jobs. GigOrbit eliminates the friction of manual searching, bargaining, and trust issues by letting an AI Agent handle the entire orchestration—from initial matchmaking to final billing.

## ⚠️ The "Zero-Hardcoding" Hackathon Promise
Unlike standard prototypes, **GigOrbit is a fully dynamic engine.** Every worker proposed by the AI is fetched live from our backend database (`workers.json`). The Trust Cards, WhatsApp links, and distances are generated dynamically based on live AI output and Haversine proximity calculations. What you see is a real, breathing software architecture.

## ✨ Hackathon-Winning Features
* 🤖 **Autonomous AI Matchmaking:** Powered by **Google Vertex AI**. Users chat naturally in English or Roman Urdu. The AI parses the intent, scans the database, calculates real-world distances using the Haversine formula, and proposes the absolute best worker for the job.
* 🛡️ **Premium Trust Layer:** The informal economy lacks trust. We built simulated **KYC Verification** badges (NADRA/Police verified) and a **GigWallet Escrow** visual system to guarantee user confidence before they book.
* 🔄 **Real-Time Two-Sided Sync:** A fully functional dual-interface for Customers and Partners. When a customer books a job, it instantly pings the dynamic Partner Dashboard via cross-tab storage sync, allowing the worker to accept the job in real-time.
* ⭐ **Dynamic Rating Engine:** A true closed-loop feedback system. Completing a job triggers a rating modal that dynamically writes back to the server. The AI learns from this database update and adjusts future recommendations based on the worker's new performance score.
* 📍 **Interactive Live Tracking:** Beautiful Lottie animations (radar scanning and vehicle tracking) combined with a premium, mobile-responsive UI for real-time status updates and direct worker contact.
* 📱 **Mobile-First PWA UI:** A hyper-premium Glass-morphism design, flawless dark/light mode integration, and strict responsive layouts built completely with Tailwind CSS.

## 🔮 Future Enhancements (Post-Hackathon Roadmap)
*Due to time constraints, we focused on perfecting the core AI loop. Here is how we plan to scale GigOrbit:*
1. **AI Surge Pricing:** Dynamically adjusting base rates depending on late-night hours or extreme weather.
2. **Automated Voice-to-Invoice:** Allowing informal workers to dictate materials used via mic to generate instant, itemized PDF bills.
3. **AI Dispute Resolution:** An automated text-based mediator to resolve client-worker conflicts.

## 🛠️ Tech Stack
* **Frontend:** Vanilla JavaScript (ES6), HTML5, Tailwind CSS. (SPA Architecture)
* **Backend:** Node.js, Express.js.
* **Database:** JSON/FS File System (Mock Data for Hackathon Demo).
* **AI Engine:** Google Vertex AI.

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rizuuuuu-bot/GigOrbit-Hackathon-Submission.git
   cd GigOrbit-Hackathon-Submission
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Authentication:**
   GigOrbit uses Google Vertex AI. Place your `credentials.json` (Service Account Key) file in the root directory and create a `.env` file with the following:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS="./credentials.json"
   PROJECT_ID="your-google-cloud-project-id"
   PORT=3000
   ```

4. **Start the Server:**
   ```bash
   npm start
   ```

5. **Open the App:**
   Navigate to `http://localhost:3000` in your browser to experience the platform.
