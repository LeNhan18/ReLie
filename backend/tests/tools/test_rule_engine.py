from datetime import date

import pytest

from antam.config import settings
from antam.seed import load_legal_params, load_rules
from antam.tools.rule_engine import (
    BRANCH_CREDIT_INSTITUTION,
    BRANCH_NON_CREDIT,
    LegalParam,
    RuleError,
    evaluate,
    params_at,
    risk_level,
    safe_eval,
)

RULES = load_rules(settings.seed_dir)
PARAMS = load_legal_params(settings.seed_dir)
ON = date(2026, 11, 20)

BASE = {
    "apr_simple": 10.0, "total_cost": 100_000, "license_found": False, "rate_stated_pct": 10.0,
    "data_access_contacts": False, "requires_upfront_payment": False,
    "third_party_collection": False, "has_rate_and_method": True,
}


def ids(facts, branch=BRANCH_NON_CREDIT):
    return {f.rule_id for f in evaluate(RULES, PARAMS, {**BASE, **facts}, branch, ON)}


def test_safe_eval_blocks_calls_and_attributes():
    for bad in ["__import__('os')", "a.b", "[1,2]", "f(1)"]:
        with pytest.raises(RuleError):
            safe_eval(bad, {"a": 1, "f": print})


def test_safe_eval_logic():
    assert safe_eval("x > 1 and not y", {"x": 2, "y": False}) is True
    assert safe_eval("1 < x <= 3", {"x": 3}) is True


@pytest.mark.parametrize("apr,expected", [(20.0, False), (20.01, True)])
def test_r1_boundary(apr, expected):
    assert ("R1" in ids({"apr_simple": apr})) is expected


@pytest.mark.parametrize("apr,expected", [(99.99, False), (100.0, True)])
def test_r2_boundary(apr, expected):
    assert ("R2" in ids({"apr_simple": apr})) is expected


def test_r3_late_penalty():
    assert "R3" in ids({"late_penalty_apr_pct": 1825.0})
    assert "R3" not in ids({"late_penalty_apr_pct": 30.0})
    assert "R3" not in ids({})  # thiếu dữ kiện → bỏ qua


def test_r4_zero_rate_with_fees():
    assert "R4" in ids({"rate_stated_pct": 0})
    assert "R4" not in ids({"rate_stated_pct": 0, "total_cost": 0})


def test_r5_r6_r7_r8_flags():
    assert "R5" in ids({})
    assert {"R6", "R7", "R8"} <= ids({"data_access_contacts": True, "third_party_collection": True,
                                     "requires_upfront_payment": True})


def test_credit_branch_does_not_use_civil_cap():
    fired = ids({"apr_simple": 300.0, "license_found": True}, BRANCH_CREDIT_INSTITUTION)
    assert not {"R1", "R2", "R5"} & fired


def test_t1_t2_credit_branch():
    fired = ids({"apr_simple": 33.0, "rate_stated_pct": 18.0, "has_rate_and_method": False},
                BRANCH_CREDIT_INSTITUTION)
    assert {"T1", "T2"} <= fired
    assert "T2" not in ids({"apr_simple": 20.0, "rate_stated_pct": 18.0}, BRANCH_CREDIT_INSTITUTION)


def test_params_by_effective_date():
    ps = [LegalParam("cap", 20, date(2017, 1, 1), date(2026, 12, 31), "old"),
          LegalParam("cap", 15, date(2027, 1, 1), None, "new")]
    assert params_at(ps, date(2026, 6, 1))["cap"] == 20
    assert params_at(ps, date(2027, 6, 1))["cap"] == 15


def test_overlapping_params_rejected():
    ps = [LegalParam("cap", 20, date(2017, 1, 1), None, "a"), LegalParam("cap", 15, date(2020, 1, 1), None, "b")]
    with pytest.raises(RuleError):
        params_at(ps, date(2021, 1, 1))


def test_risk_level():
    assert risk_level([]) == "green"
    assert risk_level(evaluate(RULES, PARAMS, {**BASE, "apr_simple": 1000.0}, BRANCH_NON_CREDIT, ON)) == "red"
