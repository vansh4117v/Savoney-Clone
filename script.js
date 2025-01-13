const incomeForm = document.getElementById("income-form")
const budgetForm = document.getElementById("budget-form")
const expenseForm = document.getElementById("expense-form")
const totalIncome = document.getElementById("total-income")
const totalBalance = document.getElementById("total-balance")
const totalExpense = document.getElementById("total-expense")

const resetButton = document.getElementById("reset")
let incomeChart;
let expenseChart;

let incomeArray = []
let budgetObject = {}
let expenseArray = []

function start() {
    totalIncome.innerText = JSON.parse(localStorage.getItem("totalIncome"))
    totalExpense.innerText = JSON.parse(localStorage.getItem("totalExpense"))
    totalBalance.innerText = parseInt(totalIncome.innerText) - parseInt(totalExpense.innerText)
    incomeArray = JSON.parse(localStorage.getItem("incomeArray"))
    budgetObject = JSON.parse(localStorage.getItem("budgetObject"))
    expenseArray = JSON.parse(localStorage.getItem("expenseArray"))
    incomeArray.forEach(element => {
        addIncomeHistory(element)
    });
    expenseArray.forEach(element => {
        addExpenseHistory(element)
    });
    for (const key in budgetObject) {
        addBudgetList(key)
        updateBudgetList(key)
    }
    incomeChart = loadChart("incomeChart", incomeArray,incomeChart)
    expenseChart = loadChart("expenseChart", expenseArray,expenseChart)
}


function addIncomeHistory(obj) {
    const div = document.createElement("div")
    div.className = "income-history"
    div.innerHTML = `${obj.amount} from ${obj.remark} on ${obj.date} as ${obj.source}`
    const incomeHistoryBox = document.querySelector(".income-history-box")
    if (incomeHistoryBox.firstChild) {
        incomeHistoryBox.insertBefore(div, incomeHistoryBox.firstChild)
    }
    else incomeHistoryBox.appendChild(div)
}

function addExpenseHistory(obj) {
    const div = document.createElement("div")
    div.className = "expense-history"
    div.innerHTML = `${obj.amount} on ${obj.remark} on ${obj.date} from ${obj.source}`
    const expenseHistoryBox = document.querySelector(".expense-history-box")
    if (expenseHistoryBox.firstChild) {
        expenseHistoryBox.insertBefore(div, expenseHistoryBox.firstChild)
    }
    else expenseHistoryBox.appendChild(div)
}

function addBudgetList(key) {
    const text = document.createTextNode(key)
    const outer = document.createElement("div")
    outer.className = "outer"
    const inner = document.createElement("div")
    budgetObject[key].inner = inner
    inner.className = "inner"
    outer.appendChild(inner)
    const fragment = document.createDocumentFragment();
    fragment.appendChild(text)
    fragment.appendChild(outer)
    const budgetList = document.querySelector(".budget-list")
    if (budgetList.firstChild) {
        budgetList.insertBefore(fragment, budgetList.firstChild)
    }
    else budgetList.appendChild(fragment)

    const expenseSource = document.getElementById("expense-src")
    const option = document.createElement("option")
    option.value = key;
    option.innerText = key;
    expenseSource.appendChild(option)
}

function updateBudgetList(key) {
    let percentWidth = budgetObject[key].consumed / budgetObject[key].amount
    percentWidth = parseInt(percentWidth * 100)
    budgetObject[key].inner.style.width = `${percentWidth}%`;
    localStorage.setItem("budgetObject", JSON.stringify(budgetObject))
}

function addIncome(e) {
    const amount = parseInt(document.getElementById("income-amt").value)
    const date = document.getElementById("income-date").value
    const remark = document.getElementById("income-remarks").value
    const source = document.getElementById("income-src").value
    const currentIncomeObject = { amount, date, remark, source }
    incomeArray.push(currentIncomeObject)
    totalIncome.innerText = parseInt(totalIncome.innerText) + amount
    totalBalance.innerText = parseInt(totalBalance.innerText) + amount
    incomeForm.reset()
    e.preventDefault()
    localStorage.setItem("incomeArray", JSON.stringify(incomeArray))
    localStorage.setItem("totalIncome", JSON.stringify(totalIncome.innerHTML))
    addIncomeHistory(currentIncomeObject)
    if (incomeChart) {
        incomeChart.destroy(); 
    }
    incomeChart = loadChart("incomeChart", incomeArray)
}

function addBudget(e) {
    const amount = parseInt(document.getElementById("budget-amt").value)
    const type = document.getElementById("budget-type").value
    if (Object.hasOwn(budgetObject, type)) {
        budgetObject[type].amount += amount
    }
    else {
        budgetObject[type] = { amount, consumed: 0 }
    }
    budgetForm.reset()
    addBudgetList(type)
    localStorage.setItem("budgetObject", JSON.stringify(budgetObject))
    e.preventDefault()
}

function addExpense(e) {
    const amount = parseInt(document.getElementById("expense-amt").value)
    const date = document.getElementById("expense-date").value
    const remark = document.getElementById("expense-remarks").value
    const source = document.getElementById("expense-src").value
    if (budgetObject[source].amount - budgetObject[source].consumed < amount) {
        alert("Insufficient Budget");
        return;
    }
    const currentExpenseObject = { amount, date, remark, source }
    expenseArray.push(currentExpenseObject)
    budgetObject[source].consumed += amount
    console.log(expenseArray)
    totalExpense.innerText = parseInt(totalExpense.innerText) + amount
    totalBalance.innerText = parseInt(totalBalance.innerText) - amount
    addExpenseHistory(currentExpenseObject)
    updateBudgetList(source)
    expenseForm.reset()
    localStorage.setItem("expenseArray", JSON.stringify(expenseArray))
    localStorage.setItem("totalExpense", JSON.stringify(totalExpense.innerText))
    localStorage.setItem("budgetObject", JSON.stringify(budgetObject))
    e.preventDefault()
    if (expenseChart) {
        expenseChart.destroy(); 
    }
    expenseChart = loadChart("expenseChart", expenseArray)
}

function loadChart(id, array) {
    const chart = document.getElementById(id)
    const chartLabels = [];
    const chartData = [];
    array.forEach(value => {
        chartData.push(value.amount)
        chartLabels.push(value.source)
    })
    const data = {
        labels: chartLabels,
        datasets: [
            {
                data: chartData,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(1, 142, 203)',
                    'rgb(106, 144, 204)',
                    'rgb(1, 142, 203)',
                    'rgb(102, 55, 221)',
                ],
            },
        ],
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Expense',
                },
            },
        },
    };

    return new Chart(chart, config);
}

function reset() {
    incomeArray = []
    budgetObject = {}
    expenseArray = []
    totalIncome.innerHTML = 0
    totalExpense.innerHTML = 0
    localStorage.setItem("incomeArray", JSON.stringify(incomeArray))
    localStorage.setItem("expenseArray", JSON.stringify(expenseArray))
    localStorage.setItem("totalIncome", JSON.stringify(totalIncome.innerHTML))
    localStorage.setItem("budgetObject", JSON.stringify(budgetObject))
    localStorage.setItem("totalExpense", JSON.stringify(totalExpense.innerText))
    location.reload();
}

incomeForm.addEventListener("submit", addIncome)
budgetForm.addEventListener("submit", addBudget)
expenseForm.addEventListener("submit", addExpense)
window.addEventListener("load", start)
resetButton.addEventListener("click", reset)

// vansh4117v