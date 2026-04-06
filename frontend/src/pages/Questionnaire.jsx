import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { createSubmission, updateSubmission, getSubmissionByToken } from '../api/api'

const STEPS = ['Personal Info', 'Dependents & Income', 'Child & Education', 'Business & Banking']

const INCOME_OPTIONS = [
  { key: 'wage_w2', label: 'Wage Statements W-2s' },
  { key: 'f1099s', label: '1099s' },
  { key: 'iras', label: 'IRAs' },
  { key: 'sale_investments', label: 'Sale of Investments' },
  { key: 'unemployment', label: 'Received Unemployment' },
  { key: 'alimony', label: 'Alimony' },
  { key: 'buy_sell_home', label: 'Buy or Sell of a Home' },
  { key: 'rental_property', label: 'Own Rental Property' },
  { key: 'interest_received', label: 'Interest Received' },
  { key: 'dividends', label: 'Dividends Received' },
  { key: 'pension', label: 'Pension or Retirement Income' },
  { key: 'social_security', label: 'Social Security Income' },
  { key: 'self_employed', label: 'Self Employed / Own a Business' },
  { key: 'tips_other', label: 'Tips / Other Income' },
  { key: 'farm_income', label: 'Farm Income' },
  { key: 'household_income', label: 'Household Income' },
  { key: 'lottery', label: 'Lottery or Gambling Winnings' },
  { key: 'corporate', label: 'Corporate Income' },
]

const DEDUCTION_OPTIONS = [
  { key: 'property_tax', label: 'Property Tax' },
  { key: 'union_dues', label: 'Union Dues' },
  { key: 'moving_expense', label: 'Moving Expense' },
  { key: 'medical', label: 'Medical Expense' },
  { key: 'job_related', label: 'Job Related Expense' },
  { key: 'education', label: 'Education Expense' },
  { key: 'mortgage_interest', label: 'Mortgage Interest' },
  { key: 'significant_loss', label: 'Significant Loss or Theft' },
  { key: 'tax_prep', label: 'Tax Preparation Expense' },
  { key: 'charity', label: 'Charity or Religious Contribution' },
  { key: 'retirement_savings', label: 'Retirement Savings' },
  { key: 'mortgage_points', label: 'Mortgage Points (Closing Points)' },
]

const BENEFITS_OPTIONS = [
  { key: 'food_stamps', label: 'Food Stamps' },
  { key: 'wic', label: 'WIC' },
  { key: 'section8', label: 'Section 8' },
  { key: 'alimony', label: 'Alimony' },
  { key: 'child_support', label: 'Child Support' },
  { key: 'other', label: 'Other' },
]

const OTHER_INCOME_OPTIONS = [
  { key: 'self_employed', label: 'Self-Employed' },
  { key: 'llc', label: 'LLC' },
  { key: 'f1120', label: '1120' },
  { key: 'f1120s', label: '1120S' },
  { key: 'f1065', label: '1065' },
  { key: 'f1099_recipient', label: '1099 Recipient' },
]

function SectionHeader({ title }) {
  return <div className="section-header mt-6 first:mt-0">{title}</div>
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="form-label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function CheckboxGroup({ options, selected, onChange }) {
  const toggle = (key) => {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]
    onChange(next)
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
            checked={selected.includes(key)}
            onChange={() => toggle(key)}
          />
          {label}
        </label>
      ))}
    </div>
  )
}

