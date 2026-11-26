"""Model chính thức PaddleOCR-VL 1.6; ảnh chỉ truyền bằng ndarray trong bộ nhớ."""

import os
from io import BytesIO
from threading import Lock
from warnings import catch_warnings, simplefilter

from antam.ai.errors import AIUnavailable, OCRInputError
from antam.config import settings

MODEL_ID = "PaddlePaddle/PaddleOCR-VL-1.6"
MAX_PIXELS = 16_000_000
MAX_TEXT_CHARS = 50_000
_lock = Lock()
_pipeline = None


def _new_pipeline():
    try:
        # Device đã chọn phải chạy được; không âm thầm đổi sang CPU.
        os.environ["PADDLE_PDX_DISABLE_DEVICE_FALLBACK"] = "True"
        from paddleocr import PaddleOCRVL

        return PaddleOCRVL(
            pipeline_version="v1.6", device=settings.paddle_device,
            use_doc_orientation_classify=False, use_doc_unwarping=False,
        )
    except Exception:
        raise AIUnavailable(
            "Chưa khởi động được chức năng đọc hợp đồng; vui lòng thử lại sau hoặc nhập số liệu.",
        ) from None


def _decode_image(image_bytes: bytes):
    try:
        import numpy as np
        from PIL import Image, UnidentifiedImageError
    except ImportError:
        raise AIUnavailable("Chức năng đọc ảnh chưa sẵn sàng; vui lòng thử lại sau hoặc nhập số liệu.") from None
    try:
        with catch_warnings():
            simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(image_bytes)) as image:
                if image.format not in {"JPEG", "PNG", "WEBP"} or getattr(image, "n_frames", 1) != 1:
                    raise OCRInputError("Vui lòng gửi ảnh JPEG, PNG hoặc WebP một trang.")
                if image.width * image.height > MAX_PIXELS:
                    raise OCRInputError("Ảnh có độ phân giải quá lớn; vui lòng thu nhỏ trước khi đọc.")
                # Paddle sử dụng BGR; không tạo đường dẫn hoặc file ảnh tạm.
                return np.array(image.convert("RGB"))[:, :, ::-1].copy()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise OCRInputError("Không đọc được ảnh; vui lòng chọn ảnh hợp lệ khác.") from None


def read_image(image_bytes: bytes) -> str:
    """Trả Markdown OCR, không lưu ảnh/Markdown, không in kết quả SDK."""
    global _pipeline
    if not _lock.acquire(blocking=False):
        raise AIUnavailable("OCR đang xử lý tài liệu khác; vui lòng thử lại sau.")
    try:
        image = _decode_image(image_bytes)
        if _pipeline is None:
            _pipeline = _new_pipeline()
        parts: list[str] = []
        length = 0
        for result in _pipeline.predict(image, use_queues=False, max_new_tokens=4096):
            markdown = result.markdown
            text = markdown.get("markdown_texts") if isinstance(markdown, dict) else None
            if not isinstance(text, str):
                raise AIUnavailable("Model OCR trả kết quả không hợp lệ.")
            length += len(text)
            if length > MAX_TEXT_CHARS:
                raise OCRInputError("Văn bản OCR quá dài; vui lòng chia nhỏ tài liệu.")
            parts.append(text)
        text = "\n\n".join(parts).strip()
        if not text:
            raise OCRInputError("Chưa đọc được chữ từ ảnh; vui lòng chụp rõ hơn hoặc nhập văn bản.")
        return text
    except (AIUnavailable, OCRInputError):
        raise
    except Exception:
        raise AIUnavailable("Chưa đọc được ảnh; vui lòng thử lại sau hoặc nhập số liệu.") from None
    finally:
        _lock.release()
