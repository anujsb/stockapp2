import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    const { symbol, name, sector, industry, description, currentPrice, peRatio, marketCap, otherData } = await request.json();
    // Compose a strict prompt for Gemini
    const prompt = `You are a financial AI assistant. Analyze the following stock and provide a summary in this exact JSON format (no code block, no explanation outside JSON):\n\n{\n  "sentiment": "...",\n  "recommendation": "...",\n  "riskScore": ...,\n  "volatility": "...",\n  "prediction": "...",\n  "explanation": "..."\n}\n\nStock Symbol: ${symbol}\nName: ${name}\nSector: ${sector}\nIndustry: ${industry}\nCurrent Price: ${currentPrice}\nP/E Ratio: ${peRatio}\nMarket Cap: ${marketCap}\nDescription: ${description}\nOther Data: ${JSON.stringify(otherData)}\n\nRespond ONLY with the JSON object.`;

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!geminiRes.ok) {
      const error = await geminiRes.text();
      return NextResponse.json({ error: 'Gemini API error', details: error }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    // Parse the model's response
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = { raw: text };
    }
    // Add a timestamp for when the analysis was generated
    return NextResponse.json({ analysis, generatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
} 