"""So sánh chi phí lịch trả đã xác nhận, không khuyến nghị bên cho vay."""

from collections.abc import Sequence
from dataclasses import dataclass

from antam.schemas.loan import ConfirmedLoan
from antam.tools.calc_true_cost import CashFlow, CashFlowError, CostResult, true_cost


@dataclass
class Comparison:
    costs: list[CostResult]
    cheapest_indices: list[int]


def compare_loans(loans: Sequence[ConfirmedLoan]) -> Comparison:
    """So 2–4 khoản cùng tiền thực nhận, cùng ngày giải ngân.

    Rẻ nhất là tổng tiền trả theo lịch thấp nhất; giữ mọi phương án hòa.
    APR được trả riêng để thấy đánh đổi kỳ hạn. Không tính phí gia hạn
    chưa phát sinh, không xác nhận giấy phép hay khả năng trả nợ.
    Giá mua thẳng và khoản trả trước cần hợp đồng dữ liệu riêng.
    """
    if not 2 <= len(loans) <= 4:
        raise CashFlowError("Cần từ 2 đến 4 phương án để so sánh")
    reference = loans[0]
    costs: list[CostResult] = []
    for loan in loans:
        if (loan.amount_received, loan.disbursed_date) != (reference.amount_received, reference.disbursed_date):
            raise CashFlowError("Chỉ so sánh phương án có cùng tiền thực nhận và ngày giải ngân")
        if not loan.schedule or any(item.amount <= 0 or item.on <= loan.disbursed_date for item in loan.schedule):
            raise CashFlowError("Mỗi kỳ trả phải sau ngày giải ngân và có số tiền dương")
        flows = [CashFlow(loan.disbursed_date, loan.amount_received)]
        flows.extend(CashFlow(item.on, -item.amount) for item in loan.schedule)
        costs.append(true_cost(flows))
    lowest = min(cost.total_repaid for cost in costs)
    return Comparison(costs, [index for index, cost in enumerate(costs) if cost.total_repaid == lowest])
