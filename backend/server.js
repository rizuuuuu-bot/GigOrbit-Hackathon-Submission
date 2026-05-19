require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));
// Serve mock data
app.use('/mock_data', express.static(path.join(__dirname, '../mock_data')));

// Initialize Google GenAI with Vertex AI properly
const ai = new GoogleGenAI({
  vertexai: {
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: 'us-central1'
  }
});

// Load workers data on boot
let workersData = [];
try {
  const data = fs.readFileSync(path.join(__dirname, '../mock_data/workers.json'), 'utf8');
  workersData = JSON.parse(data);
} catch (err) {
  console.error("Failed to load workers.json", err);
}

// Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Partner Registration Endpoint
app.post('/api/partner/register', (req, res) => {
  const { name, phone, password, skill, lat, lng } = req.body;

  if (!name || !phone || !password || !skill) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newWorker = {
    id: Date.now(), // Numeric ID as requested
    name,
    phone,
    password,
    skill,
    rating: 5.0,
    reliability: 100,
    availability: true,
    lat: lat ? parseFloat(lat) : 24.8607, // Default to Karachi if not provided
    lng: lng ? parseFloat(lng) : 67.0011
  };

  workersData.push(newWorker);
  
  try {
    fs.writeFileSync(path.join(__dirname, '../mock_data/workers.json'), JSON.stringify(workersData, null, 2));
  } catch (err) {
    console.error("Failed to save new partner to workers.json", err);
  }

  res.json({ success: true, message: "Partner registered successfully", worker: newWorker });
});

app.post('/api/chat', async (req, res) => {
  const { message, user_id, user_name, manual_location_string, user_lat, user_lng, chat_history, locked_workers } = req.body;

  // Filter out locked workers
  let availableWorkers = workersData;
  if (locked_workers && Array.isArray(locked_workers)) {
    availableWorkers = workersData.filter(w => !locked_workers.includes(w.id));
  }

  let activeLocation = manual_location_string || "Karachi, Pakistan";
  let distances = [];

  if (user_lat && user_lng) {
    activeLocation = `${user_lat}, ${user_lng}`;
    distances = availableWorkers.map(w => ({
      id: w.id,
      name: w.name,
      distance_km: parseFloat(getDistance(user_lat, user_lng, w.lat, w.lng).toFixed(2))
    }));
  }

  const systemInstruction = `
You are the AI Orchestrator for 'Agentic', a informal economy platform in Pakistan.
Your goal is to process the user's request and return a structured JSON response.

CURRENT CONTEXT:
- User Name: ${user_name}
- User Location: ${activeLocation}
- Available Workers: ${JSON.stringify(availableWorkers)}
- Distances to Workers: ${JSON.stringify(distances)}

OPERATIONAL STATES & RULES:

LANGUAGE RULE: You MUST dynamically detect the language pattern used by the user in their latest message. If the user writes in English, your entire 'reasoning' and dialogue output MUST be strictly in English. If the user writes in Roman Urdu (Urdu words written in English alphabet), your entire output MUST be in natural Roman Urdu. Do NOT mix languages within a single response state unless quoting technical terms.

STATE 1 (Advisory/Consultation):
- Trigger: User asks for advice, troubleshooting, or general questions (e.g., "Why is my AC leaking?").
- Action: Act as an expert. Give advice in Roman Urdu (Urdu written in English script). Do NOT offer a booking yet.
- Output: Set \`action\` to \`"advisory"\`. Provide \`reasoning\` in Roman Urdu.

STATE 2 (Quotation/Proposal):
- Trigger: User explicitly asks to book a service OR has stated a problem and needs a worker (and is NOT in confirmation/dispute state).
- Action: Find the BEST matched worker from the Available Workers list.
  - Prioritize skill match.
  - Prioritize lowest distance if coordinates are available.
  - Prioritize rating/reliability.
- Output: Set \`action\` to \`"quote_provided"\`.
- You MUST provide a \`quote\` object:
  - \`base_fee\`: Number (e.g., 500)
  - \`distance_fee\`: Number (e.g., 200)
  - \`total_pkr\`: Number (sum of both)
- Set \`matched_worker_id\`: The ID of the worker you selected.
- Set \`exact_distance_km\`: The distance to that worker from the list, or a reasonable mock float (e.g., 3.4) if coordinates are missing.
- Set \`reasoning\`: Explain WHY you chose this worker and state the price in Roman Urdu.

STATE 3 (Confirmation):
- Trigger: User says "Yes", "Confirm", "Theek hai", or agrees to the proposal provided in the chat history.
- Action: Confirm the booking.
- Output: Set \`action\` to \`"booking_confirmed"\`.
- Set \`matched_worker_id\`: The ID of the worker being confirmed (look at chat history).
- Provide the same \`quote\` object.
- Set \`reasoning\`: Confirm the booking and state that the worker is on the way in Roman Urdu.

STATE 4 (Dispute/Refund):
- Trigger: User complains about service, requests refund, or states a dispute.
- Action: Act as an arbitrator.
- Output: Set \`action\` to \`"dispute_resolved"\`.
- Set \`reasoning\`: Apologize and state the refund amount in Roman Urdu.
- Provide a \`quote\` object with \`refund_amount\`.

STRICT JSON OUTPUT FORMAT:
You MUST return ONLY a valid JSON object. No markdown, no backticks, no text before or after.
Format:
{
  "action": "advisory" | "quote_provided" | "booking_confirmed" | "dispute_resolved",
  "matched_worker_id": number | null,
  "exact_distance_km": float | null,
  "quote": {
    "base_fee": number,
    "distance_fee": number,
    "total_pkr": number,
    "refund_amount": number (only for dispute)
  } | null,
  "reasoning": "Your response in Roman Urdu here"
}
`;

  const contents = [];
  if (chat_history && Array.isArray(chat_history)) {
    chat_history.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    res.setHeader('Content-Type', 'application/json');
    res.send(text);

  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Failed to generate content", details: error.message });
  }
});


// Rating & Review Endpoint
app.post('/api/rate', (req, res) => {
  const { worker_id, rating, review_text } = req.body;
  if (!worker_id || !rating) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const workerIndex = workersData.findIndex(w => w.id == worker_id);
  if (workerIndex !== -1) {
    const worker = workersData[workerIndex];
    if (!worker.reviews) worker.reviews = [];
    worker.reviews.push({ rating: parseFloat(rating), text: review_text || "", date: new Date().toISOString() });
    
    // Recalculate average rating slightly favoring the new rating for demonstration
    const currentWeight = worker.completed_jobs || 10;
    const totalRating = (worker.rating * currentWeight) + parseFloat(rating);
    worker.rating = parseFloat((totalRating / (currentWeight + 1)).toFixed(1));
    
    try {
      fs.writeFileSync(path.join(__dirname, '../mock_data/workers.json'), JSON.stringify(workersData, null, 2));
      return res.json({ success: true, message: "Rating submitted", new_rating: worker.rating });
    } catch (err) {
      console.error("Failed to save rating", err);
      return res.status(500).json({ error: "Failed to save rating" });
    }
  }
  
  res.status(404).json({ error: "Worker not found" });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});