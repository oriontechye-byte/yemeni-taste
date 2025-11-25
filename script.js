// ===== 1) Navbar: add 'scrolled' class on scroll =====
(function() {
  const header = document.querySelector(".header");
  const toggleScrolled = () => {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", toggleScrolled, { passive: true });
  toggleScrolled();
})();

// ===== 2) Back-to-Top button (created dynamically) =====
(function() {
  const btn = document.createElement("button");
  btn.id = "backToTop";
  btn.setAttribute("aria-label", "العودة للأعلى");
  btn.textContent = "↑";
  document.body.appendChild(btn);

  const toggleBtn = () => {
    btn.style.display = window.scrollY > 300 ? "block" : "none";
  };
  window.addEventListener("scroll", toggleBtn, { passive: true });
  toggleBtn();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// ===== 3) Contact form basic validation =====
(function() {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  // نتأكد أن هذا النموذج ليس نموذج إضافة صنف (لأننا نستخدم كلاس contact-form هناك أيضاً)
  if (form.id === 'item-form') return; 

  form.addEventListener("submit", function(e) {
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const message = document.getElementById("message")?.value.trim();

    if (!name || !email || !message) {
      alert("الرجاء تعبئة جميع الحقول قبل الإرسال.");
      e.preventDefault();
      return;
    }
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!okEmail) {
      alert("رجاءً أدخل بريدًا إلكترونيًا صالحًا.");
      e.preventDefault();
    }
  });
})();

// ===== 4) Reveal-on-scroll using IntersectionObserver =====
(function() {
  const revealTargets = document.querySelectorAll(
    "section, .menu-item, .about-image, .about-text, .info-item"
  );
  if (revealTargets.length === 0) return;

  revealTargets.forEach(el => el.classList.add("reveal-init"));

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-show");
          obs.unobserve(entry.target);
        }
      });
    },
    { root: null, threshold: 0.12 }
  );

  revealTargets.forEach(el => observer.observe(el));
})();

/* ==========================================================================
   نظام إدارة القائمة (Dashboard & Menu System)
   هذا الجزء يتعامل مع عرض الأصناف في الصفحة الرئيسية وإدارتها في الداش بورد
   ========================================================================== */

// 1. البيانات الافتراضية (في حال لم يكن هناك شيء مخزن)
const defaultMenuItems = [
    { title: "مندي لحم", price: "10000 ريال", desc: "أرز بسمتي مع لحم الضأن المطهو ببطء مع التوابل اليمنية الأصيلة", image: "images/mandi.jpg" },
    { title: "سلتة يمنية", price: "6000 ريال", desc: "طبق يمني تقليدي ساخن مع اللحم والخضروات والحلبة", image: "images/saltah.png" },
    { title: "فحسة", price: "7000 ريال", desc: "لحم مفروم مطهو مع الحلبة والتوابل اليمنية الخاصة", image: "images/fahsa.jpg" },
    { title: "سلتة دجاج", price: "3000 ريال", desc: "سلتة يمنية بالدجاج الطازج والخضروات المشكلة", image: "images/saltah2.jpg" },
    { title: "مقبلات يمنية", price: "2000 ريال", desc: "تشكيلة متنوعة من المقبلات اليمنية الأصيلة", image: "images/spread.png" },
    { title: "مندي دجاج", price: "6500 ريال", desc: "دجاج كامل مشوي مع أرز بسمتي معطر بالتوابل", image: "images/mandi.jpg" }
];

// 2. دالة جلب البيانات (من التخزين المحلي أو الافتراضي)
function getMenuItems() {
    const stored = localStorage.getItem('yemeniMenu');
    return stored ? JSON.parse(stored) : defaultMenuItems;
}

// 3. دالة حفظ البيانات
function saveMenuItems(items) {
    localStorage.setItem('yemeniMenu', JSON.stringify(items));
}

