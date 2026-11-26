"use client";

export type CuteIconProps = {
  className?: string;
};

/** 1. Mascot Khiên AnTâm chớp mắt thân thiện */
export function MascotShieldIcon({ className = "h-10 w-10" }: CuteIconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <g className="antam-float">
        <path
          d="M32 7L12 15.5V31C12 44.5 20.6 54.4 32 58C43.4 54.4 52 44.5 52 31V15.5L32 7Z"
          fill="#D82D8B"
          stroke="#A50064"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M32 12L17 18.4V31C17 41.3 23.4 49.1 32 52.3C40.6 49.1 47 41.3 47 31V18.4L32 12Z"
          fill="#FF94C7"
          fillOpacity="0.28"
        />
        {/* Má hồng dễ thương */}
        <ellipse cx="22.5" cy="34.5" rx="3.2" ry="2" fill="#FFB3D9" />
        <ellipse cx="41.5" cy="34.5" rx="3.2" ry="2" fill="#FFB3D9" />
        {/* Mắt chớp */}
        <g className="antam-blink">
          <circle cx="25.5" cy="29.5" r="2.6" fill="#FFFFFF" />
          <circle cx="38.5" cy="29.5" r="2.6" fill="#FFFFFF" />
          <circle cx="26.1" cy="29" r="1.1" fill="#4A002D" />
          <circle cx="39.1" cy="29" r="1.1" fill="#4A002D" />
        </g>
        {/* Nụ cười */}
        <path
          d="M28 36.2C29.3 38.2 34.7 38.2 36 36.2"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
      {/* Ngôi sao lấp lánh */}
      <path
        className="antam-sparkle"
        d="M52 10L53.4 13.6L57 15L53.4 16.4L52 20L50.6 16.4L47 15L50.6 13.6L52 10Z"
        fill="#FBBF24"
      />
    </svg>
  );
}

/** 2. Tôi cần tiền gấp — Ví hồng cười nảy đồng xu vàng */
export function NeedWalletIcon({ className = "h-11 w-11" }: CuteIconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      {/* Đồng xu vàng nhảy nhẹ */}
      <g className="antam-coin-hop">
        <circle cx="32" cy="15" r="8.5" fill="#FBBF24" stroke="#D97706" strokeWidth="2.2" />
        <path d="M32 11.5V18.5M29.5 14.5H34.5" stroke="#FFFBEB" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Thân ví hoạt hình */}
      <g className="antam-float">
        <rect x="11" y="24" width="42" height="30" rx="9" fill="#FF6EB4" stroke="#A50064" strokeWidth="2.5" />
        <rect x="39" y="34" width="15" height="10" rx="5" fill="#FFF0F7" stroke="#A50064" strokeWidth="2.2" />
        <circle cx="44" cy="39" r="2.2" fill="#A50064" />
        {/* Khuôn mặt kawaii */}
        <ellipse cx="19" cy="43" rx="2.8" ry="1.7" fill="#FFC2DF" />
        <ellipse cx="34" cy="43" rx="2.8" ry="1.7" fill="#FFC2DF" />
        <g className="antam-blink">
          <circle cx="22" cy="38.5" r="2.2" fill="#4A002D" />
          <circle cx="31" cy="38.5" r="2.2" fill="#4A002D" />
        </g>
        <path d="M24.2 43.2C25.3 44.8 27.7 44.8 28.8 43.2" stroke="#4A002D" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** 3. Kiểm tra khoản vay — Tờ hợp đồng đáng yêu + kính lúp soi qua lại */
