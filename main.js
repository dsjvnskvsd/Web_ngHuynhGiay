// =============== HOÀNG HUYNH SHOES - MAIN SCRIPT (FINAL) ===============

// --- 1. Tạo tài khoản mặc định nếu chưa có ---
(function seedDefaultUsers() {
  if (!localStorage.getItem("users")) {
    const defaults = [
      { username: "admin", password: "admin123", role: "admin" },
      { username: "boss", password: "boss123", role: "admin" },
      { username: "vietanh123", password: "123456", role: "user" },
    ];
    localStorage.setItem("users", JSON.stringify(defaults));
  }
})();

// --- 2. Các hàm tiện ích chung ---
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}
function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}
function logout() {
  localStorage.removeItem("currentUser");
  alert("👋 Bạn đã đăng xuất thành công!");
  location.href = "index.html";
}
window.logout = logout; // để gọi từ HTML

// --- 3. Khi tải trang ---
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const userCart = header ? header.querySelector(".user-cart") : null;
  const me = getCurrentUser();

  // Hiển thị trạng thái đăng nhập ở header
  if (header && userCart) {
    if (me) {
      if (me.role === "admin") {
        userCart.innerHTML = `
          <span>🧑‍💼 Admin <b>${me.username}</b></span> |
          <a href="admin.html">Trang quản trị</a> |
          <a href="#" onclick="logout()" style="color:#e63946;font-weight:600;">Đăng xuất</a>
        `;
      } else {
        userCart.innerHTML = `
          <span>👋 Xin chào, <b>${me.username}</b></span> |
          <a href="cart.html">Giỏ hàng</a> |
          <a href="#" onclick="logout()" style="color:#e63946;font-weight:600;">Đăng xuất</a>
        `;
      }
    } else {
      userCart.innerHTML = `
        <a href="login.html" class="login-icon">Đăng nhập</a> |
        <a href="cart.html" class="cart-icon">Giỏ hàng</a>
      `;
    }
  }

  // Chặn user thường vào admin
  const path = location.pathname.toLowerCase();
  if (path.includes("admin.html")) {
    if (!me) {
      alert("⚠️ Bạn cần đăng nhập để vào trang quản trị!");
      location.href = "login.html";
      return;
    }
    if (me.role !== "admin") {
      alert("🚫 Bạn không có quyền truy cập trang này!");
      location.href = "index.html";
      return;
    }
  }

  // Chặn chưa đăng nhập vào cart / profile
  if ((path.includes("cart.html") || path.includes("profile.html")) && !me) {
    alert("⚠️ Vui lòng đăng nhập để sử dụng tính năng này!");
    location.href = "login.html";
  }

  // Cho phép reset toàn bộ dữ liệu demo (dành cho dev)
  const url = new URL(location.href);
  if (url.searchParams.get("reset") === "1") {
    localStorage.clear();
    alert("🧹 Đã reset dữ liệu demo. Tự động tạo lại tài khoản mặc định.");
    location.href = "index.html";
  }
});

// --- 4. Đăng ký tài khoản ---
window.handleRegister = function () {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  if (!username || !password) return alert("⚠️ Vui lòng nhập đầy đủ thông tin!");

  const users = getUsers();
  if (users.some((u) => u.username === username))
    return alert("❌ Tên đăng nhập đã tồn tại!");

  users.push({ username, password, role: "user" });
  setUsers(users);
  setCurrentUser({ username, role: "user" });
  alert("🎉 Đăng ký thành công! Xin chào " + username);
  location.href = "index.html";
};

// --- 5. Đăng nhập tài khoản ---
window.handleLogin = function () {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  if (!username || !password) return alert("⚠️ Vui lòng nhập đầy đủ thông tin!");

  const users = getUsers();
  const found = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) return alert("❌ Sai tên đăng nhập hoặc mật khẩu!");

  setCurrentUser(found);
  if (found.role === "admin") {
    alert("🧑‍💼 Xin chào Admin " + found.username + "!");
    location.href = "admin.html";
  } else {
    alert("✅ Đăng nhập thành công! Xin chào " + found.username);
    location.href = "index.html";
  }
};

// --- 6. Lưu đơn hàng (dùng cho cart.html) ---
window.createOrderFromCart = function (bankName) {
  const me = getCurrentUser();
  if (!me) return alert("Bạn chưa đăng nhập!");

  const cartKey = "cart_" + me.username;
  const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
  if (!cart.length) return alert("Giỏ hàng đang trống!");

  const total = cart.reduce((s, i) => s + i.price, 0);
  const code =
    "HHS" +
    new Date().getFullYear() +
    "-" +
    bankName.slice(0, 3).toUpperCase() +
    "-" +
    Math.floor(Math.random() * 900000 + 100000);

  const order = {
    code,
    time: new Date().toLocaleString(),
    bank: bankName,
    items: cart,
    total,
  };

  const key = "orders_" + me.username;
  const old = JSON.parse(localStorage.getItem(key) || "[]");
  old.push(order);
  localStorage.setItem(key, JSON.stringify(old));

  localStorage.removeItem(cartKey);
  return order;
};
