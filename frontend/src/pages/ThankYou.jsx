import { useParams, useNavigate } from 'react-router-dom'
import { downloadPDFByToken, downloadExcelByToken, triggerDownload } from '../api/api'
import { useState } from 'react'

export default function ThankYou() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState('')
  const editLink = `${window.location.origin}/questionnaire/${token}`

  const handleDownload = async (type) => {
    setDownloading(type)
    try {
      if (type === 'pdf') {
        const res = await downloadPDFByToken(token)
        triggerDownload(res.data, 'tax_questionnaire.pdf')
      } else {
        const res = await downloadExcelByToken(token)
        triggerDownload(res.data, 'tax_questionnaire.xlsx')
      }
    } catch {
      alert('Download failed. Please try again.')
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] flex flex-col">
      <header className="px-8 py-5">
        <span className="text-white font-bold text-lg">Machin &amp; Co. Tax Services</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Submitted Successfully!</h1>
          <p className="text-gray-500 text-sm mb-8">
            Thank you. Your tax questionnaire has been received by Machin &amp; Co. Tax Services.
          </p>

          {/* Download buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading === 'pdf'}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading === 'pdf' ? 'Downloading...' : 'Download PDF'}
            </button>
            <button
              onClick={() => handleDownload('excel')}
              disabled={downloading === 'excel'}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading === 'excel' ? 'Downloading...' : 'Download Excel'}
            </button>
          </div>

          {/* Edit link */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6">
            <p className="text-sm font-semibold text-[#1e3a5f] mb-1">Your personal edit link</p>
            <p className="text-xs text-gray-500 mb-2">Save this link to come back and correct any information.</p>
            <div className="flex gap-2 items-center">
              <input
                readOnly
                value={editLink}
                className="form-input text-xs flex-1 bg-white"
                onClick={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(editLink)}
                className="text-xs bg-[#1e3a5f] text-white px-3 py-2 rounded-lg hover:bg-[#16325e] transition-colors whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-[#1e3a5f] hover:underline"
          >
            Return to Home
          </button>
        </div>
      </main>
    </div>
  )
}
