const llog = require('learninglab-log')
const OpenAI = require('openai');

const writingTutorFriend = async ({client, message, say}) => {
    llog.magenta(`got an im from <@${message.user}>`);
    llog.blue(message);
    // await say(`...`);
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        let result = await client.conversations.history({channel: message.channel, limit: 20})
        llog.magenta("result", result)
        const conversation = result.messages.map(message => {
            return {
                writer: message.user,
                text: message.text
            }
        })
        let oAiCompletion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant who functions as a writing tutor and you are helping me write my paper on the evolution of Friendship." },
                { role: "user", content: `here is the JSON fora conversation between me and you, I am ${message.user} and you are the bots, please respond with the next appropriate thing to say given the conversation thread, but return only the value of message.text, not actual JSON. Your responses should be longer than 2 sentences but less than 500 words: ${JSON.stringify(conversation)}` }
            ],
            model: "gpt-4o",
          });

          console.log(oAiCompletion.choices[0]);
          let slackResult = await client.chat.postMessage({
            channel: message.channel,
            text: `${oAiCompletion.choices[0].message.content}`,
            icon_url: "https://files.slack.com/files-pri/T0HTW3H0V-F0790D3RB4H/writing-tutor-bot-icon.jpg?pub_secret=68e157efa4",
            username: "Writing Tutor"
            });
        return({
            slackResult,
            tutorResponse: oAiCompletion.choices[0],
            history: conversation
        })
        // llog.magenta(oAiCompletion)
    } catch (error) {
        llog.red(error)
    }


    

}

module.exports = writingTutorFriend