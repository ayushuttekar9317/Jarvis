// J.A.R.V.I.S. Neural AI & Real-Time Intelligence Engine

const JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the legendary artificial intelligence created by Tony Stark.
You communicate with polite, highly sophisticated, witty, concise, and technologically advanced British flair ("sir", "Chief Operator").
You are capable of answering ANY question (science, technology, programming, history, pop culture, everyday queries, reasoning, creative tasks).
Be helpful, precise, and articulate. Keep answers reasonably concise and well-structured with bullet points or code snippets when helpful.
Always remain in character as J.A.R.V.I.S.`;

// In-memory conversation history for contextual multi-turn chat
let conversationHistory = [
  { role: 'system', content: JARVIS_SYSTEM_PROMPT }
];

/**
 * Handle real-time local calculations (Time, Date, Math, Diagnostics)
 */
function handleRealTimeLocalTools(query) {
  const lower = query.toLowerCase().trim();

  // 1. Live US & World Time Queries
  if (/\b(time in|what(?:'s| is) (?:the )?time|current time|clock|what time is it)\b/i.test(lower)) {
    const now = new Date();

    // Check if US time requested
    if (/\b(u\.?s\.?|united states|america|usa|us time)\b/i.test(lower)) {
      const getTZTime = (tz) => {
        try {
          return new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'short'
          }).format(now);
        } catch (e) {
          return 'N/A';
        }
      };

      const eastern = getTZTime('America/New_York');
      const central = getTZTime('America/Chicago');
      const mountain = getTZTime('America/Denver');
      const pacific = getTZTime('America/Los_Angeles');

      return `Current United States Standard & Daylight Times:\n• Eastern (New York / DC): ${eastern}\n• Central (Chicago / Dallas): ${central}\n• Mountain (Denver / Phoenix): ${mountain}\n• Pacific (Los Angeles / Seattle): ${pacific}\n\nAtomic clock synchronization is currently 100% nominal across all United States nodes.`;
    }

    // Specific city / country timezone lookups
    const tzMap = {
      'new york': 'America/New_York',
      'california': 'America/Los_Angeles',
      'los angeles': 'America/Los_Angeles',
      'san francisco': 'America/Los_Angeles',
      'london': 'Europe/London',
      'uk': 'Europe/London',
      'england': 'Europe/London',
      'india': 'Asia/Kolkata',
      'delhi': 'Asia/Kolkata',
      'mumbai': 'Asia/Kolkata',
      'tokyo': 'Asia/Tokyo',
      'japan': 'Asia/Tokyo',
      'paris': 'Europe/Paris',
      'france': 'Europe/Paris',
      'berlin': 'Europe/Berlin',
      'germany': 'Europe/Berlin',
      'sydney': 'Australia/Sydney',
      'australia': 'Australia/Sydney',
      'dubai': 'Asia/Dubai',
      'uae': 'Asia/Dubai',
      'singapore': 'Asia/Singapore',
      'toronto': 'America/Toronto',
      'canada': 'America/Toronto',
      'utc': 'UTC',
      'gmt': 'UTC'
    };

    for (const [location, tz] of Object.entries(tzMap)) {
      if (lower.includes(location)) {
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          timeZoneName: 'short'
        }).format(now);
        return `The current local time in ${location.toUpperCase()} is: ${formatted}.`;
      }
    }

    // Local device time
    const localFormatted = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZoneName: 'short'
    }).format(now);
    return `Current Local System Time: ${localFormatted}.`;
  }

  // 2. Date Queries
  if (/\b(what(?:'s| is) (?:the )?date|today(?:'s)? date|current date|what day is it)\b/i.test(lower)) {
    const dateFormatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
    return `Today's date is ${dateFormatted}. All temporal telemetry is aligned.`;
  }

  // 3. Audio / Microphone / Song recognition query
  if (/\b(song|music|track|playing|check from (?:my )?microph(?:one|noe))\b/i.test(lower)) {
    return `Acoustic telemetry online. The Neural Visualizer is currently analyzing frequency harmonics and audio gain from your microphone stream.\n\nTo identify a specific song without a dedicated ACRCloud API key, please hum, sing, or provide some lyrics into the terminal or voice link, and I will cross-reference our global music archives immediately for you.`;
  }

  return null;
}

/**
 * Process a user prompt through J.A.R.V.I.S AI
 * @param {string} prompt - The user prompt
 * @param {object} options - Callbacks and configuration
 * @returns {Promise<{ reply: string, action?: object }>}
 */
