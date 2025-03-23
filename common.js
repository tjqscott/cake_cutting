// Imports and declarations 
google.charts.load('current', {
    packages: ['corechart']
});
google.charts.setOnLoadCallback(drawChart);

let values = [];
let position = undefined;
let agent = 1;
let modal_hidden = 1;
var chart;
let playing = false;
let intervalId;
let progressInterval;

function switchPage(url) {
    if (url) {
        window.location.href = url;
    }
}

function step_to_step(x){
    return x
}

function step_to_stack(x){
    return x
}

function togglePlaying() {
    playing = !playing;
    let icon = playing ? "./assets/controls/pause.png" : "./assets/controls/play.png";
    document.getElementById("play/pause").src = icon;
    let progressBar = document.getElementById("progress-bar");
    let progressContainer = document.getElementById("progress-container");

    if (playing) {
        progressContainer.style.display = "block"
        progressBar.classList.remove("reset-transition"); // Ensure reset is instant
        progressBar.style.width = "0%";
        void progressBar.offsetWidth; // Force reflow to apply the change

        let progress = 0;
        intervalId = setInterval(() => {
            next();
            progress = 0;
            progressBar.classList.add("reset-transition"); // Disable smooth transition for reset
            progressBar.style.width = "0%";
            void progressBar.offsetWidth;
            progressBar.classList.remove("reset-transition"); // Enable smooth transition after reset
        }, 5000);

        progressInterval = setInterval(() => {
            if (progress >= 100) {
                progress = 100; // Ensure it stays at full before resetting
            } else {
                progress += 2;
                progressBar.classList.add("smooth-transition"); // Ensure smooth transition when increasing
                progressBar.style.width = `${progress}%`;
            }
        }, 100);
    } else {
        progressContainer.style.display = "none"
        clearInterval(intervalId);
        clearInterval(progressInterval);
        progressBar.classList.add("reset-transition"); // Ensure reset is instant when stopping
        progressBar.style.width = "0%";
    }
}

function generateRandomArray(length, maxValue) {
    // Create an empty array
    const randomArray = [];

    // Loop to generate random numbers and push them into the array
    for (let i = 0; i < length; i++) {
        // Generate a random positive number between 1 and maxValue
        const randomNumber = Math.floor(Math.random() * maxValue) + 1;
        randomArray.push(randomNumber);
    }

    return randomArray;
}

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
        if (values[agent].length == 0) {
            values[agent] = [1]
            position = 0
            chart.setSelection([{
                row: position * 3 + 1,
                column: 2
            }])
        }
        algorithm()
    }
}

function drawChart() {
    var data = new google.visualization.DataTable();
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

    const rows = values[agent].flatMap((x, index) => [
        [index, x, null, null],
        [index + 0.5, x, x, createTooltip(index, x)],
        [index + 1, x, null, null]
    ]);

    data.addRows(rows);

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

    chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);

    // Add a selection handler
    function selectHandler() {
        var selectedItem = chart.getSelection()[0];
        if (selectedItem) {
            var value = data.getValue(selectedItem.row, selectedItem.column);
            position = (selectedItem.row - 1) / 3
        }
    }

    // Listen for the 'select' event
    google.visualization.events.addListener(chart, 'select', selectHandler);


    chart.setSelection([{
        row: position * 3 + 1,
        column: 2
    }])
}

function createTooltip(index, value) {
    return `<div class="custom-tooltip">
                <strong>Index:</strong> ${index}<br>
                <strong>Value:</strong> ${value}
            </div>`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {}).catch(err => {
        console.error("Failed to copy: ", err);
    });
}

async function readFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        values[agent] = text.split(/[,\s\n]+/).map(Number).filter(value => !isNaN(value));
        drawChart();
    } catch (err) {
        console.error("Failed to read clipboard: ", err);
    }
}

function addToList() {
    const numInput = document.getElementById('numberInput');
    let inputValue = numInput.value;

    // Replace commas with periods to handle European decimal format
    inputValue = inputValue.replace(/,/g, '.');

    const num = +inputValue; // Convert the modified string to a number

    if (numInput.value === '' || isNaN(num)) {
        console.log("nan");
        return;
    }

    if (position == undefined) {
        position = values[agent].length - 1;
    }

    index = position;

    values[agent].splice(index + 1, 0, num)
    numInput.value = '';

    position += 1
    console.log(position)
    drawChart();
    chart.setSelection([{
        row: position * 3 + 1,
        column: 2
    }])
}

function removeFromList() {
    index = position;
    values[agent].splice(index, 1);
    drawChart();
    position -= 1
    if (position < 0) {
        position = 0
    }
    chart.setSelection([{
        row: position * 3 + 1,
        column: 2
    }])
}

function clearChart() {
    values[agent] = [];
    position = null;
    drawChart();
}

function setAgent(n) {
    console.log(agent)
    if (agent != n || position == undefined) {
        agent = n;
        position = values[agent].length - 1;
    }
    toggleModal()
    drawChart();
}




const numberInput = document.getElementById('numberInput');

numberInput.addEventListener('input', function() {
    if (numberInput.validity.patternMismatch) {
        numberInput.setCustomValidity('Enter a number');
    } else {
        numberInput.setCustomValidity('');
    }
});

numberInput.addEventListener('invalid', function() {
    if (numberInput.validity.patternMismatch) {
        numberInput.setCustomValidity('Enter a number');
    }
});


steps = []

// Cake cutting logic


function cut(preference_values, target_value) {
    if (target_value === 1) {
        return 1;
    }
    if (target_value === 0) {
        return 0;
    }

    const total_value = preference_values.reduce((x, a) => x + a, 0);
    const normalised_values = preference_values.map(x => x / total_value);

    let piece_index = 0;
    let running_total = 0;

    // Find where we exceed target
    while (running_total < target_value && piece_index < normalised_values.length) {
        running_total += normalised_values[piece_index];
        piece_index++;
    }

    // Calculate exact fractional piece needed
    const overshoot = running_total - target_value;
    const last_value = normalised_values[piece_index - 1];
    const fractional_part = (last_value - overshoot) / last_value;

    // Convert to position
    return (piece_index - 1 + fractional_part) / preference_values.length;
}

function evaluate(preference_values, cut_position) {
    if (cut_position === 0) return 0;
    if (cut_position === 1) return 1;

    const total_value = preference_values.reduce((x, a) => x + a, 0);
    const normalised_values = preference_values.map(x => x / total_value);

    const exact_position = cut_position * preference_values.length;
    const whole_pieces = Math.floor(exact_position);
    const fractional_part = exact_position - whole_pieces;

    // Sum whole pieces
    const whole_sum = normalised_values
        .slice(0, whole_pieces)
        .reduce((sum, val) => sum + val, 0);

    // Add fractional piece
    const fractional_value = whole_pieces < normalised_values.length ?
        normalised_values[whole_pieces] * fractional_part :
        0;

    return whole_sum + fractional_value;
}

function diff_cut(preference_values, start_position, target_value) {
    return cut(preference_values, (evaluate(preference_values, start_position) + target_value))
}

function diff_eval(preference_values, start_position, end_position) {
    return evaluate(preference_values, end_position) - evaluate(preference_values, start_position)
}