// 4. عرض القائمة في الصفحة الرئيسية (index.html)
function renderHomeMenu() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return; // لسنا في الصفحة الرئيسية

    const items = getMenuItems();
    grid.innerHTML = ''; // مسح المحتوى القديم

    items.forEach(item => {
        const html = `
            <div class="menu-item reveal-init reveal-show">
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='images/spread.png'">
                </div>
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${item.title}</h3>
                    <p class="menu-item-description">${item.desc}</p>
                    <p class="menu-item-price">${item.price}</p>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', html);
    });
}

// تشغيل عرض القائمة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', renderHomeMenu);

/* ============================
   منطق صفحة الداش بورد
   ============================ */

// التحقق من حالة تسجيل الدخول عند فتح صفحة الداش بورد
document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');

    if (loginSection && dashboardSection) {
        if (localStorage.getItem('isAdminLoggedIn') === 'true') {
            showDashboard();
        } else {
            loginSection.style.display = 'flex';
            dashboardSection.style.display = 'none';
        }
    }
});

// التعامل مع نموذج تسجيل الدخول
const adminLoginForm = document.getElementById('admin-login-form');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;

        if (u === 'admin' && p === 'password123') {
            localStorage.setItem('isAdminLoggedIn', 'true');
            showDashboard();
        } else {
            alert('بيانات الدخول غير صحيحة!');
        }
    });
}

// دالة إظهار الداش بورد وتعبئة الجدول
function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    renderAdminTable();
}

// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('isAdminLoggedIn');
    location.reload();
}

// دالة تعبئة جدول الإدارة
function renderAdminTable() {
    const tbody = document.getElementById('admin-items-list');
    if (!tbody) return;

    const items = getMenuItems();
    tbody.innerHTML = '';

    items.forEach((item, index) => {
        const row = `
            <tr>
                <td><img src="${item.image}" alt="img" onerror="this.src='images/spread.png'"></td>
                <td>${item.title}</td>
                <td>${item.price}</td>
                <td>${item.desc.substring(0, 30)}...</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="openEditModal(${index})">تعديل</button>
                        <button class="delete-btn" onclick="deleteItem(${index})">حذف</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

/* ============================
   إدارة النافذة المنبثقة (Modal) والإضافة/التعديل
   ============================ */
const itemModal = document.getElementById('item-modal');
const itemForm = document.getElementById('item-form');

function openItemModal() {
    if(!itemModal) return;
    document.getElementById('modal-title').textContent = 'إضافة صنف جديد';
    document.getElementById('item-index').value = '-1'; // -1 يعني إضافة جديد
    itemForm.reset();
    itemModal.classList.add('active');
}

function closeItemModal() {
    if(itemModal) itemModal.classList.remove('active');
}

function openEditModal(index) {
    const items = getMenuItems();
    const item = items[index];
    
    document.getElementById('modal-title').textContent = 'تعديل الصنف';
    document.getElementById('item-index').value = index;
    document.getElementById('item-name').value = item.title;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-desc').value = item.desc;
    document.getElementById('item-image').value = item.image;
    
    itemModal.classList.add('active');
}

function deleteItem(index) {
    if(confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
        const items = getMenuItems();
        items.splice(index, 1);
        saveMenuItems(items);
        renderAdminTable();
        alert('تم الحذف بنجاح');
    }
}

// حفظ بيانات النموذج (إضافة أو تعديل)
if (itemForm) {
    itemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const index = parseInt(document.getElementById('item-index').value);
        const newItem = {
            title: document.getElementById('item-name').value,
            price: document.getElementById('item-price').value,
            desc: document.getElementById('item-desc').value,
            image: document.getElementById('item-image').value
        };

        const items = getMenuItems();

        if (index === -1) {
            // إضافة جديد
            items.push(newItem);
        } else {
            // تعديل موجود
            items[index] = newItem;
        }

        saveMenuItems(items);
        renderAdminTable();
        closeItemModal();
        alert('تم الحفظ بنجاح!');
    });
}

// إغلاق النافذة عند النقر خارجها
window.onclick = function(event) {
    if (event.target === itemModal) {
        closeItemModal();
    }
}