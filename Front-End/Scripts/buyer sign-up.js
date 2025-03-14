document.addEventListener("DOMContentLoaded", function () {
    const formPages = document.querySelectorAll(".form-page");
    const nextButtons = document.querySelectorAll(".next");
    const prevButtons = document.querySelectorAll(".prev");
    const form = document.getElementById("multiStepForm");
    let currentPage = 0;

    function showPage(index) {
        formPages.forEach((page, i) => {
            if (i === index) {
                page.style.display = "block";
                page.classList.add("active");
            } else {
                page.style.display = "none";
                page.classList.remove("active");
            }
        });

        prevButtons.forEach(btn => btn.style.display = index === 0 ? "none" : "inline-block");
    }

    function validatePage(index) {
        let valid = true;
        const inputs = formPages[index].querySelectorAll("input[required]");

        inputs.forEach(input => {
            const errorMessage = input.parentElement.nextElementSibling;

            if (input.type === "file") {
                if (input.files.length === 0) {
                    errorMessage.style.display = "block";
                    valid = false;
                } else {
                    errorMessage.style.display = "none";
                }
            } else if (input.value.trim() === "") {
                errorMessage.style.display = "block";
                valid = false;
            } else {
                errorMessage.style.display = "none";
            }
        });

        if (index === 1) {
            const email = document.getElementById("email");
            const password = document.getElementById("password");
            const confirmPassword = document.getElementById("confirmPassword");

            const emailError = email.nextElementSibling;
            const passwordError = password.nextElementSibling;
            const confirmPasswordError = confirmPassword.nextElementSibling;

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

            if (!emailPattern.test(email.value.trim())) {
                emailError.textContent = "Enter a valid email (e.g., example@domain.com)";
                emailError.style.display = "block";
                valid = false;
            } else {
                emailError.style.display = "none";
            }

            if (!passwordPattern.test(password.value.trim())) {
                passwordError.textContent = "Password must be 8+ characters, include 1 uppercase letter and 1 number";
                passwordError.style.display = "block";
                valid = false;
            } else {
                passwordError.style.display = "none";
            }

            if (confirmPassword.value !== password.value) {
                confirmPasswordError.textContent = "Passwords do not match";
                confirmPasswordError.style.display = "block";
                valid = false;
            } else {
                confirmPasswordError.style.display = "none";
            }
        }

        if (index === 0 || index === 3) {
            const phoneFields = ["phone", "emergencyNumber", "alternateNumber"];
            phoneFields.forEach(id => {
                const phoneInput = document.getElementById(id);
                if (phoneInput) {
                    const phoneError = phoneInput.parentElement.nextElementSibling;
                    if (!/^\d{10}$/.test(phoneInput.value.trim())) {
                        phoneError.textContent = "Enter a valid 10-digit phone number";
                        phoneError.style.display = "block";
                        valid = false;
                    } else {
                        phoneError.style.display = "none";
                    }
                }
            });
        }

        console.log("Validation result for page", index, ":", valid);
        return valid;
    }

    nextButtons.forEach(button => {
        button.addEventListener("click", function () {
            console.log("Next button clicked on page", currentPage);
            if (validatePage(currentPage)) {
                currentPage++;
                showPage(currentPage);
                console.log("Moved to page", currentPage);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener("click", function () {
            console.log("Prev button clicked on page", currentPage);
            currentPage--;
            showPage(currentPage);
        });
    });

    form.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", function () {
            const errorMessage = input.parentElement.nextElementSibling;
            if (input.value.trim() !== "") {
                errorMessage.style.display = "none";
            }
            validatePage(currentPage);
        });
    });

    showPage(currentPage);
});
