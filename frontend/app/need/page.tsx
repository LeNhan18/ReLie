"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { OptionCard } from "@/components/OptionCard";
import {
  api,
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

type Screen = "q1" | "q2" | "q3" | "q4" | "results" | "draft";

type DeadlineChoiceKey = "1d" | "3d" | "7d" | "14d" | "none";

const PURPOSE_OPTIONS: readonly { value: NeedPurpose; label: string }[] = [
  { value: "hoc_phi", label: "Đóng học phí" },
  { value: "tien_nha", label: "Trả tiền nhà, điện nước" },
  { value: "vien_phi", label: "Đóng viện phí, thuốc men" },
  { value: "tra_no_cu", label: "Trả khoản nợ đang đến hạn" },
  { value: "khac", label: "Việc gia đình / chi tiêu khác" },
];

const AMOUNT_OPTIONS: readonly { value: AmountBand; label: string }[] = [
  { value: "duoi_5tr", label: "Dưới 5 triệu đồng" },
  { value: "5_20tr", label: "Từ 5 đến 20 triệu đồng" },
  { value: "tren_20tr", label: "Trên 20 triệu đồng" },
];

const DEADLINE_OPTIONS: readonly {
  key: DeadlineChoiceKey;
  daysOffset: number | null;
  label: string;
}[] = [
  { key: "1d", daysOffset: 1, label: "Ngay hôm nay hoặc ngày mai" },
  { key: "3d", daysOffset: 3, label: "Trong 3 ngày tới" },
  { key: "7d", daysOffset: 7, label: "Trong 1 tuần tới" },
  { key: "14d", daysOffset: 14, label: "Trong 2 tuần tới" },
  { key: "none", daysOffset: null, label: "Chưa có hạn cố định" },
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

function formatIsoToDdMmYyyy(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
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

function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0 });
  }
}

