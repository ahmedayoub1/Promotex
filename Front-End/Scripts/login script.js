// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements with error checking
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginBtn = document.querySelector('.login-btn');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // Check if elements exist
    if (!loginForm || !emailInput || !passwordInput || !loginBtn || !emailError || !passwordError || !rememberMeCheckbox) {
        console.error('One or more DOM elements not found. Check your HTML.');
        return;
    }

    // Load saved credentials if "Remember me" was checked
    loadSavedCredentials();

    // Validate form inputs in real-time
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    loginForm.addEventListener('submit', handleLoginSubmit);

    function validateEmail() {
        const email = emailInput.value.trim();
        let error = '';

        if (!email) {
            error = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            error = "Invalid email.";
        }

        showError(emailError, error);
        validateForm();
    }

    function validatePassword() {
        const password = passwordInput.value.trim();
        let error = '';

        if (!password) {
            error = "Password is required.";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
            error = "Invalid password.";
        }

        showError(passwordError, error);
        validateForm();
    }

    function showError(errorElement, message) {
        if (message) {
            errorElement.textContent = `✗ ${message}`;
            errorElement.classList.add('active');
        } else {
            errorElement.textContent = '';
            errorElement.classList.remove('active');
        }
    }

    function validateForm() {
        const isEmailValid = !emailError.classList.contains('active');
        const isPasswordValid = !passwordError.classList.contains('active');

        loginBtn.disabled = !(isEmailValid && isPasswordValid);
        loginBtn.style.opacity = isEmailValid && isPasswordValid ? '1' : '0.6';
    }

    function handleLoginSubmit(e) {
        e.preventDefault();

        validateEmail();
        validatePassword();

        if (!emailError.classList.contains('active') && !passwordError.classList.contains('active')) {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = rememberMeCheckbox.checked;

            simulateLogin(email, password)
                .then(success => {
                    if (success) {
                        showGlobalMessage('Login successful!', 'success');
                        if (rememberMe) {
                            saveCredentials(email, password);
                        }
                        setTimeout(() => {
                            window.location.href = 'dashboard.html'; // Replace with your target page
                        }, 1000);
                    } else {
                        showGlobalMessage('Invalid email or password.', 'error');
                    }
                })
                .catch(error => {
                    showGlobalMessage('An error occurred. Please try again.', 'error');
                    console.error('Login error:', error);
                });
        } else {
            showGlobalMessage('Please fix the errors above before logging in.', 'error');
        }
    }

    function simulateLogin(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true); // Mock success for demo
            }, 1000);
        });
    }

    function showGlobalMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message;
        messageDiv.style.color = type === 'error' ? 'red' : 'green';
        messageDiv.style.marginTop = '10px';
        messageDiv.style.fontSize = '14px';
        messageDiv.style.padding = '10px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.textAlign = 'center';

        loginForm.appendChild(messageDiv);

        setTimeout(() => {
            if (loginForm.contains(messageDiv)) {
                loginForm.removeChild(messageDiv);
            }
        }, 3000);
    }

    function saveCredentials(email, password) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password); // In production, never store plain passwords
    }

    function clearCredentials() {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
    }

    function loadSavedCredentials() {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPassword = localStorage.getItem('rememberedPassword');

        if (savedEmail && savedPassword) {
            emailInput.value = savedEmail;
            passwordInput.value = savedPassword;
            rememberMeCheckbox.checked = true;
            validateEmail(); // Validate email after loading
            validatePassword(); // Validate password after loading
        }
    }
});