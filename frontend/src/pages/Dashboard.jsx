import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  listSubmissions, getSubmission, deleteSubmission,
  downloadPDF, downloadExcel, triggerDownload
} from '../api/api'

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Badge({ label }) {
  return (
    <span className="inline-block bg-[#dbe8f5] text-[#1e3a5f] text-xs font-semibold px-2.5 py-0.5 rounded-full">
      {label}
    </span>
  )
}

export default function Dashboard() {
  const { accountant, logout } = useAuth()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [downloading, setDownloading] = useState('')
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    listSubmissions()
      .then((r) => setSubmissions(r.data))
      .finally(() => setLoadingList(false))
  }, [])

  const openDetail = async (id) => {
    setLoadingDetail(true)
    try {
      const r = await getSubmission(id)
      setSelected(r.data)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission? This cannot be undone.')) return
    await deleteSubmission(id)
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const handleDownload = async (type, id) => {
    setDownloading(type + id)
    try {
      if (type === 'pdf') {
        const res = await downloadPDF(id)
        triggerDownload(res.data, `questionnaire_${id}.pdf`)
      } else {
        const res = await downloadExcel(id)
        triggerDownload(res.data, `questionnaire_${id}.xlsx`)
      }
    } catch {
      alert('Download failed.')
    } finally {
      setDownloading('')
    }
  }

  const filtered = submissions.filter((s) => {
    const matchSearch =
      !search ||
      (s.taxpayer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase())
    const matchDate =
      !filterDate ||
      new Date(s.submitted_at).toISOString().slice(0, 10) === filterDate
    return matchSearch && matchDate
  })

  const editLink = (token) => `${window.location.origin}/questionnaire/${token}`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-[#1e3a5f] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-1.5">
            <svg className="w-5 h-5 text-[#1e3a5f]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-base">Machin &amp; Co. Tax Services</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm hidden sm:block">Welcome, {accountant?.name}</span>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="text-sm border border-white/40 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar: Submission List ───────────────────────────────────── */}
        <aside className="w-full sm:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1e3a5f] text-lg mb-3">Client Submissions</h2>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="form-input mb-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              className="form-input text-sm"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-12">No submissions found</div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.id}
                  onClick={() => openDetail(s.id)}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors
                    ${selected?.id === s.id ? 'bg-[#dbe8f5] border-l-4 border-l-[#1e3a5f]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {s.taxpayer_name || 'Unnamed'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{s.email || '—'}</p>
                    </div>
                    {s.filing_status && <Badge label={s.filing_status} />}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(s.submitted_at)}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-100 text-xs text-gray-400 text-center">
            {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
          </div>
        </aside>

        {/* ─── Main: Detail View ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">
          {loadingDetail ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f]" />
            </div>
          ) : !selected ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">Select a submission to view details</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1e3a5f]">{selected.taxpayer_name || 'Unnamed Client'}</h2>
                  <p className="text-sm text-gray-500">Submitted: {formatDate(selected.submitted_at)}</p>
                  {selected.updated_at && (
                    <p className="text-xs text-gray-400">Last updated: {formatDate(selected.updated_at)}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDownload('pdf', selected.id)}
                    disabled={downloading === `pdf${selected.id}`}
                    className="btn-primary text-sm flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {downloading === `pdf${selected.id}` ? '...' : 'PDF'}
                  </button>
                  <button
                    onClick={() => handleDownload('excel', selected.id)}
                    disabled={downloading === `excel${selected.id}`}
                    className="btn-secondary text-sm flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {downloading === `excel${selected.id}` ? '...' : 'Excel'}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(editLink(selected.client_token))
                      alert('Edit link copied to clipboard!')
                    }}
                    className="btn-secondary text-sm"
                  >
                    Copy Edit Link
                  </button>
                  <button onClick={() => handleDelete(selected.id)} className="btn-danger text-sm">
                    Delete
                  </button>
                </div>
              </div>

              {/* Details */}
              <DetailSection title="Personal Information">
                <DetailRow label="Taxpayer" value={selected.taxpayer_name} />
                <DetailRow label="SSN" value={selected.taxpayer_ssn} />
                <DetailRow label="Spouse" value={selected.spouse_name} />
                <DetailRow label="Spouse SSN" value={selected.spouse_ssn} />
                <DetailRow label="Address" value={[selected.address, selected.city, selected.state, selected.zip_code].filter(Boolean).join(', ')} />
                <DetailRow label="Phone" value={selected.telephone} />
                <DetailRow label="Email" value={selected.email} />
                <DetailRow label="Date of Birth" value={selected.date_of_birth} />
                <DetailRow label="Occupation" value={selected.occupation} />
                <DetailRow label="Filing Status" value={selected.filing_status} />
                <DetailRow label="How Heard" value={selected.how_heard} />
              </DetailSection>

              {selected.dependents?.length > 0 && (
                <DetailSection title="Dependents">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-[#dbe8f5] text-[#1e3a5f]">
                          <th className="text-left px-3 py-2 font-semibold">Name</th>
                          <th className="text-left px-3 py-2 font-semibold">Relationship</th>
                          <th className="text-left px-3 py-2 font-semibold">SSN</th>
                          <th className="text-left px-3 py-2 font-semibold">DOB</th>
                          <th className="text-left px-3 py-2 font-semibold">Months</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.dependents.map((d, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-3 py-2">{d.name}</td>
                            <td className="px-3 py-2">{d.relationship}</td>
                            <td className="px-3 py-2">{d.ssn}</td>
                            <td className="px-3 py-2">{d.date_of_birth}</td>
                            <td className="px-3 py-2">{d.months_lived_home}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </DetailSection>
              )}

              <DetailSection title="Income">
                <div className="flex flex-wrap gap-2">
                  {(selected.income_types || []).length === 0
                    ? <span className="text-gray-400 text-sm">None selected</span>
                    : (selected.income_types || []).map((k) => <Badge key={k} label={k.replace(/_/g, ' ')} />)
                  }
                </div>
              </DetailSection>

              <DetailSection title="Deductions">
                <div className="flex flex-wrap gap-2">
                  {(selected.deduction_types || []).length === 0
                    ? <span className="text-gray-400 text-sm">None selected</span>
                    : (selected.deduction_types || []).map((k) => <Badge key={k} label={k.replace(/_/g, ' ')} />)
                  }
                </div>
              </DetailSection>

              <DetailSection title="Child Tax Credit">
                <DetailRow label="Claiming Child Credit" value={boolStr(selected.claiming_child_credit)} />
                <DetailRow label="Biological Parent" value={boolStr(selected.biological_parent)} />
                <DetailRow label="Has Custody" value={boolStr(selected.has_custody)} />
                <DetailRow label="Other Parent Location" value={selected.other_parent_location} />
                <DetailRow label="Caretaker While Working" value={selected.caretaker_while_working} />
              </DetailSection>

              {selected.provider_name && (
                <DetailSection title="Child Care">
                  <DetailRow label="Provider" value={selected.provider_name} />
                  <DetailRow label="Provider SSN/EIN" value={selected.provider_ssn_ein} />
                  <DetailRow label="Amount Paid" value={selected.amount_paid_provider} />
                </DetailSection>
              )}

              {selected.school_name && (
                <DetailSection title="Educational Expenses">
                  <DetailRow label="School" value={selected.school_name} />
                  <DetailRow label="Tuition Paid" value={selected.tuition_paid} />
                  <DetailRow label="Supplies" value={selected.supplies_bought} />
                  <DetailRow label="Equipment" value={selected.equipment_bought} />
                  <DetailRow label="Person Attending" value={selected.person_attending} />
                </DetailSection>
              )}

              <DetailSection title="Supplementary">
                <DetailRow label="Delinquent on Federal Loans" value={boolStr(selected.delinquent_loans)} />
                <DetailRow label="IRS Debt" value={boolStr(selected.irs_debt)} />
              </DetailSection>

              {selected.business_name && (
                <DetailSection title="Business Income &amp; Expenses">
                  <DetailRow label="Business" value={selected.business_name} />
                  <DetailRow label="Gross Receipts" value={selected.gross_receipts} />
                  <DetailRow label="Gross Profit" value={selected.gross_profit} />
                  <DetailRow label="Accounting Method" value={selected.accounting_method} />
                </DetailSection>
              )}

              {selected.bank_name && (
                <DetailSection title="Banking">
                  <DetailRow label="Bank" value={selected.bank_name} />
                  <DetailRow label="Routing" value={selected.routing_number} />
                  <DetailRow label="Account" value={selected.account_number} />
                </DetailSection>
              )}

              <DetailSection title="Signature">
                <DetailRow label="Taxpayer Signature" value={selected.taxpayer_signature} />
                <DetailRow label="Taxpayer Date" value={selected.taxpayer_signature_date} />
                {selected.spouse_signature && (
                  <>
                    <DetailRow label="Spouse Signature" value={selected.spouse_signature} />
                    <DetailRow label="Spouse Date" value={selected.spouse_signature_date} />
                  </>
                )}
              </DetailSection>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function boolStr(v) {
  if (v === true) return 'Yes'
  if (v === false) return 'No'
  return '—'
}

function DetailSection({ title, children }) {
  return (
    <div className="card mb-4">
      <div className="section-header" dangerouslySetInnerHTML={{ __html: title }} />
      <div className="section-body divide-y divide-gray-100">{children}</div>
    </div>
  )
}

function DetailRow({ label, value }) {
  if (!value && value !== false) return null
  return (
    <div className="flex py-1.5 text-sm gap-3">
      <span className="font-semibold text-gray-600 w-40 shrink-0">{label}</span>
      <span className="text-gray-900">{String(value)}</span>
    </div>
  )
}
