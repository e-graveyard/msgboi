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

const msgboi = require('./msgboi/main');
const logger = require('./msgboi/logger');
const config = require('./msgboi/config');

process.on('SIGINT',  exitGracefully);
process.on('SIGHUP',  exitGracefully);
process.on('SIGQUIT', exitGracefully);
process.on('SIGTERM', exitGracefully);

logger.info('msgboi has started');


/**
    --- TODO: docs ---
 */
async function exitGracefully()
{
    logger.warn('got SIGNAL');
    logger.info('closing server');

    await server.close(() => {
        logger.info('exiting...');
        process.exit(0);
    });
}


/**
    --- TODO: docs ---
 */
async function deal(data)
{
    try {
        return await msgboi.deal(data);
    }
    catch (e) {
        return e.content;
    }
}


/**
    --- TODO: docs ---
 */
const server = http.createServer((req, res) =>
{
    const r = req.connection.remoteAddress;
    let body = [];
    let code = 200;

    req.on('data', (d) => {
        body.push(d);

        if (body.length > 1e6) {
            req.connection.destroy();
        }
    });

    req.on('end', async () => {
        if (code === 200) {
            body = Buffer.concat(body).toString();
            if (body.length) {
                const result = await deal(body);

                const log = `(${r}) ${result.message}`;
                if (result.code < 400) {
                    logger.success(log);
                }
                else {
                    logger.error(log);
                }

                code = result.code;
            }
            else {
                logger.error(`(${r}) send no content`);
                code = 400;
            }
        }

        res.statusCode = code;
        res.end();
    });

    if (req.url !== '/') {
        logger.error(`(${r}) requested "${req.url}"`);
        code = 404;
    }

    else if (req.method !== 'POST') {
        logger.error(`(${r}) called with "${req.method}"`);
        code = 405;
    }

    else if (req.headers['content-type'] !== 'application/json') {
        logger.error(`(${r}) used type "${req.headers['content-type']}"`);
        code = 415;
    }
});

// --------------------------------------------------

const port = process.env.MSGBOI_PORT || 8080;
const host = process.env.MSGBOI_HOST || 'localhost';

server.listen(port, host, () => {
    logger.info(`listening on port ${port}`);
});
