// Import the Google Charts corechart library
google.charts.load('current', {
    packages: ['corechart']
});
google.charts.setOnLoadCallback(drawChart);

let values = [];           // Initialise the values array as empty for value funcitons to be pushed to
let position = undefined;  // Initialise the graph position index as undefined
let agent = 1;             // Initialise the selected agent index as 1, this is arbitrary
let modal_hidden = true;   // Initialsie the modal boolean as true
var chart;                 // Declare the chart variable
let playing = false;       // Initialise the playing boolean as false

// Declare global variables for the playing interval
let intervalId;            
let progressInterval;

// Define the switch page function which takes a URL and redirectst the user to it
function switchPage(url) {
    // If a URL was provided, redirect the user to it
    if (url) {
        window.location.href = url;
    }
}

// Declare the step to step function to return the provided parameter for generalisation, this will be overwritten if needed
function step_to_step(x){
    return x
}

// Declare the step to stack function to return the provided parameter for generalisation, this will be overwritten if needed
function step_to_stack(x){
    return x
}

// Define the toggle playing function to toggle whether the algorithm steps are automatically steping through
function togglePlaying() {
    // Flip the playing variable and change the icon to correspond
    playing = !playing;
    let icon = playing ? "./assets/controls/pause.png" : "./assets/controls/play.png";
    document.getElementById("play/pause").src = icon;

    // Assign the progress bar and its container to variables
    let progressBar = document.getElementById("progress-bar");
    let progressContainer = document.getElementById("progress-container");

    // If playing was just set to true
    if (playing) {
        progressContainer.style.display = "block"
        progressBar.classList.remove("reset-transition"); // Ensure reset is instant
        progressBar.style.width = "0%";
        void progressBar.offsetWidth; // Force reflow to apply the change

        // set the progress through the current step to zero
        let progress = 0;

        // set a five second interval
        intervalId = setInterval(() => {
            next();                                           // Move to the next step by calling the next funciton
            progress = 0;                                     // Reset the progress to zero
            progressBar.classList.add("reset-transition");    // Disable smooth transition for reset
            progressBar.style.width = "0%";                   // Move the progress bar to zero
            void progressBar.offsetWidth;                     // Force reflow to apply the change
            progressBar.classList.remove("reset-transition"); // Enable smooth transition after reset
        }, 5000);

        // set a 100ms interval
        progressInterval = setInterval(() => {
            if (progress >= 100) {
                progress = 100; // Ensure it stays at full before resetting
            } else {
                progress += 2;                                  // increse progress by two percent
                progressBar.classList.add("smooth-transition"); // Ensure smooth transition when increasing
                progressBar.style.width = `${progress}%`;       // set the width of the progress bar to match the progess variable
            }
        }, 100);
    } 
    // If playing was just set to false
    else {
        progressContainer.style.display = "none"       // Hide the entire progress bar container
        clearInterval(intervalId);                     // clear the interval responsible for stepping and ensuring a smooth progress bar
        clearInterval(progressInterval);               // clear the interval responsible for moving the progress bar 
        progressBar.classList.add("reset-transition"); // Ensure reset is instant when stopping
        progressBar.style.width = "0%";                // Set the progress bar to zero
    }
}

// define the generate random array function for the creation of random value functions
function generateRandomArray(length, maxValue) {
    // Create an empty array
    const randomArray = [];

    // Loop to generate random numbers and push them into the array
    for (let i = 0; i < length; i++) {
        // Generate a random positive number between 1 and maxValue
        const randomNumber = Math.floor(Math.random() * maxValue) + 1;
        // push the number to the array
        randomArray.push(randomNumber);
    }
    // return the array
    return randomArray;
}

// define the togal modal function to toggle the graph display tool
// toggle the variable and toggle the visibility of the modal and the blur status of the background element
function toggleModal() {
    if (modal_hidden) {
        // Modal is opened
        modal_hidden = false;
        document.getElementById("blur").style.visibility = "visible";
        document.getElementById("modal").style.visibility = "visible";
    } else {
        // Modal is closed
        modal_hidden = true;
        document.getElementById("modal").style.visibility = "hidden";
        document.getElementById("blur").style.visibility = "hidden";
        // if the modal is closed without any elements in the value function
        if (values[agent].length == 0) {
            // add a single value to the function 
            values[agent] = [1]
            // set the position to zero, the only value in the function
            position = 0
            // update the selected element based on the position
            chart.setSelection([{
                row: position * 3 + 1,
                column: 2
            }])
        }
        // run the cake-cutting algorithm with the new value funciton
        algorithm()
    }
}

