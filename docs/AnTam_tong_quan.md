# AnTâm – Trợ lý AI giúp người lao động vượt khó tài chính, tránh bẫy tín dụng đen

> MoMo Tech Contest 2026 · Chủ đề: **Chống lừa đảo + Trợ lý AI (Trợ lý tài chính)**
> Hạn nộp bài: 23:59:59 03/12/2026 · Chung kết: 11/12/2026
> Tên cũ trong quá trình ý tưởng: SOI VAY → LỐI THOÁT → **AnTâm**

---

## 1. Tổng quan

**Một câu:** Khi cần tiền gấp, AnTâm giúp người dùng tìm cách an toàn nhất để có tiền hoặc lùi được khoản chi. Nếu đang cân nhắc một khoản vay, AnTâm cho biết chi phí thật và khoản vay đó có hợp pháp không. Nếu đã lỡ vay, AnTâm giúp hạn chế thiệt hại.

**Định vị:** Lớp bảo vệ **ngoài giao dịch**, bổ sung cho hệ thống AI cảnh báo giao dịch của MoMo.

**Câu pitch:**
> *"MoMo đã bảo vệ người dùng ở khoảnh khắc chuyển tiền. AnTâm bảo vệ ở những khoảnh khắc MoMo chưa nhìn thấy: lúc cần tiền gấp, lúc đọc hợp đồng vay, lúc bị đòi nợ."*

> *"Chúng tôi không hứa ai cũng vay được. Chúng tôi đảm bảo không ai phải chọn tín dụng đen vì không biết mình còn lựa chọn khác."*

**Ý nghĩa tên:** "An tâm" về tiền bạc là cảm giác người dùng cần nhất khi kẹt tiền. Tên ngắn, dễ nhớ với người lớn tuổi, và đồng điệu với thông điệp "an tâm, an toàn" mà MoMo đang dùng cho mảng niềm tin số.

---

## 2. Vấn đề (cập nhật nghiên cứu cuối 2026)

### Thực trạng
- Tín dụng đen qua app và mạng xã hội vẫn diễn biến phức tạp, liên tục bị công an các tỉnh cảnh báo trong năm 2026.
- Giai đoạn 2019–2025 cả nước xử lý gần 7.000 vụ việc liên quan tín dụng đen; công nhân, người lao động chiếm tỷ lệ không nhỏ.
- Khoản vay vài triệu có thể bị đẩy lên hàng chục triệu sau vài tháng; app thu thập danh bạ, hình ảnh để khống chế người vay.

### Gốc rễ
| Nguyên nhân | Ý nghĩa với sản phẩm |
|---|---|
| **Chi đột xuất** (học phí, viện phí, tiền nhà) | Nhu cầu gốc thường là lùi hoặc chia nhỏ khoản chi, không phải khoản vay |
| **Không tiếp cận được tín dụng chính thống** (lao động ngoại tỉnh, không tài sản thế chấp, nợ xấu) | Phải chỉ ra kênh hợp pháp dành cho đúng nhóm này |
| **Nhầm lẫn** giữa công ty tài chính được cấp phép và app cho vay không chính thống | Soi khoản vay, đối chiếu giấy phép và luật |
| **Không có dự phòng**, đến hạn không có tiền trả nên vay app khác | Kế hoạch nợ, cảnh báo thiếu tiền sớm |
| **Sau khi vay** bị đòi nợ khủng bố, lạm dụng dữ liệu | Cứu hộ: khoá dữ liệu, bằng chứng, đơn trình báo |

### Khoảng trống thị trường
| Giải pháp hiện có | Làm được | Chưa làm |
|---|---|---|
| AI cảnh báo giao dịch của MoMo | Chấm điểm rủi ro mỗi giao dịch, tạo "khoảng dừng" trước khi chuyển tiền | Tác hại tín dụng đen xảy ra phần lớn **ngoài giao dịch**: cài app, cho quyền danh bạ, ký điều khoản, bị đòi nợ |
| nTrust (Hiệp hội An ninh mạng quốc gia) | Tra số điện thoại, số tài khoản, website, QR, mã độc | Không đọc hợp đồng, không tính chi phí thật, không tìm lối thoát |
| Cảnh báo của công an, ngân hàng | Tuyên truyền | Không cá nhân hoá, không có mặt đúng lúc người dùng cần |
| Tài chính vi mô, quỹ công đoàn, ứng lương | Có nguồn vốn hợp pháp cho người lao động | Người cần tiền không biết, không tìm tới |

