const https = require('https');


/**
    --- TODO: docs ---
 */
function send(channel, payload)
{
    const info = {
        hostname: 'hooks.slack.com',
        path:     `/services/${channel}`,
        method:   'POST',
        port:     443,
        headers:  {
            'Content-Type':  'application/json',
            'Content-Length': payload.length,
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(info, (res) => {
            resolve({
                channel: channel,
                code: res.statusCode,
            });
        });

        req.on('error', () => {
            reject({
                channel: channel,
                code: 500,
            });
        });

        req.write(payload);
        req.end();
    });
}


/**
    --- TODO: docs ---
 */
function notifyAll(channels, message)
{
    const promises = channels.map(c => send(c, message));

    return Promise.all(promises).then((r) => {
        return r;
    });
}


/**
    --- TODO: docs ---
 */
module.exports = {
    notifyAll,
};
