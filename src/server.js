/*
The person who associated a work with this deed has dedicated the work to the
public domain by waiving all of his or her rights to the work worldwide under
copyright law, including all related and neighboring rights, to the extent
allowed by law.

You can copy, modify, distribute and perform the work, even for commercial
purposes, all without asking permission.

AFFIRMER OFFERS THE WORK AS-IS AND MAKES NO REPRESENTATIONS OR WARRANTIES OF
ANY KIND CONCERNING THE WORK, EXPRESS, IMPLIED, STATUTORY OR OTHERWISE,
INCLUDING WITHOUT LIMITATION WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR
A PARTICULAR PURPOSE, NON INFRINGEMENT, OR THE ABSENCE OF LATENT OR OTHER
DEFECTS, ACCURACY, OR THE PRESENT OR ABSENCE OF ERRORS, WHETHER OR NOT
DISCOVERABLE, ALL TO THE GREATEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW.

For more information, please see
<http://creativecommons.org/publicdomain/zero/1.0/>
*/

const http = require('http');

const config = require('./config');
const msgboi = require('./msgboi');


/**
    --- TODO: docs ---
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

        reply(await msgboi.deal(data));
    });
}

http.createServer(handler).listen(8080);
