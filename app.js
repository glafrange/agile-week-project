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
    
    $(function() {
    $('#stock-input').on("click",function() {
        const text = $("stock-input").val();   //getting value of text input element
        const item = $('<li/>')
          .text(text)
          .on("click",function() { $(this).remove()});
        $("#content").prepend(li); 
    });
});

    // List of added stocks, with the names of users who own them
    const stocks = [
        {ticker: 'AMZN', price: 1696, ownedBy: ['gabriel', 'joe', 'chris', 'liz', 'gulia']},
        {ticker: 'appl', price: 1696, ownedBy: ['gabriel', 'joe', 'connor']},
        {ticker: 'micRO', price: 1696, ownedBy: ['gabriel', 'joe']},
        {ticker: 'micRO', price: 1696, ownedBy: ['gabriel']}  // temp example data
    ];


    // Sets ticker value toUpperCase if the are not already
    const upperCaseTicker = array => {
        array.forEach(stock => {
            if (stock.ticker !== stock.ticker.toUpperCase()) {
                stock.ticker = stock.ticker.toUpperCase();
            }   
        });
        return array;
    }

    console.log(upperCaseTicker(stocks));


    // Displays Stock to the content div
    const displayStocks = array => {
        array.forEach(stock => {
            $("#content").append(`<div style="border-bottom: 1px black solid"><p>Ticker: ${stock.ticker}</p> <p>Price: ${stock.price}</p> <p>Owned by: ${stock.ownedBy}</p></div>`);
        })
    }

    displayStocks(stocks);

    const users = [];
    
    const addUser = (userName) => {
        users.push(userName);
    };

});