export async function processJarvisPrompt(prompt, { onTriggerAction, onThemeChange, isOverdrive, onToggleOverdrive } = {}) {
  const raw = prompt.trim();
  if (!raw) return { reply: 'Standing by for instruction, sir.' };

  const lower = raw.toLowerCase();

  // Fast-Path: System HUD Commands
  if (lower === 'help') {
    return {
      reply: 'Available system commands: "status", "scan", "overdrive", "optimize", "theme [cyan|quantum|solar|emerald]", "clear", "ping", "whoami".\n\nAdditionally, I possess full neural cognition: ask me any general knowledge, coding, calculation, web lookup, or world time question.'
    };
  }

  if (lower === 'status' || lower === 'diagnostics') {
    return {
      reply: 'Core temperature 298K. Neural throughput: 99.4%. Arc reactor output: stable. Zero unauthorized incursions detected.'
    };
  }

  if (lower === 'scan' || lower === 'sweep') {
    if (onTriggerAction) onTriggerAction('scan');
    return {
      reply: 'Initiating full spectrum neural sweep... 100% complete. Sector 7 clean. No anomalies found.',
      action: { type: 'action', value: 'scan' }
    };
  }

  if (lower === 'optimize') {
    if (onTriggerAction) onTriggerAction('optimize');
    return {
      reply: 'Compacting cache buffers and purging stagnant threads... Latency reduced to 3.1ms.',
      action: { type: 'action', value: 'optimize' }
    };
  }

  if (lower.includes('overdrive')) {
    if (onToggleOverdrive) onToggleOverdrive();
    return {
      reply: isOverdrive ? 'Disengaging neural overdrive. Core returning to baseline efficiency.' : 'Overdrive engaged! Quantum bandwidth increased by 300%.',
      action: { type: 'overdrive', value: !isOverdrive }
    };
  }

  if (lower.startsWith('theme')) {
    const parts = lower.split(' ');
    if (parts[1] && ['cyan', 'quantum', 'solar', 'emerald'].includes(parts[1])) {
      if (onThemeChange) onThemeChange(parts[1]);
      return {
        reply: `HUD holographic palette switched to "${parts[1].toUpperCase()}".`,
        action: { type: 'theme', value: parts[1] }
      };
    }
    return { reply: 'Theme options: cyan, quantum, solar, emerald. Usage: "theme quantum"' };
  }

  if (lower === 'ping') {
    return { reply: 'Pong! Neural response time: 2.1ms (Speed of Light fiber loop).' };
  }

  if (lower === 'whoami') {
    return { reply: 'You are the Chief Operator. Authorization Level: OMEGA-1 CLEARANCE.' };
  }

  // Check Real-Time Tools (Time, Date, Sensor queries)
  const localToolResult = handleRealTimeLocalTools(raw);
  if (localToolResult) {
    return { reply: localToolResult };
  }

  // Neural LLM Query to Cloud AI (Pollinations OpenAI-compatible endpoint)
  try {
    // Append user message to history
    conversationHistory.push({ role: 'user', content: raw });

    // Limit history length to last 8 turns to keep fast latency
    if (conversationHistory.length > 10) {
      conversationHistory = [
        conversationHistory[0], // System prompt
        ...conversationHistory.slice(-8)
      ];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: conversationHistory,
        model: 'openai',
        seed: 42
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const replyText = await response.text();
      const cleaned = cleanAIReply(replyText);
      if (cleaned) {
        // Save assistant reply to history
        conversationHistory.push({ role: 'assistant', content: cleaned });
        return { reply: cleaned };
      }
    }
  } catch (err) {
    console.warn('Primary AI neural uplink timed out or encountered an error:', err);
  }

  // Fallback direct GET endpoint if POST encountered CORS/Network hiccup
  try {
    const encodedPrompt = encodeURIComponent(raw);
    const getRes = await fetch(`https://text.pollinations.ai/${encodedPrompt}?system=${encodeURIComponent(JARVIS_SYSTEM_PROMPT)}`);
    if (getRes.ok) {
      const getReply = await getRes.text();
      const cleaned = cleanAIReply(getReply);
      if (cleaned) {
        conversationHistory.push({ role: 'assistant', content: cleaned });
        return { reply: cleaned };
      }
    }
  } catch (fallbackErr) {
    console.warn('Fallback AI endpoint failed:', fallbackErr);
  }

  // Intelligent Offline Heuristic Response
  return {
    reply: `I have analyzed your query regarding "${raw}". All neural pathways are synchronized. While our secondary cloud uplink is re-calibrating, my core heuristics confirm full operational readiness to assist with calculations, system telemetry, and commands.`
  };
}

/**
 * Filter out external API trailers and advertisements
 */
function cleanAIReply(text) {
  if (!text) return '';
  return text
    .replace(/---\s*\*\*Support Pollinations\.AI[\s\S]*$/gi, '')
    .replace(/🌸[\s\S]*$/gi, '')
    .replace(/Powered by Pollinations[\s\S]*$/gi, '')
    .replace(/\[Support our mission\][\s\S]*$/gi, '')
    .trim();
}

/**
 * Clear conversation memory
 */
export function resetJarvisMemory() {
  conversationHistory = [
    { role: 'system', content: JARVIS_SYSTEM_PROMPT }
  ];
}
