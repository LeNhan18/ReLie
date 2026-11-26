import type { ChecklistItem } from "@/lib/api";
import { formatIsoDateVi } from "@/lib/format";

export type HarassmentTab = "identify" | "evidence" | "messages";

export type SituationId =
  | "threat_force"
  | "defame_photo"
  | "contacts_spam"
  | "third_party_collector"
  | "upfront_rollover";

export type HarassmentSituation = {
  id: SituationId;
  title: string;
  shortTag: string;
  legalRefs: readonly string[];
  signSummary: string;
  calmExplanation: string;
  safeActions: readonly string[];
};

export type ContactChannelId = "call" | "sms" | "zalo" | "facebook" | "in_person";

export type ContactChannelOption = {
  id: ContactChannelId;
  label: string;
};

export type EvidenceEvent = {
  id: string;
  occurredAt: string;
  channel: ContactChannelId;
  senderInfo: string;
  summary: string;
};

export type MessageTemplateId = "family" | "colleague" | "collector";

export type MessageTemplate = {
  id: MessageTemplateId;
  buttonLabel: string;
  audienceTitle: string;
  guidanceNote: string;
  defaultBody: string;
};

export const HARASSMENT_SITUATIONS: readonly HarassmentSituation[] = [
  {
    id: "threat_force",
    title: "Gọi điện, nhắn tin đe doạ dùng vũ lực hoặc uy hiếp tinh thần",
    shortTag: "Đe doạ an toàn & tinh thần",
    legalRefs: ["Bộ luật Hình sự 2015", "Nghị định 144/2021/NĐ-CP"],
    signSummary:
      "Hành vi có dấu hiệu cưỡng đoạt hoặc uy hiếp tinh thần, gây áp lực vượt quá khuôn khổ giao dịch dân sự.",
    calmExplanation:
      "Quan hệ vay mượn tiền là quan hệ dân sự. Bên cho vay có quyền nhắc khoản nợ đến hạn một cách văn minh, nhưng việc nhắn tin, gọi điện doạ đánh đập, doạ gây thương tích cho bạn hay gia đình có dấu hiệu xâm hại quyền được bảo đảm an toàn về tính mạng, sức khoẻ và tinh thần của công dân.",
    safeActions: [
      "Không đôi co, thách thức hay dùng lời lẽ nóng nảy đáp trả để tránh bị cắt ghép ghi âm gây bất lợi.",
      "Bật ghi âm cuộc gọi (hoặc mở loa ngoài dùng điện thoại thứ hai quay lại màn hình hiện rõ số gọi đến và ngày giờ).",
      "Nếu có người lạ tìm đến tận phòng trọ, nhà riêng đe doạ thân thể: giữ cửa khoá, ở nơi đông người và gọi ngay 113.",
    ],
  },
  {
    id: "defame_photo",
    title: "Cắt ghép ảnh, đăng mạng xã hội bêu riếu bạn hoặc gia đình",
    shortTag: "Ghép ảnh & bôi nhọ danh dự",
    legalRefs: [
      "Bộ luật Dân sự 2015, Điều 32 và Điều 34",
      "Nghị định 15/2020/NĐ-CP",
    ],
    signSummary:
      "Hành vi có dấu hiệu xâm phạm quyền đối với hình ảnh cá nhân và xúc phạm danh dự, nhân phẩm trên mạng xã hội.",
    calmExplanation:
      "Mọi cá nhân đều có quyền đối với hình ảnh và được pháp luật bảo vệ danh dự, uy tín. Việc tự ý lấy ảnh chân dung của bạn hoặc người thân để cắt ghép nội dung sai sự thật, tung lên mạng xã hội nhằm gây sức ép có dấu hiệu xâm phạm quyền nhân thân và đưa thông tin xuyên tạc, xúc phạm uy tín cá nhân.",
    safeActions: [
      "Chụp màn hình nguyên vẹn bài đăng, bình luận, tên tài khoản đăng tải và sao chép đường dẫn (URL) kèm ngày giờ trước khi bấm báo cáo gỡ bài.",
      "Tạm thời khoá bảo vệ trang cá nhân Facebook/Zalo, ẩn danh sách bạn bè và hạn chế người lạ bình luận.",
      "Gửi ngay tin nhắn báo trước (ở Phần 3) để người nhà và đồng nghiệp hiểu rõ sự việc, không hoang mang.",
    ],
  },
  {
    id: "contacts_spam",
    title: "Tự ý lấy danh bạ, gọi quấy rối người thân, tổ trưởng, đồng nghiệp",
    shortTag: "Khai thác danh bạ & quấy rối người quen",
    legalRefs: [
      "Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15",
      "Nghị định 356/2025/NĐ-CP",
    ],
    signSummary:
      "Hành vi có dấu hiệu thu thập, sử dụng trái phép dữ liệu cá nhân và quấy rối người không có nghĩa vụ trả nợ.",
    calmExplanation:
      "Nghĩa vụ thanh toán khoản vay chỉ phát sinh đối với người trực tiếp xác lập giao dịch vay (hoặc người bảo lãnh hợp pháp). Cha mẹ, anh chị em, tổ trưởng hay đồng nghiệp không có trách nhiệm trả thay; việc khai thác danh bạ để gọi điện thúc ép họ có dấu hiệu lạm dụng dữ liệu cá nhân và gây ảnh hưởng đời sống riêng tư.",
    safeActions: [
      "Vào Cài đặt điện thoại tắt ngay quyền truy cập Danh bạ, Tin nhắn, Ảnh và Vị trí của các ứng dụng vay không rõ nguồn gốc.",
      "Lưu lại ảnh chụp màn hình hợp đồng/lịch trả trong app làm bằng chứng trước khi gỡ cài đặt ứng dụng lạ.",
      "Dùng mẫu tin nhắn ở Phần 3 báo trước cho gia đình và quản lý để mọi người chủ động từ chối nghe máy và không chuyển tiền trả hộ.",
    ],
  },
  {
    id: "third_party_collector",
    title: "Công ty/nhóm đòi nợ thuê (bên thứ ba) gọi điện hoặc tìm đến nơi làm việc",
    shortTag: "Bên thứ ba đòi nợ thuê",
    legalRefs: ["Luật Đầu tư 2020, Điều 6 (cấm kinh doanh dịch vụ đòi nợ)"],
    signSummary:
      "Hành vi có dấu hiệu thực hiện dịch vụ đòi nợ thuê thuộc danh mục ngành nghề bị cấm đầu tư kinh doanh.",
    calmExplanation:
      "Theo Luật Đầu tư 2020, kinh doanh dịch vụ đòi nợ đã bị cấm hoàn toàn tại Việt Nam. Các nhóm tự xưng 'công ty thu hồi nợ bên thứ ba' hoặc kéo người đến công xưởng, nơi làm việc gây sức ép, làm mất trật tự có dấu hiệu hoạt động ngành nghề bị cấm và gây rối trật tự nơi công cộng.",
    safeActions: [
      "Đề nghị người liên hệ nêu rõ họ tên, tổ chức chủ quản và văn bản uỷ quyền hợp pháp; tuyệt đối không đi theo người lạ ra chỗ vắng.",
      "Nếu có người lạ xuất hiện tại cổng công ty hoặc khu trọ: báo ngay cho bảo vệ, tổ trưởng dân phố và Công an xã/phường sở tại.",
      "Ghi nhận lại biển số xe (nếu có), thời gian, số người và nội dung trao đổi vào Sổ bằng chứng ở Phần 2.",
    ],
  },
  {
    id: "upfront_rollover",
    title: "Ép chuyển tiền phí trước hoặc vay sang app khác cùng nhóm để đảo nợ",
    shortTag: "Thu phí trước & ép vay đảo nợ",
    legalRefs: ["Bộ luật Dân sự 2015, Điều 468"],
    signSummary:
      "Hành vi có dấu hiệu áp đặt chi phí vượt trần lãi suất dân sự hoặc dẫn dụ đóng phí trước bất thường.",
    calmExplanation:
      "Theo Điều 468 Bộ luật Dân sự 2015, lãi suất vay dân sự ngoài tổ chức tín dụng có mức trần 20%/năm; phần lãi và phí trá hình vượt quá giới hạn này không được pháp luật bảo hộ. Việc ép đóng 'phí gia hạn', 'phí xoá hồ sơ' vào tài khoản cá nhân hoặc xúi giục tải thêm app khác cùng nhóm chỉ khiến số nợ phình gấp nhiều lần mà tiền gốc không giảm.",
    safeActions: [
      "Dừng ngay việc chuyển thêm các khoản 'phí gia hạn', 'phí giải ngân' vào tài khoản cá nhân không trùng tên pháp nhân cho vay.",
      "Không cài đặt thêm bất kỳ ứng dụng vay mới nào theo đường dẫn do người nhắc nợ gửi sang.",
      "Sao lưu biên lai ngân hàng thể hiện đúng số tiền gốc bạn thực nhận ban đầu, sau đó sang mục 'Tôi đã lỡ vay' để tách rõ gốc và lãi trong trần.",
    ],
  },
] as const;

