"""Rule engine: quyết định cảnh báo nào được bật. LLM KHÔNG tham gia quyết định này.

- Quy tắc nằm trong data/seed/rules.yaml, tham số luật trong data/seed/legal_params.yaml.
- Tham số được chọn theo NGÀY GIẢI NGÂN của khoản vay (luật áp dụng tại thời điểm giao kết).
- Biểu thức điều kiện được đánh giá bằng một evaluator AST giới hạn, không dùng eval().
"""

from __future__ import annotations

import ast
import operator
from dataclasses import dataclass
from datetime import date
from typing import Any

BRANCH_CREDIT_INSTITUTION = "credit_institution"
BRANCH_NON_CREDIT = "non_credit_institution"
BRANCH_ANY = "any"

_BIN_OPS = {
    ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv,
}
_CMP_OPS = {
    ast.Gt: operator.gt, ast.GtE: operator.ge, ast.Lt: operator.lt, ast.LtE: operator.le,
    ast.Eq: operator.eq, ast.NotEq: operator.ne,
}


class RuleError(ValueError):
    pass


def safe_eval(expr: str, names: dict[str, Any]) -> Any:
    """Đánh giá biểu thức số học/so sánh/logic đơn giản. Tên không tồn tại → RuleError."""

    def ev(node: ast.AST) -> Any:
        if isinstance(node, ast.Expression):
            return ev(node.body)
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float, bool)):
            return node.value
        if isinstance(node, ast.Name):
            if node.id not in names:
                raise RuleError(f"Thiếu biến '{node.id}'")
            return names[node.id]
        if isinstance(node, ast.BinOp) and type(node.op) in _BIN_OPS:
            return _BIN_OPS[type(node.op)](ev(node.left), ev(node.right))
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
            return not ev(node.operand)
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
            return -ev(node.operand)
        if isinstance(node, ast.BoolOp):
            vals = [ev(v) for v in node.values]
            return all(vals) if isinstance(node.op, ast.And) else any(vals)
        if isinstance(node, ast.Compare):
            left = ev(node.left)
            for op, comp in zip(node.ops, node.comparators, strict=True):
                if type(op) not in _CMP_OPS:
                    raise RuleError("Toán tử so sánh không được hỗ trợ")
                right = ev(comp)
                if not _CMP_OPS[type(op)](left, right):
                    return False
                left = right
            return True
        raise RuleError(f"Cú pháp không được phép: {type(node).__name__}")

    try:
        tree = ast.parse(expr, mode="eval")
    except SyntaxError as e:
        raise RuleError(f"Biểu thức sai cú pháp: {expr}") from e
    return ev(tree)


@dataclass(frozen=True)
class LegalParam:
    name: str
    value: float
    effective_from: date
    effective_to: date | None
    source_doc: str


@dataclass(frozen=True)
class Rule:
    rule_id: str
    branch: str
    condition: str
    severity: str  # "red" | "yellow"
    message_template: str
    legal_ref: str


@dataclass(frozen=True)
class FiredRule:
    rule_id: str
    severity: str
    message: str
    legal_ref: str


def params_at(params: list[LegalParam], on: date) -> dict[str, float]:
    """Lấy giá trị tham số có hiệu lực tại ngày `on`."""
    out: dict[str, float] = {}
    for p in params:
        if p.effective_from <= on and (p.effective_to is None or on <= p.effective_to):
            if p.name in out:
                raise RuleError(f"Tham số '{p.name}' có nhiều giá trị hiệu lực cùng ngày {on}")
            out[p.name] = p.value
    return out


def evaluate(
    rules: list[Rule],
    params: list[LegalParam],
    facts: dict[str, Any],
    branch: str,
    on: date,
) -> list[FiredRule]:
    """Chạy các quy tắc thuộc nhánh `branch` (và nhánh "any") với `facts` của khoản vay.

    Quy tắc thiếu dữ kiện thì bỏ qua (không bật), không làm hỏng cả lượt đánh giá.
    """
    p = params_at(params, on)
    names = {**{f"p_{k}": v for k, v in p.items()}, **facts}
    fired: list[FiredRule] = []
    for r in rules:
        if r.branch not in (branch, BRANCH_ANY):
            continue
        try:
            hit = bool(safe_eval(r.condition, names))
        except RuleError:
            continue
        if hit:
            msg_vars = {k: (round(v, 1) if isinstance(v, float) else v) for k, v in names.items()}
            try:
                message = r.message_template.format(**msg_vars)
            except (KeyError, ValueError):
                message = r.message_template
            fired.append(FiredRule(r.rule_id, r.severity, message, r.legal_ref))
    return fired


def risk_level(fired: list[FiredRule]) -> str:
    if any(f.severity == "red" for f in fired):
        return "red"
    if fired:
        return "yellow"
    return "green"
