/*global $*/
$('body').hide();
$('body').fadeIn(2000);

$(document).ready(() => {
    

    let stocks = {};

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
                        // $('.loading').hide();
                        // $('#Favorite').fadeIn(2000);
                        // $('#content').fadeIn(1200);
    
                    }   
                });
            };
            callAPI();
            $('#stock-input').val('');
        }
    );


    // Add stock 
    const addStocks = (stockInput, price) => {
        let newStock = new Stock(stockInput, price, currentUser);
        stocks[stockInput] = newStock;
        users[currentUser].stocks[stockInput] = {ticker: stockInput, price: price, owned: false, shares: 0};
        displayStocks();
    };
    
    const delStocks = () =>{     
        $('.delStocks').click(function(event){
            var stockName = $(event.target).closest('tr').find("[prop='ticker']").html();
            delete stocks[stockName];
            delete users[currentUser].stocks[stockName];
            console.log(stockName);
            console.log(stocks);
            displayStocks();   
        });
    };

    // Displays Stocks
    const displayStocks = () => {
        $("tbody").empty();
        
        if(Object.keys(users).length === 0) return;
        if(Object.keys(stocks).length === 0) return;
        let filteredStocks = filterStocks();
        filteredStocks = filterOwned(filteredStocks);
        let sortedStocks = sortBy(Object.values(filteredStocks), sortSettings);
        
        for(let stock of sortedStocks){
            //if (!filteredStocks.hasOwnProperty(key)) continue;
            let stockData = `<tr id=${stock.ticker}><td align="center"><input type="checkbox" class="form-check-input owned-toggle">
                                                                       <input class="buy-stock-input" type="number" placeholder="Enter Amount" />
                                                                       <button class="buy-stock-btn" type="button">Buy</button>
                                                                       <button class="sell-stock-btn" type="button">Sell</button></td>`;             
        
            //let obj = sortedStocks[key];
            for(let prop in stock) {
                if (!stock.hasOwnProperty(prop)) continue;
                stockData += `<td prop=${prop}>${stock[prop]}</td> `;
            }
            stockData += `<td align="center"><button class='delStocks' type="button">Delete</button></td>`;
            stockData += "</tr>";
            $("tbody").append(stockData );
            $("tbody tr:last-child").hide();
            $("tbody tr:last-child").fadeIn(1200);

            const owned = users[currentUser].stocks[stock.ticker].owned;
            $("tbody tr:last-child .owned-toggle")[0].checked = owned;
        }
        addOwnedToggleListener();
        delStocks();
        setCookies('stocks');
        purchaseStocks();
        sellStocks();

    };


    // Filter
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

    // toggle owned stocks
    const addOwnedToggleListener = () => {
        $('.owned-toggle').on('click', (event) => {
            const checked = $(event.target)[0].checked;
            const stockName = $(event.target).closest('tr').find("[prop='ticker']").html();
            users[currentUser].stocks[stockName].owned = checked;
            console.log(users[currentUser].stocks[stockName].owned);
            displayStocks();
        });
    };
    
    // Sort the array by prop and direction
    function sortBy(array, {prop, direction}){  
        
        array.sort((a,b) => {
            if (a[prop] < b[prop]) {
                return -1;
            }
            if (a[prop] > b[prop]) {
                return 1;
            }
            return 0;
        });
        
        if (direction === 'dsc') {
            array.reverse();
        }

        return array;
    }

    // Sort settings
    let sortSettings = {
        prop: 'ticker',
        direction: 'asc'
    };

    // Event handler to set sort settings for the display function
    $('#sort-list').on('change', function() {
        let current = $(this).val();
        if (current === "ticker-a" ){
            sortSettings.prop = 'ticker';
            sortSettings.direction = 'asc';
        } else if (current === "ticker-z"){
            sortSettings.prop = 'ticker';
            sortSettings.direction = 'dsc';
        } else if (current === "price-high"){
            sortSettings.prop = 'price';
            sortSettings.direction = 'dsc';
        } else if (current === "price-low"){
            sortSettings.prop = 'price';
            sortSettings.direction = 'asc';
        }

        displayStocks();
    }); 

    let users = {};

    let currentUser = null;
    
    const addUser = (userName) => {
        if (userName.length === 0) return;

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
            stocks: {},
            funds: 0
        };
        $('#users-dropdown').append("<option value='" + userName + "'>" + userName + "</option>");
        currentUser = userName;
        $('#users-dropdown')[0].options.selectedIndex = $('#users-dropdown')[0].options.length - 1;
        $('#user-logo h2').html(userName);
        setCookies('users');
        displayStocks();
    };

    const loadUsers = () => {
        Object.keys(users).forEach(userName => {
            $('#users-dropdown').append("<option value='" + userName + "'>" + userName + "</option>");
        });
        selectUserByUserName(currentUser);
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
        $('#user-logo h2').html(currentUser);
        filterSettings = 'all';
        displayStocks();
    };

    const selectUserByUserName = (userName) => {
        $('#users-dropdown')[0].options.selectedIndex = Array.from($('#users-dropdown')[0].options).map((item) => {
            return item.value;
        }).indexOf(userName);
        $('#user-logo h2').html(userName);
    };

    $('#users-dropdown').on('change', (event) => {
        selectUser();
    });

   
    const purchaseStocks = () => {
        $(".buy-stock-btn, input[type='button']").click(function(event){
            let buyStockName = $(event.target).closest('tr').find("[prop='ticker']").html();
            let purchaseAmount = $(event.target).closest('tr').find(".buy-stock-input").val();
            purchaseAmount = parseInt(purchaseAmount);
        
            displayStocks();

            funds = users[currentUser].funds;
            stockPrice = purchaseAmount * users[currentUser].stocks[buyStockName].price;
            shares = purchaseAmount + users[currentUser].stocks[buyStockName].shares;
            if(funds > stockPrice) {
                funds -= stockPrice;
                alert(`SUCCESS: You purchased ${purchaseAmount} shares. You have ${shares} total shares of ${buyStockName}.`);
                users[currentUser].funds = funds;
                users[currentUser].stocks[buyStockName].shares = shares;
            } else {
                alert(`You have $${funds} and tried to spend $${stockPrice}`)
            }; 
            //console.log("this " + users[currentUser].stocks[buyStockName].price);
            console.log(users[currentUser]);
        });   
    };

    const sellStocks = () => {
        $(".sell-stock-btn, input[type='button']").click(function(event){
            let sellStockName = $(event.target).closest('tr').find("[prop='ticker']").html();
            let sellAmount = $(event.target).closest('tr').find(".buy-stock-input").val();
            sellAmount = parseInt(sellAmount);
            console.log(sellStockName, sellAmount);
            displayStocks();

            funds = users[currentUser].funds;
            stockPrice = sellAmount * users[currentUser].stocks[sellStockName].price;
            shares = users[currentUser].stocks[sellStockName].shares;
            if(shares - sellAmount >= 0) {
                shares = sellAmount - users[currentUser].stocks[sellStockName].shares;
                funds += stockPrice;
                alert(`SUCCESS: You sold ${sellAmount} shares. You have ${shares} total shares of ${sellStockName}.`);
                users[currentUser].funds = funds;
                users[currentUser].stocks[sellStockName].shares = shares;
            } else {
                alert(`You have ${shares} shares and tried to sell ${sellAmount} shares.`);
            }
            //console.log("this " + users[currentUser].stocks[buyStockName].price);
            
            console.log(users[currentUser]);
        });   
    };

    const depositFunds = (funds) => {
        users[currentUser].funds += funds;
    };

    $('#deposit-input').keypress((event) => {
        if(event.which == 13){
            event.preventDefault();
            depositFunds(parseInt(event.target.value));
            $('#funds-amount').html(users[currentUser].funds);
        }
    });

    
    const setCookies = () => {
        usersJSON = JSON.stringify(users);
        stocksJSON = JSON.stringify(stocks);
        currentUserJSON = JSON.stringify(currentUser);
        
        $.cookie('users', usersJSON);
        $.cookie('stocks', stocksJSON);
        $.cookie('currentUser', currentUserJSON);
    };

    const loadCookies = () => {
        if ($.cookie('users')) {
            users = JSON.parse($.cookie('users'));
        }
        if ($.cookie('currentUser')) {
            currentUser = JSON.parse($.cookie('currentUser'));
        }
        if ($.cookie('stocks')) {
            stocks = JSON.parse($.cookie('stocks'));
        }
    };
        $('.search-button').click(function(){
          $(this).parent().toggleClass('open');
        });
    loadCookies();
    loadUsers();
    displayStocks();
});