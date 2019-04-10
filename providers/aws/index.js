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

const msgboi = require('./msgboi/main');
const logger = require('./msgboi/logger');
const config = require('./msgboi/config');

global.MsgboiError = require('./msgboi/error');


exports.handler = async (event, context) =>
{
    let c = null;
    let r = null;

    try {
        c = await config.load();
        r = await msgboi.handle(c, event.body);
    }
    catch (e) {
        r = e.content;
    }

    if (r.code < 400) {
        logger.success(r.message);

        r.responses.map((r) => {
            if (r.code < 400)
                logger.success(`notification to channel ${r.channel} succeded`);
            else
                logger.error(`notification to channel ${r.channel} failed with code ${r.code}`);
        });
    }
    else {
        logger.error(r.message, r.error);
    }

    return {
        headers: { 'Content-Type': 'application/json' },
        isBase64Encoded: false,
        statusCode: r.code,
        body: null,
    };
};
