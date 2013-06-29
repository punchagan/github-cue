var restore_options = function() {
    options.login.value = localStorage.login; // The user's login.
    options.login.onchange = function() {
        localStorage.login = options.login.value;
    };
};
document.addEventListener('DOMContentLoaded', restore_options);
