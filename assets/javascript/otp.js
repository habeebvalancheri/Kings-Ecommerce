// Get all OTP input fields
const otpInputs = document.querySelectorAll('.otp-input');

// Add event listener to each OTP input
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (event) => {
    const value = event.target.value;

    // Move to the next input if the current input is filled
    if (value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  // Add event listener to backspace
  input.addEventListener('keydown', (event) => {
    if (event.key == "Backspace" && index > 0) {
      // Clear each input
      otpInputs[index].value = '';
      otpInputs[index - 1].focus();
    }
  });
});

// Initial countDown value
let countDown = 30;

function startResendTimer() {
  const countDownElement = document.getElementById('countdown');
  const resendButton = document.getElementById('resend');

  resendButton.style.display = "none";

  const timeInterval = setInterval(() => {
    countDownElement.textContent = countDown;
    countDown--;

    if (countDown < 0) {
      clearInterval(timeInterval);
      countDownElement.textContent = " ";
      resendButton.style.display = "block";
    }
  }, 1000);

  resendButton.addEventListener('click',()=>{
    clearInterval(timeInterval);
    countDown = 30;
    startResendTimer();
  })
}

// Call the function when the page loads to start the timer
document.addEventListener('DOMContentLoaded', () => {
  startResendTimer();
});
