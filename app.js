$(document).ready(() => {

    const stocks = {
        XXXf: {ticker: 'XXXf', price: 1750, name: 'Chris'},
        vvvf: {ticker: 'vvvf', price: 1139, name: 'Chris'},
        rrrf: {ticker: 'rrrf', price: 540, name: 'Chris'},
        qqqf: {ticker: 'qqqf', price: 666, name: 'Chris'},
        ffff: {ticker: 'ffff', price: 666, name: 'Chris'}
    };

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

    
    // ToolTip Function 
    $(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

    // Gets form input value, current user, and stock price from API, 
    // saves as an object and pushes to the stock array
    $('#add-stock-btn').click(() => {
            const stockInput = $('#stock-input').val().toUpperCase();
            function callAPI() {
                var query = $('#stock-input').val();
                var url = "https://api.iextrading.com/1.0/stock/" + query + "/batch?types=price";
                $.ajax({
                    url: url,
                    type: 'POST',
                    dataType: "jsonp",
                    success: (res) => addStocks(stockInput, res.price),
                    error: function(err){
                        console.log(err);
                        alert("We don't recognize this ticker symbol, please check your input and try again");
                    }
                });
            };
            callAPI();
            $('#stock-input').val('');
        }
    );

    const addStocks = (stockInput, price) => {
        let newStock = new Stock(stockInput, price, currentUser);
        stocks[stockInput] = newStock;
        users[currentUser].stocks[stockInput] = {ticker: stockInput, owned: false};
        console.log("current users stocks: " + users[currentUser]);
        displayStocks(stocks);
        console.log(stocks);
    };
    
/*     $(function() {
    $('#stock-input').on("click",function() {
        const text = $("stock-input").val();   //getting value of text input element
        const item = $('<li/>')
          .text(text)
          .on("click",function() { $(this).remove()});
        $("#content").prepend(li); 
    });
}); */

    // Displays Stock 
    const displayStocks = obj => {
        $("tbody").empty();
        for(let key in stocks){
            if (!stocks.hasOwnProperty(key)) continue;
            let keyData = `<tr id=${key}>`;
        
            let obj = stocks[key];
            for(let prop in obj) {
                if (!obj.hasOwnProperty(prop)) continue;
                 keyData += `<td>${obj[prop]}</td> `;
            }
            keyData += "</tr>";
            $("tbody").append(keyData );
        }
        
    };

    displayStocks(stocks);

    const users = {};

    let currentUser = null;
    
    const addUser = (userName) => {
        let userNames = [];
        Object.keys(users).forEach((user) => userNames.push(user));
        if (userNames.includes(userName)) {
            $('#users-dropdown')[0].options.selectedIndex = Array.from($('#users-dropdown')[0].options).map((item) => {
                return item.value;
            }).indexOf(userName);
            currentUser = userName;
            return;
        }
        users[userName] = {
            name: userName,
            stocks: {}
        };
        $('#users-dropdown').append("<option value='" + userName + "'>" + userName + "</option>");
        currentUser = userName;
        $('#users-dropdown')[0].options.selectedIndex = $('#users-dropdown')[0].options.length - 1;
        console.log(currentUser);
    };

    $('#add-user-input').keypress((event) => {
        if(event.which == 13){
            event.preventDefault();
            addUser(event.target.value);
            $('#add-user-input')[0].value = "";
        }
    });

    $('#add-user-btn').click((event) => {
        event.preventDefault();
        addUser($('#add-user-input').val());
        $('#add-user-input')[0].value = "";
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

