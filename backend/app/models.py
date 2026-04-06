from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import uuid


def generate_token():
    return str(uuid.uuid4())


class Accountant(Base):
    __tablename__ = "accountants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    client_token = Column(String, unique=True, index=True, default=generate_token)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # --- Page 1: Personal Information ---
    taxpayer_name = Column(String)
    taxpayer_ssn = Column(String)
    spouse_name = Column(String)
    spouse_ssn = Column(String)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    telephone = Column(String)
    work_phone = Column(String)
    date_of_birth = Column(String)
    occupation = Column(String)
    spouse_dob = Column(String)
    spouse_occupation = Column(String)
    email = Column(String)
    filing_status = Column(String)
    how_heard = Column(String)

    # Income & Deductions (stored as JSON arrays of selected keys)
    income_types = Column(JSON, default=list)
    deduction_types = Column(JSON, default=list)

    # --- Page 2: Child Tax Credit ---
    claiming_child_credit = Column(Boolean, nullable=True)
    biological_parent = Column(Boolean, nullable=True)
    has_custody = Column(Boolean, nullable=True)
    other_parent_location = Column(String)
    why_parents_not_claiming = Column(String)
    biological_parents_location = Column(String)
    other_parent_works = Column(String)
    other_parent_income = Column(String)
    benefits_received = Column(JSON, default=list)
    caretaker_while_working = Column(String)

    # Child Care Information
    provider_name = Column(String)
    provider_ssn_ein = Column(String)
    provider_address = Column(String)
    provider_phone = Column(String)
    provider_city_state_zip = Column(String)
    amount_paid_provider = Column(String)

    # Educational Expenses
    school_name = Column(String)
    school_phone = Column(String)
    school_address = Column(String)
    school_city_state_zip = Column(String)
    tuition_paid = Column(String)
    supplies_bought = Column(String)
    equipment_bought = Column(String)
    person_attending = Column(String)

    # Supplementary Statements
    delinquent_loans = Column(Boolean, nullable=True)
    irs_debt = Column(Boolean, nullable=True)

    # --- Page 3: Other Sources of Income ---
    other_income_types = Column(JSON, default=list)

    # Business Income & Expense
    business_name = Column(String)
    business_address = Column(String)
    business_city_state_zip = Column(String)
    employer_id = Column(String)
    business_owned_by = Column(String)
    accounting_method = Column(String)
    gross_receipts = Column(String)
    returns_allowance = Column(String)
    cost_goods_sold = Column(String)
    gross_profit = Column(String)
    expense_advertising = Column(String)
    expense_car_truck = Column(String)
    expense_commissions = Column(String)
    expense_contract_labor = Column(String)
    expense_depreciation = Column(String)
    expense_insurance = Column(String)
    expense_legal = Column(String)
    expense_office = Column(String)

    # --- Page 4: More Expenses + Banking + Signatures ---
    expense_rent_lease = Column(String)
    expense_repair = Column(String)
    expense_supplies = Column(String)
    expense_taxes_license = Column(String)
    expense_travel = Column(String)
    expense_meals = Column(String)
    expense_utilities = Column(String)
    expense_wages = Column(String)
    expense_other = Column(String)

    bank_name = Column(String)
    routing_number = Column(String)
    account_number = Column(String)

    taxpayer_signature = Column(String)
    taxpayer_signature_date = Column(String)
    spouse_signature = Column(String)
    spouse_signature_date = Column(String)

    # Relationship to dependents
    dependents = relationship("Dependent", back_populates="submission", cascade="all, delete-orphan")


class Dependent(Base):
    __tablename__ = "dependents"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    name = Column(String)
    relation_type = Column(String)
    ssn = Column(String)
    date_of_birth = Column(String)
    months_lived_home = Column(String)

    submission = relationship("Submission", back_populates="dependents")
