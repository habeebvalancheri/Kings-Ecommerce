// // RegisterField.js

// // Get all signup input fields
// const registerInput = document.querySelectorAll('.form');

// // Add event listener to each signUp input
// registerInput.forEach((input, index) => {
//   input.addEventListener('input', (event) => {
//     const value = event.target.value;

//     // Move to the next input if the current input is filled
//     if (value.length === 1 && index < registerInput.length - 1) {
//       registerInput[index + 1].focus();
//     }
//   });

//   // Add event listener to backspace and enter
//   input.addEventListener('keydown', (event) => {
//     if (event.key === "Enter") {
//       // Move focus to the next input when "Enter" is pressed
//       if (index < registerInput.length - 1) {
//         event.preventDefault(); // Prevent form submission (if inside a form)
//         registerInput[index + 1].focus();
//       }
//     }  if (event.key === "Backspace" && index > 0) {
//       // Clear the current input and move focus to the previous input
//       registerInput[index].value = '';
//       registerInput[index - 1].focus();
//     }
//   });
// });
