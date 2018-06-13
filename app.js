/*global $*/
$('body').hide();
$('body').fadeIn(2000);
$('#Favorite').hide();
$('#Favorite').fadeIn(3000);

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
        users[currentUser].stocks[stockInput] = {ticker: stockInput, owned: false};
        displayStocks();
    };
    
    const delStocks = () =>{     
        $('.delStocks').click(function(event){
            var stockName = $(event.target).closest('tr').find("[prop='ticker']").html();
            delete stocks[stockName];
            console.log(stockName);
            console.log(stocks);
            displayStocks();   
        });
    };
    // Displays Stocks
    const displayStocks = () => {
        if(Object.keys(users).length === 0) return;
        if(Object.keys(stocks).length === 0) return;
        let filteredStocks = filterStocks();
        filteredStocks = filterOwned(filteredStocks);

        let stockArray = Object.keys(filteredStocks).map(i => {
            let stockObj = stocks[i];
            return stockObj;
        });
        
        // Sort the array by prop and direction
        function sortBy(array, prop, direction){  
            
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


        $('#sort-list').on('change', function() {
            let current = $(this).val();
            let goodStocks;
            if (current === "ticker-a" ){
                 goodStocks = sortBy(stockArray, 'ticker');

            } else if (current === "ticker-z"){
                 goodStocks = sortBy(stockArray, 'ticker', 'dsc');

            } else if (current === "price-high"){
                 goodStocks = sortBy(stockArray, 'price', 'dsc');
                
            } else if (current === "price-low"){
                 goodStocks = sortBy(stockArray, 'price');
                
            }

            $("tbody").empty();
            goodStocks.forEach((stock,i) => {
                $("tbody").append(`<tr id=${i}><td align="center"><input type="checkbox" class="form-check-input owned-toggle"></td><td>${stock.ticker}</td><td>${stock.price}</td><td>${stock.name}</td><td align="center"><button class='delStocks' type="button">Delete</button></td></tr>`)
            })
            delStocks();
        })  
      


        $("tbody").empty();
        for(let key in filteredStocks){
            if (!filteredStocks.hasOwnProperty(key)) continue;
            let keyData = `<tr id=${key}><td align="center"><input type="checkbox" class="form-check-input owned-toggle"></td>`;
             
        
            let obj = filteredStocks[key];
            for(let prop in obj) {
                if (!obj.hasOwnProperty(prop)) continue;
                 keyData += `<td prop=${prop}>${obj[prop]}</td> `;
            }
            keyData += `<td align="center"><button class='delStocks' type="button">Delete</button></td>`;
            keyData += "</tr>";
            $("tbody").append(keyData );
            $("tbody tr:last-child").hide();
            $("tbody tr:last-child").fadeIn(1200);

            const owned = users[currentUser].stocks[key].owned;
            $("tbody tr:last-child .owned-toggle")[0].checked = owned;
        }
        addOwnedToggleListener();
        delStocks();
        setCookies('stocks');

        
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
    }

    let users = {};

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
        displayStocks();
    }

    const selectUserByUserName = (userName) => {
        $('#users-dropdown')[0].options.selectedIndex = Array.from($('#users-dropdown')[0].options).map((item) => {
            return item.value;
        }).indexOf(userName);
    }

    $('#users-dropdown').on('change', (event) => {
        selectUser();
    });

    
    const setCookies = (type) => {
        usersJSON = JSON.stringify(users);
        stocksJSON = JSON.stringify(stocks);
        currentUserJSON = JSON.stringify(currentUser);
        
        $.cookie('users', usersJSON);
        $.cookie('stocks', stocksJSON);
        $.cookie('currentUser', currentUserJSON);
    }

    const loadCookies = () => {
        if ($.cookie('users')) {
            users = JSON.parse($.cookie('users'));
            console.log(users);
        }
        if ($.cookie('currentUser')) {
            currentUser = JSON.parse($.cookie('currentUser'));
            console.log("currentusercookie:" + JSON.parse($.cookie('currentUser')));
        }
        if ($.cookie('stocks')) {
            stocks = JSON.parse($.cookie('stocks'));
            console.log(stocks);
        }

        // $('body').hide();
        // $('#content').hide();
        // $('body').fadeIn(2000);
        // $('#Favorite').hide();
        // $('#Favorite').fadeIn(3000);
    }

    loadCookies();
    loadUsers();
    displayStocks();
    //displayStocks();
    // setTimeout(() => {
    //     displayStocks();
    // }, 1000);
    
});


