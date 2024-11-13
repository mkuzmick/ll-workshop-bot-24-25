const llog = require('learninglab-log');
const ts280 = require('../bots/ts280/index')

exports.parseAll = async ({ client, message, say, event }) => {
    llog.cyan("got a message the day of the ts280 demo")
    llog.gray(message);
    if (message.text) {
        const result = await ts280({ client, message, say, event })
    } else {
        llog.blue("message has no text")
    }
}
