import Link from "next/link";
import { BigButton } from "@/components/BigButton";

const TRUST_BADGES = [
  "Không đăng ký",
  "Không đọc danh bạ",
  "Miễn phí 100%",
] as const;

const EASY_STEPS = [
  {
    step: "1",
    title: "Chọn việc bạn đang gặp",
    desc: "Cần tiền gấp, soi hợp đồng vay, đã lỡ vay hay đang bị đòi nợ.",
  },
  {
    step: "2",
    title: "Xem con số thật & căn cứ luật",
    desc: "Hiểu rõ lãi suất thực tế, phí ẩn và các dấu hiệu cần cảnh giác.",
  },
  {
    step: "3",
    title: "Lấy mẫu thư hoặc kế hoạch hành động ngay",
    desc: "Sao chép lời nhắn lịch sự hoặc làm theo danh sách việc bảo vệ bản thân.",
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-6 pb-2">
      {/* Khối Hero có hình ảnh minh hoạ */}
      <section
        aria-labelledby="home-hero-heading"
        className="overflow-hidden rounded-3xl border border-teal-200/80 bg-white shadow-sm"
      >
        <div className="p-2.5 pb-0">
          <img
            src="/images/hero-antam.jpg"
            alt="AnTâm đồng hành giúp người lao động vượt khó tài chính an toàn"
            className="aspect-[16/9] w-full rounded-2xl object-cover shadow-sm ring-1 ring-black/5"
          />
        </div>

        <div className="p-5 pt-4">
          <h1
            id="home-hero-heading"
            className="text-2xl font-bold leading-snug tracking-tight text-slate-900"
          >
            An tâm vượt khó tài chính
          </h1>

          <p className="mt-1.5 text-base leading-relaxed text-slate-600">
            Giúp bạn tìm lối ra an toàn khi kẹt tiền, tính rõ lãi thật trước khi ký và tự bảo vệ trước bẫy tín dụng đen.
          </p>

          <ul
            aria-label="Ba cam kết niềm tin của AnTâm"
            className="mt-4 flex flex-wrap gap-2"
          >
            {TRUST_BADGES.map((label) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-sm font-semibold text-emerald-950"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 shrink-0 text-emerald-700"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42 0l-3.75-3.775a1 1 0 1 1 1.42-1.41l3.04 3.06 6.54-6.585a1 1 0 0 1 1.414-.004Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Thẻ hành động ưu tiên số 1 */}
      <section aria-labelledby="priority-flow-heading" className="space-y-2.5">
        <h2 id="priority-flow-heading" className="sr-only">
          Hành động ưu tiên khi đang kẹt tiền
        </h2>
        <BigButton
          href="/need"
          featured
          badge="Ưu tiên số 1 · Nên thử trước tiên"
          title="Tôi cần tiền gấp"
          hint="Tìm cách xoay xở an toàn hoặc soạn lời nhắn xin giãn khoản chi mà không phải gánh lãi nặng"
          imageSrc="/images/card-need.jpg"
          imageAlt="Minh hoạ tìm cách xoay xở an toàn khi cần tiền gấp"
        />
      </section>

      {/* 3 thẻ chức năng chính có ảnh minh hoạ */}
      <section aria-labelledby="core-flows-heading" className="space-y-3">
        <div className="px-0.5">
          <h2 id="core-flows-heading" className="text-lg font-bold text-slate-900">
            Kiểm tra &amp; tự bảo vệ khoản vay
          </h2>
          <p className="mt-0.5 text-base text-slate-600">
            Chạm vào đúng tình huống bạn đang gặp để xem hướng dẫn rõ ràng từng bước.
          </p>
        </div>

        <div className="space-y-3">
          <BigButton
            href="/loan"
            title="Kiểm tra khoản vay"
            hint="Chụp hợp đồng hoặc màn hình app vay để tính lãi thật và nhận diện dấu hiệu rủi ro trước khi ký"
            imageSrc="/images/card-loan.jpg"
            imageAlt="Minh hoạ kiểm tra hợp đồng khoản vay"
          />

          <BigButton
            href="/aftercare"
            title="Tôi đã lỡ vay"
            hint="Tách rõ tiền gốc thực nhận, phần lãi trong trần luật dân sự và việc nên làm ngay để hạn chế thiệt hại"
            imageSrc="/images/card-aftercare.jpg"
            imageAlt="Minh hoạ tách khoản nợ và hạn chế thiệt hại sau khi đã lỡ vay"
          />

          <BigButton
            href="/harassment"
            title="Tôi bị đòi nợ"
            hint="Giữ bình tĩnh, biết rõ quyền được bảo vệ, cách lưu bằng chứng và nơi tiếp nhận trình báo"
            imageSrc="/images/card-harassment.jpg"
            imageAlt="Minh hoạ bảo vệ bản thân khi bị đòi nợ quấy rối"
          />
        </div>
      </section>

      {/* Thẻ tiện ích Hôm nay bạn được tiêu */}
      <section aria-labelledby="plan-utility-heading" className="space-y-2.5">
        <div className="px-0.5">
          <h2 id="plan-utility-heading" className="text-lg font-bold text-slate-900">
            Giữ nhịp chi tiêu tới kỳ lương
          </h2>
        </div>

        <BigButton
          href="/plan"
          badge="Kế hoạch tiền & nợ"
          title="Hôm nay bạn được tiêu"
          hint="Tính mức chi tiêu an toàn mỗi ngày tới kỳ lương và cảnh báo sớm khoản nợ dễ bị thiếu hụt"
          imageSrc="/images/card-plan.jpg"
          imageAlt="Minh hoạ tính mức chi tiêu an toàn mỗi ngày tới kỳ lương"
        />
      </section>

      {/* Khối hướng dẫn 3 bước trực quan */}
      <section
        aria-labelledby="how-it-works-heading"
        className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200/80"
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
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
          <h2 id="how-it-works-heading" className="text-lg font-bold text-slate-900">
            Dùng AnTâm rất dễ — chỉ 3 bước
          </h2>
        </div>

        <ol className="mt-4 space-y-3">
          {EASY_STEPS.map((item) => (
            <li
              key={item.step}
              className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white shadow-sm"
              >
                {item.step}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold leading-snug text-slate-900">
                  {item.title}
                </div>
                <p className="mt-0.5 text-base leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Khối cam kết quyền riêng tư cuối trang */}
      <section
        aria-labelledby="privacy-pledge-heading"
        className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-slate-100 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-inset ring-teal-400/30"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <h2 id="privacy-pledge-heading" className="text-base font-semibold text-teal-300">
              Quyền riêng tư của bạn được đặt lên hàng đầu
            </h2>
            <p className="mt-1.5 text-base font-medium leading-relaxed text-white">
              &ldquo;App vay đen đòi danh bạ của bạn. AnTâm không cần biết bạn là ai mà vẫn giúp được.&rdquo;
            </p>
            <div className="mt-3">
              <Link
                href="/privacy"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-base font-semibold text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
              >
                <span>Xem cam kết riêng tư &amp; quản lý phiên</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
