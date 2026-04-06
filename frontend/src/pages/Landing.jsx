import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e]">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-2">
            <svg className="w-7 h-7 text-[#1e3a5f]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">Machin &amp; Co. Tax Services</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-white border border-white px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-[#1e3a5f] transition-colors font-medium"
        >
          Accountant Login
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="max-w-2xl">
          <div className="inline-block bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Tax Year 2024 — Personal Income Tax
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Personal Income Tax<br />Questionnaire
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-lg mx-auto">
            Complete your tax questionnaire securely online. Download your completed form as PDF or Excel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/questionnaire')}
              className="bg-white text-[#1e3a5f] font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Start Questionnaire
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-3xl w-full">
          {[
            {
              icon: '📋',
              title: 'Easy to Fill',
              desc: 'Step-by-step form that matches our official questionnaire.',
            },
            {
              icon: '📥',
              title: 'Download Instantly',
              desc: 'Export your completed form as PDF or Excel at any time.',
            },
            {
              icon: '✏️',
              title: 'Edit Anytime',
              desc: 'Made a mistake? Use your personal link to update your answers.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/10 backdrop-blur rounded-xl p-6 text-left">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-base mb-1">{f.title}</h3>
              <p className="text-blue-200 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-blue-300 text-sm py-6">
        &copy; {new Date().getFullYear()} Machin &amp; Co. Tax Services. All rights reserved.
      </footer>
    </div>
  )
}
