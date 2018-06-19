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
    $('#searchList').keypress((event) => {
        if(event.which == 13){
            event.preventDefault();
            $('#search-lst-btn').click();
        }
    });
    
    $('#stock-input').keypress((event) => {
        if(event.which == 13){
            event.preventDefault();
            $('#add-stock-btn').click();
        }
    });

    // Every time a modal is shown, if it has an autofocus element, focus on it.
    $('.modal').on('shown.bs.modal', function() {
        $(this).find('[autofocus]').focus();
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
                var url = "https://api.iextrading.com/1.0/stock/" + query + "/batch?types=price,company";
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
        filteredStocks = filterList(filteredStocks);
        let sortedStocks = sortBy(Object.values(filteredStocks), sortSettings);
        for(let stock of sortedStocks){
            //if (!filteredStocks.hasOwnProperty(key)) continue;
            let stockData = `<tr id=${stock.ticker}><td align="center"><input type="checkbox" class="form-check-input owned-toggle" checked="${users[currentUser].stocks[stock.ticker].owned}">
                                                                       <input class="buy-stock-input" type="number" placeholder="Enter Amount" />
                                                                       <button class="buy-stock-btn" type="button">Buy</button>
                                                                       <button class="sell-stock-btn" type="button">Sell</button></td>`;             
        
            //let obj = sortedStocks[key];
            for(let prop in stock) {
                if (!stock.hasOwnProperty(prop)) continue;
                if (prop === 'price') {
                    stockData += `<td prop=${prop}>$${stock[prop]}</td> `;
                } else if (prop === 'name'){
                    continue;
                } else {
                    stockData += `<td prop=${prop}>${stock[prop]}</td> `;
                }
            }
            //let sName = 
            stockData += `<td align="center">${users[currentUser].stocks[stock.ticker].shares} </td>`;
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

    document.getElementById('searchList').addEventListener('keyup', displayStocks );
    function filterList(filteredStocks){
            let result = document.getElementById('searchList').value.toUpperCase();
            let keys = Object.keys(filteredStocks);
            let newFilteredStocks = {}; 
            keys.forEach(key => {
              if (key.indexOf(result) >= 0){
                newFilteredStocks[key] = filteredStocks[key];
              }
            });
            return newFilteredStocks;
        }

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
        const filteredStockNames = Object.keys(stocks).filter((stockName) => {
            const shares = users[currentUser].stocks[stockName].shares;
            if (filterSettings === 'all') {
                if (shares > 0) {
                    users[currentUser].stocks[stockName].owned = true;
                    return true;
                } else {
                    users[currentUser].stocks[stockName].owned = false;
                    return true;
                }
            }else if (filterSettings === 'owned') {
                if (shares > 0) {
                    users[currentUser].stocks[stockName].owned = true;
                    return true;
                } else {
                    users[currentUser].stocks[stockName].owned = false;
                }
            }else if (filterSettings === 'unowned') {
                if (shares === 0) {
                    users[currentUser].stocks[stockName].owned = false;
                    return true;
                } else {
                    users[currentUser].stocks[stockName].owned = true;
                }
            };
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
        highlightOwnedButton('show-all-btn');
        displayStocks();
    });

    // show only owned stocks
    $('#show-owned-btn').click((event) => {
        filterSettings = 'owned';
        highlightOwnedButton('show-owned-btn');
        displayStocks();
    });

    // show only unowned stocks
    $('#hide-owned-btn').click((event) => {
        filterSettings = 'unowned';
        highlightOwnedButton('hide-owned-btn');
        displayStocks();
    });

    const highlightOwnedButton = (id) => {
        $('#sort-button-group .btn-outline-primary').addClass('btn-outline-secondary');
        $('#sort-button-group .btn-outline-primary').removeClass('btn-outline-primary');
        $(`#${id}`).removeClass('btn-outline-secondary');
        $(`#${id}`).addClass('btn-outline-primary');
    }

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
        $('#searchList').val("");
        $('#users-dropdown')[0].options.selectedIndex = $('#users-dropdown')[0].options.length - 1;
        $('#user-logo h2').html(userName);
        $('#funds-amount').html(users[currentUser].funds).formatCurrency();
        highlightOwnedButton('show-all-btn');
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
        $('#searchList').val("");
        $('#user-logo h2').html(currentUser);
        $('#funds-amount').html(users[currentUser].funds).formatCurrency();
        highlightOwnedButton('show-all-btn');
        filterSettings = 'all';
        displayStocks();
    };

    const selectUserByUserName = (userName) => {
        $('#users-dropdown')[0].options.selectedIndex = Array.from($('#users-dropdown')[0].options).map((item) => {
            return item.value;
        }).indexOf(userName);
        $('#searchList').val("");
        $('#user-logo h2').html(userName);
        if (currentUser) $('#funds-amount').html(users[currentUser].funds).formatCurrency();
        highlightOwnedButton('show-all-btn');
    };

    $('#users-dropdown').on('change', (event) => {
        selectUser();
    });

   
    const purchaseStocks = () => {
        $(".buy-stock-btn, input[type='button']").click(function(event){
            let buyStockName = $(event.target).closest('tr').find("[prop='ticker']").html();
            let purchaseAmount = $(event.target).closest('tr').find(".buy-stock-input").val();
            purchaseAmount = parseInt(purchaseAmount);
        
            //displayStocks();

            let funds = users[currentUser].funds;
            let stockPrice = purchaseAmount * users[currentUser].stocks[buyStockName].price;
            let shares = purchaseAmount + users[currentUser].stocks[buyStockName].shares;
            if(funds > stockPrice) {

                funds -= stockPrice;
                alert(`SUCCESS: You purchased ${purchaseAmount} shares. You have ${shares} total shares of ${buyStockName}.`);
                users[currentUser].funds = funds;
                users[currentUser].stocks[buyStockName].shares = shares;
                displayStocks();
            } else {
                alert(`You have $${funds} and tried to spend $${stockPrice}`);
                displayStocks();
            }; 
            //console.log("this " + users[currentUser].stocks[buyStockName].price);
            console.log(users[currentUser]);
            $('#funds-amount').html(users[currentUser].funds).formatCurrency();
        });   
    };

    const sellStocks = () => {
        $(".sell-stock-btn, input[type='button']").click(function(event){
            let sellStockName = $(event.target).closest('tr').find("[prop='ticker']").html();
            let sellAmount = $(event.target).closest('tr').find(".buy-stock-input").val();
            sellAmount = parseInt(sellAmount);
            console.log(sellStockName, sellAmount);
            displayStocks();

            let funds = users[currentUser].funds;
            let stockPrice = sellAmount * users[currentUser].stocks[sellStockName].price;
            let shares = users[currentUser].stocks[sellStockName].shares;

            let change = shares - sellAmount;
            console.log(change);
            if(change >= 0) {
                shares = users[currentUser].stocks[sellStockName].shares - sellAmount;
                funds += stockPrice;
                alert(`SUCCESS: You sold ${sellAmount} share(s). You have ${shares} total share(s) of ${sellStockName}.`);
                users[currentUser].funds = funds;
                users[currentUser].stocks[sellStockName].shares = shares;
                displayStocks();
            } else {
                alert(`ERROR: You have ${shares} share(s) and tried to sell ${sellAmount} share(s).`);
                displayStocks();
            }
            //console.log("this " + users[currentUser].stocks[buyStockName].price);
            
            console.log(users[currentUser]);
            $('#funds-amount').html(users[currentUser].funds).formatCurrency();
            
        });   
        
    };

    const depositFunds = (funds) => {
    
        if (funds <= 0) {
            alert('Please deposit more than 0 dollars');
            return;
        }

        users[currentUser].funds += funds;
        $('#funds-amount').html(users[currentUser].funds).formatCurrency();
    };

    $('#deposit-input').keypress((event) => {
        if(event.which == 13){
            event.preventDefault();
            const regEx = /^-?\d+\.?\d*$/;
            const input = event.target.value;
            if (!regEx.test(input)) {
                alert(`${input} is not a valid input. Please enter a number.`);
                return;
            };
            depositFunds(parseInt(event.target.value));
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