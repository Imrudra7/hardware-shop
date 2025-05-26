const API_BASE_URL = location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://hardware-shop-backend-pwf6.onrender.com"; // ← Replace with your actual Render backend URL
const token = localStorage.getItem("jwtToken");
document.addEventListener('DOMContentLoaded', function () {
  if (!token) {
    document.getElementById("authBtn").innerText = "Sign In / Create Account";
  }
});

function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
  if (menu.style.display == "block") {
    const crAcc = document.getElementById("createAccount");
    const sign = document.getElementById("signIn");
    const logout = document.getElementById("logOut");
    if (token) {
      crAcc.style.display = "none";
      sign.style.display = "none";
      logout.style.display = "block";
      logout.onclick = handleLogout;
    } else {
      crAcc.style.display = "block";
      sign.style.display = "block";
      logout.style.display = "none";
    }
  }
}
//Optional: Click outside to hide dropdown
window.onclick = function (event) {
  if (!event.target.matches('.menu-btn')) {
    if (dropdownMenu.style.display === "block") {
      dropdownMenu.style.display = "none";
    }
  }
};
// Hide dropdown if user clicks outside
window.onclick = function (event) {
  if (!event.target.matches('.menu-btn')) {
    const dropdown = document.getElementById("dropdownMenu");
    if (dropdown && dropdown.style.display === "block") {
      dropdown.style.display = "none";
    }
  }
}
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("registerForm")) {
    handleRegisterForm();
  }

  if (document.getElementById("loginForm")) {
    handleLoginForm();
  }
});

function handleRegisterForm() {
  const form = document.getElementById("registerForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/newUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        window.location.href = "/login.html";
      } else {
        alert(result.message || "Something went wrong.");
      }
    } catch (err) {
      alert("Failed to register: " + err.message);
    }
  });
}

function handleLoginForm() {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("jwtToken", result.token);

        alert(result.message);
        window.location.href = "/index.html";
      } else {
        alert(result.message || "Invalid login");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
}
function handleLogout() {
  localStorage.removeItem("jwtToken");
  alert("Logged out successfully.👍");
  location.reload();
  //window.location.href = "/login.html";
}


