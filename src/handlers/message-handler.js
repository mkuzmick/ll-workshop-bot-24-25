const llog = require('learninglab-log')
const bots = require('../bots');
const OpenAI = require('openai');

async function getLast30Messages({client, channel}) {
    try {
      const result = await client.conversations.history({
        channel: channel,
        limit: 30, // Get the last 30 messages
      });
  
      const messages = result.messages;
  
      // Display messages
      messages.forEach((msg, index) => {
        console.log(`${index + 1}: ${msg.text} (Timestamp: ${msg.ts})`);
      });
      return messages
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }
  




exports.testing = async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    await say(`the bot is running, <@${message.user}>!`);
}

exports.parseAll = async ({ client, message, say, event }) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

    llog.magenta("logging all messages")
    llog.yellow(message)

    if (message.files) {
      llog.blue("message has files")
      llog.yellow(message.files)
        return
    }


    const messages = await getLast30Messages({client: client, channel: message.channel});
    const messageText = messages.map(msg => ({
        text: msg.text,
        username: msg.username || msg.user // Use username if exists, otherwise use user
    }));

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: "You are a historian of the future studying a Harvard Comparative Literature course on digital capitalism." },
            { role: "user", content: `you are about to add the next line in the following conversation between bots and users on Slack. The conversation is about digital capitalism in a course where they read Marx and Benjamin and other similar theorists: ${JSON.stringify(messageText)}. Please reply with what a historian studying this course in the future would say, and do it in text alone, not in JSON. Give special attention to the new message, which is: ${message.text}` }
        ],
        max_tokens: 1000,
    });

    const responseText = response.choices[0].message.content.trim();

    await client.chat.postMessage({
        channel: message.channel,
        text: responseText,
        thread_ts: message.thread_ts ? message.thread_ts : message.ts,
        username: "Comp Lit 207 Historian"
      });

}

