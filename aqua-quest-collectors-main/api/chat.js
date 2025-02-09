export default async function handler(req, res) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        console.error("Missing OpenAI API Key");
        return res.status(500).json({ error: "Server configuration error" });
    }

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

    // Transform your messages to the format OpenAI expects
    const formattedMessages = messages.map((msg) => ({
        role: msg.isBot ? "assistant" : "user",
        content: msg.text,
    }));

    try {
        // Forward the request to OpenAI's API with the formatted messages
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: formattedMessages,
            }),
        });

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
