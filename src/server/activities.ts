import type { ActivityItem, GitHubEvent } from './types'

export function eventsToActivities(events: GitHubEvent[], actor: string, avatar: string): ActivityItem[] {
  const seen = new Set<string>()
  const repoCount: Record<string, number> = {}
  const filtered: GitHubEvent[] = []

  for (const e of events) {
    if (e.type === 'PushEvent') {
      const ref = e.payload.ref || 'main'
      const key = `${e.repo.name}#${ref}`
      if (seen.has(key)) continue
      seen.add(key)
    }
    if ((repoCount[e.repo.name] || 0) >= 5) continue
    repoCount[e.repo.name] = (repoCount[e.repo.name] || 0) + 1
    filtered.push(e)
  }

  const items: ActivityItem[] = []
  for (const e of filtered) {
    const repoURL = `https://github.com/${e.repo.name}`
    const base = {
      id: e.id,
      type: e.type,
      actor,
      actor_url: `https://github.com/${actor}`,
      avatar_url: avatar,
      repo: e.repo.name,
      repo_url: repoURL,
      commits: e.payload.commits || [],
      message: '',
      action: '',
      target: '',
      target_url: '',
      created_at: e.created_at,
    }

    switch (e.type) {
      case 'PushEvent': {
        let msg = ''
        const commits = e.payload.commits || []
        if (commits.length > 0) {
          msg = commits[0].message
          if (commits.length > 1) msg = `${msg} and ${commits.length - 1} more`
        }
        items.push({ ...base, message: msg, action: 'pushed to' })
        break
      }
      case 'CreateEvent':
        items.push({
          ...base,
          action: `created ${e.payload.ref_type}`,
          target: e.payload.ref || '',
          target_url: `${repoURL}/tree/${e.payload.ref}`,
        })
        break
      case 'PullRequestEvent': {
        const pr = e.payload.pull_request
        let action = e.payload.action || ''
        if (pr?.merged) action = 'merged'
        items.push({
          ...base,
          action: `${action} pull request`,
          target: pr ? `#${pr.number} ${pr.title}` : '',
          target_url: pr?.html_url || '',
        })
        break
      }
      case 'IssuesEvent': {
        const issue = e.payload.issue
        items.push({
          ...base,
          action: `${e.payload.action} issue`,
          target: issue ? `#${issue.number} ${issue.title}` : '',
          target_url: issue?.html_url || '',
        })
        break
      }
      case 'WatchEvent':
        items.push({ ...base, action: 'starred' })
        break
      case 'ForkEvent': {
        const forkee = e.payload.forkee
        items.push({
          ...base,
          action: 'forked',
          target: forkee?.full_name || '',
          target_url: forkee?.html_url || '',
        })
        break
      }
      case 'ReleaseEvent':
        items.push({
          ...base,
          action: 'released',
          target: e.payload.ref || '',
          target_url: `${repoURL}/releases`,
          message: e.payload.description || '',
        })
        break
    }
  }
  return items
}
