
  function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
  }

  // Hide dropdown if user clicks outside
  window.onclick = function(event) {
    if (!event.target.matches('.menu-btn')) {
      const dropdown = document.getElementById("dropdownMenu");
      if (dropdown && dropdown.style.display === "block") {
        dropdown.style.display = "none";
      }
    }
  }