export const SAFETY_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "safety-keep-calm",
    text: "Giữ bình tĩnh, không cãi vã hay đe doạ ngược lại để tránh bị ghi âm cắt ghép gây bất lợi.",
  },
  {
    id: "safety-preserve-evidence",
    text: "Chụp màn hình tin nhắn, nhật ký cuộc gọi và lưu file ghi âm (giữ nguyên số điện thoại và ngày giờ gốc).",
  },
  {
    id: "safety-revoke-permissions",
    text: "Tắt quyền Danh bạ, Ảnh, Vị trí của app lạ trong Cài đặt máy (chụp lưu thông tin khoản vay trước khi gỡ app).",
  },
  {
    id: "safety-stop-rollover",
    text: "Không chuyển thêm 'phí gia hạn/phí hồ sơ' cho tài khoản cá nhân lạ và không tải app mới để đảo nợ.",
  },
  {
    id: "safety-inform-contacts",
    text: "Nhắn báo trước cho bố mẹ, người thân và quản lý để không ai hoảng sợ hoặc tự ý chuyển tiền trả thay.",
  },
];

export const CONTACT_CHANNELS: readonly ContactChannelOption[] = [
  { id: "call", label: "Cuộc gọi" },
  { id: "sms", label: "Tin nhắn SMS" },
  { id: "zalo", label: "Zalo" },
  { id: "facebook", label: "Facebook" },
  { id: "in_person", label: "Trực tiếp" },
] as const;