// define a function to draw the chart of the selected value funciton
function drawChart() {

    // decalre a google visualisations data table
    var data = new google.visualization.DataTable();

    // add the relevent columns to the data table
    data.addColumn('number', 'X');
    data.addColumn('number', 'Area');
    data.addColumn('number', 'Points');
    data.addColumn({
        type: 'string',
        role: 'tooltip',
        p: {
            html: true
        }
    });

    // add the actual points and phantom points to create the steps associated with the piecewise uniform representation
    const rows = values[agent].flatMap((x, index) => [
        [index, x, null, null],
        [index + 0.5, x, x, createTooltip(index, x)],
        [index + 1, x, null, null]
    ]);

    // add the rows to the data table
    data.addRows(rows);

    // define options regarding the two graphs, the axis formatting, colours, legend, and area according to the documentation
    var options = {
        tooltip: {
            isHtml: true
        },
        seriesType: 'area',
        series: {
            0: {
                areaOpacity: 0.2,
                enableInteractivity: false,
                tooltip: {
                    trigger: 'none'
                }
            },
            1: {
                type: 'scatter',
                pointSize: 4,
                enableInteractivity: true
            }
        },
        hAxis: {
            textPosition: 'none',
            gridlines: {
                color: 'transparent'
            },
            baselineColor: 'transparent'
        },
        vAxis: {
            textPosition: 'none',
            gridlines: {
                color: 'transparent'
            },
            baselineColor: 'transparent'
        },
        legend: 'none',
        colors: ['#4285F4', '#4285F4'],
        chartArea: {
            left: 0,
            top: '5%',
            width: '100%',
            height: '90%', 
            bottom: '5%' 
        }
    };

    // set the chart, pasing in the chart div container
    chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    // draw the chart using the data table and the options defined above
    chart.draw(data, options);

    // Add a selection handler which sets the positon index based on the clicked point on the graph
    function selectHandler() {
        var selectedItem = chart.getSelection()[0];
        if (selectedItem) {
            // since indexes start at one and there are three points per real point, this conversion must take place
            position = (selectedItem.row - 1) / 3
        }
    }

    // add a listener to the graph, sending select events to the select handler
    google.visualization.events.addListener(chart, 'select', selectHandler);

    // set the selection to the selected position after the graph is drawn for pre defined selections
    chart.setSelection([{
        row: position * 3 + 1,
        column: 2
    }])
}

// define the crete tool tip funciton to create the on hover tool for the center points of the graph
function createTooltip(index, value) {
    // return a div element containing a labeled index and value in bold type
    return `<div class="custom-tooltip">
                <strong>Index:</strong> ${index}<br>
                <strong>Value:</strong> ${value}
            </div>`;
}

// define the copy to clipboard function which copies the selected value funciton to the user's clipboard
function copyToClipboard(text) {
    // the navigator.clipboard.writeText function is user to send the text parameter to the clipboard
    navigator.clipboard.writeText(text).then(() => {}).catch(err => {
        // errors such as missing permission are sent to the console
        console.error("Failed to copy: ", err);
    });
}

// define the read from clipboard to read data from the user's clipboard
async function readFromClipboard() {
    try {
        // the text is read from the clipboard using navigator.clipboard.readText function
        const text = await navigator.clipboard.readText();
        // the text is split on newline characters, spaces, and commas
        // the resultant array is mapped to numbers, with invalid data removed and assigned to the selected value function
        values[agent] = text.split(/[,\s\n]+/).map(Number).filter(value => !isNaN(value));
        drawChart();
    } catch (err) {
        // errors such as missing permission are sent to the console
        console.error("Failed to read clipboard: ", err);
    }
}

// the add to list funcntion is defined to add a new element to the selected value function
function addToList() {

    // the new number is fetched from the number input form
    const numInput = document.getElementById('numberInput');
    let inputValue = numInput.value;

    // replace commas with decimal points to handle European decimal format
    inputValue = inputValue.replace(/,/g, '.');

    const num = +inputValue; // Convert the modified string to a number

    // if a string or other non number element gets through, the function returns
    if (numInput.value === '' || isNaN(num)) {
        return;
    }

    // if position is ever undefined, it is set to the final element of the function
    if (position == undefined) {
        position = values[agent].length - 1;
    }

    // the value is entered after the current selected position
    values[agent].splice(position + 1, 0, num)
    // the input field is cleared
    numInput.value = '';

    // the position is incremented
    position += 1
    // the chart is redrawn to contain the new point
    drawChart();
    // the visually selected point is updated
    chart.setSelection([{
        row: position * 3 + 1,
        column: 2
    }])
}


// define the remove from list funciton for removing elements from the value function
function removeFromList() {
    // the currently seelcted element is removed from the list
    values[agent].splice(position, 1);
    // the chart is redrawn to reflect the change
    drawChart();
    // the position index is decremented
    position -= 1
    // if the position becomes negative, it is reset to zero
    if (position < 0) {
        position = 0
    }
    // the visually selected point is updated
    chart.setSelection([{
        row: position * 3 + 1,
        column: 2
    }])
}

// define the clear chart function to remove all elements from the currently selected value function
function clearChart() {
    // set the current value function to an empty array
    values[agent] = [];
    // set the current position to undefined
    position = null;
    // redraw the chart to reflect the change
    drawChart();
}

