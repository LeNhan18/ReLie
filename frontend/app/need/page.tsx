"use client";

import { useRef, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { OptionCard } from "@/components/OptionCard";
import { PageHeader } from "@/components/PageHeader";
import {
  api,
  formatIsoDateVi,
  type AmountBand,
  type BadDebtStatus,
  type NeedProfile,
  type NeedPurpose,
  type Option,
} from "@/lib/api";
import {
  buildCleanDraftValues,
  DraftScreen,
  getFieldsForOption,
  type DraftFieldKey,
  type DraftFieldValues,
} from "./DraftScreen";
import {
  AmountIcon,
  DeadlineIcon,
  HarmReductionBlock,
  PurposeIcon,
  RejectedSupportBlock,
  type DeadlineIconKey,
} from "./NeedSupportBlocks";

type Screen = "q1" | "q2" | "q3" | "q4" | "results" | "draft";

const PURPOSE_OPTIONS: readonly {
  value: NeedPurpose;
  label: string;
  shortLabel: string;
  hint: string;
}[] = [
  {
    value: "hoc_phi",
    label: "Đóng học phí",
    shortLabel: "Học phí",
    hint: "Tiền học, tiền trường lớp cho con hoặc bản thân",
  },
  {
    value: "tien_nha",
    label: "Trả tiền nhà, điện nước",
    shortLabel: "Tiền nhà",
    hint: "Tiền phòng trọ, điện nước sinh hoạt đến kỳ",
  },
  {
    value: "vien_phi",
    label: "Đóng viện phí, thuốc men",
    shortLabel: "Viện phí",
    hint: "Chi phí khám chữa bệnh, chăm sóc sức khỏe gia đình",
  },
  {
    value: "tra_no_cu",
    label: "Trả khoản nợ đang đến hạn",
    shortLabel: "Nợ đến hạn",
    hint: "Khoản vay hoặc trả góp sắp tới ngày đóng",
  },
  {
    value: "khac",
    label: "Việc gia đình / chi tiêu khác",
    shortLabel: "Việc khác",
    hint: "Chi phí thiết yếu đột xuất khác trong gia đình",
  },
];

const AMOUNT_OPTIONS: readonly {
  value: AmountBand;
  label: string;
  shortLabel: string;
  hint: string;
}[] = [
  {
    value: "duoi_5tr",
    label: "Dưới 5 triệu đồng",
    shortLabel: "Dưới 5 triệu",
    hint: "Khoản vừa phải, thường dễ xin giãn hạn hoặc tạm ứng lương",
  },
  {
    value: "5_20tr",
    label: "Từ 5 đến 20 triệu đồng",
    shortLabel: "5 – 20 triệu",
    hint: "Có thể kết hợp đóng từng đợt và kênh hỗ trợ hợp pháp",
  },
  {
    value: "tren_20tr",
    label: "Trên 20 triệu đồng",
    shortLabel: "Trên 20 triệu",
    hint: "Khoản lớn, nên ưu tiên kênh chính thống kỳ hạn dài",
  },
];

const DEADLINE_OPTIONS: readonly {
  key: DeadlineIconKey;
  daysOffset: number | null;
  label: string;
  shortLabel: string;
  hint: string;
}[] = [
  {
    key: "1d",
    daysOffset: 1,
    label: "Ngay hôm nay hoặc ngày mai",
    shortLabel: "Trong 1 ngày",
    hint: "Rất gấp — ưu tiên mở lời xin lùi hạn ngay trong ngày",
  },
  {
    key: "3d",
    daysOffset: 3,
    label: "Trong 3 ngày tới",
    shortLabel: "Trong 3 ngày",
    hint: "Kịp thương lượng chia đợt hoặc xin ứng lương",
  },
  {
    key: "7d",
    daysOffset: 7,
    label: "Trong 1 tuần tới",
    shortLabel: "Trong 1 tuần",
    hint: "Đủ thời gian hỏi công đoàn hoặc kênh vi mô hợp pháp",
  },
  {
    key: "14d",
    daysOffset: 14,
    label: "Trong 2 tuần tới",
    shortLabel: "Trong 2 tuần",
    hint: "Thong thả chuẩn bị hồ sơ kênh vay có giấy phép nếu cần",
  },
  {
    key: "none",
    daysOffset: null,
    label: "Chưa có hạn cố định",
    shortLabel: "Chưa cố định",
    hint: "Đang tìm hiểu trước để chủ động phương án an toàn",
  },
];

const TRI_BOOLEAN_OPTIONS: readonly { value: boolean | null; label: string }[] = [
  { value: true, label: "Có" },
  { value: false, label: "Không" },
  { value: null, label: "Chưa rõ" },
];

const BAD_DEBT_OPTIONS: readonly { value: BadDebtStatus; label: string }[] = [
  { value: "khong", label: "Không có" },
  { value: "co", label: "Đang có" },
  { value: "khong_biet", label: "Không biết" },
];

function addDaysLocalIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getQuestionNumber(screen: Screen): number | null {
  switch (screen) {
    case "q1":
      return 1;
    case "q2":
      return 2;
    case "q3":
      return 3;
    case "q4":
      return 4;
    default:
      return null;
  }
}

function getHeaderCopy(screen: Exclude<Screen, "draft">): {
  badge: string;
  title: string;
  subtitle: string;
} {
  switch (screen) {
    case "q1":
      return {
        badge: "Ưu tiên phương án 0 đồng · Không cần định danh",
        title: "Bạn đang cần tiền cho việc gì?",
        subtitle:
          "Chọn việc đang gấp nhất để AnTâm tìm hướng nhẹ nhàng, ít tốn kém nhất cho bạn.",
      };
    case "q2":
      return {
        badge: "Ước chừng khoảng tiền",
        title: "Bạn đang thiếu khoảng bao nhiêu tiền?",
        subtitle:
          "Bạn chỉ cần chọn khoảng gần đúng nhất, không cần nhập con số chi tiết.",
      };
    case "q3":
      return {
        badge: "Mốc thời gian cần xoay xở",
        title: "Khi nào bạn cần khoản tiền này?",
        subtitle: "Chọn thời hạn để biết những cách nào kịp giải quyết cho bạn.",
      };
    case "q4":
      return {
        badge: "Hoàn cảnh hiện tại · Có thể bỏ qua",
        title: "Tình hình hiện tại của bạn?",
        subtitle:
          "Giúp lọc đúng nơi có khả năng hỗ trợ cao, tránh mất công nộp hồ sơ không hợp lệ.",
      };
    case "results":
      return {
        badge: "Xếp theo chi phí thấp nhất trước",
        title: "Các hướng phù hợp với bạn",
        subtitle:
          "Ưu tiên thử phương án không cần vay (0đ) trước để không phải gánh thêm lãi và phí.",
      };
  }
}

function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0 });
  }
}

