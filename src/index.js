export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route API calls to OpenAI (keeps the API key safe on the server)
    if (url.pathname.startsWith("/api/")) {
      // Handle CORS preflight request sent by the browser before a POST
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      // Headers added to every API response so the browser accepts it
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      };

      // Read the messages array sent by the front-end
      const userInput = await request.json();

      // Build the request body for OpenAI
      const requestBody = {
        model: "gpt-4o",
        messages: userInput.messages,
        max_completion_tokens: 300,
      };

      // Forward the request to OpenAI using the secret key stored in Cloudflare
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      const data = await response.json();

      // Send OpenAI's reply back to the browser
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // For every other URL, serve the static site files (HTML, CSS, JS, images)
    return env.ASSETS.fetch(request);
  },
};