**AnTâm đứng ở khoảng trống này và làm cầu nối tới bên cung hợp pháp.**

### Giới hạn trung thực
AnTâm không tạo ra nguồn tín dụng mới. Phần thiếu cung tín dụng thật cần bên cho vay, công đoàn và chính sách. Ước tính sản phẩm giải quyết khoảng **70–75%** vấn đề ở mức một ứng dụng có thể làm; phần còn lại nằm ở lộ trình tích hợp với bên cung (MoMo, đối tác tín dụng, tài chính vi mô).

---

## 3. Người dùng

| Nhóm | Hoàn cảnh | Cần gì |
|---|---|---|
| **Người lao động cần tiền gấp** (chính) | Công nhân, lao động phổ thông, thu nhập thấp, ngoại tỉnh | Có tiền hoặc lùi được khoản chi, theo cách an toàn |
| Người bị nợ xấu | Bị kênh chính thống từ chối | Kênh hợp pháp còn khả thi, lộ trình thoát nợ xấu |
| Người lớn tuổi, ít rành công nghệ | Không quen gõ chữ | Nút lớn, giọng nói, con cháu hỗ trợ |
| Người đã lỡ vay | Nợ một hoặc nhiều app | Biết thực sự nợ bao nhiêu, thoát vòng gia hạn |
| Người bị đòi nợ khủng bố | Bị đe doạ, bêu riếu | Biết quyền của mình, bằng chứng, đơn trình báo |
| Người thân | Lo cho người nhà | Được báo khi có rủi ro (có sự đồng ý) |
| Đội rủi ro fintech (lộ trình) | Đội rủi ro của MoMo | Phát hiện sớm app đen, chiến dịch mới |

---

## 4. Trải nghiệm chính

### Màn hình chính (theo thứ tự ưu tiên)
1. **Tôi cần tiền gấp** ← nút lớn nhất, đầu tiên
2. **Kiểm tra khoản vay**
3. **Tôi đã lỡ vay**
4. **Tôi bị đòi nợ**

Kèm thẻ **"Hôm nay bạn được tiêu"** và cảnh báo thiếu tiền trước hạn trả nợ.

Ứng dụng theo tác vụ, không phải chatbot thuần. Chat và giọng nói chỉ là kênh phụ ("Hỏi thêm").

### Kịch bản demo: chị Hoa
Chị Hoa, công nhân, cần 4 triệu đóng học phí cho con trước thứ Sáu.
1. Bấm "Tôi cần tiền gấp", chọn: học phí, 4 triệu, trong 3 ngày.
2. AnTâm đưa lựa chọn xếp theo chi phí: xin trường chia hoặc lùi học phí (0đ, thư soạn sẵn), ứng lương (0đ), kênh vay có giấy phép cho người lao động.
3. Chị muốn xem app XanhCash vừa thấy quảng cáo: chụp màn hình, AnTâm phát hiện "lãi 0%" trá hình, chi phí thật ~1.043%/năm, đòi danh bạ, không có giấy phép.
4. Chị chọn xin lùi học phí, gửi thư soạn sẵn cho cô giáo.
5. Lịch trả nợ và cảnh báo thiếu tiền giúp chị không phải vay lại lần sau.

---

## 5. Danh sách chức năng

Ký hiệu: **v1.0** = có trong bản nộp, phải hoàn chỉnh · **Lộ trình** = cần đối tác hoặc tích hợp, chỉ đưa vào slide.