export default function NeedPage() {
  const [screen, setScreen] = useState<Screen>("q1");

  const [purpose, setPurpose] = useState<NeedPurpose | null>(null);
  const [amountBand, setAmountBand] = useState<AmountBand | null>(null);
  const [deadlineKey, setDeadlineKey] = useState<DeadlineIconKey | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);

  const [hasSalary, setHasSalary] = useState<boolean | null>(null);
  const [hasAsset, setHasAsset] = useState<boolean | null>(null);
  const [badDebt, setBadDebt] = useState<BadDebtStatus>("khong_biet");

  const [options, setOptions] = useState<Option[] | null>(null);
  const [note, setNote] = useState<string>("");
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);
  const [resultsError, setResultsError] = useState<string>("");

  const [draftOption, setDraftOption] = useState<Option | null>(null);
  const [draftFields, setDraftFields] = useState<DraftFieldValues>({});
  const [draftText, setDraftText] = useState<string>("");
  const [draftLoading, setDraftLoading] = useState<boolean>(false);
  const [draftError, setDraftError] = useState<string>("");

  const optionsReqIdRef = useRef<number>(0);
  const draftReqIdRef = useRef<number>(0);

  function goToScreen(next: Screen) {
    setScreen(next);
    scrollToTop();
  }

  function handleSelectPurpose(val: NeedPurpose) {
    setPurpose(val);
    goToScreen("q2");
  }

  function handleSelectAmount(val: AmountBand) {
    setAmountBand(val);
    goToScreen("q3");
  }

  function handleSelectDeadline(key: DeadlineIconKey, daysOffset: number | null) {
    setDeadlineKey(key);
    setDeadline(daysOffset === null ? null : addDaysLocalIso(daysOffset));
    goToScreen("q4");
  }

  async function runFetchOptions(profile: NeedProfile) {
    const reqId = ++optionsReqIdRef.current;
    setResultsLoading(true);
    setResultsError("");
    setScreen("results");
    scrollToTop();

    try {
      const res = await api.needOptions(profile);
      if (reqId !== optionsReqIdRef.current) return;
      setOptions(res.options);
      setNote(res.note);
    } catch (err) {
      if (reqId !== optionsReqIdRef.current) return;
      setResultsError(
        err instanceof Error
          ? err.message
          : "Chưa tải được danh sách phương án. Bạn kiểm tra mạng rồi thử lại nhé.",
      );
    } finally {
      if (reqId === optionsReqIdRef.current) {
        setResultsLoading(false);
      }
    }
  }

  async function fetchOptions() {
    if (!purpose || !amountBand) {
      goToScreen("q1");
      return;
    }

    await runFetchOptions({
      purpose,
      amount_band: amountBand,
      deadline,
      has_salary: hasSalary,
      has_asset: hasAsset,
      bad_debt: badDebt,
    });
  }

  async function handleSkipQ4AndFetch() {
    if (!purpose || !amountBand) {
      goToScreen("q1");
      return;
    }

    setHasSalary(null);
    setHasAsset(null);
    setBadDebt("khong_biet");

    await runFetchOptions({
      purpose,
      amount_band: amountBand,
      deadline,
      has_salary: null,
      has_asset: null,
      bad_debt: "khong_biet",
    });
  }

  function handleQuickDemoChiHoa() {
    const sampleDeadline = addDaysLocalIso(3);
    setPurpose("hoc_phi");
    setAmountBand("duoi_5tr");
    setDeadlineKey("3d");
    setDeadline(sampleDeadline);
    setHasSalary(true);
    setHasAsset(true);
    setBadDebt("khong");

    void runFetchOptions({
      purpose: "hoc_phi",
      amount_band: "duoi_5tr",
      deadline: sampleDeadline,
      has_salary: true,
      has_asset: true,
      bad_debt: "khong",
    });
  }

  async function requestDraft(option: Option, fieldsToSend: DraftFieldValues) {
    const reqId = ++draftReqIdRef.current;
    setDraftLoading(true);
    setDraftError("");

    try {
      const res = await api.draft(option.option_id, buildCleanDraftValues(fieldsToSend));
      if (reqId !== draftReqIdRef.current) return;
      setDraftText(res.text);
    } catch (err) {
      if (reqId !== draftReqIdRef.current) return;
      setDraftError(
        err instanceof Error
          ? err.message
          : "Chưa soạn được tin nhắn lúc này. Bạn kiểm tra mạng rồi thử lại nhé.",
      );
    } finally {
      if (reqId === draftReqIdRef.current) {
        setDraftLoading(false);
      }
    }
  }

  function handleOpenDraft(option: Option) {
    const initialFields: DraftFieldValues = {};
    const supportedFields = getFieldsForOption(option.option_id);
    const usesHanMoi = supportedFields.some((f) => f.key === "han_moi");

    if (usesHanMoi && deadline) {
      initialFields.han_moi = formatIsoDateVi(deadline);
    }

    setDraftOption(option);
    setDraftFields(initialFields);
    setDraftText("");
    setDraftError("");
    setScreen("draft");
    scrollToTop();

    void requestDraft(option, initialFields);
  }

  function handleDraftFieldChange(key: DraftFieldKey, value: string) {
    setDraftFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleApplyPresetFields(nextFields: DraftFieldValues) {
    setDraftFields(nextFields);
    if (draftOption) {
      void requestDraft(draftOption, nextFields);
    }
  }

  function handleRestartFromScratch() {
    optionsReqIdRef.current += 1;
    draftReqIdRef.current += 1;
    setPurpose(null);
    setAmountBand(null);
    setDeadlineKey(null);
    setDeadline(null);
    setHasSalary(null);
    setHasAsset(null);
    setBadDebt("khong_biet");
    setOptions(null);
    setNote("");
    setResultsError("");
    setResultsLoading(false);
    goToScreen("q1");
  }

  if (screen === "draft" && draftOption) {
    return (
      <DraftScreen
        option={draftOption}
        draftText={draftText}
        onDraftTextChange={setDraftText}
        fields={draftFields}
        onFieldChange={handleDraftFieldChange}
        onApplyPresetFields={handleApplyPresetFields}
        isLoading={draftLoading}
        error={draftError}
        onRegenerate={() => void requestDraft(draftOption, draftFields)}
        onBack={() => {
          draftReqIdRef.current += 1;
          setDraftLoading(false);
          goToScreen("results");
        }}
      />
    );
  }

  const activeScreen: Exclude<Screen, "draft"> = screen === "draft" ? "q1" : screen;
  const questionNum = getQuestionNumber(activeScreen);
  const headerCopy = getHeaderCopy(activeScreen);

  const selectedPurposeItem = PURPOSE_OPTIONS.find((item) => item.value === purpose) ?? null;
  const selectedAmountItem = AMOUNT_OPTIONS.find((item) => item.value === amountBand) ?? null;
  const selectedDeadlineItem = DEADLINE_OPTIONS.find((item) => item.key === deadlineKey) ?? null;

  const summaryChips: {
    step: 1 | 2 | 3 | 4;
    targetScreen: Screen;
    text: string;
  }[] = [];

  if (selectedPurposeItem && activeScreen !== "q1") {
    summaryChips.push({
      step: 1,
      targetScreen: "q1",
      text: `1. ${selectedPurposeItem.shortLabel}`,
    });
  }
  if (selectedAmountItem && activeScreen !== "q1" && activeScreen !== "q2") {
    summaryChips.push({
      step: 2,
      targetScreen: "q2",
      text: `2. ${selectedAmountItem.shortLabel}`,
    });
  }
  if (
    selectedDeadlineItem &&
    activeScreen !== "q1" &&
    activeScreen !== "q2" &&
    activeScreen !== "q3"
  ) {
    const dateSuffix = deadline ? ` (${formatIsoDateVi(deadline)})` : "";
    summaryChips.push({
      step: 3,
      targetScreen: "q3",
      text: `3. ${selectedDeadlineItem.shortLabel}${dateSuffix}`,
    });
  }
  if (activeScreen === "results") {
    summaryChips.push({
      step: 4,
      targetScreen: "q4",
      text: "4. Hoàn cảnh",
    });
  }

  const firstNoLoanOption =
    options?.find((item) => item.kind === "no_loan") ?? null;

  return (
    <div className="space-y-5 pb-4">
      <PageHeader
        backHref="/"
        backLabel="Về trang chủ"
        badge={headerCopy.badge}
        title={headerCopy.title}
        subtitle={headerCopy.subtitle}
        rightSlot={
          questionNum !== null ? (
            <span className="inline-flex min-h-[40px] items-center rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-base font-semibold text-teal-900 tabular-nums">
              Câu {questionNum} / 4
            </span>
          ) : null
        }
      />

      {questionNum !== null ? (
        <div aria-hidden="true" className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2.5 rounded-full transition-colors ${
                step <= questionNum ? "bg-teal-700" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      ) : null}

      {/* Dải tóm tắt các câu đã chọn — bấm quay lại nhanh bất kỳ câu 1-3 (và câu 4 khi ở kết quả) */}
      {summaryChips.length > 0 ? (
        <nav
          aria-label="Các câu trả lời đã chọn — chạm để đổi ý nhanh"
          className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-3"
        >
          <p className="px-1 text-base font-medium text-teal-950">
            Đã chọn (chạm vào thẻ bất kỳ để đổi ý ngay):
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {summaryChips.map((chip) => (
              <button
                key={chip.step}
                type="button"
                onClick={() => goToScreen(chip.targetScreen)}
                className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border border-teal-300 bg-white px-3.5 py-2 text-base font-semibold text-teal-950 shadow-sm transition hover:border-teal-600 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100"
              >
                <span>{chip.text}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0 text-teal-700"
                >
                  <path d="M13.5 3.5a2.1 2.1 0 0 1 3 3L7 16l-4 1 1-4 9.5-9.5Z" />
                </svg>
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      {activeScreen === "q1" ? (
        <section aria-label="Câu 1: Chọn mục đích cần tiền" className="space-y-4">
          {/* Nút thử nhanh tình huống mẫu 1 chạm cho giám khảo */}
          <div className="rounded-2xl border border-teal-300 bg-gradient-to-br from-teal-50 via-white to-emerald-50/70 p-4 shadow-sm">
            <button
              type="button"
              onClick={handleQuickDemoChiHoa}
              className="flex min-h-[54px] w-full items-center justify-between gap-3 rounded-xl bg-teal-700 px-4 py-3.5 text-left text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
            >
              <span className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-teal-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
                  </svg>
                </span>
                <span className="leading-snug">
                  Thử nhanh tình huống mẫu: Chị Hoa cần 4 triệu đóng học phí trong 3 ngày
                </span>
              </span>
              <span aria-hidden="true" className="shrink-0 text-lg font-bold">
                →
              </span>
            </button>
            <p className="mt-2.5 px-1 text-base leading-relaxed text-slate-700">
              Xem ngay cách AnTâm ưu tiên phương án 0đ và soạn sẵn thư xin lùi học phí chỉ với 1 chạm — hoặc tự chọn từng bước bên dưới.
            </p>
          </div>

          <div className="space-y-3">
            {PURPOSE_OPTIONS.map((item) => {
              const selected = purpose === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectPurpose(item.value)}
                  className={`group flex min-h-[64px] w-full items-center justify-between gap-3.5 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    selected
                      ? "border-2 border-teal-700 bg-teal-50 text-teal-950 shadow-sm"
                      : "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-teal-600 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  <span className="flex min-w-0 flex-1 items-start gap-3.5">
                    <span
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                        selected
                          ? "bg-teal-700 text-white"
                          : "bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200/80 group-hover:bg-teal-100"
                      }`}
                    >
                      <PurposeIcon purpose={item.value} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold leading-snug">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-base font-normal leading-relaxed text-slate-600">
                        {item.hint}
                      </span>
                    </span>
                  </span>
                  <span aria-hidden="true" className="shrink-0 text-lg font-semibold text-teal-700">
                    →
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeScreen === "q2" ? (
        <section aria-label="Câu 2: Chọn khoảng tiền đang thiếu" className="space-y-4">
          <div className="space-y-3">
            {AMOUNT_OPTIONS.map((item) => {
              const selected = amountBand === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectAmount(item.value)}
                  className={`group flex min-h-[64px] w-full items-center justify-between gap-3.5 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    selected
                      ? "border-2 border-teal-700 bg-teal-50 text-teal-950 shadow-sm"
                      : "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-teal-600 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  <span className="flex min-w-0 flex-1 items-start gap-3.5">
                    <span
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                        selected
                          ? "bg-teal-700 text-white"
                          : "bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200/80 group-hover:bg-teal-100"
                      }`}
                    >
                      <AmountIcon band={item.value} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold leading-snug">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-base font-normal leading-relaxed text-slate-600">
                        {item.hint}
                      </span>
                    </span>
                  </span>
                  <span aria-hidden="true" className="shrink-0 text-lg font-semibold text-teal-700">
                    →
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => goToScreen("q1")}
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
          >
            ← Quay lại câu trước
          </button>
        </section>
      ) : null}

      {activeScreen === "q3" ? (
        <section aria-label="Câu 3: Chọn thời hạn cần tiền" className="space-y-4">
          <div className="space-y-3">
            {DEADLINE_OPTIONS.map((item) => {
              const selected = deadlineKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectDeadline(item.key, item.daysOffset)}
                  className={`group flex min-h-[64px] w-full items-center justify-between gap-3.5 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    selected
                      ? "border-2 border-teal-700 bg-teal-50 text-teal-950 shadow-sm"
                      : "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-teal-600 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  <span className="flex min-w-0 flex-1 items-start gap-3.5">
                    <span
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                        selected
                          ? "bg-teal-700 text-white"
                          : "bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200/80 group-hover:bg-teal-100"
                      }`}
                    >
                      <DeadlineIcon deadlineKey={item.key} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold leading-snug">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-base font-normal leading-relaxed text-slate-600">
                        {item.hint}
                      </span>
                    </span>
                  </span>
                  <span aria-hidden="true" className="shrink-0 text-lg font-semibold text-teal-700">
                    →
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => goToScreen("q2")}
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
          >
            ← Quay lại câu trước
          </button>
        </section>
      ) : null}

      {activeScreen === "q4" ? (
        <section aria-label="Câu 4: Tình hình hiện tại" className="space-y-4">
          <div className="space-y-4">
            <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <legend className="px-1 text-base font-semibold leading-snug text-slate-900">
                Có lương chuyển khoản / bảng lương không?
              </legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {TRI_BOOLEAN_OPTIONS.map((opt) => {
                  const selected = hasSalary === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setHasSalary(opt.value)}
                      className={`min-h-[48px] break-words rounded-xl px-2 py-2.5 text-center text-base leading-snug transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                        selected
                          ? "border-2 border-teal-700 bg-teal-50 font-semibold text-teal-950"
                          : "border border-slate-300 bg-white font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <legend className="px-1 text-base font-semibold leading-snug text-slate-900">
                Có tài sản đứng tên (đăng ký xe máy, ô tô...) không?
              </legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {TRI_BOOLEAN_OPTIONS.map((opt) => {
                  const selected = hasAsset === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setHasAsset(opt.value)}
                      className={`min-h-[48px] break-words rounded-xl px-2 py-2.5 text-center text-base leading-snug transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                        selected
                          ? "border-2 border-teal-700 bg-teal-50 font-semibold text-teal-950"
                          : "border border-slate-300 bg-white font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <legend className="px-1 text-base font-semibold leading-snug text-slate-900">
                Có đang vướng nợ quá hạn / nợ xấu không?
              </legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {BAD_DEBT_OPTIONS.map((opt) => {
                  const selected = badDebt === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setBadDebt(opt.value)}
                      className={`min-h-[48px] break-words rounded-xl px-2 py-2.5 text-center text-base leading-snug transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                        selected
                          ? "border-2 border-teal-700 bg-teal-50 font-semibold text-teal-950"
                          : "border border-slate-300 bg-white font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => void fetchOptions()}
              className="min-h-[52px] w-full rounded-xl bg-teal-700 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
            >
              Xem các cách phù hợp
            </button>

            <button
              type="button"
              onClick={() => void handleSkipQ4AndFetch()}
              className="min-h-[48px] w-full rounded-xl border-2 border-teal-700 bg-teal-50/70 px-4 py-3 text-base font-semibold text-teal-950 transition hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-200"
            >
              Bỏ qua câu này, xem kết quả ngay
            </button>

            <button
              type="button"
              onClick={() => goToScreen("q3")}
              className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
            >
              ← Quay lại câu trước
            </button>
          </div>
        </section>
      ) : null}

      {activeScreen === "results" ? (
        <section aria-label="Kết quả gợi ý phương án an toàn" className="space-y-5">
          {resultsLoading ? (
            <div className="space-y-4">
              <LoadingState
                title="Đang tìm các hướng an toàn cho bạn..."
                hint="AnTâm ưu tiên các cách không tốn tiền lãi trước."
              />
              <button
                type="button"
                onClick={() => {
                  optionsReqIdRef.current += 1;
                  setResultsLoading(false);
                  goToScreen("q4");
                }}
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
              >
                ← Quay lại câu trước
              </button>
            </div>
          ) : resultsError ? (
            <ErrorState
              message={resultsError}
              onRetry={() => void fetchOptions()}
              onBack={() => goToScreen("q4")}
              backLabel="Sửa lại câu trả lời"
            />
          ) : options !== null && options.length === 0 ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold leading-snug text-slate-900">
                  Hiện chưa có phương án khớp điều kiện vừa chọn
                </h2>
                <p className="mt-2 text-base leading-relaxed text-slate-700">
                  Bạn bình tĩnh nhé. Bạn có thể kiểm tra lại các câu trả lời vừa chọn, hoặc chủ động trao đổi sớm với gia đình, chủ nhà, nhà trường hay công đoàn cơ sở để xin lùi hạn thanh toán.
                </p>
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => goToScreen("q1")}
                    className="min-h-[48px] w-full rounded-xl bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
                  >
                    Chọn lại câu trả lời
                  </button>
                  <button
                    type="button"
                    onClick={() => goToScreen("q4")}
                    className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
                  >
                    ← Quay lại câu trước
                  </button>
                </div>
              </div>

              <RejectedSupportBlock
                firstNoLoanOption={null}
                onOpenDraft={handleOpenDraft}
              />

              <HarmReductionBlock />
            </div>
          ) : options !== null ? (
            <>
              <div className="space-y-4">
                {options.map((opt) => (
                  <OptionCard
                    key={opt.option_id}
                    option={opt}
                    onDraft={handleOpenDraft}
                  />
                ))}
              </div>

              {note ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-base leading-relaxed text-slate-700">
                  {note}
                </div>
              ) : null}

              {/* Khối hỗ trợ v1.0: Tôi vừa bị từ chối hồ sơ thì làm sao? */}
              <RejectedSupportBlock
                firstNoLoanOption={firstNoLoanOption}
                onOpenDraft={handleOpenDraft}
              />

              {/* Khối giảm thiểu tác hại v1.0: Nguyên tắc tự bảo vệ nếu vẫn quyết định vay */}
              <HarmReductionBlock />

              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleRestartFromScratch}
                  className="min-h-[48px] w-full rounded-xl border-2 border-teal-700 bg-white px-4 py-3 text-base font-semibold text-teal-900 transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100"
                >
                  Trả lời lại từ đầu
                </button>
                <button
                  type="button"
                  onClick={() => goToScreen("q4")}
                  className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
                >
                  ← Sửa lại câu trả lời
                </button>
              </div>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
