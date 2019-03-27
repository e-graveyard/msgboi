// standard
const fs = require('fs');

// 3rd-party
const dayjs = require('dayjs');
const mustache = require('mustache');

// modules
const data = require('./data');
const file = require('./file');

function getPipelineInfo(e)
{
    const m = {};
    const oattr = e.object_attributes;

    // git project info
    m.proj = {
        name:       e.project.name,
        url:        e.project.web_url,
        branch:     oattr.ref,
        branch_url: `${e.project.web_url}/tree/${oattr.ref}`,
    };

    // pipeline info
    m.pipe = {
        id:       oattr.id,
        url:      `${m.proj.url}/pipelines/${oattr.id}`,
        status:   oattr.detailed_status,
        duration: oattr.duration,
        finish:   dayjs(oattr.finished_at).unix(),
    };

    m.pipe.status_icon = (m.pipe.status === 'passed' ? ':heavy_check_mark:' : ':x:');

    // user-related
    m.user = {
        name:   e.user.name,
        url:    `https://gitlab.com/${e.user.username}`,
        avatar: e.user.avatar_url,
    };

    // commit info
    m.commit = {
        message: e.commit.message,
        author:  e.commit.author.name,
        email:   e.commit.author.email,
    }

    // etc
    m.misc = {
        color: (m.pipe.status === 'passed' ? '#36a64f' : '#d40e0d'),
    }

    return m;
}

function getMergeRequestInfo(e)
{
}

function render(event)
{
    const kind = event.object_kind;
    const info = {
        pipeline:      getPipelineInfo,
        merge_request: getMergeRequestInfo,
    };

    mustache.escape = ((text) => { return text; });

    return (async () => {
        try {
            const templateFile = `./templates/${kind}.yml`;
            if (!file.isReady(templateFile))
                return null;

            const template = await file.read(templateFile);
            const content = await info[kind](event);

            return {
                attachments: [await data.fromYAML(mustache.render(template, content))]
            }
        }
        catch (e) {
            console.log(e);
            return null;
        }
    })();
}

module.exports = {
    render: render,
}
