const llog = require('learninglab-log')
const OpenAI = require('openai');

// takes in message history and ts of message and responds in a snarky way
const bestFriend = async ({client, writingTutorMessage, frenemyMessage, message, history, threadTs }) => {

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        let oAiCompletion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are playing the role of a student's best friend in a conversation about writing a paper for a college course taking place between the student, the writing tutor, the student's frenemy, and you. Your job is to give the student ideas on how to defeat the frenemy's critique in a way that will make the paper better. You are smart and supportive. You concede the grain of truth in what the frenemy says if there is one, but always help your best friend come up with good ideas for their paper." },
                { role: "user", content: `here is the JSON for conversation between a student and a writing Tutor bot: ${JSON.stringify(history)}. The tutor bot has now just said "${writingTutorMessage}", and the student's frenemy has just interjected "${frenemyMessage}" in a comment thread. Now we want you to create the text for a comment that pushes back on the frenemy's remarks in support of your friend. Best sure to give me JUST the text of your smart and supportive message, not JSON, just the value of your message.text.` }
            ],
            model: "gpt-4o",
          });

          console.log(oAiCompletion.choices[0]);
          let slackResult = await client.chat.postMessage({
            channel: message.channel,
            text: `${oAiCompletion.choices[0].message.content}`,
            thread_ts: threadTs,
            icon_url: "https://files.slack.com/files-pri/T0HTW3H0V-F0790RP50N5/best-friend-bot-icon-1.jpg?pub_secret=d56483540e",
            username: "Best Friend Bot"
        });
        // llog.magenta(oAiCompletion)
        return slackResult
    } catch (error) {
        llog.red(error)
    }


    

}

module.exports = bestFriend