### 5.1. Tôi cần tiền gấp (ưu tiên số 1)
| Chức năng | Mô tả | Phạm vi |
|---|---|---|
| Hỏi nhu cầu gốc | Cần bao nhiêu, cho việc gì, trước khi nào; dạng bấm chọn, có nút bỏ qua, không cần định danh | v1.0 |
| Nhận diện trạng thái người dùng | Chưa biết, do dự, quyết tâm vay, đã vay, bị đòi nợ | v1.0 |
| Phương án không cần vay | Xin lùi/chia nhỏ học phí, viện phí, tiền nhà; ứng lương; hỗ trợ khẩn cấp; nhờ người thân | v1.0 |
| Soạn thư và tin nhắn hộ | Thư gửi trường, bệnh viện, chủ nhà, tổ trưởng, người thân; giọng lịch sự kiểu Việt | v1.0 |
| Kênh vay cho người lao động | Tài chính vi mô, quỹ công đoàn, vay chính sách, cầm đồ có giấy phép, ví điện tử, công ty tài chính | v1.0 |
| Xếp hạng theo chi phí thật | Tool tính tổng chi phí từng kênh cho đúng số tiền và kỳ hạn | v1.0 |
| Nhãn khả năng phù hợp | Phù hợp cao / Có thể / Khó; không hứa chắc được duyệt | v1.0 |
| Luồng "Tôi bị từ chối" | Hỏi lý do, chuyển lựa chọn tiếp; khuyên không nộp nhiều nơi cùng lúc | v1.0 |
| Chế độ giảm thiểu tác hại | Cho người vẫn quyết vay: chỉ vay đủ số thiếu, lưu bằng chứng, kế hoạch trả, không vay chồng | v1.0 |
| Ghi nhận kết quả (ẩn danh) | Người dùng báo được duyệt/từ chối để cải thiện gợi ý | v1.0 |
| Kiểm tra đủ điều kiện ngay | Báo giá thật qua API Vay Nhanh, Ví Trả Sau, đối tác tín dụng | Lộ trình |

### 5.2. Kiểm tra khoản vay
| Chức năng | Mô tả | Phạm vi |
|---|---|---|
| Nhận đầu vào đa phương thức | Ảnh hợp đồng, màn hình app, PDF, dán chữ, giọng nói | v1.0 |
| Tiền xử lý ảnh | Làm thẳng, tăng nét, tự làm mờ CCCD, không lưu ảnh gốc | v1.0 |
| Trích xuất điều khoản | VLM trả JSON kèm độ tin cậy | v1.0 |
| Kiểm tra nhất quán | Rule kiểm tra chéo ngày, tổng tiền, tiền thực nhận | v1.0 |
| Form xác nhận | Người dùng chỉ kiểm tra; ô độ tin cậy thấp tô vàng | v1.0 |
| Máy tính chi phí thật | IRR trên dòng tiền thực nhận; mô phỏng gia hạn, quá hạn; góp ngày | v1.0 |
| Thang so sánh thị trường | So với ngân hàng, công ty tài chính, trần luật | v1.0 |
| Cảnh báo dựa trên luật | Rule engine theo 2 nhánh (mục 7) | v1.0 |
| "Vì sao?" / "Xem căn cứ" | Hiện cách tính và đoạn trích điều luật | v1.0 |
| Soi màn hình xin quyền của app | Giải thích từng quyền nguy hiểm | v1.0 |
| Vay giữa cá nhân | Người quen (giấy vay tiền, lịch trả), người lạ/góp ngày, quy tắc đỏ "đòi phí trước" | v1.0 |

> Đã bỏ: tra cứu số tài khoản, số điện thoại, link lừa đảo (đã có ở MoMo và nTrust).

### 5.3. Kế hoạch tiền và nợ
| Chức năng | Mô tả | Phạm vi |
|---|---|---|
| Thêm khoản nợ từ ảnh | Dùng lại pipeline kiểm tra khoản vay | v1.0 |
| Thu nhập, chi cố định | Ngày lương, tiền nhà, học phí… | v1.0 |
| Ghi chi tiêu | Giọng nói, ảnh hoá đơn; AI tự phân loại | v1.0 |
| Hôm nay bạn được tiêu | Tool dự báo dòng tiền | v1.0 |
| Cảnh báo thiếu tiền sớm | Báo trước ngày đến hạn, kèm cách xử lý | v1.0 |
| Ưu tiên trả nợ | Xếp thứ tự khi tiền không đủ | v1.0 |
| Kịch bản xin lùi hạn | Soạn sẵn để gọi hoặc nhắn bên cho vay | v1.0 |
| Đồng bộ tự động từ MoMo/ngân hàng | Có sự đồng ý của người dùng | Lộ trình |

