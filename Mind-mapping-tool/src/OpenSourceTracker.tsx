import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  openSourceRoadmap,
  type OpenSourceModule,
} from "./openSourceTrackerData"

const STORAGE_KEY = "gsoc_tracker_state_v1"

interface StudySession {
  topic: string
  minutes: number
  date: string
}

interface TrackerState {
  checks: Record<string, boolean>
  expanded: Record<string, boolean>
  journal: string
  sessions: StudySession[]
}

type TrackerIconName = "arrow" | "book" | "branch" | "check" | "chevron" | "clock" | "collapse" | "expand" | "moon" | "search" | "spark" | "sun" | "target" | "trash" | "zap"

const trackerIcons: Record<TrackerIconName, ReactNode> = {
  arrow: <path d="m15 18-6-6 6-6" />,
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  branch: (
    <>
      <circle cx="6" cy="5" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="6" cy="19" r="2.5" />
      <path d="M6 7.5v9M8.5 5H12a6 6 0 0 1 6 6v-2.5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  collapse: (
    <>
      <path d="m8 3 4 4 4-4M12 7V1M8 21l4-4 4 4M12 17v6" />
    </>
  ),
  expand: (
    <>
      <path d="m8 7 4-4 4 4M12 3v6M8 17l4 4 4-4M12 21v-6" />
    </>
  ),
  moon: <path d="M20.5 14.5A8 8 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 1.7 5.4L19 9l-5.3 1.6L12 16l-1.7-5.4L5 9l5.3-1.6L12 2Z" />
      <path d="m5 16 .7 2.3L8 19l-2.3.7L5 22l-.7-2.3L2 19l2.3-.7L5 16Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" />
    </>
  ),
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
}

function TrackerIcon({
  name,
  size = 18,
}: {
  name: TrackerIconName
  size?: number
}) {
  return (
    <svg
      aria-hidden="true"
      className="tracker-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {trackerIcons[name]}
    </svg>
  )
}

function defaultState(): TrackerState {
  return {
    checks: {},
    expanded: { "module-1": true },
    journal: "",
    sessions: [],
  }
}

function loadState(): TrackerState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultState()
    const parsed = JSON.parse(saved) as Partial<TrackerState>
    return {
      ...defaultState(),
      ...parsed,
      checks: parsed.checks ?? {},
      expanded: parsed.expanded ?? { "module-1": true },
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    }
  } catch {
    return defaultState()
  }
}

