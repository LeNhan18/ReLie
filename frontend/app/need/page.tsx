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
import { HarmReductionBlock, RejectedSupportBlock } from "./NeedSupportBlocks";

type Screen = "form" | "results" | "draft";
type DeadlineChoiceKey = "1d" | "3d" | "7d" | "14d" | "none";

const PURPOSE_OPTIONS: readonly { value: NeedPurpose; label: string }[] = [
  { value: "hoc_phi", label: "Học phí" },
  { value: "tien_nha", label: "Tiền nhà" },
  { value: "vien_phi", label: "Viện phí" },
  { value: "tra_no_cu", label: "Trả nợ cũ" },
  { value: "khac", label: "Việc khác" },
];

const AMOUNT_OPTIONS: readonly { value: AmountBand; label: string }[] = [
  { value: "duoi_5tr", label: "Dưới 5 triệu" },
  { value: "5_20tr", label: "5 – 20 triệu" },
  { value: "tren_20tr", label: "Trên 20 triệu" },
];

const DEADLINE_OPTIONS: readonly {
  key: DeadlineChoiceKey;
  daysOffset: number | null;
  label: string;
}[] = [
  { key: "1d", daysOffset: 1, label: "1–2 ngày" },
  { key: "3d", daysOffset: 3, label: "3 ngày" },
  { key: "7d", daysOffset: 7, label: "1 tuần" },
  { key: "none", daysOffset: null, label: "Chưa gấp" },
];

const TRI_BOOLEAN_OPTIONS: readonly { value: boolean | null; label: string }[] = [
  { value: true, label: "Có" },
  { value: false, label: "Không" },
  { value: null, label: "Chưa rõ" },
];

const BAD_DEBT_OPTIONS: readonly { value: BadDebtStatus; label: string }[] = [
  { value: "khong", label: "Không" },
  { value: "co", label: "Đang có" },
  { value: "khong_biet", label: "Không rõ" },
];

function addDaysLocalIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function NeedPage() {
  const [screen, setScreen] = useState<Screen>("form");

  const [purpose, setPurpose] = useState<NeedPurpose>("hoc_phi");
  const [amountBand, setAmountBand] = useState<AmountBand>("duoi_5tr");
  const [deadlineKey, setDeadlineKey] = useState<DeadlineChoiceKey>("3d");
  const [deadline, setDeadline] = useState<string | null>(() => addDaysLocalIso(3));

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

  async function fetchOptions(override?: NeedProfile) {
    const reqId = ++optionsReqIdRef.current;
    setResultsLoading(true);
    setResultsError("");
    setScreen("results");

    const profile: NeedProfile = override ?? {
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
          : "Chưa tải được gợi ý lúc này. Bạn thử lại nhé.",
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
        err instanceof Error ? err.message : "Chưa soạn được tin nhắn lúc này.",
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
    if (supportedFields.some((f) => f.key === "han_moi") && deadline) {
      initialFields.han_moi = formatIsoDateVi(deadline);
    }

    setDraftOption(option);
    setDraftFields(initialFields);
    setDraftText("");
    setDraftError("");
    setScreen("draft");

    void requestDraft(option, initialFields);
  }

  function handleDraftFieldChange(key: DraftFieldKey, value: string) {
    setDraftFields((prev) => ({ ...prev, [key]: value }));
  }

  if (screen === "draft" && draftOption) {
    return (
      <DraftScreen
        option={draftOption}
        draftText={draftText}
        onDraftTextChange={setDraftText}
        fields={draftFields}
        onFieldChange={handleDraftFieldChange}
        onApplyPresetFields={(nextFields) => {
          setDraftFields(nextFields);
          void requestDraft(draftOption, nextFields);
        }}
        isLoading={draftLoading}
        error={draftError}
        onRegenerate={() => void requestDraft(draftOption, draftFields)}
        onBack={() => {
          draftReqIdRef.current += 1;
          setDraftLoading(false);
          setScreen("results");
        }}
      />
    );
  }

  const firstNoLoanOption = options?.find((o) => o.kind === "no_loan");

  return (
    <div className="space-y-4">
      <PageHeader
        backHref="/"
        title="Tôi cần tiền gấp"
        subtitle={
          screen === "form"
            ? "Chọn nhanh nhu cầu để xem phương án 0đ và kênh an toàn."
            : "Ưu tiên cách không cần vay trước."
        }
      />

      {screen === "form" ? (
        <div className="space-y-4">
          <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
            {/* 1. Mục đích */}
            <div>
              <p className="text-sm font-bold text-slate-900">1. Cần tiền cho việc gì?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PURPOSE_OPTIONS.map((item) => {
                  const active = purpose === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPurpose(item.value)}
                      className={`min-h-[44px] rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-teal-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Số tiền */}
            <div>
              <p className="text-sm font-bold text-slate-900">2. Khoảng bao nhiêu?</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {AMOUNT_OPTIONS.map((item) => {
                  const active = amountBand === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setAmountBand(item.value)}
                      className={`min-h-[44px] rounded-xl px-2 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-teal-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Thời hạn */}
            <div>
              <p className="text-sm font-bold text-slate-900">3. Khi nào cần?</p>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {DEADLINE_OPTIONS.map((item) => {
                  const active = deadlineKey === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setDeadlineKey(item.key);
                        setDeadline(
                          item.daysOffset === null ? null : addDaysLocalIso(item.daysOffset),
                        );
                      }}
                      className={`min-h-[44px] rounded-xl px-1.5 py-2 text-xs font-semibold transition sm:text-sm ${
                        active
                          ? "bg-teal-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Điều kiện thêm (thu gọn để không dài dòng) */}
            <details className="rounded-xl bg-slate-50 px-3.5 py-2.5">
              <summary className="cursor-pointer select-none text-sm font-semibold text-slate-700">
                Điều kiện lọc kỹ hơn (lương, tài sản, nợ xấu)
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600">Bảng lương / sao kê</p>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {TRI_BOOLEAN_OPTIONS.map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => setHasSalary(opt.value)}
                        className={`min-h-[40px] rounded-lg text-xs font-semibold ${
                          hasSalary === opt.value
                            ? "bg-teal-700 text-white"
                            : "bg-white text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Tài sản đứng tên</p>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {TRI_BOOLEAN_OPTIONS.map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => setHasAsset(opt.value)}
                        className={`min-h-[40px] rounded-lg text-xs font-semibold ${
                          hasAsset === opt.value
                            ? "bg-teal-700 text-white"
                            : "bg-white text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Nợ quá hạn / nợ xấu</p>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {BAD_DEBT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBadDebt(opt.value)}
                        className={`min-h-[40px] rounded-lg text-xs font-semibold ${
                          badDebt === opt.value
                            ? "bg-teal-700 text-white"
                            : "bg-white text-slate-700 ring-1 ring-slate-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            <button
              type="button"
              onClick={() => void fetchOptions()}
              className="min-h-[52px] w-full rounded-xl bg-teal-700 px-4 py-3 text-base font-bold text-white shadow-sm transition hover:bg-teal-800 active:bg-teal-900"
            >
              Xem phương án phù hợp
            </button>
          </section>
        </div>
      ) : null}

      {screen === "results" ? (
        <div className="space-y-3.5">
          {resultsLoading ? (
            <LoadingState title="Đang tìm phương án phù hợp..." />
          ) : resultsError ? (
            <ErrorState
              message={resultsError}
              onRetry={() => void fetchOptions()}
              onBack={() => setScreen("form")}
              backLabel="Đổi lựa chọn"
            />
          ) : options !== null && options.length === 0 ? (
            <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200/80">
              <p className="text-base font-bold text-slate-900">
                Chưa tìm thấy phương án khớp điều kiện
              </p>
              <button
                type="button"
                onClick={() => setScreen("form")}
                className="mt-3 min-h-[48px] w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Chọn lại điều kiện
              </button>
            </div>
          ) : options !== null ? (
            <>
              <div className="space-y-3">
                {options.map((opt) => (
                  <OptionCard
                    key={opt.option_id}
                    option={opt}
                    onDraft={handleOpenDraft}
                  />
                ))}
              </div>

              {note ? (
                <p className="px-1 text-xs leading-relaxed text-slate-500">{note}</p>
              ) : null}

              <RejectedSupportBlock
                firstNoLoanOption={firstNoLoanOption ?? null}
                onOpenDraft={handleOpenDraft}
              />

              <HarmReductionBlock />

              <button
                type="button"
                onClick={() => setScreen("form")}
                className="min-h-[48px] w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              >
                ← Đổi nhu cầu khác
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
