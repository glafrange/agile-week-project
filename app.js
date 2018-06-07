$(document).ready(() => {

    const stocks = [];

    class Stock {
        constructor(ticker, price, name) {
            this.ticker = ticker;
            this.price = price;
            this.name = name;
        }
    }

    // Allows Enter key to submit
    $('#stock-input').keypress((event) => {
        if(event.which == 13){
            event.preventDefault();
            $('#add-stock-btn').click();
        }
    });
 
    // Gets form input value, current user, and stock price from API, 
    // saves as an object and pushes to the stock array
    $('#add-stock-btn').click(() => {
            const stockInput = $('#stock-input').val();
            //place holder $$ until API
            let newStock = new Stock(stockInput, 400 , currentUser);

            stocks.push(newStock);
            upperCaseTicker(stocks);
            displayStocks(stocks);

            $('#stock-input').val('');

            console.log(stocks);
        }
    );
    
/*     $(function() {
    $('#stock-input').on("click",function() {
        const text = $("stock-input").val();   //getting value of text input element
        const item = $('<li/>')
          .text(text)
          .on("click",function() { $(this).remove()});
        $("#content").prepend(li); 
    });
}); */


    // Sets ticker value toUpperCase if the are not already
    const upperCaseTicker = array => {
        array.forEach(stock => {
            if (stock.ticker !== stock.ticker.toUpperCase()) {
                stock.ticker = stock.ticker.toUpperCase();
            }   
        });
        return array;
    };

    // Displays Stock 
    const displayStocks = array => {
        $("table").empty();
        array.forEach((stock, i) => {
            $("table").append(`
                <tr id=${i} style="border-bottom: 1px black solid">
                    <td>Ticker: ${stock.ticker}</td>
                    <td>Price: ${stock.price}</td> 
                    <td>Owned by: ${stock.name}</td>
                </tr>
            `);
        })
    };

    const users = {};

    let currentUser = "";
    
    const addUser = (userName) => {
        users[userName] = {
            name: userName,
            stocks: {}
        };
        $('#users-dropdown').append("<option value='" + userName + "'>" + userName + "</option>");
    };

    $('#add-user-input').keypress((event) => {
        if(event.which == 13){
            event.preventDefault();
            addUser(event.target.value);
        }
    });

    $('#add-user-btn').click((event) => {
        event.preventDefault();
        addUser($('#add-user-input').val());
    });

    const selectUser = () => {
        usersDropdown = $('#users-dropdown');
        currentUser = usersDropdown[0].options[usersDropdown[0].options.selectedIndex].value;
        console.log("current user: " + currentUser);
    }

    $('#users-dropdown').on('change', (event) => {
        selectUser();
    });

});

