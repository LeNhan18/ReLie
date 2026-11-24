import { BigButton } from "@/components/BigButton";

export default function Home() {
  return (
    <div className="space-y-4">
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-teal-700">AnTâm</h1>
        <p className="text-sm text-slate-600">
          Không cần đăng ký · Không xin quyền danh bạ, ảnh, tin nhắn · Không cho vay, không nhận hoa hồng
        </p>
      </header>
      <BigButton href="/need" title="Tôi cần tiền gấp" hint="Tìm cách an toàn nhất để có tiền hoặc lùi khoản chi" />
      <BigButton href="/loan" title="Kiểm tra khoản vay" hint="Chụp hợp đồng hoặc màn hình app vay" />
      <BigButton href="/aftercare" title="Tôi đã lỡ vay" hint="Hạn chế thiệt hại, biết mình thực sự nợ bao nhiêu" />
      <BigButton href="/harassment" title="Tôi bị đòi nợ" hint="Biết quyền của mình, lưu bằng chứng" />
    </div>
  );
}