export const SAMPLE_EVIDENCE_EVENTS: readonly EvidenceEvent[] = [
  {
    id: "sample-ev-1",
    occurredAt: "2026-11-24T09:15",
    channel: "zalo",
    senderInfo: "Tài khoản Zalo 'Hỗ Trợ Hồ Sơ Nhanh' (đầu số 0909xxx412)",
    summary:
      "Gửi ảnh chân dung của tôi bị ghép chữ sai sự thật, gây sức ép yêu cầu trước 12h00 phải chuyển 1.800.000 đ gọi là 'phí gia hạn', nếu không sẽ gửi ảnh cho danh bạ.",
  },
  {
    id: "sample-ev-2",
    occurredAt: "2026-11-24T14:40",
    channel: "call",
    senderInfo: "Đầu số lạ 0898xxx735 (gọi liên tiếp 8 cuộc trong 25 phút)",
    summary:
      "Tự xưng bộ phận thu hồi nợ bên thứ ba, gọi điện cho tổ trưởng chuyền sản xuất nơi tôi làm việc để gây áp lực và nói lời lẽ xúc phạm danh dự.",
  },
] as const;

export const MESSAGE_TEMPLATES: readonly MessageTemplate[] = [
  {
    id: "family",
    buttonLabel: "1. Nhắn cho bố mẹ / người thân trong nhà",
    audienceTitle: "Mẫu tin nhắn gửi bố mẹ, vợ/chồng hoặc người thân trong gia đình",
    guidanceNote:
      "Nên gửi ngay khi thấy đối phương nhắc tới danh bạ để người nhà yên tâm, không hoảng loạn và tuyệt đối không chuyển tiền hộ khi số lạ gọi doạ.",
    defaultBody:
      "Bố mẹ / cả nhà ơi, con xin phép báo trước việc này để nhà mình yên tâm ạ. Hiện thông tin liên lạc trên điện thoại của con có dấu hiệu bị một bên cho vay qua mạng khai thác để gọi điện làm phiền người quen. Con đang chủ động thu thập bằng chứng và xử lý đúng theo quy định pháp luật rồi ạ. Nếu có số lạ gọi đến nói chuyện nợ nần, doạ nạt hoặc gửi hình ảnh cắt ghép, bố mẹ và cả nhà cứ bình tĩnh cúp máy, chặn số luôn và TUYỆT ĐỐI KHÔNG chuyển bất kỳ khoản tiền nào cho họ nhé. Cần kiểm tra gì cả nhà cứ gọi trực tiếp cho con ạ.",
  },
  {
    id: "colleague",
    buttonLabel: "2. Nhắn cho tổ trưởng / quản lý / đồng nghiệp",
    audienceTitle: "Mẫu lời nhắn gửi tổ trưởng, quản lý nhân sự hoặc đồng nghiệp",
    guidanceNote:
      "Giúp nơi làm việc hiểu bạn đang xử lý nghiêm túc sự cố rò rỉ dữ liệu cá nhân, tránh tâm lý ngại ngùng và hướng dẫn đồng nghiệp từ chối cuộc gọi quấy rối.",
    defaultBody:
      "Chào anh/chị và mọi người ạ, em xin phép nhắn trước và rất mong anh/chị thông cảm. Điện thoại của em vừa gặp sự cố lộ thông tin danh bạ nên có thể xuất hiện một vài cuộc gọi tự động hoặc số lạ gọi tới làm phiền người cùng cơ quan về việc cá nhân của em. Em đang làm việc để giải quyết dứt điểm và lập hồ sơ trình báo cơ quan chức năng tại địa phương. Nếu có số lạ gọi hỏi hoặc nói lời khiếm nhã, nhờ anh/chị báo 'không liên quan' rồi cúp máy và chặn số giúp em nhé. Em cảm ơn anh/chị nhiều ạ!",
  },
  {
    id: "collector",
    buttonLabel: "3. Tin nhắn phản hồi ngắn gọn gửi bên nhắc nợ",
    audienceTitle: "Mẫu phản hồi văn minh, đúng luật gửi bên nhắc nợ",
    guidanceNote:
      "Thể hiện rõ thiện chí làm việc trên số tiền gốc thực nhận đúng quy định dân sự, đồng thời yêu cầu dừng ngay việc làm phiền người không liên quan.",
    defaultBody:
      "Tôi xác nhận có thiện chí làm việc và thực hiện nghĩa vụ thanh toán đối với khoản tiền gốc thực nhận cùng mức lãi, phí nằm trong giới hạn quy định của Bộ luật Dân sự 2015. Đề nghị quý đơn vị cung cấp thông tin pháp nhân rõ ràng, bảng đối chiếu số tiền gốc thực nhận và tài khoản chính thức của đơn vị cho vay để trao đổi văn minh. Đồng thời, đề nghị chấm dứt ngay việc gọi điện đe doạ, cắt ghép hình ảnh hoặc liên hệ người thân, đồng nghiệp không có nghĩa vụ liên quan. Mọi tin nhắn và cuộc gọi đều đang được tôi lưu giữ nguyên trạng để làm việc với cơ quan chức năng khi cần thiết.",
  },
] as const;

