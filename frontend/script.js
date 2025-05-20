
function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

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
      const res = await fetch("http://localhost:5000/api/users/newUser", {
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
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok) {
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

