const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const STORAGE_KEY = "deltavi-notify-email";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const launchDateEl = document.getElementById("launchDate");
const yearEl = document.getElementById("year");
const form = document.getElementById("notifyForm");
const emailInput = document.getElementById("email");
const formMessage = document.getElementById("formMessage");
const submitButton = form.querySelector("button[type=\"submit\"]");

let timerId = null;

// count down to the next 1 April so the timer never sits on a past date
function getLaunchDate() {
    const today = new Date();
    let launch = new Date(today.getFullYear(), 3, 1);
    if (launch <= today) {
        launch = new Date(today.getFullYear() + 1, 3, 1);
    }
    return launch;
}

const launchTime = getLaunchDate().getTime();

function pad(number) {
    return String(number).padStart(2, "0");
}

function setTime(days, hours, minutes, seconds) {
    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
}

function updateCountdown() {
    const distance = launchTime - Date.now();

    if (distance <= 0) {
        clearInterval(timerId);
        setTime(0, 0, 0, 0);
        launchDateEl.textContent = "Launch day is here. Refresh the page in a moment.";
        return;
    }

    const days = Math.floor(distance / DAY);
    const hours = Math.floor((distance % DAY) / HOUR);
    const minutes = Math.floor((distance % HOUR) / MINUTE);
    const seconds = Math.floor((distance % MINUTE) / SECOND);

    setTime(days, hours, minutes, seconds);
}

function showLaunchDate() {
    const formatted = new Date(launchTime).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    launchDateEl.textContent = "Launching on " + formatted + ".";
}

function readSavedEmail() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        return null;
    }
}

function saveEmail(email) {
    try {
        localStorage.setItem(STORAGE_KEY, email);
    } catch (error) {
        // private mode or storage full: the form still works, it just won't be remembered
    }
}

function setMessage(text, type) {
    formMessage.textContent = text;
    formMessage.classList.toggle("is-error", type === "error");
    formMessage.classList.toggle("is-success", type === "success");
}

function validateEmail(value) {
    if (value === "") {
        return "Please enter your email address.";
    }
    if (!EMAIL_PATTERN.test(value)) {
        return "That email doesn't look right. Try something like name@example.com.";
    }
    return "";
}

function showSubscribed(email) {
    emailInput.value = email;
    emailInput.disabled = true;
    submitButton.disabled = true;
    setMessage("Thanks! We'll email " + email + " as soon as we launch.", "success");
}

function handleSubmit(event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const error = validateEmail(email);

    if (error) {
        emailInput.setAttribute("aria-invalid", "true");
        setMessage(error, "error");
        emailInput.focus();
        return;
    }

    emailInput.removeAttribute("aria-invalid");
    // demo only: nothing is sent anywhere, the address just stays in this browser
    saveEmail(email);
    showSubscribed(email);
}

function clearError() {
    if (emailInput.getAttribute("aria-invalid") === "true") {
        emailInput.removeAttribute("aria-invalid");
        setMessage("", "");
    }
}

function init() {
    yearEl.textContent = String(new Date().getFullYear());
    showLaunchDate();
    updateCountdown();
    timerId = setInterval(updateCountdown, SECOND);

    form.addEventListener("submit", handleSubmit);
    emailInput.addEventListener("input", clearError);

    const savedEmail = readSavedEmail();
    if (savedEmail && validateEmail(savedEmail) === "") {
        showSubscribed(savedEmail);
    }
}

init();
