import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';

/* ── Inline SVG helpers ─────────────────────────────────────── */
function CodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}

/* ── Marketing Navbar ───────────────────────────────────────── */
function MarketingNav() {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
              <CodeIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">CompileHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors">
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero Section ───────────────────────────────────────────── */
function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-950 pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-20 w-[600px] h-[600px] rounded-full bg-blue-100/60 dark:bg-blue-900/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-indigo-100/50 dark:bg-indigo-900/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Trusted by 5,000+ students from 50+ colleges
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
            Crack Your{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              Dream Placement
            </span>{' '}
            with Smart Practice
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Practice real interview questions from Amazon, Google & Flipkart.
            Get AI-powered feedback on every wrong answer — not just "Wrong Answer".
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
            >
              Start Practicing Free
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => navigate(isAuthenticated ? '/compiler' : '/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-base rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <CodeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Try Compiler
            </button>
          </div>

          {/* Social proof badges */}
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {['No credit card required', 'Free plan available', '5,000+ problems solved'].map((text) => (
              <div key={text} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <CheckIcon className="w-4 h-4 text-green-500" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Hero mockup */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl shadow-gray-900/10 dark:shadow-black/40 overflow-hidden">
            {/* Mock browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md max-w-xs" />
              </div>
            </div>

            {/* Mock content */}
            <div className="flex h-72 sm:h-80">
              {/* Left: problem */}
              <div className="w-2/5 p-5 border-r border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 bg-gray-800 dark:bg-gray-200 rounded w-3/4" />
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 shrink-0">MEDIUM</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 space-y-1.5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Input</div>
                  <code className="text-xs text-green-600 dark:text-green-400">nums = [2,7,11,15], target = 9</code>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-2">Output</div>
                  <code className="text-xs text-blue-600 dark:text-blue-400">[0, 1]</code>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['Amazon', 'Google'].map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{c}</span>
                  ))}
                </div>
              </div>

              {/* Right: editor + feedback */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-[#1e1e1e] p-4 font-mono text-xs overflow-hidden">
                  <div className="text-[#569cd6]">def <span className="text-[#dcdcaa]">twoSum</span><span className="text-white">(nums, target):</span></div>
                  <div className="text-[#6a9955] mt-1 ml-4"># HashMapped approach</div>
                  <div className="text-white ml-4">seen = {'{}'}</div>
                  <div className="text-[#c586c0] ml-4">for <span className="text-white">i, n</span> <span className="text-[#c586c0]">in</span> <span className="text-[#dcdcaa]">enumerate</span><span className="text-white">(nums):</span></div>
                  <div className="text-white ml-8">diff = target - n</div>
                  <div className="text-[#c586c0] ml-8">if <span className="text-white">diff</span> <span className="text-[#c586c0]">in</span> <span className="text-white">seen:</span></div>
                  <div className="text-[#c586c0] ml-12">return <span className="text-white">[seen[diff], i]</span></div>
                  <div className="text-white ml-8">seen[n] = i</div>
                </div>

                {/* AI Feedback */}
                <div className="border-t-2 border-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-orange-500">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-400">AI Insight</span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-orange-200 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">❌ Test 3 Failed</span>
                      </div>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        You may have an <strong>off-by-one error</strong> — check your loop boundary. The expected output was <code className="bg-orange-100 dark:bg-orange-900/40 px-1 rounded">7</code> but you returned <code className="bg-orange-100 dark:bg-orange-900/40 px-1 rounded">6</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Trust Section ──────────────────────────────────────────── */
function TrustSection() {
  const colleges = ['VIT Vellore', 'SRM Chennai', 'KIIT Bhubaneswar', 'Manipal', 'Amity Delhi', 'LPU', 'MIT Pune', 'Christ University'];

  const testimonials = [
    {
      quote: "CompileHub's company-wise questions and AI feedback helped me crack my Infosys interview. The feedback was spot-on every time.",
      name: 'Priya Sharma',
      college: 'VIT Vellore, CSE 2024',
      avatar: 'P',
      color: 'from-pink-500 to-rose-500',
    },
    {
      quote: "I went from failing basic array problems to solving Medium LeetCode questions in 3 weeks. The AI explanations make it click.",
      name: 'Rahul Verma',
      college: 'KIIT Bhubaneswar, IT 2024',
      avatar: 'R',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      quote: "The built-in compiler is amazing. No setup, just code. Got my first off-campus offer after 2 months of practice here.",
      name: 'Anjali Patel',
      college: 'SRM Chennai, CS 2025',
      avatar: 'A',
      color: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Trusted by Students</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Used by students from 50+ colleges</h2>
        </div>

        {/* College names marquee */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-14">
          {colleges.map((college) => (
            <span
              key={college}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm"
            >
              {college}
            </span>
          ))}
          <span className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-blue-600 dark:text-blue-400 shadow-sm">
            +42 more
          </span>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-linear-to-br ${t.color} flex items-center justify-center shrink-0`}>
                  <span className="text-sm font-bold text-white">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.college}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features Section ───────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd" />
          <path d="M3 15.055v-.684c.122.042.24.085.36.128a18.978 18.978 0 006.64 1.201 18.979 18.979 0 006.64-1.2c.12-.044.239-.086.361-.129v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 01-9.274 0C3.985 17.585 3 16.402 3 15.055z" />
        </svg>
      ),
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      title: 'Company-wise Preparation',
      description: 'Filter questions by Amazon, Google, Flipkart, TCS, Wipro and 20+ more companies. Practice exactly what they ask.',
      bullets: ['Real interview questions', '20+ top companies', 'Tag-based filtering'],
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      title: 'AI Smart Feedback',
      description: "When you fail a test case, our AI doesn't just say 'Wrong Answer'. It explains exactly what went wrong and why.",
      bullets: ['Off-by-one detection', 'Edge case hints', 'Complexity insights'],
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      title: 'Built-in Compiler',
      description: 'Powered by Judge0. Write, run and debug code in Python, C++, Java and more — no local setup needed.',
      bullets: ['5 languages supported', 'Real execution engine', 'Instant results'],
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
        </svg>
      ),
      color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
      title: 'Structured Learning Path',
      description: 'Not sure where to start? Follow our curated tracks — from basic arrays to dynamic programming, step by step.',
      bullets: ['Beginner to advanced', 'Topic-based tracks', 'Progress tracking'],
    },
  ];

  return (
    <section id="features" className="bg-white dark:bg-gray-950 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Everything You Need</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Built for placement success</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Not another generic coding platform. CompileHub is purpose-built for students preparing for campus and off-campus placements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-white dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${f.color} mb-4`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">{f.description}</p>
              <ul className="space-y-1.5">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Demo Section ───────────────────────────────────────────── */
function DemoSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">Our USP</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Real feedback,<br />not just "Wrong Answer"
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Most platforms tell you that you failed. We tell you <em>why</em>. Our AI analyzes your code, identifies the root cause, and gives you a targeted hint to fix it — so you actually learn.
            </p>
            <div className="space-y-4">
              {[
                { label: 'Off-by-one errors', desc: 'Pinpoint boundary issues in loops and arrays' },
                { label: 'Edge case handling', desc: 'Identify missing cases like empty inputs or overflow' },
                { label: 'Complexity analysis', desc: 'Know if your solution is too slow before submission' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback demo card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-xl shadow-gray-900/10 dark:shadow-black/30">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Submission Result</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                ❌ 2/5 Passed
              </span>
            </div>

            {/* Test results */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {[
                { tc: 'Test case 1', passed: true },
                { tc: 'Test case 2', passed: true },
                { tc: 'Test case 3', passed: false },
              ].map((tc) => (
                <div key={tc.tc} className="flex items-center gap-3 px-4 py-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs ${tc.passed ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                    {tc.passed ? '✓' : '✗'}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{tc.tc}</span>
                  <span className={`ml-auto text-xs font-medium ${tc.passed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {tc.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>

            {/* AI Feedback highlight */}
            <div className="border-t-2 border-orange-400 bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-orange-500">
                    <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.763-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-bold text-orange-700 dark:text-orange-400">AI Insight</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-orange-200/70 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">for Test 3</span>
                  </div>
                  <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed">
                    You may have an <strong>off-by-one error</strong> in your loop boundary. When <code className="bg-orange-200/60 dark:bg-orange-900/40 px-1 rounded text-xs">i = n-1</code>, your code reads <code className="bg-orange-200/60 dark:bg-orange-900/40 px-1 rounded text-xs">arr[i+1]</code> which is out of bounds.
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                    Try: Change <code className="bg-orange-200/60 dark:bg-orange-900/40 px-1 rounded">range(n)</code> to <code className="bg-orange-200/60 dark:bg-orange-900/40 px-1 rounded">range(n-1)</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing Section ────────────────────────────────────────── */
function PricingSection() {
  const plans = [
    {
      name: 'Basic',
      price: '₹99',
      period: '/month',
      description: 'Perfect to get started with practice.',
      popular: false,
      color: 'border-gray-200 dark:border-gray-700',
      features: [
        '50 problems access',
        'Basic compiler (5 runs/day)',
        'Difficulty filters',
        'Community support',
      ],
      cta: 'Get started',
      ctaStyle: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
    },
    {
      name: 'Pro',
      price: '₹199',
      period: '/month',
      description: 'Best for serious placement prep.',
      popular: true,
      color: 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-950',
      features: [
        'All 500+ problems',
        'Unlimited compiler runs',
        'AI feedback on all failures',
        'Company-wise filters',
        'Progress analytics',
        'Priority support',
      ],
      cta: 'Start Pro',
      ctaStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20',
    },
    {
      name: 'Premium',
      price: '₹499',
      period: '/month',
      description: 'For those who want everything.',
      popular: false,
      color: 'border-gray-200 dark:border-gray-700',
      features: [
        'Everything in Pro',
        'Mock interview mode',
        'Resume feedback AI',
        'Dedicated mentor access',
        'Placement guarantee support',
        '1-on-1 doubt sessions',
      ],
      cta: 'Go Premium',
      ctaStyle: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
    },
  ];

  return (
    <section id="pricing" className="bg-white dark:bg-gray-950 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Pricing</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Affordable for every student</h2>
          <p className="text-gray-500 dark:text-gray-400">
            No hidden fees. Cancel anytime. Built for Tier-2 and Tier-3 college budgets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-white dark:bg-gray-900 p-7 transition-all ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{plan.period}</span>
                </div>
              </div>

              <Link
                to="/signup"
                className={`block w-full text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors mb-6 ${plan.ctaStyle}`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                    <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                <CodeIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-base">CompileHub</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              The smart coding practice platform for Indian students preparing for placements.
            </p>
            <div className="flex gap-3 mt-4">
              {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
                <span key={s} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Product</h4>
            <ul className="space-y-2">
              {['Problems', 'Compiler', 'Pricing', 'Changelog'].map((l) => (
                <li key={l}>
                  <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">{l}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Support</h4>
            <ul className="space-y-2">
              {['Contact Us', 'Privacy Policy', 'Terms of Service', 'Refund Policy'].map((l) => (
                <li key={l}>
                  <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2024 CompileHub. Made with ❤️ for Indian students.</p>
          <p className="text-xs text-gray-400">Powered by Judge0 &amp; OpenAI</p>
        </div>
      </div>
    </footer>
  );
}

/* ── Page Export ────────────────────────────────────────────── */
export function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <MarketingNav />
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <DemoSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
