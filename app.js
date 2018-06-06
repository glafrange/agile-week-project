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

    // List of added stocks, with the names of users who own them
    const stocks = [
        {ticker: 'AMZN', price: 1696, ownedBy: ['gabriel', 'joe']} // temp example data
    ];
});

const displayStock = array => {
    return array;
};