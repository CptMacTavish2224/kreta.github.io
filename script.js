document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
    const sidebar = document.getElementById('sidebar');

    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', function () {
            sidebar.classList.toggle('show');
        });
    } else {
        console.error('ToggleButton or Sidebar not found in the DOM.');
    }
});

// Calendar variables
let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();

const day = document.querySelector(".calendar-dates");
const currdate = document.querySelector(".calendar-current-date");
const prenexIcons = document.querySelectorAll(".calendar-navigation span");

// Array of month names
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

// Function to generate the calendar with reserved dates
const manipulate = (reservedDates = []) => {
    // Get the first day of the month
    let dayone = new Date(year, month, 1).getDay();
    dayone = (dayone === 0) ? 6 : dayone - 1;

    // Get the last date of the month
    let lastdate = new Date(year, month + 1, 0).getDate();

    // Get the day of the last date of the month
    let dayend = new Date(year, month, lastdate).getDay();
    dayend = (dayend === 0) ? 6 : dayend - 1;

    // Get the last date of the previous month
    let monthlastdate = new Date(year, month, 0).getDate();

    // Variable to store the generated calendar HTML
    let lit = "";

    // Loop to add the last dates of the previous month
    for (let i = dayone; i > 0; i--) {
        lit += `<li class="inactive">${monthlastdate - i + 1}</li>`;
    }

    // Loop to add the dates of the current month
    for (let i = 1; i <= lastdate; i++) {
        // Format the current date to DD/MM/YYYY
        let dateStr = `${String(i).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

        // Check if the current date is today
        let isToday = i === date.getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? "active" : "";

        // Check if the current date is reserved
        let isReserved = reservedDates.includes(dateStr) ? "reserved" : "";

        lit += `<li class="${isToday} ${isReserved}" data-date="${dateStr}">${i}</li>`;
    }

    // Loop to add the first dates of the next month
    for (let i = dayend; i < 6; i++) {
        lit += `<li class="inactive">${i - dayend + 1}</li>`;
    }

    // Update the text of the current date element with the formatted current month and year
    currdate.innerText = `${months[month]} ${year}`;

    // Update the HTML of the dates element with the generated calendar
    day.innerHTML = lit;
};

// Function to fetch reserved dates from Google Sheets
const fetchReservedDates = () => {
    const spreadsheetId = "1gHwysewlQU2QC7MtDltJrPhINtw5dpn5_1-HbLwdhXs";
    const sheetRange = "Reservations!A2:B"; // Specify the range explicitly to skip headers
    const apiKey = "AIzaSyBrWWQRUJALT2ZqTqLdrYaMX-J5JvSjeZ4";
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetRange}?key=${apiKey}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Extract reserved dates from the data
            const rows = data.values;
            if (!rows || rows.length === 0) {
                console.log("No data found.");
                return;
            }

            // Extract reserved dates and convert format to match calendar (DD/MM/YYYY)
            const reservedDates = rows
                .filter(row => row[1] === "1") // Filter rows where 'is_reserved' is '1'
                .map(row => {
                    const [day, month, year] = row[0].split('/');
                    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
                });

            // Generate calendar with reserved dates
            manipulate(reservedDates);
        })
        .catch(error => console.error("Error fetching reserved dates:", error));
};

// Initial call to generate the calendar with reserved dates
fetchReservedDates();

// Attach a click event listener to each icon
prenexIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        month = icon.id === "calendar-prev" ? month - 1 : month + 1;

        // Check if the month is out of range
        if (month < 0 || month > 11) {
            date = new Date(year, month, new Date().getDate());
            year = date.getFullYear();
            month = date.getMonth();
        } else {
            date = new Date();
        }

        // Fetch reserved dates and update the calendar
        fetchReservedDates();
    });
});
