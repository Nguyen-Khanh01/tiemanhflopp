// script.js - shared functionality for FLOP' Studio
document.addEventListener('DOMContentLoaded', () => {
  // ========== NAV ACTIVE ==========
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(a => {
    if (location.pathname.endsWith(a.getAttribute('href'))) a.classList.add('active');
  });

  // ========== MOBILE NAV TOGGLE ==========
  const menuBtn = document.getElementById('menuToggle');
  if (menuBtn) {
    const nav = document.querySelector('.nav-links');
    menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // ========== CONTACT FORM SUBMIT ==========
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const submitBtn = contactForm.querySelector('button[type=submit]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang gửi...';
      try {
        const res = await fetch('send_email.php', { method: 'POST', body: data });
        const json = await res.json();
        if (json.success) {
          alert('Gửi thành công — chúng tôi sẽ liên hệ bạn sớm!');
          contactForm.reset();
        } else {
          alert('Gửi không thành công: ' + (json.message || 'Lỗi máy chủ'));
        }
      } catch (err) {
        console.error(err);
        alert('Lỗi kết nối. Vui lòng thử lại sau.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi';
      }
    });
  }

  // ========== CONTACT PAGE: GMAIL QUICK SEND ==========
  window.sendEmail = function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    const recipient = "nguyenduykhanh200339@gmail.com";
    const subject = encodeURIComponent("Liên hệ từ khách hàng FLOP' Studio");
    const body = encodeURIComponent(`Tên: ${name}\nEmail: ${email}\n\nNội dung:\n${message}`);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

    if (navigator.userAgent.includes("Android") || navigator.userAgent.includes("Chrome")) {
      window.open(gmailUrl, "_blank");
    } else {
      window.location.href = mailtoUrl;
    }

    return false;
  };

  // ========== GÓI CHỤP (gia.html) ==========
  const serviceList = document.getElementById('serviceList');
  if (serviceList) {
    const FB_PAGE = "Iuqanh";
    const ZALO_PHONE = "0383070200";

    const servicePackages = {
      beauty: [
        { name: "Gói Cơ bản", price: "2.000.000đ" },
        { name: "Gói Nâng cao", price: "3.000.000đ" }
      ],
      wedding: [
        { name: "Gói Tiêu chuẩn", price: "5.000.000đ" },
        { name: "Gói VIP", price: "8.000.000đ" }
      ],
      yearbook: [
        { name: "Gói Lớp Nhỏ", price: "4.000.000đ" },
        { name: "Gói Lớp Lớn", price: "6.000.000đ" },
        { name: "Gói Nâng cao", price: "7.500.000đ" }
      ],
      concept: [
        { name: "Gói Đơn", price: "2.500.000đ" },
        { name: "Gói Đôi", price: "3.500.000đ" }
      ]
    };

    let selectedService = null;
    let selectedPackage = null;
    let selectedDates = [];

    // Khởi tạo Flatpickr (lịch)
    const fp = flatpickr("#calendar", {
      inline: true,
      mode: "multiple",
      dateFormat: "d/m/Y",
      locale: "vn",
      onChange: (dates, _, instance) => {
        selectedDates = dates.map(d => instance.formatDate(d, "d/m/Y"));
        if (selectedService)
          localStorage.setItem(`dates_${selectedService}`, JSON.stringify(selectedDates));
        updateBookState();
      }
    });

    // DOM elements
    const serviceCards = document.querySelectorAll(".service-card");
    const packageList = document.getElementById("packageList");
    const packageTitle = document.getElementById("packageTitle");
    const calendarSection = document.getElementById("calendarSection");
    const bookingPanel = document.getElementById("bookingPanel");
    const bookBtn = document.getElementById("bookBtn");
    const modal = document.getElementById("messageModal");
    const modalMessage = document.getElementById("modalMessage");

    // Khi chọn dịch vụ
    serviceCards.forEach(card => {
      card.addEventListener("click", () => {
        serviceCards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        selectedService = card.dataset.service;
        selectedPackage = null;
        selectedDates = JSON.parse(localStorage.getItem(`dates_${selectedService}`)) || [];
        fp.setDate(selectedDates, false);

        calendarSection.style.display = "block";
        bookingPanel.style.display = "flex";
        packageTitle.textContent = `Các gói ${card.querySelector("h3").textContent}`;
        packageList.innerHTML = servicePackages[selectedService].map(
          p => `<div class="package" data-name="${p.name}"><strong>${p.name}</strong><br><small>${p.price}</small></div>`
        ).join("");

        document.querySelectorAll(".package").forEach(pkg => {
          pkg.addEventListener("click", () => {
            document.querySelectorAll(".package").forEach(x => x.classList.remove("selected"));
            pkg.classList.add("selected");
            selectedPackage = pkg.dataset.name;
            updateBookState();
          });
        });
      });
    });

    // Cập nhật trạng thái nút
    function updateBookState() {
      bookBtn.disabled = !(selectedPackage && selectedDates.length);
    }

    // Khi bấm Đặt lịch
    bookBtn.addEventListener("click", () => {
      const channel = document.querySelector('input[name="channel"]:checked').value;
      const message = 
`Xin chào FLOP' Studio! 👋

Mình muốn đặt lịch chụp:
📸 Gói: ${selectedPackage}
📂 Dịch vụ: ${selectedService.toUpperCase()}
🗓️ Ngày chụp: ${selectedDates.join(", ")}

Cảm ơn Studio rất nhiều! 💫`;

      const encodedMsg = encodeURIComponent(message);
      if (channel === "messenger") {
        window.open(`https://m.me/${FB_PAGE}?text=${encodedMsg}`, "_blank");
      } else {
        window.open(`https://zalo.me/${ZALO_PHONE}?text=${encodedMsg}`, "_blank");
      }

      // Hiện modal xem lại nội dung
      modal.style.display = "block";
      modalMessage.textContent = message;

      setTimeout(() => {
        alert("✅ Đang mở ứng dụng chat của bạn.\nNếu không tự mở, hãy kiểm tra popup bị chặn hoặc bấm lại nút 'Đặt lịch'.");
      }, 1200);
    });

    // Nút copy tin nhắn
    const copyBtn = document.getElementById("copyBtn");
    const closeBtn = document.getElementById("closeModal");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(modalMessage.textContent);
        alert("Đã sao chép tin nhắn!");
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", () => modal.style.display = "none");
    }
  }
});
