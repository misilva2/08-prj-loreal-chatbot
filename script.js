/* System prompt — defines the chatbot's role and scope */
// Note: the API key is stored securely in Cloudflare — never put it here
const systemPrompt =
  "You are a helpful L'Oréal beauty assistant. You only answer questions related to L'Oréal products, skincare and haircare routines, and personalized beauty recommendations. If a user asks about anything unrelated to L'Oréal or beauty, politely let them know you can only assist with L'Oréal-related topics.";

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Helper: add a message bubble to the chat window
function addMessage(role, text) {
  const message = document.createElement("div");
  // Use different styling for user vs assistant messages
  message.classList.add(
    "message",
    role === "user" ? "user-message" : "bot-message",
  );
  message.textContent = text;
  chatWindow.appendChild(message);
  // Scroll to the latest message
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Set initial greeting message
addMessage("assistant", "👋 Hello! How can I help you today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1. Capture the user's input and clear the text field
  const userText = userInput.value.trim();
  userInput.value = "";

  // 2. Display the user's message in the chat window
  addMessage("user", userText);

  // 3. Show a loading indicator while waiting for the response
  addMessage("assistant", "Thinking…");

  try {
    // 4. Send the request to our Cloudflare Worker, which securely forwards
    //    it to OpenAI using the API key stored as a Cloudflare secret.
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Only the messages array is sent — the Worker adds the model & key
        messages: [
          // System prompt sets the assistant's behavior
          { role: "system", content: systemPrompt },
          // The user's question
          { role: "user", content: userText },
        ],
      }),
    });

    // 5. Parse the JSON response
    const data = await response.json();

    // 6. Extract the assistant's reply
    const botReply = data.choices[0].message.content;

    // 7. Remove the loading indicator and display the real response
    chatWindow.lastChild.remove();
    addMessage("assistant", botReply);
  } catch (error) {
    // If something goes wrong, show an error message
    chatWindow.lastChild.remove();
    addMessage("assistant", "Sorry, something went wrong. Please try again.");
  }
});
