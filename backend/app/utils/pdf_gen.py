from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from typing import Any

NAVY = colors.HexColor("#1e3a5f")
LIGHT_BLUE = colors.HexColor("#dbe8f5")
WHITE = colors.white
BLACK = colors.black


def _val(v):
    return str(v) if v else ""


def _bool_label(v):
    if v is True:
        return "Yes"
    if v is False:
        return "No"
    return ""


def _checked(items: list, key: str) -> str:
    return "[X]" if key in (items or []) else "[ ]"


def _section_header(title: str, styles) -> Table:
    t = Table([[Paragraph(f"<b>{title}</b>", styles["header_cell"])]], colWidths=[7.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, -1), WHITE),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def _info_row(label: str, value: str, styles, label_w=2.0, value_w=5.5) -> Table:
    t = Table(
        [[Paragraph(f"<b>{label}</b>", styles["label"]), Paragraph(value, styles["value"])]],
        colWidths=[label_w * inch, value_w * inch]
    )
    t.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
        ("LINEAFTER", (0, 0), (0, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def generate_pdf(submission: Any) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    base_styles = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle("title", parent=base_styles["Title"], textColor=NAVY, fontSize=18, spaceAfter=4),
        "subtitle": ParagraphStyle("subtitle", parent=base_styles["Normal"], textColor=NAVY, fontSize=13, spaceAfter=10, alignment=TA_CENTER, fontName="Helvetica-Bold"),
        "header_cell": ParagraphStyle("header_cell", parent=base_styles["Normal"], textColor=WHITE, fontSize=11, fontName="Helvetica-Bold"),
        "label": ParagraphStyle("label", parent=base_styles["Normal"], fontSize=9, fontName="Helvetica-Bold"),
        "value": ParagraphStyle("value", parent=base_styles["Normal"], fontSize=9),
        "normal": ParagraphStyle("normal", parent=base_styles["Normal"], fontSize=9),
        "small": ParagraphStyle("small", parent=base_styles["Normal"], fontSize=8),
    }

    story = []

    # ─── Header ─────────────────────────────────────────────────────────────
    story.append(Paragraph("Machin &amp; Co. Tax Services", styles["title"]))
    story.append(Paragraph("Personal Income Tax Questionnaire", styles["subtitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=NAVY))
    story.append(Spacer(1, 10))

    # ─── Page 1: Personal Info ───────────────────────────────────────────────
    story.append(_section_header("Personal Information", styles))
    story.append(Spacer(1, 4))

    personal_rows = [
        ["Taxpayer's Name", _val(submission.taxpayer_name), "Social Security", _val(submission.taxpayer_ssn)],
        ["Spouse Name", _val(submission.spouse_name), "Social Security", _val(submission.spouse_ssn)],
        ["Address", _val(submission.address), "", ""],
        ["City", _val(submission.city), "State", _val(submission.state)],
        ["Zip", _val(submission.zip_code), "Telephone", _val(submission.telephone)],
        ["Work Phone", _val(submission.work_phone), "E-Mail", _val(submission.email)],
        ["Date of Birth", _val(submission.date_of_birth), "Occupation", _val(submission.occupation)],
        ["Spouse's DOB", _val(submission.spouse_dob), "Spouse Occupation", _val(submission.spouse_occupation)],
        ["Filing Status", _val(submission.filing_status), "How did you hear about us?", _val(submission.how_heard)],
    ]

    col_w = [1.5 * inch, 2.2 * inch, 1.5 * inch, 2.3 * inch]
    for row in personal_rows:
        t = Table([[
            Paragraph(f"<b>{row[0]}</b>", styles["label"]),
            Paragraph(row[1], styles["value"]),
            Paragraph(f"<b>{row[2]}</b>", styles["label"]),
            Paragraph(row[3], styles["value"]),
        ]], colWidths=col_w)
        t.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
            ("LINEAFTER", (0, 0), (0, -1), 0.5, colors.grey),
            ("LINEAFTER", (2, 0), (2, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
            ("BACKGROUND", (2, 0), (2, -1), LIGHT_BLUE),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t)

    story.append(Spacer(1, 8))

    # ─── Dependents ──────────────────────────────────────────────────────────
    story.append(_section_header("Dependents", styles))
    story.append(Spacer(1, 4))

    dep_header = [
        Paragraph("<b>Name</b>", styles["label"]),
        Paragraph("<b>Relationship</b>", styles["label"]),
        Paragraph("<b>SSN</b>", styles["label"]),
        Paragraph("<b>Date of Birth</b>", styles["label"]),
        Paragraph("<b>Months at Home</b>", styles["label"]),
    ]
    dep_rows = [dep_header]
    for d in (submission.dependents or []):
        dep_rows.append([
            Paragraph(_val(d.name), styles["value"]),
            Paragraph(_val(d.relationship), styles["value"]),
            Paragraph(_val(d.ssn), styles["value"]),
            Paragraph(_val(d.date_of_birth), styles["value"]),
            Paragraph(_val(d.months_lived_home), styles["value"]),
        ])
    # pad to at least 3 rows
    while len(dep_rows) < 4:
        dep_rows.append(["", "", "", "", ""])

    dep_table = Table(dep_rows, colWidths=[2.2 * inch, 1.4 * inch, 1.2 * inch, 1.4 * inch, 1.3 * inch])
    dep_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BLUE),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ]))
    story.append(dep_table)
    story.append(Spacer(1, 8))

    # ─── Income ──────────────────────────────────────────────────────────────
    income_keys = [
        ("wage_w2", "Wage Statements W-2s"),
        ("f1099s", "1099s"),
        ("iras", "IRAs"),
        ("sale_investments", "Sale of Investments"),
        ("unemployment", "Received Unemployment"),
        ("alimony", "Alimony"),
        ("buy_sell_home", "Buy or Sell of a Home"),
        ("rental_property", "Own Rental Property"),
        ("interest_received", "Interest Received"),
        ("dividends", "Dividends Received"),
        ("pension", "Pension or Retirement Income"),
        ("social_security", "Social Security Income"),
        ("self_employed", "Self Employed / Own a Business"),
        ("tips_other", "Tips / Other Income"),
        ("farm_income", "Farm Income"),
        ("household_income", "Household Income"),
        ("lottery", "Lottery or Gambling Winnings"),
        ("corporate", "Corporate Income"),
    ]
    income_list = submission.income_types or []

    story.append(_section_header("Income", styles))
    story.append(Spacer(1, 4))
    inc_rows = []
    for i in range(0, len(income_keys), 3):
        row = []
        for k, label in income_keys[i:i+3]:
            row.append(Paragraph(f"{_checked(income_list, k)} {label}", styles["normal"]))
        while len(row) < 3:
            row.append("")
        inc_rows.append(row)
    inc_table = Table(inc_rows, colWidths=[2.5 * inch, 2.5 * inch, 2.5 * inch])
    inc_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(inc_table)
    story.append(Spacer(1, 8))

    # ─── Deductions ──────────────────────────────────────────────────────────
    deduction_keys = [
        ("property_tax", "Property Tax"),
        ("union_dues", "Union Dues"),
        ("moving_expense", "Moving Expense"),
        ("medical", "Medical Expense"),
        ("job_related", "Job Related Expense"),
        ("education", "Education Expense"),
        ("mortgage_interest", "Mortgage Interest"),
        ("significant_loss", "Significant Loss or Theft"),
        ("tax_prep", "Tax Preparation Expense"),
        ("charity", "Charity or Religious Contribution"),
        ("retirement_savings", "Retirement Savings"),
        ("mortgage_points", "Mortgage Points (Closing Points)"),
    ]
    ded_list = submission.deduction_types or []

    story.append(_section_header("Deductions", styles))
    story.append(Spacer(1, 4))
    ded_rows = []
    for i in range(0, len(deduction_keys), 3):
        row = []
        for k, label in deduction_keys[i:i+3]:
            row.append(Paragraph(f"{_checked(ded_list, k)} {label}", styles["normal"]))
        while len(row) < 3:
            row.append("")
        ded_rows.append(row)
    ded_table = Table(ded_rows, colWidths=[2.5 * inch, 2.5 * inch, 2.5 * inch])
    ded_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(ded_table)
    story.append(Spacer(1, 10))

    # ─── Page 2: Child Tax Credit ────────────────────────────────────────────
    story.append(_section_header("Child Tax Credit", styles))
    story.append(Spacer(1, 4))

    ctc_data = [
        ["Claiming child for Child Tax Credit or EIC?", _bool_label(submission.claiming_child_credit)],
        ["Biological parent of the child?", _bool_label(submission.biological_parent)],
        ["Do you have custody of the child?", _bool_label(submission.has_custody)],
        ["If parent, where is the other parent?", _val(submission.other_parent_location)],
        ["If not parent, why are parents not claiming?", _val(submission.why_parents_not_claiming)],
        ["If not parent, where are biological parents?", _val(submission.biological_parents_location)],
        ["Does the other parent work?", _val(submission.other_parent_works)],
        ["How much does the other parent make?", _val(submission.other_parent_income)],
        ["Caretaker while working?", _val(submission.caretaker_while_working)],
    ]
    benefits = submission.benefits_received or []
    benefits_str = "  ".join([
        f"[{'X' if 'food_stamps' in benefits else ' '}] Food Stamps",
        f"[{'X' if 'wic' in benefits else ' '}] WIC",
        f"[{'X' if 'section8' in benefits else ' '}] Section 8",
        f"[{'X' if 'alimony' in benefits else ' '}] Alimony",
        f"[{'X' if 'child_support' in benefits else ' '}] Child Support",
        f"[{'X' if 'other' in benefits else ' '}] Other",
    ])
    ctc_data.append(["Benefits received", benefits_str])

    ctc_table = Table(ctc_data, colWidths=[3.5 * inch, 4.0 * inch])
    ctc_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(ctc_table)
    story.append(Spacer(1, 8))

    # ─── Child Care ──────────────────────────────────────────────────────────
    story.append(_section_header("Child Care Information", styles))
    story.append(Spacer(1, 4))

    cc_data = [
        ["Provider's Name", _val(submission.provider_name), "Provider's SSN/EIN", _val(submission.provider_ssn_ein)],
        ["Provider's Address", _val(submission.provider_address), "Telephone", _val(submission.provider_phone)],
        ["City, State, Zip", _val(submission.provider_city_state_zip), "Amount Paid", _val(submission.amount_paid_provider)],
    ]
    cc_table = Table(cc_data, colWidths=[1.6 * inch, 2.2 * inch, 1.6 * inch, 2.1 * inch])
    cc_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("BACKGROUND", (2, 0), (2, -1), LIGHT_BLUE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(cc_table)
    story.append(Spacer(1, 8))

    # ─── Educational Expenses ────────────────────────────────────────────────
    story.append(_section_header("Educational Expenses", styles))
    story.append(Spacer(1, 4))

    ed_data = [
        ["School Name", _val(submission.school_name), "Telephone", _val(submission.school_phone)],
        ["Address", _val(submission.school_address), "City, State, Zip", _val(submission.school_city_state_zip)],
        ["Tuition Paid", _val(submission.tuition_paid), "Supplies Bought", _val(submission.supplies_bought)],
        ["Equipment Bought", _val(submission.equipment_bought), "Person Attending", _val(submission.person_attending)],
    ]
    ed_table = Table(ed_data, colWidths=[1.6 * inch, 2.2 * inch, 1.6 * inch, 2.1 * inch])
    ed_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("BACKGROUND", (2, 0), (2, -1), LIGHT_BLUE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(ed_table)
    story.append(Spacer(1, 8))

    # ─── Supplementary ───────────────────────────────────────────────────────
    story.append(_section_header("Supplementary Statements", styles))
    story.append(Spacer(1, 4))
    sup_data = [
        ["Delinquent on child support, student loans, SBA loan, or other federal loan?", _bool_label(submission.delinquent_loans)],
        ["Do you/spouse have any debt with the IRS?", _bool_label(submission.irs_debt)],
    ]
    sup_table = Table(sup_data, colWidths=[6.0 * inch, 1.5 * inch])
    sup_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(sup_table)
    story.append(Spacer(1, 10))

    # ─── Page 3: Other Income ─────────────────────────────────────────────────
    other_income_keys = [
        ("self_employed", "Self-Employed"),
        ("llc", "LLC"),
        ("f1120", "1120"),
        ("f1120s", "1120S"),
        ("f1065", "1065"),
        ("f1099_recipient", "1099 Recipient"),
    ]
    other_list = submission.other_income_types or []

    story.append(_section_header("Other Sources of Income", styles))
    story.append(Spacer(1, 4))
    other_row = [Paragraph(f"{_checked(other_list, k)} {label}", styles["normal"]) for k, label in other_income_keys]
    other_table = Table([other_row], colWidths=[1.25 * inch] * 6)
    other_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.3, colors.lightgrey),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(other_table)
    story.append(Spacer(1, 8))

    # ─── Business Income & Expense ───────────────────────────────────────────
    story.append(_section_header("Business Income &amp; Expense", styles))
    story.append(Spacer(1, 4))

    biz_info = [
        ["Principle Business/Profession", _val(submission.business_name), "Employer ID", _val(submission.employer_id)],
        ["Business Address", _val(submission.business_address), "City, State, Zip", _val(submission.business_city_state_zip)],
        ["Business Owned By", _val(submission.business_owned_by), "Accounting Method", _val(submission.accounting_method)],
    ]
    biz_table = Table(biz_info, colWidths=[1.8 * inch, 2.0 * inch, 1.6 * inch, 2.1 * inch])
    biz_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("BACKGROUND", (2, 0), (2, -1), LIGHT_BLUE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(biz_table)
    story.append(Spacer(1, 4))

    inc_header = [Paragraph("<b>Income</b>", styles["header_cell"])]
    income_tbl = Table([inc_header], colWidths=[7.5 * inch])
    income_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BLUE),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TEXTCOLOR", (0, 0), (-1, -1), NAVY),
    ]))
    story.append(income_tbl)

    biz_income = [
        ["Total Gross Receipts", _val(submission.gross_receipts)],
        ["Returns and Allowance", _val(submission.returns_allowance)],
        ["Cost of Goods Sold", _val(submission.cost_goods_sold)],
        ["Gross Profit", _val(submission.gross_profit)],
    ]
    _add_kv_table(story, biz_income, styles)

    exp_header = [Paragraph("<b>Expenses</b>", styles["header_cell"])]
    exp_tbl = Table([exp_header], colWidths=[7.5 * inch])
    exp_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BLUE),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TEXTCOLOR", (0, 0), (-1, -1), NAVY),
    ]))
    story.append(exp_tbl)

    expenses = [
        ["Advertising", _val(submission.expense_advertising)],
        ["Car and Truck Expenses", _val(submission.expense_car_truck)],
        ["Commissions and Fees", _val(submission.expense_commissions)],
        ["Contract Labor", _val(submission.expense_contract_labor)],
        ["Depreciation", _val(submission.expense_depreciation)],
        ["Insurance", _val(submission.expense_insurance)],
        ["Legal and Professional Services", _val(submission.expense_legal)],
        ["Office Expenses", _val(submission.expense_office)],
        ["Rent or Lease of Equipment/Land", _val(submission.expense_rent_lease)],
        ["Repair/Maintenance", _val(submission.expense_repair)],
        ["Supplies", _val(submission.expense_supplies)],
        ["Taxes and License Fee", _val(submission.expense_taxes_license)],
        ["Travel", _val(submission.expense_travel)],
        ["Meals and Entertainment", _val(submission.expense_meals)],
        ["Utilities", _val(submission.expense_utilities)],
        ["Wages", _val(submission.expense_wages)],
        ["Other", _val(submission.expense_other)],
    ]
    _add_kv_table(story, expenses, styles)
    story.append(Spacer(1, 10))

    # ─── Banking ─────────────────────────────────────────────────────────────
    story.append(_section_header("Banking Information", styles))
    story.append(Spacer(1, 4))

    bank_data = [
        ["Bank Name", _val(submission.bank_name)],
        ["Routing Number", _val(submission.routing_number)],
        ["Account Number", _val(submission.account_number)],
    ]
    _add_kv_table(story, bank_data, styles, label_w=2.0, value_w=5.5)
    story.append(Spacer(1, 10))

    # ─── Signatures ──────────────────────────────────────────────────────────
    story.append(Paragraph(
        "<i>I certify that I would like my taxes prepared according to the information I supplied above.</i>",
        ParagraphStyle("cert", parent=base_styles["Normal"], fontSize=9, alignment=TA_CENTER)
    ))
    story.append(Spacer(1, 8))
    sig_data = [
        ["Taxpayer's Signature", _val(submission.taxpayer_signature), "Date", _val(submission.taxpayer_signature_date)],
        ["Spouse Signature", _val(submission.spouse_signature), "Date", _val(submission.spouse_signature_date)],
    ]
    sig_table = Table(sig_data, colWidths=[1.8 * inch, 3.5 * inch, 0.6 * inch, 1.6 * inch])
    sig_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("BACKGROUND", (2, 0), (2, -1), LIGHT_BLUE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(sig_table)

    doc.build(story)
    return buffer.getvalue()


def _add_kv_table(story, rows, styles, label_w=2.8, value_w=4.7):
    for label, value in rows:
        t = Table(
            [[Paragraph(f"<b>{label}</b>", styles["label"]), Paragraph(value, styles["value"])]],
            colWidths=[label_w * inch, value_w * inch]
        )
        t.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
            ("LINEAFTER", (0, 0), (0, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
