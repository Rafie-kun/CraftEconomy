# Smart Budget & Expense Tracker Blueprint

## Purpose
Build a simple browser-based expense tracker that clearly demonstrates the AP CSP Create Task requirements:

- a dynamic list
- a student-developed procedure with a parameter
- sequencing, iteration, and selection
- user input and visual output
- two test cases with different outcomes

This blueprint is designed to keep the project clean, easy to explain, and easy to show in the demo video.

## Core Idea
The app lets a user:

1. Set a budget goal
2. Enter expense amounts one at a time
3. Add each expense to a list
4. Recalculate the total
5. Show a warning if spending goes over budget

## Project Structure

Use three files:

- `index.html` for the interface
- `style.css` for the layout and visual design
- `script.js` for the AP CSP logic

## AP CSP Rubric Mapping

### 1. List Requirement
Use a dynamic array to store every expense.

Example:

```javascript
let expenseList = [];
```

Why this works:

- the list grows as the user adds new expenses
- the program processes the whole list later
- it is clearly used for data abstraction, not just storage

### 2. Input
The user types values into:

- a budget input box
- an expense input box

Add a button that submits the expense.

### 3. Output
Show the user:

- the running total spent
- the full list of logged expenses
- a status message

Use visible text on the page, not just alerts, so the output is easy to capture in the video.

### 4. Student-Developed Procedure
Create one main function with a parameter, such as:

```javascript
function analyzeSpending(budgetGoal) {
```

That function must:

- total the list
- compare the total to the budget goal
- update the screen

### 5. Sequencing
Inside the procedure, the steps should happen in order:

1. initialize `totalSpent`
2. loop through the list
3. compare total against budget
4. update the page

### 6. Iteration
Use a loop to go through every item in `expenseList`.

Example:

```javascript
for (let i = 0; i < expenseList.length; i++) {
  totalSpent += expenseList[i];
}
```

### 7. Selection
Use an `if/else` statement to decide which message to show.

Example:

```javascript
if (totalSpent > budgetGoal) {
  // over budget
} else {
  // within budget
}
```

## Recommended User Interface

Keep the layout minimal and centered:

- title at the top
- budget goal input
- expense input
- add expense button
- expense list display
- total spent display
- status message display

### Suggested Visual Style

- background: light gray or soft neutral
- card: white with subtle shadow
- font: Arial, system sans-serif, or Inter if available
- button: strong blue or green for clear visibility in the recording
- warning text: bold red

## Recommended File Behavior

### `index.html`
Include:

- a title header
- a number input for budget goal
- a number input for expense amount
- a button labeled `Add Expense`
- display areas with clear IDs

Suggested IDs:

- `budgetInput`
- `expenseInput`
- `addExpenseBtn`
- `expenseListDisplay`
- `totalDisplay`
- `statusMessage`

### `style.css`
Style for:

- centered container
- readable spacing
- clean typography
- strong button contrast
- red warning state

### `script.js`
Program flow:

1. declare `expenseList`
2. listen for button clicks
3. validate input
4. push expense into the list
5. call `analyzeSpending(budgetGoal)`
6. update the visible list and totals

## Exact Logic Blueprint

### Data Flow

1. User enters budget goal.
2. User enters an expense amount.
3. Program converts input to a number.
4. Expense gets added to `expenseList`.
5. Program recalculates total.
6. Program checks if the total exceeds the budget.
7. Program updates the page with the result.

### Pseudocode

```text
start
  create empty expense list

  when user clicks Add Expense:
    read budget goal
    read expense amount
    if expense is valid:
      add expense to list
      call analyzeSpending(budgetGoal)
      show updated list
      show updated total
      show status message
end
```

## Example Procedure Design

Keep the procedure simple and easy to explain in the written response.

```javascript
function analyzeSpending(budgetGoal) {
  let totalSpent = 0;

  for (let i = 0; i < expenseList.length; i++) {
    totalSpent += expenseList[i];
  }

  if (totalSpent > budgetGoal) {
    statusMessage.textContent = "Warning: Over Budget!";
    statusMessage.style.color = "red";
    statusMessage.style.fontWeight = "bold";
  } else {
    statusMessage.textContent = "Looking good! You are within your budget.";
    statusMessage.style.color = "green";
    statusMessage.style.fontWeight = "normal";
  }

  totalDisplay.textContent = "Total Spent: $" + totalSpent.toFixed(2);
}
```

## Testing Plan

You need two test paths that clearly show different outcomes.

### Test 1: Within Budget

Goal:

- budget = `100`
- add expense = `40`

Expected result:

- status shows `Looking good! You are within your budget.`
- total shows `$40.00`

### Test 2: Over Budget

Goal:

- budget = `100`
- add another expense = `70`

Expected result:

- total becomes `$110.00`
- status changes to `Warning: Over Budget!`
- warning text turns red and bold

## Demo Video Checklist

For the 1-minute recording:

- show the interface clearly
- type values live on screen
- demonstrate the within-budget state
- then demonstrate the over-budget state
- keep the video quiet and professional
- do not show name, face, or voice if you want the simplest submission

## Written Response Prep

This app makes it easy to explain:

- what the list stores
- how the procedure works
- where iteration happens
- where selection happens
- how input affects output

## Build Order

1. Create `index.html`
2. Create `style.css`
3. Create `script.js`
4. Test the input and output flow
5. Verify both rubric test cases
6. Record the video

## Quality Rules

To keep the project strong for AP CSP:

- avoid unnecessary complexity
- keep the logic easy to explain
- make sure every visible output is intentional
- make sure the list is actually used in the algorithm
- make sure the parameter matters in the procedure

## Final Recommendation

The safest version of this project is a simple, polished single-page tracker with a dynamic expense list, a total calculator, and a clear budget warning state. That gives you a strong balance of clarity, rubric coverage, and demo friendliness.
