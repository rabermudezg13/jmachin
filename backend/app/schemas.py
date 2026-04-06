from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class AccountantCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class AccountantLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AccountantOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dependents ──────────────────────────────────────────────────────────────

class DependentCreate(BaseModel):
    name: Optional[str] = None
    relation_type: Optional[str] = None
    ssn: Optional[str] = None
    date_of_birth: Optional[str] = None
    months_lived_home: Optional[str] = None

class DependentOut(DependentCreate):
    id: int
    class Config:
        from_attributes = True


# ─── Submission ──────────────────────────────────────────────────────────────

class SubmissionCreate(BaseModel):
    # Page 1
    taxpayer_name: Optional[str] = None
    taxpayer_ssn: Optional[str] = None
    spouse_name: Optional[str] = None
    spouse_ssn: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    telephone: Optional[str] = None
    work_phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    occupation: Optional[str] = None
    spouse_dob: Optional[str] = None
    spouse_occupation: Optional[str] = None
    email: Optional[str] = None
    filing_status: Optional[str] = None
    how_heard: Optional[str] = None
    income_types: Optional[List[str]] = []
    deduction_types: Optional[List[str]] = []
    dependents: Optional[List[DependentCreate]] = []

    # Page 2
    claiming_child_credit: Optional[bool] = None
    biological_parent: Optional[bool] = None
    has_custody: Optional[bool] = None
    other_parent_location: Optional[str] = None
    why_parents_not_claiming: Optional[str] = None
    biological_parents_location: Optional[str] = None
    other_parent_works: Optional[str] = None
    other_parent_income: Optional[str] = None
    benefits_received: Optional[List[str]] = []
    caretaker_while_working: Optional[str] = None
    provider_name: Optional[str] = None
    provider_ssn_ein: Optional[str] = None
    provider_address: Optional[str] = None
    provider_phone: Optional[str] = None
    provider_city_state_zip: Optional[str] = None
    amount_paid_provider: Optional[str] = None
    school_name: Optional[str] = None
    school_phone: Optional[str] = None
    school_address: Optional[str] = None
    school_city_state_zip: Optional[str] = None
    tuition_paid: Optional[str] = None
    supplies_bought: Optional[str] = None
    equipment_bought: Optional[str] = None
    person_attending: Optional[str] = None
    delinquent_loans: Optional[bool] = None
    irs_debt: Optional[bool] = None

    # Page 3
    other_income_types: Optional[List[str]] = []
    business_name: Optional[str] = None
    business_address: Optional[str] = None
    business_city_state_zip: Optional[str] = None
    employer_id: Optional[str] = None
    business_owned_by: Optional[str] = None
    accounting_method: Optional[str] = None
    gross_receipts: Optional[str] = None
    returns_allowance: Optional[str] = None
    cost_goods_sold: Optional[str] = None
    gross_profit: Optional[str] = None
    expense_advertising: Optional[str] = None
    expense_car_truck: Optional[str] = None
    expense_commissions: Optional[str] = None
    expense_contract_labor: Optional[str] = None
    expense_depreciation: Optional[str] = None
    expense_insurance: Optional[str] = None
    expense_legal: Optional[str] = None
    expense_office: Optional[str] = None

    # Page 4
    expense_rent_lease: Optional[str] = None
    expense_repair: Optional[str] = None
    expense_supplies: Optional[str] = None
    expense_taxes_license: Optional[str] = None
    expense_travel: Optional[str] = None
    expense_meals: Optional[str] = None
    expense_utilities: Optional[str] = None
    expense_wages: Optional[str] = None
    expense_other: Optional[str] = None
    bank_name: Optional[str] = None
    routing_number: Optional[str] = None
    account_number: Optional[str] = None
    taxpayer_signature: Optional[str] = None
    taxpayer_signature_date: Optional[str] = None
    spouse_signature: Optional[str] = None
    spouse_signature_date: Optional[str] = None


class SubmissionOut(SubmissionCreate):
    id: int
    client_token: str
    submitted_at: datetime
    updated_at: Optional[datetime] = None
    dependents: List[DependentOut] = []

    class Config:
        from_attributes = True


class SubmissionSummary(BaseModel):
    id: int
    client_token: str
    taxpayer_name: Optional[str] = None
    email: Optional[str] = None
    filing_status: Optional[str] = None
    submitted_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
