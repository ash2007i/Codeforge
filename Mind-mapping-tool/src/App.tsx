import { useEffect, useState, type ReactNode } from "react"
import LLMTracker from "./LLMTracker"
import OpenSourceTracker from "./OpenSourceTracker"

type IconName = "bell" | "brain" | "chevron" | "code" | "community" | "courses" | "flame" | "github" | "home" | "progress" | "search" | "spark" | "terminal"

type CourseTheme = "emerald" | "violet" | "ember"

const iconPaths: Record<IconName, ReactNode> = {
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  brain: (
    <>
      <path d="M9.5 4a3 3 0 0 0-5 2.2A3.5 3.5 0 0 0 5 13a3 3 0 0 0 4.5 3" />
      <path d="M14.5 4a3 3 0 0 1 5 2.2A3.5 3.5 0 0 1 19 13a3 3 0 0 1-4.5 3" />
      <path d="M9.5 4v16M14.5 4v16M5 9h4.5M14.5 9H19M6.5 15.5h3M14.5 15.5h3" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  code: (
    <>
      <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />
    </>
  ),
  community: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  courses: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  flame: (
    <path d="M12 22c4 0 7-2.8 7-7 0-3.6-2.1-6.4-5.7-9.4.1 2.4-.8 4-2.2 5.1.1-3.3-1.7-6.4-4.4-8.7.2 4.6-2.7 7.4-2.7 12.4C4 19 7.6 22 12 22Z" />
  ),
  github: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.2.5S18 0 15 1.8a13.4 13.4 0 0 0-7 0C5 0 3.8.5 3.8.5A5 5 0 0 0 3.6 4a5.4 5.4 0 0 0-1.4 3.5c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4" />
      <path d="M8 19c-3 .9-3-1.5-4-2" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  progress: (
    <>
      <path d="M4 19V9M10 19V5M16 19v-7M22 19V2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8L12 3Z" />
      <path d="m5 15 .7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15Z" />
    </>
  ),
  terminal: (
    <>
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </>
  ),
}

function Icon({ name, size = 20 }: { name: IconName size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {iconPaths[name]}
    </svg>
  )
}

const navItems: { label: string icon?: IconName }[] = [
  { label: "Home", icon: "home" },
  { label: "Courses", icon: "courses" },
  { label: "Progress", icon: "progress" },
  { label: "Community", icon: "community" },
  { label: "More" },
]

function Navbar({
  activePage = "Home",
  onHome,
}: {
  activePage?: string
  onHome?: () => void
}) {
  const [active, setActive] = useState(activePage)

  useEffect(() => {
    setActive(activePage)
  }, [activePage])

  function handleNav(label: string) {
    setActive(label)
    if (label === "Home") onHome?.()
  }

  return (
    <header className="navbar">
      <div className="nav-shell">
        <button
          className="brand"
          aria-label="CodeForge home"
          onClick={() => handleNav("Home")}
        >
          <span className="brand-mark">
            <Icon name="code" size={24} />
          </span>
          <span>
            Code<span>Forge</span>
          </span>
        </button>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={`nav-item ${active === item.label ? "is-active" : ""}`}
              key={item.label}
              onClick={() => handleNav(item.label)}
            >
              {item.icon && <Icon name={item.icon} size={17} />}
              {item.label !== "Courses" && item.label !== "Community" && (
                <span>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <label className="search">
            <Icon name="search" size={18} />
            <input aria-label="Search" placeholder="Search anything..." />
            <kbd>⌘ K</kbd>
          </label>
          <button className="icon-button" aria-label="Notifications">
            <Icon name="bell" size={21} />
            <span className="notification-dot" />
          </button>
          <button className="profile" aria-label="Open profile menu">
            <span className="avatar">A</span>
            <span className="profile-copy">
              <strong>Ash</strong>
              <small>Level 3</small>
            </span>
            <span className="down-caret">⌄</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function MotivationWidget() {
  return (
    <button className="motivation-widget">
      <span className="motivation-icon">
        <Icon name="flame" size={21} />
      </span>
      <span>
        <strong className="motivation-title">Keep going!</strong>
        <small>You’re doing great</small>
      </span>
      <Icon name="chevron" size={17} />
    </button>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="atmosphere atmosphere-one" />
      <div className="atmosphere atmosphere-two" />
      <div className="hero-shell">
        <div className="micro-quote">
          <Icon name="spark" size={15} />
          <span>Small steps build big things.</span>
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> YOUR LEARNING SPACE <span />
          </div>
          <div className="hero-greeting" role="heading" aria-level={1}>
            Welcome back,
          </div>
          <div className="hero-name">Ash</div>
          <div className="name-underline" />
          <p>Build skills. Solve problems. Create your future.</p>
        </div>
        <MotivationWidget />
        <div className="level-chip">
          <span className="level-star">✦</span>
          <div>
            <strong>Level 3</strong>
            <span>420 / 1000 XP</span>
          </div>
          <div className="xp-track">
            <span />
          </div>
        </div>
      </div>
      <div className="skyline skyline-left" />
      <div className="skyline skyline-right" />
    </section>
  )
}

const themeIcon: Record<CourseTheme, IconName> = {
  emerald: "github",
  violet: "brain",
  ember: "terminal",
}

function RepoVisual() {
  return (
    <div className="course-visual repo-visual" aria-hidden="true">
      <div className="repo-window">
        <div className="window-top">
          <i />
          <i />
          <i />
        </div>
        <div className="branch-map">
          <span className="branch branch-a" />
          <span className="branch branch-b" />
          <i className="node node-a" />
          <i className="node node-b" />
          <i className="node node-c" />
          <i className="node node-d" />
          <i className="node node-e" />
        </div>
      </div>
      <div className="float-chip chip-code">&lt;/&gt;</div>
      <div className="float-chip chip-git">⑂</div>
    </div>
  )
}

function AiVisual() {
  return (
    <div className="course-visual ai-visual" aria-hidden="true">
      <div className="ai-orbit orbit-one" />
      <div className="ai-orbit orbit-two" />
      <div className="ai-core">
        <Icon name="brain" size={45} />
      </div>
      <span className="data-node data-one">01</span>
      <span className="data-node data-two">AI</span>
      <span className="data-node data-three">∞</span>
      <div className="model-stack">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

function DevVisual() {
  return (
    <div className="course-visual dev-visual" aria-hidden="true">
      <div className="code-editor">
        <div className="editor-bar">
          <i />
          <i />
          <i />
          <span>solution.ts</span>
        </div>
        <div className="editor-body">
          <span>
            <b>01</b>
            <i className="line line-purple" />
          </span>
          <span>
            <b>02</b>
            <i className="line line-orange" />
          </span>
          <span>
            <b>03</b>
            <i className="line line-blue" />
          </span>
          <span>
            <b>04</b>
            <i className="line line-short" />
          </span>
        </div>
      </div>
      <div className="algo-map">
        <i />
        <i />
        <i />
        <i />
        <span className="algo-line line-one" />
        <span className="algo-line line-two" />
      </div>
      <span className="idea-bulb">✦</span>
    </div>
  )
}

interface CourseCardProps {
  category: string
  title: string
  description: string
  theme: CourseTheme
  wide?: boolean
  onStart?: () => void
}

function CourseCard({
  category,
  title,
  description,
  theme,
  wide = false,
  onStart,
}: CourseCardProps) {
  return (
    <article
      className={`course-card theme-${theme} ${wide ? "course-card-wide" : ""}`}
      tabIndex={0}
    >
      <div className="card-glow" />
      <div className="card-content">
        <div className="category-badge">
          <Icon name={themeIcon[theme]} size={16} />
          <span>{category}</span>
        </div>
        <div className="course-title" role="heading" aria-level={2}>
          {title}
        </div>
        <p>{description}</p>
        <div className="course-meta">
          <span>
            <Icon name="spark" size={14} /> +250 XP
          </span>
          <span>12 modules</span>
        </div>
        <button className="primary-button" onClick={onStart}>
          <span>Start Learning</span>
          <Icon name="chevron" size={17} />
        </button>
      </div>
      {theme === "emerald" && <RepoVisual />}
      {theme === "violet" && <AiVisual />}
      {theme === "ember" && <DevVisual />}
    </article>
  )
}

function App() {
  const [route, setRoute] = useState(() => window.location.hash)

  useEffect(() => {
    const syncRoute = () => setRoute(window.location.hash)
    window.addEventListener("hashchange", syncRoute)
    return () => window.removeEventListener("hashchange", syncRoute)
  }, [])

  function goHome() {
    window.location.hash = ""
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openLLMTracker() {
    window.location.hash = "/courses/llm-fine-tuning"
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openSourceTracker() {
    window.location.hash = "/courses/open-source-contribution"
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (route === "#/courses/open-source-contribution") {
    return (
      <div className="app">
        <Navbar activePage="Courses" onHome={goHome} />
        <OpenSourceTracker onBack={goHome} />
      </div>
    )
  }

  if (route === "#/courses/llm-fine-tuning") {
    return (
      <div className="app">
        <Navbar activePage="Courses" onHome={goHome} />
        <LLMTracker onBack={goHome} />
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar onHome={goHome} />
      <Hero />
      <main className="main-content">
        <div className="section-heading">
          <div>
            <div className="section-title" role="heading" aria-level={2}>
              Choose your next path
            </div>
          </div>
          <div className="streak">
            <span>
              <Icon name="flame" size={18} />
            </span>
            <div>
              <strong>7 day streak</strong>
              <small>&nbsp;&nbsp;&nbsp;</small>
            </div>
          </div>
        </div>

        <section className="course-grid" aria-label="Learning paths">
          <CourseCard
            category="OPEN SOURCE"
            description="Collaborate. Build. Make an impact."
            onStart={openSourceTracker}
            theme="emerald"
            title="Open Source Contribution"
          />
          <CourseCard
            category="AI / ML"
            description="Train. Improve. Build smarter."
            onStart={openLLMTracker}
            theme="violet"
            title="LLM Fine Tuning"
          />
          <CourseCard
            category="DEVELOPMENT & DSA"
            description="Build strong fundamentals. Think better. Solve faster."
            theme="ember"
            title="SWD + Problem Solving"
            wide
          />
        </section>

        <div className="page-indicator" aria-label="Page 1 of 4">
          <button className="active" aria-label="Page 1" />
          <button aria-label="Page 2" />
          <button aria-label="Page 3" />
          <button aria-label="Page 4" />
        </div>
      </main>
    </div>
  )
}

export default App
