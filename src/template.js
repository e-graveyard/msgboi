// standard
const fs = require('fs');

// 3rd-party
const dayjs = require('dayjs');
const mustache = require('mustache');

// modules
const data = require('./data');
const file = require('./file');

function getStatusSymbol(status)
{
    switch (status) {
        case 'success':
            return ':heavy_check_mark:';
            break;

        case 'failed':
            return ':x:';
            break;

        case 'skipped':
            return ':grey_exclamation:';
            break;
    }
}

function getStatusColor(status)
{
    switch (status) {
        case 'success':
            return '#36a64f';
            break;

        case 'failed':
            return '#d40e0d';
            break;
    }
}

function orderStages(builds)
{
    const stages = {};
    builds.map((build) => {
        const name = build.stage;

        if (stages.hasOwnProperty(name)) {
            if (stages[name].status == 'success')
                stages[name].status = build.status;
        }
        else {
            stages[name] = {
                id: build.id,
                status: build.status,
            };
        }
    });

    const order = [];
    const stagesById = {};
    for (const key in stages) {
        const id = stages[key].id;
        order.push(id);

        stagesById[id] = {
            name:   key,
            status: stages[key].status,
        };
    }

    order.sort();

    const stagesOrdered = [];
    order.map((id) => {
        stagesOrdered.push(stagesById[id]);
    });

    return stagesOrdered;
}

function getFailedStage(stages)
{
    for(let i = 0; i < stages.length; i++) {
        if (stages[i].status == 'failed')
            return stages[i].name;
    }

    return null;
}

function drawStagesStatus(stages)
{
    let statusf = "";

    stages.map((stage) => {
        statusf = statusf
            .concat(`(${getStatusSymbol(stage.status)}) *${stage.name}* >> `);
    });

    statusf = statusf.substring(0, statusf.length - 4);

    return statusf;
}

function getPipelineInfo(e)
{
    const m = {};
    const oattr = e.object_attributes;

    const stages = orderStages(e.builds);

    // git project info
    m.proj = {
        name:       e.project.name,
        url:        e.project.web_url,
        branch: {
            name: oattr.ref,
            url:  `${e.project.web_url}/tree/${oattr.ref}`,
        },
    };

    // pipeline info
    m.pipe = {
        id:       oattr.id,
        url:      `${m.proj.url}/pipelines/${oattr.id}`,
        duration: oattr.duration,
        finish:   dayjs(oattr.finished_at).unix(),
        status: {
            text:  oattr.detailed_status.toUpperCase(),
            icon:  getStatusSymbol(oattr.status),
            color: getStatusColor(oattr.status),
        },
        stages: {
            repr:  drawStagesStatus(stages),
            count: oattr.stages.length,
        }
    };

    // event author
    m.user = {
        name:   e.user.name,
        url:    `https://gitlab.com/${e.user.username}`,
        avatar: e.user.avatar_url,
    };

    // commit author
    m.commit = {
        message: e.commit.message,
        author:  e.commit.author.name,
        email:   e.commit.author.email,
    }

    m.decor = {};
    if (oattr.status == 'success') {
        m.decor.stage_status = `${oattr.detailed_status} in ${m.pipe.stages.count} stages`;
    }
    else {
        m.decor.stage_status = `${oattr.detailed_status} at stage \'${getFailedStage(stages)}\'`;
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