### 5.4. Tôi đã lỡ vay
| Chức năng | Mô tả | Phạm vi |
|---|---|---|
| Đọc bằng chứng sau giải ngân | Tin nhắn ngân hàng báo tiền về + lịch trả nợ trong app | v1.0 |
| Khoá rò rỉ dữ liệu | Hướng dẫn tắt quyền theo dòng máy; lưu bằng chứng trước khi gỡ app | v1.0 |
| Tách nợ | Gốc thực nhận, lãi trong giới hạn luật, phần vượt luật | v1.0 |
| Thoát vòng gia hạn | Mô phỏng chi phí gia hạn, kế hoạch trả, nhắc hạn (.ics) | v1.0 |

### 5.5. Tôi bị đòi nợ
| Chức năng | Mô tả | Phạm vi |
|---|---|---|
| Phân tích tin nhắn đe doạ | Hành vi có dấu hiệu vi phạm, quyền của người dùng | v1.0 |
| Sổ bằng chứng | Sắp xếp ảnh theo dòng thời gian | v1.0 |
| Đơn trình báo | Soạn sẵn, xuất PDF kèm bằng chứng | v1.0 |
| Báo trước cho người thân | Tin nhắn soạn sẵn | v1.0 |

### 5.6. Nợ xấu
| Chức năng | Mô tả | Phạm vi |
|---|---|---|
| Hướng dẫn tự tra cứu CIC | Từng bước, có hình, có giọng nói | v1.0 |
| Đọc kết quả CIC | Người dùng gửi ảnh, VLM giải thích nhóm nợ | v1.0 |
| Kênh không xét CIC | Cầm đồ có giấy phép, tài chính vi mô, vay chính sách, ứng lương | v1.0 |
| Lộ trình thoát nợ xấu | Kế hoạch tất toán, xây uy tín (Điểm Tin Cậy MoMo), nhắc theo tháng | v1.0 |
| Kiểm tra CIC trực tiếp | Qua tổ chức tín dụng có thẩm quyền | Lộ trình |

### 5.7. Nền tảng
| Chức năng | Mô tả | Phạm vi |
|---|---|---|
| Không cần đăng ký | Dùng ngay; tài khoản chỉ để lưu kế hoạch | v1.0 |
| Quyền riêng tư, xoá dữ liệu | Xem và xoá dữ liệu của mình | v1.0 |
| Trang admin | Cập nhật tham số luật, biểu phí, kênh vay; có người duyệt | v1.0 |
| Giao diện người lớn tuổi | Chữ to, nút lớn, mỗi màn hình một việc, giọng nói | v1.0 |
| Nút "AnTâm" trong ví MoMo | Hiện đúng lúc: tìm "vay tiền", chuyển tiền cho bên cho vay đáng ngờ | Lộ trình |
| Chatbot Zalo | Gửi ảnh hoặc tin nhắn thoại | Lộ trình |
| Người thân bảo hộ | Báo khi người nhà kiểm tra khoản vay rủi ro cao | Lộ trình |
| Tín hiệu cho mạng lưới cảnh báo đa ngành | Gom lượt kiểm tra thành cảnh báo app đen mới cho đội rủi ro | Lộ trình |

---

## 6. Kiến trúc

### Pipeline kiểm tra khoản vay
```
1. Đầu vào (ảnh, PDF, chữ, giọng nói)
2. VLM trích xuất → JSON + độ tin cậy
3. Xác định bên cho vay (DB giấy phép) → chọn nhánh luật
4. Tool tính toán (IRR, gia hạn, quá hạn)
5. Rule engine (legal_params theo ngày ký)
6. LLM viết cảnh báo + trích điều luật
7. Judge kiểm tra (số khớp tool, có nguồn, nói "có dấu hiệu")
8. Màn hình kết quả + nút hành động
```

### Luồng "Tôi cần tiền gấp"
```
1. Câu hỏi bấm chọn → LLM trích hồ sơ nhu cầu (JSON, không định danh)
2. Phân loại trạng thái người dùng
3. Rule lọc phương án: không cần vay → kênh hợp pháp phù hợp hoàn cảnh
4. Tool tính tổng chi phí từng kênh, xếp hạng
5. LLM giải thích + soạn thư/tin nhắn
6. Theo dõi kết quả: được duyệt / bị từ chối → bước tiếp
```

