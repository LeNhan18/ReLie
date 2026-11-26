import { resizeImageToJpegBlob } from "./resizeImage";

export const MAX_UPLOAD_BYTES = 4_000_000;

export const LOAN_FILE_ACCEPT =
  "image/*,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type PreparedUpload = {
  file: Blob | File;
  filename: string;
  mediaKind: "image" | "document";
};

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const LEGACY_WORD_MIMES = new Set<string>([
  "application/msword",
  "application/vnd.ms-word.document.macroenabled.12",
]);

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) {
    return "";
  }
  return filename.slice(dot).toLowerCase();
}

export function classifySelectedFile(
  file: File,
): "image" | "pdf" | "docx" | "legacy_word" | "unsupported" {
  const ext = getExtension(file.name);
  const mime = (file.type || "").toLowerCase();

  if (ext === ".doc" || ext === ".docm" || LEGACY_WORD_MIMES.has(mime)) {
    return "legacy_word";
  }
  if (ext === ".pdf" || mime === PDF_MIME) {
    return "pdf";
  }
  if (ext === ".docx" || mime === DOCX_MIME) {
    return "docx";
  }
  if (
    mime.startsWith("image/") ||
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".png" ||
    ext === ".webp" ||
    ext === ".heic" ||
    ext === ".heif"
  ) {
    return "image";
  }
  return "unsupported";
}

export async function prepareLoanUpload(file: File): Promise<PreparedUpload> {
  if (!file || file.size <= 0) {
    throw new Error(
      "Tệp bạn chọn không có nội dung. Bạn kiểm tra lại hoặc chọn tệp khác nhé.",
    );
  }

  const kind = classifySelectedFile(file);

  if (kind === "legacy_word") {
    throw new Error(
      "Định dạng Word cũ (.doc, .docm) chưa được hỗ trợ để đảm bảo an toàn. Bạn mở tệp rồi chọn Lưu dưới dạng (.docx hoặc .pdf), hoặc chụp ảnh màn hình rồi tải lên nhé.",
    );
  }

  if (kind === "unsupported") {
    throw new Error(
      "AnTâm hiện chỉ hỗ trợ ảnh chụp, tệp PDF (.pdf, tối đa 10 trang) và Word (.docx) với dung lượng tối đa 4 MB.",
    );
  }

  if (kind === "pdf" || kind === "docx") {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        "Tệp tài liệu vượt quá giới hạn 4 MB. Bạn thử nén tệp, giữ tối đa 10 trang hoặc chụp ảnh màn hình phần điều khoản chính nhé.",
      );
    }
    return {
      file,
      filename: file.name || (kind === "pdf" ? "hop_dong.pdf" : "hop_dong.docx"),
      mediaKind: "document",
    };
  }

  const resizedBlob = await resizeImageToJpegBlob(file);
  return {
    file: resizedBlob,
    filename: "contract.jpg",
    mediaKind: "image",
  };
}
