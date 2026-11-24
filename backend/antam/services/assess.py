"""Ghép pipeline kiểm tra khoản vay: tool tính toán → giấy phép → rule engine → lời giải thích."""

from __future__ import annotations

from antam.ai.write import explain
from antam.schemas.loan import Assessment, ConfirmedLoan, Finding
from antam.seed import seed
from antam.tools.calc_true_cost import CashFlow, extension_scenarios, true_cost
from antam.tools.check_license import check_license
from antam.tools.rule_engine import BRANCH_CREDIT_INSTITUTION, BRANCH_NON_CREDIT, evaluate, risk_level


def build_facts(loan: ConfirmedLoan, apr_simple: float, total_cost: int, license_found: bool) -> dict:
    facts: dict = {
        "apr_simple": apr_simple,
        "total_cost": total_cost,
        "license_found": license_found,
        "data_access_contacts": loan.data_access_contacts,
        "requires_upfront_payment": loan.requires_upfront_payment,
        "third_party_collection": loan.third_party_collection,
        "has_rate_and_method": loan.has_rate_and_method,
    }
    # Chỉ thêm fact khi có dữ kiện — quy tắc thiếu dữ kiện sẽ tự bỏ qua
    if loan.rate_stated_pct_year is not None:
        facts["rate_stated_pct"] = loan.rate_stated_pct_year
    if loan.late_penalty_pct_per_day is not None:
        facts["late_penalty_apr_pct"] = round(loan.late_penalty_pct_per_day * 365, 1)
    return facts


def assess(loan: ConfirmedLoan) -> Assessment:
    s = seed()
    flows = [CashFlow(loan.disbursed_date, loan.amount_received)]
    flows += [CashFlow(i.on, -i.amount) for i in loan.schedule]
    cost = true_cost(flows)

    lic = check_license(loan.lender_name, s["lenders"])
    branch = BRANCH_CREDIT_INSTITUTION if lic.status == "credit_institution" else BRANCH_NON_CREDIT
    facts = build_facts(loan, cost.apr_simple, cost.total_cost, lic.status == "credit_institution")
    fired = evaluate(s["rules"], s["legal_params"], facts, branch, loan.disbursed_date)

    scenarios = extension_scenarios(cost.total_repaid, loan.extension_fee) if loan.extension_fee else {}
    text = explain(cost.amount_received, cost.total_repaid, cost.term_days, [f.message for f in fired])
    return Assessment(
        risk_level=risk_level(fired),
        lender_status=lic.status,
        amount_received=cost.amount_received,
        total_repaid=cost.total_repaid,
        total_cost=cost.total_cost,
        apr_simple=cost.apr_simple,
        scenarios=scenarios,
        findings=[Finding(rule_id=f.rule_id, severity=f.severity, message=f.message, legal_ref=f.legal_ref)
                  for f in fired],
        explanation=text,
    )