export default function Questionnaire() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Multi-select states
  const [incomeTypes, setIncomeTypes] = useState([])
  const [deductionTypes, setDeductionTypes] = useState([])
  const [benefitsReceived, setBenefitsReceived] = useState([])
  const [otherIncomeTypes, setOtherIncomeTypes] = useState([])

  // Income details - dynamic rows
  const [incomeDetails, setIncomeDetails] = useState([
    { source: '', amount: '', description: '' }
  ])

  const addIncomeRow = () =>
    setIncomeDetails([...incomeDetails, { source: '', amount: '', description: '' }])

  const removeIncomeRow = (i) =>
    setIncomeDetails(incomeDetails.filter((_, idx) => idx !== i))

  const updateIncomeRow = (i, field, value) =>
    setIncomeDetails(incomeDetails.map((row, idx) => idx === i ? { ...row, [field]: value } : row))

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      dependents: [{ name: '', relation_type: '', ssn: '', date_of_birth: '', months_lived_home: '' }],
    },
  })

  const { fields: depFields, append: addDep, remove: removeDep } = useFieldArray({
    control,
    name: 'dependents',
  })

  // Load existing submission if token provided
  useEffect(() => {
    if (token) {
      setLoading(true)
      getSubmissionByToken(token)
        .then((res) => {
          const d = res.data
          reset({ ...d, dependents: d.dependents?.length ? d.dependents : [{ name: '', relationship: '', ssn: '', date_of_birth: '', months_lived_home: '' }] })
          setIncomeTypes(d.income_types || [])
          setDeductionTypes(d.deduction_types || [])
          setBenefitsReceived(d.benefits_received || [])
          setOtherIncomeTypes(d.other_income_types || [])
          setIncomeDetails(d.income_details?.length ? d.income_details : [{ source: '', amount: '', description: '' }])
        })
        .catch(() => setError('Could not load your submission. The link may be invalid.'))
        .finally(() => setLoading(false))
    }
  }, [token, reset])

  const onSubmit = async (data) => {
    setSaving(true)
    setError('')
    const payload = {
      ...data,
      income_types: incomeTypes,
      deduction_types: deductionTypes,
      benefits_received: benefitsReceived,
      other_income_types: otherIncomeTypes,
      income_details: incomeDetails.filter((r) => r.source?.trim() || r.amount?.trim()),
      dependents: data.dependents?.filter((d) => d.name?.trim()),
    }

    try {
      let submissionToken
      if (token) {
        const res = await updateSubmission(token, payload)
        submissionToken = res.data.client_token
      } else {
        const res = await createSubmission(payload)
        submissionToken = res.data.client_token
      }
      navigate(`/thank-you/${submissionToken}`)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg || JSON.stringify(d)).join(', '))
      } else {
        setError(detail || 'Submission failed. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-[#1e3a5f] text-white px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">Machin &amp; Co. Tax Services</Link>
        <span className="text-sm text-blue-200">Personal Income Tax Questionnaire</span>
      </header>

      {/* Step progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                    ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* ─── Step 0: Personal Info ─────────────────────────────────────── */}
          {step === 0 && (
            <div className="card">
              <div className="section-header">Personal Information</div>
              <div className="section-body space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Taxpayer's Name" required>
                    <input className="form-input" {...register('taxpayer_name', { required: 'Required' })} />
                    {errors.taxpayer_name && <p className="text-red-500 text-xs mt-1">{errors.taxpayer_name.message}</p>}
                  </Field>
                  <Field label="Social Security Number">
                    <input className="form-input" placeholder="XXX-XX-XXXX" {...register('taxpayer_ssn')} />
                  </Field>
                  <Field label="Spouse Name">
                    <input className="form-input" {...register('spouse_name')} />
                  </Field>
                  <Field label="Spouse Social Security">
                    <input className="form-input" placeholder="XXX-XX-XXXX" {...register('spouse_ssn')} />
                  </Field>
                </div>

                <Field label="Address">
                  <input className="form-input" {...register('address')} />
                </Field>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Field label="City">
                      <input className="form-input" {...register('city')} />
                    </Field>
                  </div>
                  <Field label="State">
                    <input className="form-input" maxLength={2} {...register('state')} />
                  </Field>
                  <Field label="Zip">
                    <input className="form-input" {...register('zip_code')} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Telephone">
                    <input className="form-input" type="tel" {...register('telephone')} />
                  </Field>
                  <Field label="Work Phone">
                    <input className="form-input" type="tel" {...register('work_phone')} />
                  </Field>
                  <Field label="E-Mail" required>
                    <input className="form-input" type="email" {...register('email', { required: 'Required' })} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </Field>
                  <Field label="Date of Birth">
                    <input className="form-input" type="date" {...register('date_of_birth')} />
                  </Field>
                  <Field label="Occupation">
                    <input className="form-input" {...register('occupation')} />
                  </Field>
                  <Field label="Spouse's Date of Birth">
                    <input className="form-input" type="date" {...register('spouse_dob')} />
                  </Field>
                  <Field label="Spouse's Occupation">
                    <input className="form-input" {...register('spouse_occupation')} />
                  </Field>
                </div>

                <Field label="Filing Status">
                  <select className="form-input" {...register('filing_status')}>
                    <option value="">Select...</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Married filing separately</option>
                    <option>Head of household</option>
                    <option>Widow</option>
                  </select>
                </Field>

                <Field label="How did you hear about us?">
                  <input className="form-input" {...register('how_heard')} />
                </Field>
              </div>
            </div>
          )}

          {/* ─── Step 1: Dependents + Income + Deductions ──────────────────── */}
          {step === 1 && (
            <div className="space-y-0">
              {/* Dependents */}
              <div className="card">
                <div className="section-header">Dependents</div>
                <div className="section-body space-y-4">
                  {depFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="form-label text-xs">Full Name</label>
                        <input className="form-input text-xs" {...register(`dependents.${index}.name`)} />
                      </div>
                      <div>
                        <label className="form-label text-xs">Relationship</label>
                        <input className="form-input text-xs" {...register(`dependents.${index}.relation_type`)} />
                      </div>
                      <div>
                        <label className="form-label text-xs">SSN</label>
                        <input className="form-input text-xs" {...register(`dependents.${index}.ssn`)} />
                      </div>
                      <div>
                        <label className="form-label text-xs">Date of Birth</label>
                        <input type="date" className="form-input text-xs" {...register(`dependents.${index}.date_of_birth`)} />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="form-label text-xs">Months at Home</label>
                          <input className="form-input text-xs" {...register(`dependents.${index}.months_lived_home`)} />
                        </div>
                        {index > 0 && (
                          <button type="button" onClick={() => removeDep(index)} className="mb-0.5 text-red-500 hover:text-red-700 text-lg font-bold">×</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addDep({ name: '', relation_type: '', ssn: '', date_of_birth: '', months_lived_home: '' })}
                    className="text-[#1e3a5f] text-sm font-semibold hover:underline"
                  >
                    + Add Dependent
                  </button>
                </div>
              </div>

              {/* Income */}
              <div className="card mt-4">
                <div className="section-header">Income — Check all that apply</div>
                <div className="section-body">
                  <CheckboxGroup options={INCOME_OPTIONS} selected={incomeTypes} onChange={setIncomeTypes} />
                </div>
              </div>

              {/* Income Details */}
              <div className="card mt-4">
                <div className="section-header">Income Details — Amounts &amp; Sources</div>
                <div className="section-body space-y-3">
                  <p className="text-xs text-gray-500">Enter the amount for each income source. You can add as many rows as needed.</p>

                  {/* Header */}
                  <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                    <div className="col-span-4">Income Source</div>
                    <div className="col-span-3">Amount ($)</div>
                    <div className="col-span-4">Notes / Description</div>
                    <div className="col-span-1"></div>
                  </div>

                  {incomeDetails.map((row, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="col-span-12 sm:col-span-4">
                        <input
                          className="form-input text-sm"
                          placeholder="e.g. W-2 Wages, Rental income..."
                          value={row.source}
                          onChange={(e) => updateIncomeRow(i, 'source', e.target.value)}
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            className="form-input text-sm pl-6"
                            placeholder="0.00"
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.amount}
                            onChange={(e) => updateIncomeRow(i, 'amount', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-span-5 sm:col-span-4">
                        <input
                          className="form-input text-sm"
                          placeholder="Optional notes..."
                          value={row.description}
                          onChange={(e) => updateIncomeRow(i, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {incomeDetails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeIncomeRow(i)}
                            className="text-red-400 hover:text-red-600 text-xl font-bold leading-none"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={addIncomeRow}
                      className="text-[#1e3a5f] text-sm font-semibold hover:underline flex items-center gap-1"
                    >
                      + Add Income Source
                    </button>
                    <div className="text-sm font-semibold text-[#1e3a5f]">
                      Total: $
                      {incomeDetails
                        .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
                        .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="card mt-4">
                <div className="section-header">Deductions — Check all that apply</div>
                <div className="section-body">
                  <CheckboxGroup options={DEDUCTION_OPTIONS} selected={deductionTypes} onChange={setDeductionTypes} />
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Child Tax Credit + Child Care + Education + Supplementary ── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Child Tax Credit */}
              <div className="card">
                <div className="section-header">Child Tax Credit</div>
                <div className="section-body space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { name: 'claiming_child_credit', label: 'Claiming child for Child Tax Credit / EIC?' },
                      { name: 'biological_parent', label: 'Are you the biological parent?' },
                      { name: 'has_custody', label: 'Do you have custody of the child?' },
                    ].map(({ name, label }) => (
                      <Field key={name} label={label}>
                        <select className="form-input" {...register(name)}>
                          <option value="">Select...</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </Field>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="If parent, where is the other parent?">
                      <input className="form-input" {...register('other_parent_location')} />
                    </Field>
                    <Field label="If not parent, why are parents not claiming?">
                      <input className="form-input" {...register('why_parents_not_claiming')} />
                    </Field>
                    <Field label="If not parent, where are biological parents?">
                      <input className="form-input" {...register('biological_parents_location')} />
                    </Field>
                    <Field label="Does the other parent work?">
                      <input className="form-input" {...register('other_parent_works')} />
                    </Field>
                    <Field label="How much does the other parent make?">
                      <input className="form-input" {...register('other_parent_income')} />
                    </Field>
                    <Field label="Who takes care of the dependent while you work?">
                      <input className="form-input" {...register('caretaker_while_working')} />
                    </Field>
                  </div>
                  <Field label="Do you receive any of the following?">
                    <CheckboxGroup options={BENEFITS_OPTIONS} selected={benefitsReceived} onChange={setBenefitsReceived} />
                  </Field>
                </div>
              </div>

              {/* Child Care */}
              <div className="card">
                <div className="section-header">Child Care Information</div>
                <div className="section-body">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Provider's Name">
                      <input className="form-input" {...register('provider_name')} />
                    </Field>
                    <Field label="Provider's SSN / EIN">
                      <input className="form-input" {...register('provider_ssn_ein')} />
                    </Field>
                    <Field label="Provider's Address">
                      <input className="form-input" {...register('provider_address')} />
                    </Field>
                    <Field label="Telephone">
                      <input className="form-input" type="tel" {...register('provider_phone')} />
                    </Field>
                    <Field label="City, State, Zip">
                      <input className="form-input" {...register('provider_city_state_zip')} />
                    </Field>
                    <Field label="Amount Paid to Provider">
                      <input className="form-input" placeholder="$" {...register('amount_paid_provider')} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Educational Expenses */}
              <div className="card">
                <div className="section-header">Educational Expenses</div>
                <div className="section-body">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="School Name">
                      <input className="form-input" {...register('school_name')} />
                    </Field>
                    <Field label="Telephone">
                      <input className="form-input" type="tel" {...register('school_phone')} />
                    </Field>
                    <Field label="Address">
                      <input className="form-input" {...register('school_address')} />
                    </Field>
                    <Field label="City, State, Zip">
                      <input className="form-input" {...register('school_city_state_zip')} />
                    </Field>
                    <Field label="Tuition Paid">
                      <input className="form-input" placeholder="$" {...register('tuition_paid')} />
                    </Field>
                    <Field label="Supplies Bought">
                      <input className="form-input" placeholder="$" {...register('supplies_bought')} />
                    </Field>
                    <Field label="Equipment Bought">
                      <input className="form-input" placeholder="$" {...register('equipment_bought')} />
                    </Field>
                    <Field label="Person Attending">
                      <select className="form-input" {...register('person_attending')}>
                        <option value="">Select...</option>
                        <option value="Primary">Primary (Taxpayer)</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Dependent">Dependent</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </div>

              {/* Supplementary */}
              <div className="card">
                <div className="section-header">Supplementary Statements</div>
                <div className="section-body">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Delinquent on child support, student loans, SBA or federal loan?">
                      <select className="form-input" {...register('delinquent_loans')}>
                        <option value="">Select...</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </Field>
                    <Field label="Do you / spouse have any debt with the IRS?">
                      <select className="form-input" {...register('irs_debt')}>
                        <option value="">Select...</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 3: Business + Banking + Signature ───────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Other Income */}
              <div className="card">
                <div className="section-header">Other Sources of Income — Check all that apply</div>
                <div className="section-body">
                  <CheckboxGroup options={OTHER_INCOME_OPTIONS} selected={otherIncomeTypes} onChange={setOtherIncomeTypes} />
                </div>
              </div>

              {/* Business Info */}
              <div className="card">
                <div className="section-header">Business Income &amp; Expense</div>
                <div className="section-body space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Principle Business or Profession">
                      <input className="form-input" {...register('business_name')} />
                    </Field>
                    <Field label="Employer ID Number">
                      <input className="form-input" {...register('employer_id')} />
                    </Field>
                    <Field label="Business Address">
                      <input className="form-input" {...register('business_address')} />
                    </Field>
                    <Field label="City, State, Zip">
                      <input className="form-input" {...register('business_city_state_zip')} />
                    </Field>
                    <Field label="Business Owned By">
                      <select className="form-input" {...register('business_owned_by')}>
                        <option value="">Select...</option>
                        <option>Taxpayer</option>
                        <option>Spouse</option>
                        <option>Both</option>
                      </select>
                    </Field>
                    <Field label="Accounting Method">
                      <select className="form-input" {...register('accounting_method')}>
                        <option value="">Select...</option>
                        <option>Cash</option>
                        <option>Accrual</option>
                      </select>
                    </Field>
                  </div>

                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Income</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      ['gross_receipts', 'Total Gross Receipts'],
                      ['returns_allowance', 'Returns and Allowance'],
                      ['cost_goods_sold', 'Cost of Goods Sold'],
                      ['gross_profit', 'Gross Profit'],
                    ].map(([name, label]) => (
                      <Field key={name} label={label}>
                        <input className="form-input" placeholder="$" {...register(name)} />
                      </Field>
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Expenses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      ['expense_advertising', 'Advertising'],
                      ['expense_car_truck', 'Car and Truck Expenses'],
                      ['expense_commissions', 'Commissions and Fees'],
                      ['expense_contract_labor', 'Contract Labor'],
                      ['expense_depreciation', 'Depreciation'],
                      ['expense_insurance', 'Insurance'],
                      ['expense_legal', 'Legal and Professional Services'],
                      ['expense_office', 'Office Expenses'],
                      ['expense_rent_lease', 'Rent or Lease of Equipment/Land'],
                      ['expense_repair', 'Repair / Maintenance'],
                      ['expense_supplies', 'Supplies'],
                      ['expense_taxes_license', 'Taxes and License Fee'],
                      ['expense_travel', 'Travel'],
                      ['expense_meals', 'Meals and Entertainment'],
                      ['expense_utilities', 'Utilities'],
                      ['expense_wages', 'Wages'],
                      ['expense_other', 'Other'],
                    ].map(([name, label]) => (
                      <Field key={name} label={label}>
                        <input className="form-input" placeholder="$" {...register(name)} />
                      </Field>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banking */}
              <div className="card">
                <div className="section-header">Banking Information</div>
                <div className="section-body">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Bank Name">
                      <input className="form-input" {...register('bank_name')} />
                    </Field>
                    <Field label="Routing Number">
                      <input className="form-input" {...register('routing_number')} />
                    </Field>
                    <Field label="Account Number">
                      <input className="form-input" {...register('account_number')} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="card">
                <div className="section-header">Signatures</div>
                <div className="section-body">
                  <p className="text-sm text-gray-600 italic mb-4">
                    I certify that I would like my taxes prepared according to the information I supplied above.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Taxpayer's Signature (type full name)" required>
                      <input className="form-input" {...register('taxpayer_signature', { required: 'Signature required' })} />
                      {errors.taxpayer_signature && <p className="text-red-500 text-xs mt-1">{errors.taxpayer_signature.message}</p>}
                    </Field>
                    <Field label="Date">
                      <input type="date" className="form-input" {...register('taxpayer_signature_date')} />
                    </Field>
                    <Field label="Spouse Signature (type full name)">
                      <input className="form-input" {...register('spouse_signature')} />
                    </Field>
                    <Field label="Date">
                      <input type="date" className="form-input" {...register('spouse_signature_date')} />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Navigation ─────────────────────────────────────────────────── */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">
                ← Previous
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="btn-primary">
                Next →
              </button>
            ) : (
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Submitting...' : token ? 'Update Submission' : 'Submit Questionnaire'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
