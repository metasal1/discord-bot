// Example JSON data
// const jsonData = '{"employees": [{"name": "John", "age": 30, "department": "Sales"}, {"name": "Jane", "age": 25, "department": "Marketing"}, {"name": "Bob", "age": 35, "department": "Engineering"}]}';

// Parse JSON data
const jsonData = {
    "rows": [
        {
            "_col0": "2023-03-01 00:00:00.000 UTC",
            "usd_volume": 136354164386.8064
        },
        {
            "_col0": "2023-01-01 00:00:00.000 UTC",
            "usd_volume": 62342622192.56032
        },
        {
            "_col0": "2022-11-01 00:00:00.000 UTC",
            "usd_volume": 97746577155.56041
        },
        {
            "_col0": "2023-05-01 00:00:00.000 UTC",
            "usd_volume": 39675102621.962204
        },
        {
            "_col0": "2022-12-01 00:00:00.000 UTC",
            "usd_volume": 41043849716.731895
        },
        {
            "_col0": "2023-02-01 00:00:00.000 UTC",
            "usd_volume": 77965039098.37369
        },
        {
            "_col0": "2023-04-01 00:00:00.000 UTC",
            "usd_volume": 67003803362.2952
        }
    ],
    "metadata": {
        "column_names": [
            "_col0",
            "usd_volume"
        ]
    }
}

// Parse the JSON data
const data = JSON.parse(jsonData);

// Create an HTML table
const table = document.createElement('table');
const thead = table.createTHead();
const row = thead.insertRow();
const headers = ['Name', 'Volume'];

// Create table headers
headers.forEach(header => {
    const th = document.createElement('th');
    const text = document.createTextNode(header);
    th.appendChild(text);
    row.appendChild(th);
});

const tbody = table.createTBody();

// Populate the table with data
data.employees.forEach(employee => {
    const row = tbody.insertRow();
    const { name, age, department } = employee;
    const values = [name, age, department];
    values.forEach(value => {
        const cell = row.insertCell();
        const text = document.createTextNode(value);
        cell.appendChild(text);
    });
});

// Add the table to the HTML document
document.body.appendChild(table);
