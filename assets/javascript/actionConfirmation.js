function confirmBlock(userId) {
    Swal.fire({
        title: 'Block User?',
        text: 'Are you sure you want to block this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'red',
        cancelButtonColor: 'black',
        confirmButtonText: 'Yes, Block it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Show a success message
            Swal.fire({
                icon: 'success',
                title: 'User Blocked',
                text: 'The user has been blocked successfully.'
            }).then(() => {
                // Perform the block action after clicking "OK" on the success message
                window.location.href = '/block-User?id=' + userId;
            });
        } else {
            // Show a cancellation message
            Swal.fire({
                icon: 'info',
                title: 'Action Cancelled',
                text: 'Blocking user process has been cancelled.'
            });
        }
    });
}

function confirmUnblock(userId) {
    Swal.fire({
        title: 'Unblock User?',
        text: 'Are you sure you want to unblock this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: 'black',
        confirmButtonText: 'Yes, Unblock it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Show a success message
            Swal.fire({
                icon: 'success',
                title: 'User Unblocked',
                text: 'The user has been unblocked successfully.'
            }).then(() => {
                // Perform the unblock action after clicking "OK" on the success message
                window.location.href = '/unblock-User?id=' + userId;
            });
        } else {
            // Show a cancellation message
            Swal.fire({
                icon: 'info',
                title: 'Action Cancelled',
                text: 'Unblocking user process has been cancelled.'
            });
        }
    });
}