// define the set agent function to set the correct agent before the chart is drawn
function setAgent(n) {
    // if there is a change in agent or the position is undefined
    if (agent != n || position == undefined) {
        // update the selected agent index 
        agent = n;
        // set the position to the last element in the value funciton
        position = values[agent].length - 1;
    }
    // toggle the modal so that the chart is visible
    toggleModal()
    // redraw the chart to show the change in agent
    drawChart();
}



// store the number input box as a variable
const numberInput = document.getElementById('numberInput');

// ddd an event listener that triggers whenever the user types in the input field
numberInput.addEventListener('input', function() {
    // check if the input does not match the expected pattern
    if (numberInput.validity.patternMismatch) {
        // set a custom validation message if the input is invalid
        numberInput.setCustomValidity('Enter a number');
    } else {
        // clear the validation message if the input is valid
        numberInput.setCustomValidity('');
    }
});

// add an event listener that triggers when the form is submitted with an invalid input
numberInput.addEventListener('invalid', function() {
    // check if the input does not match the expected pattern
    if (numberInput.validity.patternMismatch) {
        // set the same custom validation message when the form validation fails
        numberInput.setCustomValidity('Enter a number');
    }
});


// initialise the steps array in a global scope so that it is accessible between files
steps = []



// Cake cutting logic

// declare the cut function to handle cutting the cake given a target value and a value function
function cut(preference_values, target_value) {

    // handle the special case of cutting for the entire value by returning the entire range 
    if (target_value === 1) {
        return 1;
    }
    // handle the special case of cutting for no value by returning zero
    if (target_value === 0) {
        return 0;
    }

    // calculate the total value from the value function
    const total_value = preference_values.reduce((x, a) => x + a, 0);
    // normalise the value funciton by dividing by the total value
    const normalised_values = preference_values.map(x => x / total_value);

    // declare piece index to track the id of the current piece during runtime 
    let piece_index = 0;
    // declare running total to track the total value of the previous pieces
    let running_total = 0;

    // run until the running total exceeds the target value or the end of the function is reached
    while (running_total < target_value && piece_index < normalised_values.length) {
        // add the value of the current piece to the running total
        running_total += normalised_values[piece_index];
        // increment the piece inded
        piece_index++;
    }

    // define overshoot as the difference beteween the running total and the target value
    const overshoot = running_total - target_value;
    // define last value as the value of the piece that caused running total to exceed the target value
    const last_value = normalised_values[piece_index - 1];
    // define fractional part as the proportion of the last piece that is needed to perfectly match the target value
    const fractional_part = (last_value - overshoot) / last_value;

    // add the number of whole pieces to the fractional proportion and divide by the length of the function and return
    return (piece_index - 1 + fractional_part) / preference_values.length;
}

// define the evaluate function to handle evaluating a piece of cake given the end point and a value function
function evaluate(preference_values, cut_position) {

    // handle special cases where none or all of the cake is being evaluated, return none or all of the value
    if (cut_position === 0) return 0;
    if (cut_position === 1) return 1;

    // calculate the total value from the value function
    const total_value = preference_values.reduce((x, a) => x + a, 0);
    // normalise the value funciton by dividing by the total value
    const normalised_values = preference_values.map(x => x / total_value);

    // define the exact position as the cut position in terms of the number of pieces traversed
    const exact_position = cut_position * preference_values.length;
    // define whole pieces as the floor of exact position; the number of entire pieces being evaluated
    const whole_pieces = Math.floor(exact_position);
    // define fractional part as the difference between exact position and whole pieces; the ratio of the next piece that was traversed
    const fractional_part = exact_position - whole_pieces;

    // sum the normalsied values of all of the whole pieces
    const whole_sum = normalised_values
        .slice(0, whole_pieces)
        .reduce((sum, val) => sum + val, 0);

    // define the fractional value as the fractional part multiplied by the value of the part traversed piece
    // this is zero if the end of the function is reached to avoid list index errors
    const fractional_value = whole_pieces < normalised_values.length ?
        normalised_values[whole_pieces] * fractional_part :
        0;

    // the fractional value is added to the sum of the whole parts and this is returned
    return whole_sum + fractional_value;
}

// define the differential cut to make a cut given a value function, a start point and a target value
function diff_cut(preference_values, start_position, target_value) {
    // evaluate the value contained left of the start position and add this to the target value to get the true target value
    // return the value of the regular cut function with the same value function and the new target value
    return cut(preference_values, (evaluate(preference_values, start_position) + target_value))
}

// defined the differential evaluation function to evaluate a middle piece of cake given a start and end postion and a value function
function diff_eval(preference_values, start_position, end_position) {
    // call evaluate to get the value of the cake up to the end position
    // call evaluate again to get the value of the cake up to the start position
    // subtract the latter from the former and return the difference, this is the value contained between the two positions
    return evaluate(preference_values, end_position) - evaluate(preference_values, start_position)
}

