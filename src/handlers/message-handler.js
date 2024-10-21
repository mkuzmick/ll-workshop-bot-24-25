const llog = require('learninglab-log');
const bots = require('../bots');
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Helper function to download Slack file
async function downloadSlackImage(fileUrl, fileName, token) {
    try {
        const response = await axios.get(fileUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'arraybuffer', // Download the file as a binary buffer
        });

        const filePath = path.join(global.ROOT_DIR, "_assets", fileName); // Save the file locally
        await fs.writeFile(filePath, response.data);
        llog.green(`Image downloaded successfully: ${filePath}`);
        return filePath;
    } catch (error) {
        llog.red(`Failed to download image: ${error}`);
    }
}

// Helper function to encode image to base64
async function encodeImage(imagePath) {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
}

// Helper function to remove image after processing
async function removeImage(imagePath) {
    try {
        await fs.unlink(imagePath); // Remove the file
        llog.green(`Image removed successfully: ${imagePath}`);
    } catch (error) {
        llog.red(`Failed to remove image: ${error}`);
    }
}

async function getLast30Messages({ client, channel }) {
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
        return messages;
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

    llog.magenta("logging all messages");
    llog.yellow(message);

    // If the message has files
    if (message.files && message.files.length > 0) {
        llog.blue("Message has files");

        // Process each file (assuming only image files here for simplicity)
        for (const file of message.files) {
            if (file.mimetype.startsWith("image/")) {
                // Download the image from Slack
                const slackToken = process.env.SLACK_USER_TOKEN;
                const filePath = await downloadSlackImage(file.url_private_download, file.name, slackToken);

                if (filePath) {
                    // Base64 encode the downloaded image
                    const base64Image = await encodeImage(filePath);

                    // Send the image to OpenAI for description
                    const response = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                          { role: "system", content: "You are an image analyst." },
                          {
                            role: "user",
                            content: [
                              { type: "text", text: "This is an image from a film, please imagine a good title for this film and write a Netflix promo for the film---just return the title in bold and then the description" },
                              {
                                type: "image_url",
                                image_url: {
                                  "url": `data:image/jpeg;base64,${base64Image}`,
                                },
                              },
                            ],
                          },
                        ],




              
                        max_tokens: 500,
                    });

                    const responseText = response.choices[0].message.content.trim();

                    await client.chat.postMessage({
                        channel: message.channel,
                        text: responseText,
                        thread_ts: message.thread_ts ? message.thread_ts : message.ts,
                        username: "Netflix Promo",
                    });
                    await removeImage(filePath)
                    return; // Exit after processing the image
                }
            }
        }
    }

    // If no files, continue with text processing
    const messages = await getLast30Messages({ client: client, channel: message.channel });
    const messageText = messages.map(msg => ({
        text: msg.text,
        username: msg.username || msg.user, // Use username if exists, otherwise use user
    }));

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: "You are a historian of Social Responsibilites of Higher Education." },
            { role: "user", content: `you are about to add to this discussion of interviews and podcasts as a form for communicating ideas around the connections between social issues and the role of higher education as it relates to those issues: ${JSON.stringify(messageText)}. Please reply with what a society and higher education historian adding to this discussion would say, and do it in text alone, not in JSON. Give special attention to the new message, which is: ${message.text}` }
        ],
        max_tokens: 1000,
    });

    const responseText = response.choices[0].message.content.trim();

    await client.chat.postMessage({
        channel: message.channel,
        text: responseText,
        thread_ts: message.thread_ts ? message.thread_ts : message.ts,
        username: "Society and Higher Ed Historian",
    });
}
