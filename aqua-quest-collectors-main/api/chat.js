// api/chat.js

export default async function handler(req, res) {
    const OPENAI_API_KEY = "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";

    // Allow only POST requests
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res
            .status(405)
            .json({ error: `Method ${req.method} not allowed. Use POST.` });
    }

    // Parse the request body
    const { messages } = req.body;
    if (!messages) {
        return res
            .status(400)
            .json({ error: "Missing 'messages' in the request body." });
    }

    try {
        // Forward the request to OpenAI's API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Use your secure environment variable for the API key
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages,
            }),
        });

        // Check for errors from the OpenAI API
        if (!response.ok) {
            const errorData = await response.text();
            return res.status(response.status).json({ error: errorData });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
