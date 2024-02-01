function searchUsers() {
    // Get input value
    var input = document.getElementById('name-search');
    var filter = input.value.toUpperCase();

    // Get table rows
    var table = document.querySelector('.table-data table');
    var rows = table.getElementsByTagName('tr');

    // Loop through all rows and hide those that don't match the search query
    for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName('td');

        // Start from index 2 as you want to search based on user's name (change as needed)
        var nameCell = cells[3]; // Change index if user's name is in a different column

        if (nameCell) {
            var nameText = nameCell.textContent || nameCell.innerText;

            if (nameText.toUpperCase().indexOf(filter) > -1) {
                rows[i].style.display = ''; // Show the row if it matches the search query
            } else {
                rows[i].style.display = 'none'; // Hide the row if it doesn't match
            }
        }
    }
}
