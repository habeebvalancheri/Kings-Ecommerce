
  $(document).ready(function () {
    // Event listener for the clothing type select
    $("#clothingType").change(function () {
      var selectedType = $(this).val();
      // Clear the existing options
      $("#sizeSelect").empty();

      // Add size options based on the selected clothing type
      if (selectedType === "pants") {
        $("#sizeSelect").append(`
          <option value="30">30</option>
          <option value="32">32</option>
          <!-- Add more options as needed for pants -->
        `);
      } else if (selectedType === "fullSuits") {
        $("#sizeSelect").append(`
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <!-- Add more options as needed for full suits -->
        `);
      }
    })
  });

