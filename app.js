// BUGET CONTROLLER
var budgetController = (function(){

        var Expense = function(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;  
        };

        var Income = function(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;  
        };

            var calculateTotal = function(type){
                var sum = 0
                data.allItems[type].forEach(function(cur){
                    sum += cur.value;
                });

                /*
                0
                [200, 400, 100]
                sum = 0 + 200
                sum = 200 + 400
                sum = 600 + 100 = 700
                */
                data.totals[type] = sum;
            };

            var data = {
            allItems: {
                exp: [],
                inc: [],
            },
            totals: {
                exp: 0,
                inc: 0,
            },
            budget: 0,
            percentage: -1
        };

        return {
            addItem: function(type, des, val){
                var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
                

                // Create new item based on inc or exp type
                if (type === 'exp'){
                    newItem = new Expense(ID, des, val);
                } else if (type === 'inc'){
                    newItem = new Income(ID, des, val);
                }
                // Push into new data structure
                data.allItems[type].push(newItem);

                // Return the new element
                return newItem;
            },

            calculateBudget: function(){

                //1. Calculate total income and expenses
                calculateTotal('inc');
                calculateTotal('exp');

                //2. Calculate budget: income - expenses
                data.budget = data.totals.inc - data.totals.exp;

                //3. Calculate percentage of income that we spent
                if(data.totals.inc > 0){
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else { 
                    data.percentage = -1;
                }
                
            },

            getBudget: function(){

                return{
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                };

            },

            testing: function(){
                console.log(data);
            }
        };
    
})();



// UI CONTROLLER
var UIController = (function(){

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'

    };

        return {
            getInput: function(){
                return{
                    type : document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
                    description : document.querySelector(DOMStrings.inputDescription).value,
                    value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
                };
                
            },

            addListItem: function(obj, type){
                var html, newHtml, element;

                // Create HTML string with some placeholder text
                if(type === 'inc'){
                    element = DOMStrings.incomeContainer;

                    html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                } else if (type === 'exp'){
                    element = DOMStrings.expensesContainer;

                    html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix">                    <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
                
                // Replace placeholder text with data
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', obj.value);
                // Insert HTML into the DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

            },

            clearFields: function(){
                var fields, fieldsArr;

                fields = document.querySelectorAll(DOMStrings.inputDescription +  ',' + DOMStrings.inputValue);

                fieldsArr = Array.prototype.slice.call(fields);

                fieldsArr.forEach(function(current, index, array) {
                    current.value = '';
                });
                fieldsArr[0].focus();
            },

            displayBudget: function(obj){

                document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
                document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
                document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
                

                if(obj.percentage > 0){
                    document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(DOMStrings.percentageLabel).textContent = '---';
                };
            },

            getDOMStrings: function(){
                return DOMStrings;
            }
        };

        

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    var setupEventlisteners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
    
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();  
            }
        });

       document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    

    var updateBudget = function(){

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget 
        UICtrl.displayBudget(budget);
        
    };
    var ctrlAddItem = function(){
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the fields
            UICtrl.clearFields();
            // 5. Calculate and update budget
            updateBudget();
        }
     };

    var ctrlDeleteItem = function(event){

        console.log(event.target.parentNode.parentNode.parentNode.parentNode);

     };
     

    return {
        init: function(){

            UICtrl.displayBudget( {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1});
            setupEventlisteners();
        }
    };
})(budgetController, UIController);

controller.init();