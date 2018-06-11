/*global $*/
$('body').hide();
$('#content').hide();
$('body').fadeIn(2000);
$('#Favorite').hide();
$('#Favorite').fadeIn(3000);

$(document).ready(() => {

    const stocks = {
        // default data
        // XXXf: {ticker: 'XXXf', price: 1750, name: 'Chris'},
        // vvvf: {ticker: 'vvvf', price: 1139, name: 'Chris'},
        // rrrf: {ticker: 'rrrf', price: 540, name: 'Chris'},
        // qqqf: {ticker: 'qqqf', price: 666, name: 'Chris'},
        // ffff: {ticker: 'ffff', price: 666, name: 'Chris'}
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
                    },
                    complete: function(){
                        $('.loading').hide();
                        $('#Favorite').fadeIn(2000);
                        $('#content').fadeIn(1200)
    
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
        displayStocks();
        //console.log(stocks);
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
    const displayStocks = () => {
        if(Object.keys(users).length === 0) return;
        let filteredStocks = filterStocks();
        filteredStocks = filterOwned(filteredStocks);
        Object.keys(filteredStocks).forEach((stock) => console.log(stock));
        $("tbody").empty();
        for(let key in filteredStocks){
            if (!filteredStocks.hasOwnProperty(key)) continue;
            let keyData = `<tr id=${key}><td align="center"><input type="checkbox" class="form-check-input" id="owned-toggle"></td>`;
        
            let obj = filteredStocks[key];
            for(let prop in obj) {
                if (!obj.hasOwnProperty(prop)) continue;
                 keyData += `<td>${obj[prop]}</td> `;
            }
            keyData += "</tr>";
            $("tbody").append(keyData );
        }
    };

    const filterStocks = () => {
        const userStocks = Object.keys(users[currentUser].stocks);
        const filteredStockNames = Object.keys(stocks).filter((stockName) => {
            return userStocks.includes(stockName);
        });
        const filteredStocks = {};
        filteredStockNames.forEach((stockName) => {
            filteredStocks[stockName] = stocks[stockName];
        });
        return filteredStocks;
    };

    let filterSettings = 'all';

    const filterOwned = (stocks) => {
        if (filterSettings === 'all') return stocks;
        const filteredStockNames = Object.keys(stocks).filter((stockName) => {
            const owned = users[currentUser].stocks[stockName].owned;
            if (filterSettings === 'owned') return owned;
            else if (filterSettings === 'unowned') return !owned;
        });
        const filteredStocks = {};
        filteredStockNames.forEach((stockName) => {
            filteredStocks[stockName] = stocks[stockName];
        });
        return filteredStocks;
    };

    // show all stocks
    $('#show-all-btn').click((event) => {
        filterSettings = 'all';
        displayStocks();
    });

    // show only owned stocks
    $('#show-owned-btn').click((event) => {
        filterSettings = 'owned';
        displayStocks();
    });

    // show only unowned stocks
    $('#hide-owned-btn').click((event) => {
        filterSettings = 'unowned';
        displayStocks();
    });

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
        displayStocks();
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
        displayStocks();
        console.log("current user: " + currentUser);
    }

    $('#users-dropdown').on('change', (event) => {
        selectUser();
    });

    displayStocks();
});


