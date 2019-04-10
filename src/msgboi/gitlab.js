/**
    --- TODO: docs ---
 */
function toUnixTime(timestamp)
{
    return (new Date(timestamp).getTime() / 1000 | 0);
}


/**
    --- TODO: docs ---
 */
function getStatusSymbol(status)
{
    switch (status) {
    case 'success':
        return ':heavy_check_mark:';

    case 'failed':
        return ':x:';

    case 'skipped':
        return ':grey_exclamation:';
    }
}


/**
    --- TODO: docs ---
 */
function getStatusColor(status)
{
    switch (status) {
    case 'success':
        return '#36a64f';

    case 'failed':
        return '#d40e0d';
    }
}


/**
    --- TODO: docs ---
 */
function getFailedStage(stages)
{
    for (let i = 0; i < stages.length; i++) {
        if (stages[i].status == 'failed')
            return stages[i].name;
    }

    return null;
}


/**
    --- TODO: docs ---
 */
function drawStagesStatus(stages)
{
    let statusf = '';

    stages.map((stage) => {
        statusf = statusf
            .concat(`(${getStatusSymbol(stage.status)}) *${stage.name}* >> `);
    });

    return (statusf.substring(0, statusf.length - 4));
}


/**
    --- TODO: docs ---
 */
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


/**
    --- TODO: docs ---
 */
function getPipelineInfo(e)
{
    const m = {
        kind: e.object_kind,
    };

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
        finish:   toUnixTime(oattr.finished_at),
        status: {
            state: oattr.status,
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
    };

    m.decor = {};
    m.decor.stage_status = (
        oattr.status === 'success'
            ? `${oattr.detailed_status} in ${m.pipe.stages.count} stages`
            : `${oattr.detailed_status} at stage '${getFailedStage(stages)}'`
    );

    return m;
}


/**
    --- TODO: docs ---
 */
function getMergeRequestInfo(e) {}


/**
    --- TODO: docs ---
 */
function read(event)
{
    const kind = event.object_kind;
    const handler = {
        pipeline:      getPipelineInfo,
        merge_request: getMergeRequestInfo,
    };

    if (!handler.hasOwnProperty(kind))
        return null;

    try {
        return handler[kind](event);
    }
    catch (err) {
        throw new MsgboiError(400, `unable to read "${kind}" event; this could also be a server error`, err);
    }
}


/**
    --- TODO: docs ---
 */
module.exports = {
    read: read,
};
