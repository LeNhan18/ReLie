# Bug Tracking Log

Ghi mỗi lỗi thật: ngày · triệu chứng · nguyên nhân gốc · cách sửa · test chặn tái phát.

| Ngày | Triệu chứng | Nguyên nhân | Sửa | Test |
|---|---|---|---|---|
| 2026-11-25 | IRR ném ZeroDivisionError với khoản vay 365 ngày | Cận dưới -99%/ngày làm (0.01)^365 underflow về 0 | Đổi cận dưới thành -50%/ngày | `test_ordinary_bank_loan_low_apr` |
| 2026-11-25 | Không nhận ra "Công ty Tài chính TNHH MTV X" là X | Chỉ bóc một tiền tố pháp lý | Bóc lặp mọi tiền tố | `test_normalize_strips_accents_and_legal_prefix` |
