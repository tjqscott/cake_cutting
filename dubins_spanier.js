// Imports and declarations 
google.charts.load('current', {
    packages: ['corechart']
});
google.charts.setOnLoadCallback(drawChart);

let values = [];
let position = undefined;
let agent = 0;
let modal_hidden = 1;

let playing = false;
let intervalId;
let progressInterval;

function switchPage(url) {
    if (url) {
        window.location.href = url;
    }
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

// Charting logic and functions

let player_count = Math.floor(Math.random() * 5) + 4;

function drawAgents() {
    let agent_container = document.getElementById("agent_container");
    
    // Clear the existing content before adding new elements
    agent_container.innerHTML = "";
    
    for (let i = 0; i < player_count; i++) {
        agent_container.innerHTML += `
            <div class="agent_wrapper">
                <img title="Click to edit" onclick="setAgent(${i})" src="./assets/agent.png" alt="user icon" class="agent_icon" style="filter: hue-rotate(${(i*(360/player_count))}deg)">
                <div class="agent-text-container" ><p id="P${i+1}">P${i+1}</p><div class="remove" onclick="removeAgent(${i})">x</div></div>
            </div>`;
    }
    
    agent_container.innerHTML += 
    `<div id="addPlayer" onclick="addAgent()"><p>+</p></div>`
}

// Call the function after the DOM is fully loaded
drawAgents()

// Initialize the values array with the provided data
for (i = 0; i < player_count; i++) {
    values.push(generateRandomArray(20, 100))
}

function removeAgent(n){
    if (player_count > 1){
    restart()
    values.splice(n, 1)
    player_count --
    drawAgents()
    algorithm()
    }else{
        alert("You cant have zero players!")
    }
}

function addAgent(){
    if (player_count < 10){
        restart()
        values.push(generateRandomArray(20, 100))
        player_count ++
        drawAgents()
        algorithm()
    }else{
        alert("Too many players!")
    }
}

var chart;

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
        showStep(step_to_step(currentStep));
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
            top: 0,
            width: '100%',
            height: '100%'
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

function getPlayerColor(playerIndex) {
    const hue = (360 / player_count) * playerIndex;
    return `hsl(${hue}, 50%, 75%)`;
  }

function algorithm(){


    position = 0
    player_count = values.length
    target = 1/player_count
    assignments = new Array(player_count).fill(-1)
    cake_wise_assignments = []

    for (i=0;i<player_count-1;i++){
        offers = values.map((x,index) => assignments[index] == -1 ? diff_cut(x,position,target) : Infinity)
        winner = offers.indexOf(Math.min(...offers))
        cake_wise_assignments.push(winner)
        assignments[winner] = [position, offers[winner]]
        position = offers[winner]
    }
    last_player = assignments.findIndex(a => a == -1)
    assignments[last_player] = [position, 1]
    cake_wise_assignments.push(last_player)
    
    steps = [
        {
          title: "We have a cake that we must fairly divide between the players",
          pieces: [
            {
              range: [0, 1],
              color: "#d3d3d3"
            }
          ]
        },
        ...cake_wise_assignments.slice(0, -1).map((x, i) => ({
          title: "We slide the knife until a player feels the cut would be fair",
          pieces: [
            ...cake_wise_assignments.slice(0, i+1).map((y, j) => ({
              range: assignments[y],
              color: getPlayerColor(cake_wise_assignments[j])
            })),
            {
              range: [assignments[cake_wise_assignments[i]][1],1],
              color: "#d3d3d3" 
            }
          ]
        })),
        {
            title: "There is only one player left without an assigned piece of cake",
            pieces: [
                ...cake_wise_assignments.slice(0, cake_wise_assignments.length - 1).map((y, j) => ({
                    range: assignments[y],
                    color: getPlayerColor(cake_wise_assignments[j])
                  })),
                  {
                    range: assignments[cake_wise_assignments[assignments.length - 1]],
                    color: "#d3d3d3" 
                  }
            ]
        },
                {
                    title: "The last players gets the entire remainder of the cake which they think is great",
                    pieces: [
                        ...cake_wise_assignments.slice(0, cake_wise_assignments.length).map((y, j) => ({
                            range: assignments[y],
                            color: getPlayerColor(cake_wise_assignments[j])
                          }))
                    ]
                }
      ];
}
algorithm()


function showStep(stepIndex) {
    const container = document.getElementById('visualization-container');

    const sortedPieces = [...steps[stepIndex].pieces].sort((a, b) => a.range[0] - b.range[0]);

    container.innerHTML = `
    <h3 id="title_container" style="height:2.5em">${steps[stepIndex].title}</h3>
    <div class="cake-container">
        ${sortedPieces.map((piece, pieceIndex) => `
            <div class="cake-piece" 
                    style="width:${ (piece.range[1] - piece.range[0]) * 70}%; 
                           background-position: ${-(container.clientWidth * 0.7) * piece.range[0]}px 0;
                           border-color:${piece.color};
                           display:${isNaN(piece.range[0]) || Math.abs(piece.range[0] - piece.range[1]) < 0.0000001 ? 'none' : 'inline-block'}">
                           
                <div class="hover-info" >
                    <p style="color:black">(${piece.range[0].toFixed(4)}, ${piece.range[1].toFixed(4)})</p>
                    ${values
                    .map((agent, index) => 
                        `<p style="color:${getPlayerColor(index)}"> value: ${diff_eval(agent, piece.range[0], piece.range[1]).toFixed(4)}</p>`
                    )
                    .join("") }
                </div>
            </div>
        `).join('')}
    </div>
`;
}

total_steps = 1 + (player_count-1)*2 + 2

function step_to_step(n){
    if(currentStep >= (player_count-1)*2 + 1){
        return (currentStep - (player_count-1)*2 + player_count - 1)
    }
        return parseInt(n / 2)
}

function step_to_stack(n){
    if (n == 0){
        return 0
    }else if(currentStep >= (player_count-1)*2 + 1){
        return (currentStep - ((player_count-1)*2 + 1) + 3)
    }
    else{
        return (1 + (n - 1)%2)
    }
}


function restart() {
    document.getElementById(step_to_stack(currentStep)).classList.remove("active");
    currentStep = 0;
    showStep(step_to_step(currentStep));
    document.getElementById(step_to_stack(currentStep)).classList.add("active");
}

function next() {
    document.getElementById(step_to_stack(currentStep)).classList.remove("active");
    currentStep++;
    if (currentStep == 2*player_count  && playing) {
        togglePlaying()
    }
    if (currentStep == 2*player_count + 1) {
        currentStep = 0;
    }
    showStep(step_to_step(currentStep));
    document.getElementById(step_to_stack(currentStep)).classList.add("active");
}

function previous() {
    document.getElementById(step_to_stack(currentStep)).classList.remove("active");
    currentStep--;
    if (currentStep < 0) {
        currentStep = 2*player_count;
    }
    if (currentStep == 3 && playing) {
        togglePlaying();
    }
    showStep(step_to_step(currentStep));
    document.getElementById(step_to_stack(currentStep)).classList.add("active");
}




// Initialize
let currentStep = 0;
showStep(0);