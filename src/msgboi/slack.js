const https = require('https');


/**
    --- TODO: docs ---
 */
function notify(channel, message)
{
    const info = {
        hostname: 'hooks.slack.com',
        path:     `/services/${channel}`,
        method:   'POST',
        port:     443,
        headers:  {
            'Content-Type':  'application/json',
            'Content-Length': message.length,
        }
    };

    const success = (() => {
        const req = https.request(info, (res) => {
            console.log(res.statusCode);
            return res.statusCode === 200;
        });

        req.on('error', (e) => {
            console.log(e);
            return false;
        });

        req.write(message);
        req.end();
    })();

    return success;
}


/**
    --- TODO: docs ---
 */
module.exports = {
    notify: notify
}
