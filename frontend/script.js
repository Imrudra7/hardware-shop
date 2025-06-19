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
    const adminDashboard = document.getElementById("admin-dashboard-loader");
    const myOrders = document.getElementById("myOrders");
    if (token) {
      crAcc.style.display = "none";
      sign.style.display = "none";
      logout.style.display = "block";
      myOrders.style.display = "block";
      logout.onclick = handleLogout;
      // adminDashboard.style.display = "block";
      try {
        const decoded = jwt_decode(token);
        // const adminLink = document.getElementById('admin-dashboard-link');

        if (decoded.role === 'admin') {         // Hide admin dashboard link

          // Show admin dashboard link
          adminDashboard.style.display = 'block';
        }

      } catch (e) {
        console.error("Invalid token", e);
      }
      // adminDashboard.style.display = "block";
      try {
        const decoded = jwt_decode(token);
        // const adminLink = document.getElementById('admin-dashboard-link');

        if (decoded.role !== 'admin') {
          // Hide admin dashboard link
          adminDashboard.style.display = 'none';
        } else {
          // Show admin dashboard link
          adminDashboard.style.display = 'block';
        }

      } catch (e) {
        console.error("Invalid token", e);
      }
    } else {
      crAcc.style.display = "block";
      sign.style.display = "block";
      logout.style.display = "none";
      myOrders.style.display = "none";
      adminDashboard.style.display = "none";
    }
  }
}
window.onclick = function (event) {
  if (!event.target.matches('.menu-btn')) {
    const dropdown = document.getElementById("dropdownMenu");
    if (dropdown && dropdown.style.display === "block") {
      dropdown.style.display = "none";
    }
  }
};

document.addEventListener("DOMContentLoaded", function () {

  if (document.getElementById("registerForm")) {
    handleRegisterForm();
  }

  if (document.getElementById("loginForm")) {
    handleLoginForm();
  }
  if (document.getElementById("addProductForm")) {
    console.log("addProductFOrm");
    handleProductForm();
  }

  const cartIcon = document.getElementById("cart-link");
  cartIcon.addEventListener('click', function (e) {
    e.preventDefault();

    const jtoken = localStorage.getItem('jwtToken');

    if (!jtoken) {
      alert('Kindly Sign in first.🤷‍♂️ ');
      window.location.href = '/login';
      return;
    }

    window.location.href = '/api/opencart'; // ✅ browser request karega + token bhejna backend ka kaam hai
  });
});

function handleRegisterForm() {
  const form = document.getElementById("registerForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    showLoader();
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(`/api/users/newUser`, {
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
      const res = await fetch(`/api/users/login`, {
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
        const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectUrl;
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
    console.log(formData);

    try {
      const res = await fetch(`/api/addproduct`, {
        method: "POST",
        headers: {
          "authorization": `Bearer ${token}`,
          // "Content-Type": "multipart/form-data",  // Don't set this manually when using FormData
        },
        body: formData // no need to set headers here
      });

      const result = await res.json();
      console.log("Server Response:", res.status);
      console.log("Response JSON:", result);
      console.log(res.json);

      if (res.ok) {
        console.log(res);
        console.log(res.status);


        alert(res.json.message || "Product added successfully!");
        form.reset(); // reset form after success
      } else {
        console.log(result);

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

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const decoded = jwt_decode(token);
    const now = Math.floor(Date.now() / 1000); // seconds
    return decoded.exp < now;
  } catch (e) {
    console.log("Invalid token");
    return true;
  }
}


if (token && isTokenExpired(token)) {
  handleLogout();
  console.log("Expired token removed from storage");
  window.location.reload(); // ✅ This will refresh the page
}

function handleLogout() {
  showLoader();
  localStorage.removeItem("jwtToken");
  //alert("Logged out successfully.👍");
  hideLoader();
  location.reload();
  //window.location.href = "/login.html";
}
function handleLocationSign() {

}