### Nguyên tắc
- **AI làm việc cần hiểu ngôn ngữ:** đọc hợp đồng, phân loại, viết lời, soạn thư, kiểm tra.
- **Code và rule làm việc cần đúng tuyệt đối:** tính tiền, đối chiếu luật, quyết định cảnh báo.
- **Mọi con số do tool tính, mọi nhận định pháp lý có trích dẫn.**

### Thành phần
| Agent / tool | Vai trò |
|---|---|
| Orchestrator | Điều phối, phân loại trạng thái người dùng |
| need_profiler | Trích hồ sơ nhu cầu từ câu trả lời |
| find_alternatives | DB phương án + kênh vay, lọc theo hoàn cảnh |
| extract_terms | VLM: ảnh → JSON điều khoản |
| calc_true_cost | Python: IRR, gia hạn, quá hạn, góp ngày |
| check_license | DB tổ chức được cấp phép + so khớp tên |
| rule_engine | Quy tắc theo nhánh và ngày ký |
| legal_lookup | Đoạn trích điều luật theo mã quy tắc |
| cashflow_forecast | Dự báo dòng tiền, số tiền được tiêu |
| draft_message / draft_report | Thư, tin nhắn, đơn trình báo (PDF) |
| judge | Kiểm tra trước khi hiển thị |

### Hạ tầng (gói tài trợ AWS $20 + Kiro)
| Thành phần | Dịch vụ |
|---|---|
| VLM / LLM | Amazon Bedrock, model nhỏ cho việc nhẹ |
| Agent + tool | Lambda (hoặc AgentCore Runtime nếu chi phí phù hợp) |
| API | API Gateway, có throttling |
| Dữ liệu | DynamoDB on-demand (kênh vay, legal_params, đoạn trích luật, kế hoạch nợ) |
| Ảnh tạm | S3 + lifecycle tự xoá |
| Nhắc hạn, job cập nhật | EventBridge Scheduler + Lambda |
| Giám sát, chi phí | CloudWatch, AWS Budgets ($5/$10/$15) |
| Frontend | Next.js PWA mobile-first (Vercel hoặc Amplify) |

Tiết kiệm: không dùng vector DB cho luật (tra theo mã quy tắc), cache kết quả hợp đồng mẫu, mock response khi dựng giao diện. Kiro dùng để viết spec và sinh code, test cho tool IRR và rule engine.

---

## 7. Cảnh báo dựa trên luật

Hệ thống xác định loại bên cho vay trước, rồi mới chọn bộ quy tắc.

### Nhánh app / cá nhân
| # | Dấu hiệu | Căn cứ |
|---|---|---|
| R1 | Lãi thực > 20%/năm | BLDS 2015, Điều 468 |
| R2 | Lãi ≥ 5 lần trần | BLHS 2015, Điều 201 |
| R3 | Lãi/phạt quá hạn bất thường | BLDS 2015, Điều 466, khoản 1 Điều 468 |
| R4 | "Lãi 0%" nhưng phí lớn | Quy toàn bộ phí về lãi thực rồi đối chiếu R1, R2 |
| R5 | Không có trong danh sách được cấp phép | DB danh sách NHNN |
| R6 | Đòi danh bạ, liên hệ người thân | Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, Nghị định 356/2025/NĐ-CP |
| R7 | Bên thứ ba đòi nợ, đe doạ | Luật Đầu tư 2020 (cấm kinh doanh dịch vụ đòi nợ) |
| R8 | Đòi nộp tiền trước mới giải ngân | Quy tắc cứng: dấu hiệu lừa đảo |

### Nhánh tổ chức tín dụng
Không dùng trần 20%/năm (Luật TCTD 2024, Điều 100 cho phép thỏa thuận lãi, phí). Kiểm tra minh bạch và so sánh:
| # | Dấu hiệu | Căn cứ |
|---|---|---|
| T1 | Thiếu lãi suất hoặc phương pháp tính lãi | Thông tư 39/2016/TT-NHNN |
| T2 | Lãi quảng cáo theo dư nợ ban đầu, chênh lớn với lãi thực | Thông tư 43/2016/TT-NHNN |
| T3 | Lãi ngoài khung công ty tài chính đã công bố | Thông tư 43/2016/TT-NHNN (sửa bởi TT 18/2019) |
| T4 | Phí không có trong hợp đồng/biểu phí | Luật TCTD 2024 |
| T5 | Lãi/phạt quá hạn bất thường | Thông tư 39/2016/TT-NHNN |

