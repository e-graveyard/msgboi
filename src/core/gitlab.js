import MsgboiError from './error'

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
  const q = (color, icon) => ({ color, icon })

  switch (status) {
    case 'opened':
      return q('#FECE08', ':heavy_plus_sign:')
    case 'merged':
      return q('#2DA5E1', ':m:')
    case 'closed':
      return q('#E63C3F', ':o:')
  }
}

const getFailedStage = (stages) =>
  Object(stages.findIndex((stage) => stage.status === 'failed')).name ?? ''

const drawStagesStatus = (stages) =>
  stages.map((stage) => `(${pipeStatusIcon(stage.status)}) *${stage.name}*`).join(' >> ')

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
  const stagesById = Object.fromEntries(
    Object.keys(stages).map((name) => {
      const { id, status } = stages[name]
      order.push(id)

      return [id, { name, status }]
    })
  )

  return order.sort().map((id) => stagesById[id])
}

const getCommonInfo = (e) => ({
  kind: e.object_kind,
  proj: {
    name: e.project.name,
    url: e.project.web_url
  },
  user: {
    name: e.user.name,
    url: `https://gitlab.com/${e.user.username}`,
    avatar: e.user.avatar_url
  }
})

function getMergeRequestInfo (e) {
  const {
    state,
    url,
    title,
    source_branch: sourceBranch,
    target_branch: targetBranch,
    created_at: createdAt
  } = e.object_attributes

  const { last_commit: lc } = e.object_attributes
  const { color, icon } = mergeStatusArt(state)

  return Object.assign(getCommonInfo(e), {
    commit: {
      message: lc.message,
      author: lc.author.name,
      email: lc.author.email
    },
    mr: {
      id: url.split('/').pop(),
      url,
      created: toUnixTime(createdAt),
      title,
      status: { color, icon, state, text: state.toUpperCase() },
      source: {
        branch: {
          name: sourceBranch,
          url: `${e.project.web_url}/tree/${sourceBranch}`
        }
      },
      target: {
        branch: {
          name: targetBranch,
          url: `${e.project.web_url}/tree/${targetBranch}`
        }
      }
    }
  })
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

export default function (event) {
  const handle = (() => {
    switch (event.object_kind) {
      case 'pipeline':
        return getPipelineInfo
      case 'merge_request':
        return getMergeRequestInfo
      default:
        throw new MsgboiError(204, `unsupported event "${event.object_kind}"; skipping..."`)
    }
  })()

  try {
    return handle(event)
  } catch (err) {
    throw new MsgboiError(
      400,
      `unable to read "${event.object_kind}" event; this could also be a server error`,
      err
    )
  }
}