export default function NeedPage() {
  const [screen, setScreen] = useState<Screen>("q1");

  const [purpose, setPurpose] = useState<NeedPurpose | null>(null);
  const [amountBand, setAmountBand] = useState<AmountBand | null>(null);
  const [deadlineKey, setDeadlineKey] = useState<DeadlineChoiceKey | null>(null);
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

  function handleSelectDeadline(key: DeadlineChoiceKey, daysOffset: number | null) {
    setDeadlineKey(key);
    setDeadline(daysOffset === null ? null : addDaysLocalIso(daysOffset));
    goToScreen("q4");
  }

  async function fetchOptions() {
    if (!purpose || !amountBand) {
      goToScreen("q1");
      return;
    }

    const reqId = ++optionsReqIdRef.current;
    setResultsLoading(true);
    setResultsError("");
    setScreen("results");
    scrollToTop();

    const profile: NeedProfile = {
      purpose,
      amount_band: amountBand,
      deadline,
      has_salary: hasSalary,
      has_asset: hasAsset,
      bad_debt: badDebt,
    };

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
      initialFields.han_moi = formatIsoToDdMmYyyy(deadline);
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

  const questionNum = getQuestionNumber(screen);

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center rounded-xl px-2 text-base font-semibold text-teal-800 transition hover:bg-teal-50 hover:text-teal-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            ← Về trang chủ
          </Link>
          {questionNum !== null ? (
            <span className="rounded-full bg-teal-50 px-3.5 py-1.5 text-base font-semibold text-teal-900">
              Câu {questionNum} / 4
            </span>
          ) : null}
        </div>

        {questionNum !== null ? (
          <div
            aria-hidden="true"
            className="grid grid-cols-4 gap-1.5"
          >
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-colors ${
                  step <= questionNum ? "bg-teal-700" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        ) : null}
      </header>

      {screen === "q1" ? (
        <section aria-labelledby="q1-heading" className="space-y-4">
          <div>
            <h1 id="q1-heading" className="text-xl font-bold leading-snug text-slate-900">
              Bạn đang cần tiền cho việc gì?
            </h1>
            <p className="mt-1.5 text-base leading-relaxed text-slate-600">
              Chọn việc đang gấp nhất để AnTâm tìm hướng nhẹ nhàng, ít tốn kém nhất cho bạn.
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
                  className={`flex min-h-[52px] w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    selected
                      ? "border-2 border-teal-700 bg-teal-50 text-teal-950 shadow-sm"
                      : "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-teal-600 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="ml-3 text-teal-700">
                    →
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {screen === "q2" ? (
        <section aria-labelledby="q2-heading" className="space-y-4">
          <div>
            <h1 id="q2-heading" className="text-xl font-bold leading-snug text-slate-900">
              Bạn đang thiếu khoảng bao nhiêu tiền?
            </h1>
            <p className="mt-1.5 text-base leading-relaxed text-slate-600">
              Bạn chỉ cần chọn khoảng tiền gần đúng nhất.
            </p>
          </div>

          <div className="space-y-3">
            {AMOUNT_OPTIONS.map((item) => {
              const selected = amountBand === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectAmount(item.value)}
                  className={`flex min-h-[52px] w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    selected
                      ? "border-2 border-teal-700 bg-teal-50 text-teal-950 shadow-sm"
                      : "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-teal-600 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="ml-3 text-teal-700">
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

      {screen === "q3" ? (
        <section aria-labelledby="q3-heading" className="space-y-4">
          <div>
            <h1 id="q3-heading" className="text-xl font-bold leading-snug text-slate-900">
              Khi nào bạn cần khoản tiền này?
            </h1>
            <p className="mt-1.5 text-base leading-relaxed text-slate-600">
              Chọn mốc thời gian để biết cách nào kịp giúp bạn.
            </p>
          </div>

          <div className="space-y-3">
            {DEADLINE_OPTIONS.map((item) => {
              const selected = deadlineKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectDeadline(item.key, item.daysOffset)}
                  className={`flex min-h-[52px] w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    selected
                      ? "border-2 border-teal-700 bg-teal-50 text-teal-950 shadow-sm"
                      : "border-slate-300 bg-white text-slate-900 shadow-sm hover:border-teal-600 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="ml-3 text-teal-700">
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

      {screen === "q4" ? (
        <section aria-labelledby="q4-heading" className="space-y-4">
          <div>
            <h1 id="q4-heading" className="text-xl font-bold leading-snug text-slate-900">
              Tình hình hiện tại của bạn?
            </h1>
            <p className="mt-1.5 text-base leading-relaxed text-slate-600">
              Giúp lọc đúng nơi có thể hỗ trợ, tránh mất công nộp hồ sơ không hợp lệ.
            </p>
          </div>

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
              onClick={() => goToScreen("q3")}
              className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
            >
              ← Quay lại câu trước
            </button>
          </div>
        </section>
      ) : null}

      {screen === "results" ? (
        <section aria-labelledby="results-heading" className="space-y-4">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h1
                id="results-heading"
                className="text-lg font-bold leading-snug text-slate-900"
              >
                Hiện chưa có phương án khớp điều kiện vừa chọn
              </h1>
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
          ) : options !== null ? (
            <>
              <div>
                <h1
                  id="results-heading"
                  className="text-xl font-bold leading-snug text-slate-900"
                >
                  Các hướng phù hợp với bạn
                </h1>
                <p className="mt-1.5 text-base leading-relaxed text-slate-600">
                  Ưu tiên thử cách không cần vay trước để không phải gánh thêm lãi và phí.
                </p>
              </div>

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

      {screen === "draft" && draftOption ? (
        <DraftScreen
          option={draftOption}
          draftText={draftText}
          onDraftTextChange={setDraftText}
          fields={draftFields}
          onFieldChange={handleDraftFieldChange}
          isLoading={draftLoading}
          error={draftError}
          onRegenerate={() => void requestDraft(draftOption, draftFields)}
          onBack={() => {
            draftReqIdRef.current += 1;
            setDraftLoading(false);
            goToScreen("results");
          }}
        />
      ) : null}
    </div>
  );
}