> Cần kiểm tra lại văn bản đang có hiệu lực trước khi đưa vào sản phẩm.

### Cập nhật khi luật thay đổi
- Văn bản lưu kèm ngày hiệu lực/hết hiệu lực; tham số trong `legal_params` có `effective_from/to`, đọc theo ngày ký hợp đồng.
- Job định kỳ kiểm tra nguồn chính thức → LLM tóm tắt → **người duyệt** → xuất bản.
- Dữ liệu quá hạn xác minh thì hiện cảnh báo "quy định có thể đã thay đổi".
- Luôn nói "có dấu hiệu", không kết luận "vi phạm".

---

## 8. Dữ liệu

| Dữ liệu | Nguồn | Khối lượng v1.0 |
|---|---|---|
| Tổ chức được cấp phép | Danh sách công bố của Ngân hàng Nhà nước | Toàn bộ danh sách |
| Kênh vay cho người lao động | Website chính thức: tài chính vi mô (CEP, TYM…), NHCSXH, quỹ công đoàn, công ty tài chính, ví điện tử, cầm đồ có giấy phép | 25–30 bản ghi, có link và ngày kiểm tra |
| Phương án không cần vay | Quy trình xin lùi/chia nhỏ học phí, viện phí, tiền nhà; ứng lương; hỗ trợ khẩn cấp địa phương | 10–15 mẫu thư/tình huống |
| Văn bản luật | Nguồn chính thức | 6–8 văn bản, lưu đoạn trích theo mã quy tắc |
| Bộ test hợp đồng | Hợp đồng hư cấu nhiều loại bẫy + hợp đồng hợp pháp đối chứng | 30–50 mẫu |

Gợi ý vay luôn là ước tính theo khoảng, kèm nguồn, ngày cập nhật, link kênh chính thức. Kết quả duyệt do bên cho vay quyết định.

---

## 9. Quyền riêng tư

- Không đăng ký, không xin quyền danh bạ, ảnh, tin nhắn, vị trí.
- Không cần họ tên, CCCD, số điện thoại để nhận gợi ý hay kiểm tra khoản vay.
- Hỏi theo khoảng, giải thích vì sao hỏi, có nút bỏ qua.
- Ảnh xử lý xong là xoá; làm mờ thông tin định danh nếu phải lưu làm bằng chứng.
- Không chuyển dữ liệu cho bên cho vay; không nhận hoa hồng.
- App không tự truy vấn CIC; người dùng tự tra và chia sẻ.

> *"App vay đen đòi danh bạ của bạn. AnTâm không cần biết bạn là ai mà vẫn giúp được."*

---

## 10. Liên kết với hệ sinh thái MoMo

| Điểm nối | Giá trị |
|---|---|
| Lớp bảo vệ ngoài giao dịch | Bổ sung cho AI cảnh báo giao dịch, không trùng lặp |
| Mạng lưới cảnh báo rủi ro đa ngành (MoMo đề xuất 11/2026) | AnTâm cung cấp tín hiệu từ hợp đồng, app vay, tin nhắn đòi nợ |
| Vay Nhanh, Ví Trả Sau, đối tác tín dụng | Kênh hợp pháp thay thế cho đúng nhóm khách hàng bị tín dụng đen nhắm tới |
| Điểm Tin Cậy MoMo | Lộ trình xây uy tín để lần sau vay rẻ hơn |
| Tính trung lập | Sản phẩm MoMo được kiểm tra theo cùng chuẩn (kể cả phí trả trễ); minh bạch tạo niềm tin |

---

## 11. Đối chiếu tiêu chí chấm

| Tiêu chí | Cách đáp ứng |
|---|---|
| **Sáng tạo** | Bắt đầu từ nhu cầu tiền, không từ khoản vay; lấp khoảng trống ngoài giao dịch; giải quyết nhu cầu gốc (lùi khoản chi); giảm thiểu tác hại cho người vẫn quyết vay; phát hiện "lãi 0%" trá hình; tách nhánh luật theo loại bên cho vay |
| **Chất lượng & hoàn thiện** | Mọi luồng chạy trọn; số liệu do tool tính; bộ test đo độ chính xác trích xuất; test với người lao động và người lớn tuổi; ổn định đến 11/12 |
| **Tiềm năng tác động** | Tích hợp vào ví MoMo; cầu nối tới bên cung hợp pháp; dùng hằng ngày nhờ kế hoạch tiền và nợ; tín hiệu cho mạng lưới cảnh báo đa ngành |

