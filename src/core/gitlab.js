import { MsgboiError } from './error'

const toUnixTime = (ts) => (new Date(ts).getTime() / 1000) | 0
const hasOwnProp = Object.prototype.hasOwnProperty.call

function pipeStatusIcon (status) {
  switch (status) {
    case 'success':
      return ':heavy_check_mark:'

    case 'failed':
      return ':x:'

    case 'skipped':
      return ':grey_exclamation:'
  }
}

function pipeStatusColor (status) {
  switch (status) {
    case 'success':
      return '#36a64f'

    case 'failed':
      return '#E63C3F'
  }
}

function mergeStatusArt (status) {
  let color = null
  let icon = null

  switch (status) {
    case 'opened':
      color = '#FECE08'
      icon = ':heavy_plus_sign:'
      break

    case 'merged':
      color = '#2DA5E1'
      icon = ':m:'
      break

    case 'closed':
      color = '#E63C3F'
      icon = ':o:'
      break
  }

  return { color, icon }
}

function getFailedStage (stages) {
  for (let i = 0; i < stages.length; i++) {
    if (stages[i].status === 'failed') return stages[i].name
  }

  return null
}

function drawStagesStatus (stages) {
  let statusf = ''

  stages.forEach((stage) => {
    statusf = statusf.concat(`(${pipeStatusIcon(stage.status)}) *${stage.name}* >> `)
  })

  return statusf.substring(0, statusf.length - 4)
}

function orderStages (builds) {
  const stages = {}
  builds.forEach((build) => {
    const name = build.stage

    if (hasOwnProp(stages, name)) {
      if (stages[name].status === 'success') {
        stages[name].status = build.status
      }
    } else {
      stages[name] = {
        id: build.id,
        status: build.status
      }
    }
  })

  const order = []
  const stagesById = {}
  for (const key in stages) {
    const id = stages[key].id
    order.push(id)

    stagesById[id] = {
      name: key,
      status: stages[key].status
    }
  }

  order.sort()

  const stagesOrdered = []
  order.forEach((id) => stagesOrdered.push(stagesById[id]))
  return stagesOrdered
}

function getCommonInfo (e) {
  const m = {
    kind: e.object_kind
  }

  m.proj = {
    name: e.project.name,
    url: e.project.web_url
  }

  m.user = {
    name: e.user.name,
    url: `https://gitlab.com/${e.user.username}`,
    avatar: e.user.avatar_url
  }

  return m
}

function getMergeRequestInfo (e) {
  const m = getCommonInfo(e)

  const oattr = e.object_attributes
  const { color, icon } = mergeStatusArt(oattr.state)

  const lc = e.object_attributes.last_commit
  m.commit = {
    message: lc.message,
    author: lc.author.name,
    email: lc.author.email
  }

  m.mr = {
    id: oattr.url.split('/').pop(),
    url: oattr.url,
    created: toUnixTime(oattr.created_at),
    title: oattr.title,
    status: {
      state: oattr.state,
      text: oattr.state.toUpperCase(),
      color: color,
      icon: icon
    },
    source: {
      branch: {
        name: oattr.source_branch,
        url: `${e.project.web_url}/tree/${oattr.source_branch}`
      }
    },
    target: {
      branch: {
        name: oattr.target_branch,
        url: `${e.project.web_url}/tree/${oattr.target_branch}`
      }
    }
  }

  return m
}

function getPipelineInfo (e) {
  const m = getCommonInfo(e)

  const oattr = e.object_attributes
  const stages = orderStages(e.builds)

  m.commit = {
    message: e.commit.message,
    author: e.commit.author.name,
    email: e.commit.author.email
  }

  m.proj.branch = {
    name: oattr.ref,
    url: `${e.project.web_url}/tree/${oattr.ref}`
  }

  m.pipe = {
    id: oattr.id,
    url: `${m.proj.url}/pipelines/${oattr.id}`,
    duration: oattr.duration,
    finish: toUnixTime(oattr.finished_at),
    status: {
      state: oattr.status,
      text: oattr.detailed_status.toUpperCase(),
      icon: pipeStatusIcon(oattr.status),
      color: pipeStatusColor(oattr.status)
    },
    stages: {
      repr: drawStagesStatus(stages),
      count: oattr.stages.length
    }
  }

  m.decor = {}
  m.decor.stage_status =
    oattr.status === 'success'
      ? `${oattr.detailed_status} in ${m.pipe.stages.count} stages`
      : `${oattr.detailed_status} at stage '${getFailedStage(stages)}'`

  return m
}

export function read (event) {
  const kind = event.object_kind
  const handler = {
    pipeline: getPipelineInfo,
    merge_request: getMergeRequestInfo
  }

  if (!hasOwnProp(handler, kind)) {
    throw new MsgboiError(204, `unsupported event "${kind}"; skipping..."`)
  }

  try {
    return handler[kind](event)
  } catch (err) {
    throw new MsgboiError(
      400,
      `unable to read "${kind}" event; this could also be a server error`,
      err
    )
  }
}
