"""Lỗi AI an toàn để hiển thị; không đính kèm dữ liệu tài liệu hoặc lỗi từ SDK."""


class AIUnavailable(RuntimeError):
    pass


class OCRInputError(ValueError):
    pass