### Số liệu cần có trên slide
- Độ chính xác trích xuất từng trường trên bộ test.
- Máy tính chi phí đúng 100%.
- Độ chính xác phân loại trạng thái người dùng.
- Kết quả và clip test với 5–10 người thật (có công nhân, người lớn tuổi).
- Uptime, thời gian phản hồi.

---

## 12. Rủi ro và cách xử lý

| Rủi ro | Xử lý |
|---|---|
| Luồng "Tôi cần tiền gấp" không đủ thuyết phục | Làm thử đầu tiên, kiểm tra trước 26/11 |
| Bị hỏi "khác gì AI cảnh báo của MoMo?" | Định vị rõ: ngoài giao dịch; đã bỏ phần trùng lặp |
| Không giải quyết được thiếu cung tín dụng | Nói thẳng giới hạn; trình bày lộ trình cầu nối với bên cung |
| AI đọc sai hợp đồng | Form xác nhận, kiểm tra nhất quán, ô độ tin cậy thấp tô vàng |
| AI bịa số hoặc luật | Tool tính toán, rule engine quyết định, trích dẫn, Judge |
| Luật/biểu phí thay đổi | Tham số theo ngày hiệu lực, job cập nhật có người duyệt |
| Rủi ro pháp lý khi gắn nhãn doanh nghiệp | Chỉ nói "có dấu hiệu" |
| Hết $20 credits hoặc sập khi chấm | Budgets alarm, cache, throttling, model dự phòng |

---

## 13. Kế hoạch còn lại

| Ngày | Việc |
|---|---|
| 24–25/11 | Chốt tên và định vị; dựng lõi: VLM trích xuất, tool IRR, rule engine, DB kênh vay và phương án; dự training AWS & Kiro (25/11, 13:30) |
| **26/11** | 🚦 **Luồng "Tôi cần tiền gấp" chạy đầu-cuối** – điểm quyết định |
| 26–28/11 | Hoàn thành các luồng còn lại; gửi câu hỏi làm rõ đề trước 27/11 |
| **29/11** | **Đóng băng tính năng** |
| 30/11–01/12 | Đánh bóng UX, trạng thái lỗi, tốc độ; test người thật; chạy bộ đánh giá |
| 02/12 | Video 3 phút (kịch bản chị Hoa), slide 10 trang, hướng dẫn 1 trang, README |
| 03/12 | Kiểm tra lại toàn bộ, nộp trước 18:00 |

### Bài nộp
- Hướng dẫn sử dụng: PDF tối đa 1 trang A4, có link và tài khoản dùng thử.
- Mã nguồn: .zip + README (cách chạy, công nghệ, dịch vụ AWS, tài sản có sẵn, thư viện mã nguồn mở, công cụ AI, nguồn dữ liệu).
- Slide: PDF tối đa 10 trang, dùng cho chung kết.
- Video: MP4 tối đa 3 phút, quay sản phẩm chạy thật.

---

## Nguồn tham khảo chính
- Bộ Công an, công an các tỉnh: cảnh báo tín dụng đen qua app, mạng xã hội (2026)
- Tổng Liên đoàn Lao động Việt Nam: khảo sát áp lực tài chính của người lao động
- Hiệp hội Ngân hàng Việt Nam, CLB Tài chính tiêu dùng: hội thảo "Tài chính tiêu dùng minh bạch và có trách nhiệm" (10/2026)
- MoMo: thông cáo Digital Trust in Finance 2026; đề xuất Mạng lưới cảnh báo rủi ro trực tuyến đa ngành (11/2026)
- Hiệp hội An ninh mạng quốc gia: ứng dụng nTrust
- Văn bản pháp luật: BLDS 2015, BLHS 2015, Luật TCTD 2024, Luật Bảo vệ dữ liệu cá nhân 2025, Luật Đầu tư 2020, Thông tư 39/2016 và 43/2016 của NHNN
