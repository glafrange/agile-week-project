$(document).ready(() => {
    $('#stock-input').keypress((event) => {
        if(event.which == 13){
            event.preventDefault();
            $('#add-stock-btn').click();
        }
    });

    $('#add-stock-btn').click(
        () => {
            const stockInput = $('#stock-input').val();
            $('ul').append('<li>' + stockInput + '</li>');
        }
    );
});

const displayStock = array => {
    return array;
};