function calculateStreak(sessions: StudySession[]) {
  if (!sessions.length) return 0
  const dates = [...new Set(sessions.map((session) => session.date))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  )
  let streak = 0
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
  if (!dates.includes(today) && !dates.includes(yesterday)) return 0

  const checkDate = new Date()
  if (!dates.includes(today)) checkDate.setDate(checkDate.getDate() - 1)
  for (let index = 0; index < dates.length; index += 1) {
    const date = checkDate.toISOString().split("T")[0]
    if (!dates.includes(date)) break
    streak += 1
    checkDate.setDate(checkDate.getDate() - 1)
  }
  return streak
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

function getModuleStats(
  module: OpenSourceModule,
  checks: Record<string, boolean>,
) {
  const done = module.items.reduce(
    (count, _, itemIndex) =>
      count + (checks[`${module.id}-${itemIndex}`] ? 1 : 0),
    0,
  )
  return {
    done,
    total: module.items.length,
    percentage: Math.round((done / module.items.length) * 100),
  }
}

interface ModuleCardProps {
  module: OpenSourceModule
  checks: Record<string, boolean>
  expanded: boolean
  visibleItems: number[]
  onToggle: () => void
  onCheck: (key: string) => void
}

function ModuleCard({
  module,
  checks,
  expanded,
  visibleItems,
  onToggle,
  onCheck,
}: ModuleCardProps) {
  const stats = getModuleStats(module, checks)
  const complete = stats.done === stats.total
  const active = expanded && !complete

  return (
    <article
      className={`tracker-module ${expanded ? "is-expanded" : ""} ${
        complete ? "is-complete" : ""
      } ${active ? "is-active" : ""}`}
      id={module.id}
    >
      <button
        className="module-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="module-count">
          {complete ? (
            <TrackerIcon name="check" size={24} />
          ) : (
            `${stats.done}/${stats.total}`
          )}
        </span>
        <span className="module-copy">
          <span className="module-heading-line">
            <strong>{module.title}</strong>
            <small>{module.badge}</small>
          </span>
          <span className="module-subtitle">
            {module.items.length} contribution milestones
          </span>
        </span>
        <span className="module-progress">
          <span>
            <small>Progress</small>
            <strong>{stats.percentage}%</strong>
          </span>
          <span className="module-progress-track">
            <i style={{ width: `${stats.percentage}%` }} />
          </span>
        </span>
        <span className="module-chevron">
          <TrackerIcon name="chevron" size={19} />
        </span>
      </button>

      {expanded && (
        <div className="module-body">
          <div className="topic-grid">
            {visibleItems.map((itemIndex) => {
              const key = `${module.id}-${itemIndex}`
              const checked = Boolean(checks[key])
              return (
                <label
                  className={`topic-check ${checked ? "is-checked" : ""}`}
                  key={key}
                >
                  <input
                    checked={checked}
                    onChange={() => onCheck(key)}
                    type="checkbox"
                  />
                  <span className="custom-check">
                    <TrackerIcon name="check" size={15} />
                  </span>
                  <span>{module.items[itemIndex]}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </article>
  )
}

function OpenSourceTracker({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<TrackerState>(loadState)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "progress" | "completed">("all")
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") !== "light",
  )
  const [journalStatus, setJournalStatus] = useState("Autosaved")
  const [sessionTopic, setSessionTopic] = useState("")
  const [sessionMinutes, setSessionMinutes] = useState("")
  const [toast, setToast] = useState("")
  const journalTimer = useRef<number | undefined>(undefined)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    return () => {
      window.clearTimeout(journalTimer.current)
      window.clearTimeout(toastTimer.current)
    }
  }, [])

  const metrics = useMemo(() => {
    const totalTopics = openSourceRoadmap.reduce(
      (sum, module) => sum + module.items.length,
      0,
    )
    const mastered = openSourceRoadmap.reduce(
      (sum, module) => sum + getModuleStats(module, state.checks).done,
      0,
    )
    const modulesFinished = openSourceRoadmap.filter((module) => {
      const stats = getModuleStats(module, state.checks)
      return stats.done === stats.total
    }).length
    const totalMinutes = state.sessions.reduce(
      (sum, session) => sum + (Number(session.minutes) || 0),
      0,
    )
    return {
      totalTopics,
      mastered,
      modulesFinished,
      totalMinutes,
      streak: calculateStreak(state.sessions),
      percentage: Math.round((mastered / totalTopics) * 100),
    }
  }, [state.checks, state.sessions])

  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return openSourceRoadmap
      .map((module) => {
        const stats = getModuleStats(module, state.checks)
        const moduleMatch = module.title.toLowerCase().includes(normalizedQuery)
        const visibleItems = module.items
          .map((item, index) => ({ item, index }))
          .filter(
            ({ item }) =>
              !normalizedQuery ||
              moduleMatch ||
              item.toLowerCase().includes(normalizedQuery),
          )
          .map(({ index }) => index)
        return {
          module,
          visibleItems,
          visible:
            (!normalizedQuery || moduleMatch || visibleItems.length > 0) &&
            (filter === "all" ||
              (filter === "progress" &&
                stats.done > 0 &&
                stats.done < stats.total) ||
              (filter === "completed" && stats.done === stats.total)),
        }
      })
      .filter(({ visible }) => visible)
  }, [filter, query, state.checks])

  function showToast(message: string) {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(""), 3000)
  }

  function updateExpanded(moduleId: string) {
    setState((current) => ({
      ...current,
      expanded: {
        ...current.expanded,
        [moduleId]: !current.expanded[moduleId],
      },
    }))
  }

  function toggleCheck(key: string) {
    setState((current) => ({
      ...current,
      checks: { ...current.checks, [key]: !current.checks[key] },
    }))
  }

  function setAllExpanded(expanded: boolean) {
    setState((current) => ({
      ...current,
      expanded: Object.fromEntries(
        openSourceRoadmap.map((module) => [module.id, expanded]),
      ),
    }))
    showToast(expanded ? "All modules expanded" : "All modules collapsed")
  }

  function clearChecks() {
    if (
      !window.confirm(
        "Clear all checklist items? Your session logs and journal will be preserved.",
      )
    )
      return
    setState((current) => ({ ...current, checks: {} }))
    showToast("Checklist reset successfully")
  }

  function resetAll() {
    if (
      !window.confirm(
        "WARNING: This will completely reset all your progress, checklists, journal notes, and session history! Proceed?",
      )
    )
      return
    localStorage.removeItem(STORAGE_KEY)
    setState(defaultState())
    setQuery("")
    setFilter("all")
    setJournalStatus("Autosaved")
    showToast("All data has been reset.")
  }

  function updateJournal(value: string) {
    setJournalStatus("Saving...")
    setState((current) => ({ ...current, journal: value }))
    window.clearTimeout(journalTimer.current)
    journalTimer.current = window.setTimeout(
      () => setJournalStatus("Autosaved"),
      500,
    )
  }

  function logSession(event: FormEvent) {
    event.preventDefault()
    const topic = sessionTopic.trim()
    const minutes = Number.parseInt(sessionMinutes, 10)
    if (!topic || Number.isNaN(minutes) || minutes <= 0 || minutes > 1440)
      return
    const date = new Date().toISOString().split("T")[0]
    setState((current) => ({
      ...current,
      sessions: [...current.sessions, { topic, minutes, date }],
    }))
    setSessionTopic("")
    setSessionMinutes("")
    showToast("Activity logged! Keep it up.")
  }

  function deleteSession(index: number) {
    setState((current) => ({
      ...current,
      sessions: current.sessions.filter(
        (_, sessionIndex) => sessionIndex !== index,
      ),
    }))
    showToast("Session removed")
  }

  function toggleTheme() {
    const nextMode = !darkMode
    setDarkMode(nextMode)
    localStorage.setItem("theme", nextMode ? "dark" : "light")
  }

  function continueLearning() {
    const nextModule = openSourceRoadmap.find((module) => {
      const stats = getModuleStats(module, state.checks)
      return stats.done < stats.total
    })
    if (!nextModule) {
      showToast("Every topic is mastered. Outstanding work!")
      return
    }
    setState((current) => ({
      ...current,
      expanded: { ...current.expanded, [nextModule.id]: true },
    }))
    window.setTimeout(() => {
      document
        .getElementById(nextModule.id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 50)
  }

  return (
    <div
      className={`tracker-page open-source-tracker ${
        darkMode ? "is-dark" : "is-light"
      }`}
    >
      <section className="tracker-hero">
        <div className="tracker-orb tracker-orb-one" />
        <div className="tracker-orb tracker-orb-two" />
        <div className="tracker-shell tracker-hero-inner">
          <div className="tracker-breadcrumb">
            <button onClick={onBack}>Home</button>
            <span>/</span>
            <button onClick={onBack}>Courses</button>
            <span>/</span>
            <strong>Open Source Contribution</strong>
          </div>
          <div className="tracker-hero-grid">
            <div>
              <span className="tracker-eyebrow">
                <TrackerIcon name="branch" size={15} /> OPEN SOURCE DEVELOPMENT
              </span>
              <div className="tracker-heading" role="heading" aria-level={1}>
                Open Source Contribution
              </div>
              <p>
                Learn to navigate real-world repositories, understand Git
                workflows, contribute meaningful code, and collaborate with
                developer communities.
              </p>
              <div className="tracker-hero-actions">
                <button
                  className="tracker-primary-action"
                  onClick={continueLearning}
                >
                  Continue Learning <span>→</span>
                </button>
                <button className="tracker-back-action" onClick={onBack}>
                  <TrackerIcon name="arrow" size={17} /> Back to Courses
                </button>
              </div>
            </div>
            <div className="tracker-hero-progress">
              <div
                className="progress-ring"
                style={
                  {
                    "--progress": `${metrics.percentage * 3.6}deg`,
                  } as CSSProperties
                }
              >
                <span>
                  <strong>{metrics.percentage}%</strong>
                  <small>complete</small>
                </span>
              </div>
              <div>
                <span>YOUR PROGRESS</span>
                <strong>
                  {metrics.mastered} of {metrics.totalTopics}
                </strong>
                <small>tasks completed</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="tracker-shell tracker-main">
        <section className="mastery-header">
          <div>
            <span className="tracker-section-label">MASTERY COCKPIT</span>
            <div
              className="tracker-section-title"
              role="heading"
              aria-level={2}
            >
              Your Learning Journey
            </div>
            <p>
              Track your progress from fundamental Git skills to drafting a
              winning Google Summer of Code proposal. Stay consistent, log your
              study hours, and engage with the community.
            </p>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          >
            <TrackerIcon name={darkMode ? "sun" : "moon"} size={19} />
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
        </section>

        <section className="metrics-grid" aria-label="Learning progress">
          <article className="overall-card">
            <div className="overall-card-top">
              <span className="metric-icon emerald">
                <TrackerIcon name="target" size={22} />
              </span>
              <div>
                <span>Overall completion</span>
                <strong>{metrics.percentage}%</strong>
              </div>
            </div>
            <p>
              {metrics.mastered} of {metrics.totalTopics} tasks completed
            </p>
            <div className="overall-track">
              <span style={{ width: `${metrics.percentage}%` }} />
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon indigo">
              <TrackerIcon name="book" size={20} />
            </span>
            <div>
              <small>Modules Finished</small>
              <strong>
                {metrics.modulesFinished} / {openSourceRoadmap.length}
              </strong>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon blue">
              <TrackerIcon name="clock" size={20} />
            </span>
            <div>
              <small>Total Study Time</small>
              <strong>{formatMinutes(metrics.totalMinutes)}</strong>
            </div>
          </article>
          <article className="metric-card">
            <span className="metric-icon pink">
              <TrackerIcon name="zap" size={20} />
            </span>
            <div>
              <small>Current Streak</small>
              <strong>{metrics.streak} days</strong>
            </div>
          </article>
        </section>

        <section className="roadmap-section">
          <div className="roadmap-title-row">
            <div>
              <span className="tracker-section-label">
                {openSourceRoadmap.length} MODULES · {metrics.totalTopics}{" "}
                TOPICS
              </span>
              <div
                className="tracker-section-title"
                role="heading"
                aria-level={2}
              >
                Mastery Roadmap
              </div>
            </div>
            <button className="danger-action" onClick={resetAll}>
              <TrackerIcon name="trash" size={15} /> Reset All
            </button>
          </div>

          <div className="roadmap-toolbar">
            <label className="roadmap-search">
              <TrackerIcon name="search" size={18} />
              <input
                aria-label="Search roadmap tasks"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks..."
                value={query}
              />
            </label>
            <div className="roadmap-filters" aria-label="Filter modules">
              {(["all", "progress", "completed"] as const).map((value) => (
                <button
                  className={filter === value ? "is-active" : ""}
                  key={value}
                  onClick={() => setFilter(value)}
                >
                  {value === "all"
                    ? "All"
                    : value === "progress"
                      ? "In Progress"
                      : "Completed"}
                </button>
              ))}
            </div>
            <div className="toolbar-actions">
              <button onClick={() => setAllExpanded(true)}>
                <TrackerIcon name="expand" size={16} /> Expand All
              </button>
              <button onClick={() => setAllExpanded(false)}>
                <TrackerIcon name="collapse" size={16} /> Collapse All
              </button>
              <button className="clear-action" onClick={clearChecks}>
                Clear Checks
              </button>
            </div>
          </div>

          <div className="modules-list">
            {filteredModules.length ? (
              filteredModules.map(({ module, visibleItems }) => (
                <ModuleCard
                  checks={state.checks}
                  expanded={Boolean(state.expanded[module.id])}
                  key={module.id}
                  module={module}
                  onCheck={toggleCheck}
                  onToggle={() => updateExpanded(module.id)}
                  visibleItems={visibleItems}
                />
              ))
            ) : (
              <div className="tracker-empty-state">
                <span>
                  <TrackerIcon name="search" size={25} />
                </span>
                <strong>No topics match your search</strong>
                <p>Try another keyword or clear the search field.</p>
              </div>
            )}
          </div>
        </section>

        <section className="study-tools">
          <article className="study-panel journal-panel">
            <div className="study-panel-head">
              <span className="metric-icon emerald">
                <TrackerIcon name="book" size={19} />
              </span>
              <div>
                <div className="study-title" role="heading" aria-level={3}>
                  Contribution Journal
                </div>
                <p>
                  Record insights, bugs solved, pull requests, or your next
                  focus.
                </p>
              </div>
              <span
                className={`autosave-status ${
                  journalStatus === "Saving..." ? "is-saving" : ""
                }`}
              >
                <i /> {journalStatus}
              </span>
            </div>
            <textarea
              onChange={(event) => updateJournal(event.target.value)}
              placeholder={
                "Learned how to rebase today...\n\nNeed to review org guidelines for GSoC...\n\nMy first PR link: github.com/..."
              }
              rows={8}
              value={state.journal}
            />
          </article>

          <article className="study-panel session-panel">
            <div className="study-panel-head">
              <span className="metric-icon pink">
                <TrackerIcon name="zap" size={19} />
              </span>
              <div>
                <div className="study-title" role="heading" aria-level={3}>
                  Log Contribution Activity
                </div>
                <p>
                  Record focused work to update your daily streak and total
                  time.
                </p>
              </div>
            </div>
            <form className="session-form" onSubmit={logSession}>
              <input
                onChange={(event) => setSessionTopic(event.target.value)}
                placeholder="What did you work on?"
                required
                value={sessionTopic}
              />
              <input
                max="1440"
                min="1"
                onChange={(event) => setSessionMinutes(event.target.value)}
                placeholder="Mins"
                required
                type="number"
                value={sessionMinutes}
              />
              <button type="submit">Log</button>
            </form>
            <div className="recent-sessions-title">Recent Sessions</div>
            <div className="session-list">
              {state.sessions.length ? (
                [...state.sessions].reverse().map((session, reversedIndex) => {
                  const originalIndex =
                    state.sessions.length - 1 - reversedIndex
                  return (
                    <div
                      className="session-row"
                      key={`${session.date}-${originalIndex}`}
                    >
                      <div>
                        <strong>{session.topic}</strong>
                        <small>{session.date}</small>
                      </div>
                      <span>{session.minutes} mins</span>
                      <button
                        onClick={() => deleteSession(originalIndex)}
                        aria-label={`Delete ${session.topic} session`}
                      >
                        ×
                      </button>
                    </div>
                  )
                })
              ) : (
                <div className="sessions-empty">
                  No activity logged yet. Start working!
                </div>
              )}
            </div>
          </article>
        </section>

        <div className="local-storage-note">
          <span>✓</span>
          All progress, checklist states, journal notes, and session logs are
          securely saved locally in your browser storage.
        </div>
      </main>

      <div
        className={`tracker-toast ${toast ? "is-visible" : ""}`}
        role="status"
      >
        <span>
          <TrackerIcon name="check" size={17} />
        </span>
        {toast || "Action completed successfully"}
      </div>
    </div>
  )
}

export default OpenSourceTracker
