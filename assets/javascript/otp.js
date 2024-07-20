// Get all OTP input fields
const otpInputs = document.querySelectorAll(".otp-input");

let timerEnded = false;

// Add event listener to each OTP input
otpInputs.forEach((input, index) => {
  input.addEventListener("input", (event) => {
    const value = event.target.value;

    // Move to the next input if the current input is filled
    if (value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  // Add event listener to backspace
  input.addEventListener("keydown", (event) => {
    if (event.key == "Backspace" && index > 0) {
      // Clear each input
      otpInputs[index].value = "";
      otpInputs[index - 1].focus();
    }
  });
});

// Initial countDown value
let countDown = 60;

function startResendTimer() {
  const countDownElement = document.getElementById("countdown");
  const resendButton = document.getElementById("resend");

  resendButton.style.display = "none";


  // Get the stored countdown time from local storage
  let storedTime = localStorage.getItem("countDown");
  if (storedTime) {
    countDown = parseInt(storedTime);
  } else {
    countDown = 60;
  }

  const timeInterval = setInterval(() => {
    countDownElement.textContent = countDown;
    countDown--;

    // Store the remaining time in local storage
    localStorage.setItem("countDown", countDown);

    if (countDown < 0) {
      clearInterval(timeInterval);
      countDownElement.textContent = " ";
      resendButton.style.display = "block";
      localStorage.removeItem("countDown"); // Clear local storage when timer finishes
      timerEnded = true;
    }
  }, 1000);

  resendButton.addEventListener("click", () => {
    clearInterval(timeInterval);
    localStorage.removeItem("countDown");
    countDown = 60;
    timerEnded = false;
    startResendTimer();
  });
}

// Call the function when the page loads to start the timer
document.addEventListener("DOMContentLoaded", () => {
  startResendTimer();
});

// Prevent form submission if the timer has ended
document.querySelector("form").addEventListener("submit", (event) => {
  if (timerEnded) {
    event.preventDefault();
    alert("The OTP has expired. Please request a new one.");
  }
});