export function getChannelLabel(channelId: ContactChannelId): string {
  const found = CONTACT_CHANNELS.find((item) => item.id === channelId);
  return found ? found.label : channelId;
}

export function formatDateTimeVi(isoLocal: string): string {
  const trimmed = isoLocal.trim();
  if (!trimmed) {
    return "Chưa rõ thời điểm";
  }
  const [datePart, timePart] = trimmed.split("T");
  if (!datePart) {
    return trimmed;
  }
  const formattedDate = formatIsoDateVi(datePart);
  if (!timePart) {
    return formattedDate;
  }
  const hhmm = timePart.slice(0, 5);
  return `${hhmm} ngày ${formattedDate}`;
}

export function sortEventsChronologically(
  events: readonly EvidenceEvent[],
): EvidenceEvent[] {
  return [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

export function getCurrentLocalDateTimeInput(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function buildReportText(
  events: readonly EvidenceEvent[],
  selectedIds: readonly SituationId[],
): string {
  const sorted = sortEventsChronologically(events);
  const selectedSituations = HARASSMENT_SITUATIONS.filter((item) =>
    selectedIds.includes(item.id),
  );

  const situationLines =
    selectedSituations.length > 0
      ? selectedSituations
          .map(
            (s, idx) =>
              `   ${idx + 1}. ${s.title} (${s.signSummary} — Căn cứ tham chiếu: ${s.legalRefs.join("; ")}).`,
          )
          .join("\n")
      : "   - Bị gọi điện, nhắn tin gây sức ép tinh thần hoặc làm phiền đời sống sinh hoạt liên quan đến khoản vay dân sự.";

  const timelineLines =
    sorted.length > 0
      ? sorted
          .map(
            (ev, idx) =>
              `   ${idx + 1}. Vào lúc ${formatDateTimeVi(ev.occurredAt)} — Qua kênh: ${getChannelLabel(ev.channel)}\n      - Đối tượng / đầu số liên hệ: ${ev.senderInfo.trim() || "(Chưa ghi rõ)"}\n      - Tóm tắt nội dung sự việc: ${ev.summary.trim() || "(Chưa ghi rõ)"}`,
          )
          .join("\n\n")
      : "   (Chưa có mốc sự việc nào được thêm. Bạn hãy bấm 'Điền thử 2 mốc sự việc mẫu' hoặc thêm từng sự việc ở khung bên trên để tự động lập danh mục.)";

  return [
    "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
    "Độc lập - Tự do - Hạnh phúc",
    "----------------------------------------",
    "",
    "BẢN TÓM TẮT SỰ VIỆC & DANH MỤC BẰNG CHỨNG",
    "(Dùng để trình bày trực tiếp tại Công an xã/phường nơi cư trú hoặc lưu hồ sơ bảo vệ cá nhân)",
    "",
    "Kính gửi: Công an xã/phường .................................................",
    "",
    "1. THÔNG TIN NGƯỜI TRÌNH BÀY (điền trên bản lưu cá nhân khi nộp trực tiếp):",
    "- Họ và tên: ...................................................................",
    "- Nơi thường trú / tạm trú hiện tại: ...........................................",
    "- Số điện thoại liên hệ: .......................................................",
    "(Lưu ý bảo mật của AnTâm: Không nhập số CCCD hoặc số tài khoản ngân hàng trên trình duyệt dùng chung).",
    "",
    "2. TÓM TẮT CÁC DẤU HIỆU ĐANG GẶP PHẢI:",
    "Trong thời gian gần đây, liên quan đến một giao dịch vay tiền, tôi và những người xung quanh liên tục gặp các hành vi gây áp lực có dấu hiệu vượt quá khuôn khổ pháp luật cho phép, cụ thể:",
    situationLines,
    "",
    "3. DANH MỤC SỰ VIỆC & BẰNG CHỨNG THEO DÒNG THỜI GIAN:",
    timelineLines,
    "",
    "4. TÀI LIỆU / BẰNG CHỨNG ĐÍNH KÈM (nếu nộp trực tiếp):",
    "- [ ] Ảnh chụp màn hình tin nhắn, bài đăng mạng xã hội (giữ nguyên ngày giờ, tên tài khoản/số điện thoại).",
    "- [ ] Nhật ký cuộc gọi đến và tệp ghi âm cuộc gọi đe doạ, gây sức ép.",
    "- [ ] Sao kê / biên lai ngân hàng thể hiện số tiền gốc thực tế đã nhận.",
    "",
    "5. CAM KẾT & KIẾN NGHỊ:",
    "Tôi xin cam đoan những sự việc trình bày trên là đúng sự thật. Đối với khoản vay dân sự, tôi luôn giữ thiện chí làm việc để giải quyết phần tiền gốc thực nhận và lãi suất trong giới hạn theo quy định của Bộ luật Dân sự 2015.",
    "Kính đề nghị Quý Cơ quan xem xét, hướng dẫn và có biện pháp ngăn chặn kịp thời các hành vi đe doạ, cắt ghép hình ảnh, quấy rối nêu trên nhằm bảo đảm an toàn cho bản thân tôi, gia đình và trật tự tại địa phương.",
    "",
    "..........., ngày .... tháng .... năm 2026",
    "Người trình bày",
    "(Ký và ghi rõ họ tên)",
  ].join("\n");
}

export async function copyTextSafely(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Chuyển sang phương án sao chép dự phòng bên dưới
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  try {
    const tempArea = document.createElement("textarea");
    tempArea.value = text;
    tempArea.setAttribute("readonly", "true");
    tempArea.style.position = "fixed";
    tempArea.style.top = "-9999px";
    tempArea.style.left = "-9999px";
    document.body.appendChild(tempArea);
    tempArea.focus();
    tempArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(tempArea);
    return copied;
  } catch {
    return false;
  }
}

export function downloadTextFile(filename: string, content: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
    return true;
  } catch {
    return false;
  }
}
