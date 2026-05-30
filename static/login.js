document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("auth-form");
    const errorBox = document.getElementById("auth-error");
    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");

    if (localStorage.getItem("agriclimate_user")) {
        window.location.href = "/app";
        return;
    }

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            errorBox.classList.remove("hidden");
            return;
        }

        localStorage.setItem("agriclimate_user", email);
        window.location.href = "/app";
    });
});
