const llog = require('learninglab-log');
const frenchTranslator = require('./french-translator');
const germanTranslator = require('./german-translator');
const japaneseTranslator = require('./japanese-translator');
const critic = require('./critic');
const nicerCritic = require('./nicer-critic');


module.exports = async ({ client, message, say, event }) => {

    
    llog.cyan("got a message the day of the ts280 demo")

    // get all the translations

    const frenchResult = await frenchTranslator({ client, message, say, event });
    const germanResult = await germanTranslator({ client, message, say, event });
    const japaneseResult = await japaneseTranslator({ client, message, say, event });

    // put them together as one string
    const lineBreak = "\n\n"
    const allTranslations = (
        "FRENCH TRANSLATION: " + lineBreak + frenchResult + lineBreak +
        "GERMAN TRANSLATION:" + lineBreak + germanResult + lineBreak +
        "JAPANESE TRANSLATION:" + lineBreak + japaneseResult + lineBreak
    )

    // send translations to critic 1
    const criticResult = await critic({
        client: client,
        message: message,
        translationsToEvaluate: allTranslations
    })

    // send critic 1's output and the translations to a second critic
    const nicerCriticResult = await nicerCritic({
        client: client,
        message: message,
        translationsToEvaluate: allTranslations,
        criticalText: criticResult
    })
}

