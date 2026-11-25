const INVALID_FILE_MESSAGE =
  "Tệp bạn chọn không phải là ảnh hợp lệ. Bạn chọn lại ảnh chụp hợp đồng hoặc màn hình app nhé.";
const CORRUPT_IMAGE_MESSAGE =
  "Ảnh bị lỗi hoặc không đọc được. Bạn thử chụp lại rõ nét và đủ sáng nhé.";
const MAX_SAFE_BYTES = 3_800_000;
const HARD_LIMIT_BYTES = 4_000_000;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        reject(new Error(CORRUPT_IMAGE_MESSAGE));
        return;
      }
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(CORRUPT_IMAGE_MESSAGE));
    };

    img.src = objectUrl;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size === 0) {
          reject(new Error(CORRUPT_IMAGE_MESSAGE));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

export async function resizeImageToJpegBlob(
  file: File,
  maxEdge = 1600,
): Promise<Blob> {
  if (!file || !file.type.startsWith("image/") || file.size <= 0) {
    throw new Error(INVALID_FILE_MESSAGE);
  }

  const img = await loadImageFromFile(file);
  const { naturalWidth, naturalHeight } = img;
  const longestEdge = Math.max(naturalWidth, naturalHeight);

  let targetWidth = naturalWidth;
  let targetHeight = naturalHeight;

  if (longestEdge > maxEdge) {
    const scale = maxEdge / longestEdge;
    targetWidth = Math.max(1, Math.round(naturalWidth * scale));
    targetHeight = Math.max(1, Math.round(naturalHeight * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error(
        "Trình duyệt trên máy chưa hỗ trợ xử lý ảnh. Bạn thử chọn mẫu hoặc tự nhập thông tin nhé.",
      );
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    let blob = await canvasToJpegBlob(canvas, 0.85);
    if (blob.size > MAX_SAFE_BYTES) {
      blob = await canvasToJpegBlob(canvas, 0.7);
    }
    if (blob.size > HARD_LIMIT_BYTES) {
      throw new Error(
        "Ảnh có dung lượng quá lớn. Bạn thử chụp lại gần phần chữ trên hợp đồng nhé.",
      );
    }

    return blob;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
