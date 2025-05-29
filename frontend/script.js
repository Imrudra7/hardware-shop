const API_BASE_URL = location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://hardware-shop-backend-pwf6.onrender.com"; // ← Replace with your actual Render backend URL
const token = localStorage.getItem("jwtToken");
document.addEventListener('DOMContentLoaded', function () {
  if (!token) {
    document.getElementById("authBtn").innerText = "Sign In / Create Account";
  }
});
const loader = document.getElementById("loader");

function showLoader() {
  if (loader)
    loader.style.display = "flex";
}

function hideLoader() {
  if (loader)
    loader.style.display = "none";
}

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
console.log("addProductFOrm");
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("registerForm")) {
    handleRegisterForm();
  }

  if (document.getElementById("loginForm")) {
    handleLoginForm();
  }
  if (document.getElementById("addProductForm")) {
    handleProductForm();
  }
});

function handleRegisterForm() {
  const form = document.getElementById("registerForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    showLoader();
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
        window.location.href = "/login";
      } else {
        alert(result.message || "Something went wrong.");
      }
    } catch (err) {
      alert("Failed to register: " + err.message);
    } finally {
      hideLoader();
    }
  });
}

function handleLoginForm() {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    showLoader();
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
        window.location.href = "/";
      } else {
        alert(result.message || "Invalid login");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    } finally {
      hideLoader();
    }
  });
}
function handleProductForm() {
  console.log("handleProduct called.");

  const form = document.getElementById("addProductForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    showLoader();

    const formData = new FormData(form); // auto handles file input

    try {
      const res = await fetch(`${API_BASE_URL}/api/addproduct`, {
        method: "POST",
        body: formData // no need to set headers here
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || "Product added successfully!");
        form.reset(); // reset form after success
      } else {
        alert(result.error || "Failed to add product.");
      }
    } catch (err) {
      hideLoader();
      alert("Request failed: " + err.message);
    } finally {
      hideLoader();
    }
  });
}

function handleLogout() {
  showLoader();
  localStorage.removeItem("jwtToken");
  alert("Logged out successfully.👍");
  hideLoader();
  location.reload();
  //window.location.href = "/login.html";
}