export function LoanScanIcon({ className = "h-12 w-12" }: CuteIconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      {/* Tờ hợp đồng */}
      <rect x="13" y="10" width="32" height="42" rx="7" fill="#FFF5FA" stroke="#A50064" strokeWidth="2.4" />
      <path d="M20 20H37M20 27H32" stroke="#F45CA5" strokeWidth="2.6" strokeLinecap="round" />
      {/* Mắt nhỏ trên tờ giấy */}
      <g className="antam-blink">
        <circle cx="22.5" cy="36" r="1.8" fill="#4A002D" />
        <circle cx="30.5" cy="36" r="1.8" fill="#4A002D" />
      </g>
      <path d="M24.5 39.5C25.5 40.8 27.5 40.8 28.5 39.5" stroke="#4A002D" strokeWidth="1.8" strokeLinecap="round" />
      {/* Kính lúp soi chuyển động */}
      <g className="antam-scan">
        <circle cx="41" cy="38" r="10.5" fill="#FFE0EF" fillOpacity="0.88" stroke="#D82D8B" strokeWidth="2.8" />
        <path d="M37.5 38L40 40.5L45 35" stroke="#A50064" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M48.5 45.5L55 52" stroke="#A50064" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** 4. Tôi đã lỡ vay — Ổ khoá bảo vệ đáng yêu lắc nhẹ */
export function AftercareLockIcon({ className = "h-12 w-12" }: CuteIconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <g className="antam-wiggle">
        <path
          d="M21 28V21C21 14.9 25.9 10 32 10C38.1 10 43 14.9 43 21V28"
          stroke="#A50064"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <rect x="14" y="26" width="36" height="28" rx="9" fill="#FFE0EF" stroke="#A50064" strokeWidth="2.5" />
        {/* Má hồng & mặt cười */}
        <ellipse cx="22" cy="43" rx="3" ry="1.8" fill="#FF94C7" />
        <ellipse cx="42" cy="43" rx="3" ry="1.8" fill="#FF94C7" />
        <g className="antam-blink">
          <circle cx="25.5" cy="38" r="2.3" fill="#4A002D" />
          <circle cx="38.5" cy="38" r="2.3" fill="#4A002D" />
        </g>
        <path d="M29 43.2C30.4 45 33.6 45 35 43.2" stroke="#4A002D" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <path
        className="antam-sparkle"
        d="M52 14L53.2 17.2L56.4 18.4L53.2 19.6L52 22.8L50.8 19.6L47.6 18.4L50.8 17.2L52 14Z"
        fill="#F59E0B"
      />
    </svg>
  );
}

/** 5. Tôi bị đòi nợ — Khiên vệ sĩ dễ thương chặn sóng chuông phiền */
export function HarassmentGuardIcon({ className = "h-12 w-12" }: CuteIconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      {/* Sóng âm thanh bị chặn bên trái */}
      <g className="antam-wiggle">
        <path d="M13 24C10 27.5 10 34.5 13 38" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8.5 21C4.5 26 4.5 36 8.5 41" stroke="#FDA4AF" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      {/* Khiên vệ sĩ dễ thương */}
      <g className="antam-float">
        <path
          d="M36 10L19 17.2V31.5C19 43.4 26.4 51.8 36 55C45.6 51.8 53 43.4 53 31.5V17.2L36 10Z"
          fill="#FFF0F7"
          stroke="#A50064"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="27.5" cy="36.5" rx="2.8" ry="1.7" fill="#FF94C7" />
        <ellipse cx="44.5" cy="36.5" rx="2.8" ry="1.7" fill="#FF94C7" />
        <g className="antam-blink">
          <circle cx="30.5" cy="31.5" r="2.3" fill="#4A002D" />
          <circle cx="41.5" cy="31.5" r="2.3" fill="#4A002D" />
        </g>
        <path d="M33 37C34.2 38.6 37.8 38.6 39 37" stroke="#A50064" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** 6. Hôm nay tiêu gì — Heo đất hồng tròn trĩnh nảy xu vàng */
export function PlanPiggyIcon({ className = "h-12 w-12" }: CuteIconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      {/* Xu vàng rơi vào lưng heo */}
      <g className="antam-coin-hop">
        <circle cx="32" cy="13" r="6.5" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <circle cx="32" cy="13" r="2.2" fill="#FEF3C7" />
      </g>
      {/* Bé heo hồng */}
      <g className="antam-float">
        {/* Tai heo */}
        <path d="M18 25L15 17L24 21" fill="#FF94C7" stroke="#A50064" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M46 25L49 17L40 21" fill="#FF94C7" stroke="#A50064" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Thân heo */}
        <ellipse cx="32" cy="37" rx="20" ry="15.5" fill="#FFC2DF" stroke="#A50064" strokeWidth="2.5" />
        {/* Chân nhỏ */}
        <rect x="20" y="49" width="6" height="6" rx="3" fill="#FF94C7" stroke="#A50064" strokeWidth="2.2" />
        <rect x="38" y="49" width="6" height="6" rx="3" fill="#FF94C7" stroke="#A50064" strokeWidth="2.2" />
        {/* Khe bỏ xu */}
        <path d="M27.5 25.5H36.5" stroke="#A50064" strokeWidth="2.6" strokeLinecap="round" />
        {/* Mắt chớp */}
        <g className="antam-blink">
          <circle cx="24" cy="34.5" r="2.2" fill="#4A002D" />
          <circle cx="40" cy="34.5" r="2.2" fill="#4A002D" />
        </g>
        {/* Mũi heo xinh */}
        <ellipse cx="32" cy="40.5" rx="6.2" ry="4.5" fill="#FF6EB4" stroke="#A50064" strokeWidth="2" />
        <circle cx="30" cy="40.5" r="1.2" fill="#4A002D" />
        <circle cx="34" cy="40.5" r="1.2" fill="#4A002D" />
      </g>
    </svg>
  );
}
