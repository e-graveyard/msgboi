const http = require('http');
const fs = require('fs');

const msgboi = require('.');

/*
*/
async function handler(req, res)
{
    function reply(code)
    {
        res.writeHead(code)
        res.end();
    }

    function die(code)
    {
        reply(code);
        req.connection.destroy();
    }

    if (req.url !== '/')
        die(404);

    if (req.method !== 'POST')
        die(405);

    if (req.headers['content-type'] !== 'application/json')
        die(415);

    let data = '';
    req.on('data', (d) => {
        data += d;
        if (data.length > 1e6)
            die(413);
    });

    req.on('end', () => {
        if (data.length === 0)
            die(400);

        reply(200);
    });
}

http.createServer(handler).listen(8080);
