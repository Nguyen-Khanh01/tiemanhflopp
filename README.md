
# FLOP' Studio - Website bundle (modernized & unified)

## Nội dung gói
- index.html, about.html, gia.html, contact.html
- style.css, script.js
- send_email.php (Gmail API send endpoint)
- oauth_get_token.php (helper to obtain token.json interactively)
- README.md (this file)

## Yêu cầu server cho tính năng gửi mail
Để tính năng gửi thư hoạt động (Gmail API) bạn cần:
1. PHP 7.4+ và composer.
2. Cài đặt thư viện Google API PHP Client:
   ```bash
   composer require google/apiclient:^2.0
   ```
   Việc này tạo thư mục `vendor/` và autoload cần thiết.

3. Tạo OAuth 2.0 Client ID trong Google Cloud Console:
   - Mở https://console.cloud.google.com/apis/credentials
   - Tạo **OAuth client ID** (Application type: Web application)
   - Thêm **Authorized redirect URI** trỏ tới: `https://your-domain/oauth_get_token.php`
   - Tải file `credentials.json` và đặt vào thư mục gốc project.

4. Lấy token (chỉ làm 1 lần):
   - Mở trình duyệt: `https://your-domain/oauth_get_token.php`
   - Đăng nhập bằng tài khoản Gmail muốn gửi (đây là tài khoản "người gửi")
   - Sau khi cho phép, `token.json` sẽ được tạo.

5. Cấu hình địa chỉ nhận trong `send_email.php`:
   - Mở `send_email.php`, thay `$to = 'flopstudio@gmail.com';` thành email bạn mong muốn nhận liên hệ.

6. Triển khai lên server (HTTPS bắt buộc cho OAuth).

## Chú ý bảo mật
- `credentials.json` và `token.json` chứa thông tin nhạy cảm. KHÔNG đưa lên kho mã công khai.
- Bạn có thể xóa `oauth_get_token.php` sau khi hoàn thành để giảm rủi ro.

## Nếu bạn muốn dùng SMTP (phải bật Less secure apps hoặc tạo App Password)
Có cách dễ hơn bằng PHPMailer + SMTP (gmail SMTP), nhưng Google ưu tiên OAuth2. README này tập trung vào Gmail API theo yêu cầu bạn.
