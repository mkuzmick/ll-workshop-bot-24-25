const llog = require('learninglab-log')
const OpenAI = require('openai');

// takes in message history and ts of message and responds in a snarky way
const frenemy = async ({client, writingTutorMessage, message, history, threadTs }) => {

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        let oAiCompletion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are playing the role of a student's rival/frenemy in a conversation about writing a paper for a college course. Your job is to playfully push back against the ideas in a snarky way, sometimes passive aggressively. The goal is to say critical things that will ultimately make the student create a stronger paper." },
                { role: "user", content: `here is the JSON for conversation between a student and a writing Tutor bot ${JSON.stringify(history)}. The tutor bot has now just said ${writingTutorMessage} Now we want you to create the text for a comment on the tutor's most recent advice that really embodies your role as critical frenemy. You can doubt the student's ability to actually do it, or you can just push back against the idea. The goal is to push the ideas further by being a little snarky or passive aggressive. Respond ONLY with the text in character, the value of message.text, not JSON.` }
            ],
            model: "gpt-4o",
          });

          console.log(oAiCompletion.choices[0]);
          let slackResult = await client.chat.postMessage({
            channel: message.channel,
            text: `${oAiCompletion.choices[0].message.content}`,
            thread_ts: threadTs,
            icon_url: "https://files.slack.com/files-pri/T0HTW3H0V-F078K7SSTJR/frenemy-bot-icon-2.jpg?pub_secret=2529540596",
            username: "Frenemy Bot"
        });
        // llog.magenta(oAiCompletion)
        return slackResult
    } catch (error) {
        llog.red(error)
    }


    

}

module.exports = frenemy