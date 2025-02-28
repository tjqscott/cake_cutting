// Imports and declarations 
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

let values = [];
let position = undefined;
let agent = 1;
let modal_up = 1;

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
// Initialize the values array with the provided data
for (i=0;i<3;i++){
    values.push(generateRandomArray(20, 100))
}

var chart;

function toggleModal() {
    if (modal_up) {
        modal_up = false;
        document.getElementById("blur").style.visibility = "visible";
        document.getElementById("modal").style.visibility = "visible";
    } else {
        modal_up = true;
        document.getElementById("modal").style.visibility = "hidden";
        document.getElementById("blur").style.visibility = "hidden";
        if (values[agent].length == 0){
            values[agent] = [1]
            position = 0
            chart.setSelection([{ row: position * 3 +1, column: 2 }])
        }
    }
}

function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Area');
    data.addColumn('number', 'Points');
    data.addColumn({ type: 'string', role: 'tooltip', p: { html: true } });

    const rows = values[agent].flatMap((x, index) => [
        [index, x, null, null],
        [index + 0.5, x, x, createTooltip(index, x)],
        [index + 1, x, null, null]
    ]);

    data.addRows(rows);

    var options = {
        tooltip: { isHtml: true },
        seriesType: 'area',
        series: {
            0: { areaOpacity: 0.2, enableInteractivity: false, tooltip: { trigger: 'none' } },
            1: { type: 'scatter', pointSize: 4, enableInteractivity: true }
        },
        hAxis: { textPosition: 'none', gridlines: { color: 'transparent' }, baselineColor: 'transparent' },
        vAxis: { textPosition: 'none', gridlines: { color: 'transparent' }, baselineColor: 'transparent' },
        legend: 'none',
        colors: ['#4285F4', '#4285F4'],
        chartArea: { left: 0, top: 0, width: '100%', height: '100%' }
    };

    chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
    chart.draw(data, options);

    // Add a selection handler
    function selectHandler() {
        var selectedItem = chart.getSelection()[0];
        if (selectedItem) {
            var value = data.getValue(selectedItem.row, selectedItem.column);
            position = (selectedItem.row - 1) /3
        }
    }

    // Listen for the 'select' event
    google.visualization.events.addListener(chart, 'select', selectHandler);

    
    chart.setSelection([{ row: position * 3 +1, column: 2 }])
}

function createTooltip(index, value) {
    return `<div class="custom-tooltip">
                <strong>Index:</strong> ${index}<br>
                <strong>Value:</strong> ${value}
            </div>`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
    }).catch(err => {
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

    if (position == undefined){
        position = values[agent].length - 1;
    }
    
    index = position;

    values[agent].splice(index+1, 0, num)
    numInput.value = '';
    
    position += 1
    drawChart();
    chart.setSelection([{ row: position * 3 +1, column: 2 }])
}

function removeFromList() {
    index = position;
    values[agent].splice(index, 1);
    drawChart();
    position -= 1
    if (position < 0){position = 0}
    chart.setSelection([{ row: position * 3 +1, column: 2 }])
}

function clearChart() {
    values[agent] = [];
    drawChart();
}

function setAgent(n) {
    if (agent != n){
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
        numberInput .setCustomValidity('Enter a number');
    }
});



// Cake cutting logic


function cut(preference_values, target_value) {
    if (target_value === 1) {
        return 1;
    }
    if (target_value === 0) {
        return 0;
    }

    const total_value = preference_values.reduce((x, a) => x + a, 0);
    const normalised_values = preference_values.map(x => x/total_value);
    
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
    const normalised_values = preference_values.map(x => x/total_value);
    
    const exact_position = cut_position * preference_values.length;
    const whole_pieces = Math.floor(exact_position);
    const fractional_part = exact_position - whole_pieces;
    
    // Sum whole pieces
    const whole_sum = normalised_values
        .slice(0, whole_pieces)
        .reduce((sum, val) => sum + val, 0);
    
    // Add fractional piece
    const fractional_value = whole_pieces < normalised_values.length 
        ? normalised_values[whole_pieces] * fractional_part 
        : 0;
    
    return whole_sum + fractional_value;
}

function diff_cut(preference_values, start_position, target_value){
    return cut(preference_values, (evaluate(preference_values, start_position) + target_value))
}

function diff_eval(preference_values, start_position, end_position){
    return evaluate(preference_values, end_position) - evaluate(preference_values, start_position)
}


// P1 cuts the cake into three pieces they consider of equal size
agent_a_initial_cuts = [[0,cut(values[0], 1/3)], [cut(values[0], 1/3),cut(values[0], 2/3)], [cut(values[0], 2/3),1]]
save_initial_cuts = agent_a_initial_cuts.slice()

agent_b_initial_evaluations = agent_a_initial_cuts.map(x => diff_eval(values[1], x[0], x[1]))


agent_b_favourite_index = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
agent_b_initial_evaluations[agent_b_favourite_index] = -1

agent_b_second_favourite_value = agent_b_initial_evaluations[agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)]

trim = [-1, agent_a_initial_cuts[agent_b_favourite_index][1]]

agent_a_initial_cuts[agent_b_favourite_index] = [agent_a_initial_cuts[agent_b_favourite_index][0], diff_cut(values[1], agent_a_initial_cuts[agent_b_favourite_index][0], agent_b_second_favourite_value)]
trim = [agent_a_initial_cuts[agent_b_favourite_index][1],trim[1]]


agent_c_evaluations = agent_a_initial_cuts.map(x => diff_eval(values[2], x[0], x[1]))
agent_c_assignment = agent_c_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

if (agent_b_favourite_index == agent_c_assignment){
    PA = 2
    PB = 1
    agent_b_assignment = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)
}else{
    PA = 1
    PB = 2
    agent_b_assignment = agent_b_favourite_index
}

agent_a_assignment = [0,1,2].filter(item => ![agent_b_assignment, agent_c_assignment].includes(item));

main_assignments = [agent_a_assignment[0], agent_b_assignment, agent_c_assignment]

agent_PA_trim_value = diff_eval(values[PA], trim[0], trim[1])
agent_PA_trim_cuts = [[trim[0],diff_cut(values[PA], trim[0], agent_PA_trim_value/3)],[diff_cut(values[PA], trim[0], agent_PA_trim_value/3),diff_cut(values[PA], trim[0], 2*agent_PA_trim_value/3)],[diff_cut(values[PA], trim[0], 2*agent_PA_trim_value/3),trim[1]]]

trim_assignments = [-1,-1,-1]
trim_assignments[PB] = agent_PA_trim_cuts.map(x => diff_eval(values[PB], x[0], x[1])).reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
trim_trim_temp = agent_PA_trim_cuts[trim_assignments[PB]]
agent_PA_trim_cuts[trim_assignments[PB]] = [0,0]

trim_assignments[0] = agent_PA_trim_cuts.map(x => diff_eval(values[0], x[0], x[1])).reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
trim_assignments[PA] = [0,1,2].filter(item => !trim_assignments.includes(item))[0];

agent_PA_trim_cuts[trim_assignments[PB]] = trim_trim_temp

console.log(diff_eval(values[0], agent_a_initial_cuts[main_assignments[0]][0], agent_a_initial_cuts[main_assignments[0]][1])+ diff_eval(values[0], agent_PA_trim_cuts[trim_assignments[0]][0], agent_PA_trim_cuts[trim_assignments[0]][1]))
console.log(diff_eval(values[1], agent_a_initial_cuts[main_assignments[1]][0], agent_a_initial_cuts[main_assignments[1]][1])+ diff_eval(values[1], agent_PA_trim_cuts[trim_assignments[1]][0], agent_PA_trim_cuts[trim_assignments[1]][1]))
console.log(diff_eval(values[2], agent_a_initial_cuts[main_assignments[2]][0], agent_a_initial_cuts[main_assignments[2]][1])+ diff_eval(values[2], agent_PA_trim_cuts[trim_assignments[2]][0], agent_PA_trim_cuts[trim_assignments[2]][1]))



// Visualisation and stepping
    const steps = [
        {
            title: "We have a cake which must be shared between three people!",
            pieces: [
                {range: [0,1], color:"#d3d3d3"}
            ]
        },
        {
            title: "Archie splits the cake into three pieces that he wants equally",
            pieces: [
                { range: save_initial_cuts[0], color: "#FFB5B5" },
                { range: save_initial_cuts[1], color: "#FFB5B5" },
                { range: save_initial_cuts[2], color: "#FFB5B5" }
            ]
        },
        {
            title: "Bobby picks the two pieces that he likes the most",
            pieces: [
                { range: agent_a_initial_cuts[agent_b_favourite_index], color: "#FFB5B5" },
                { range: "30%", color: "#D4C68A" },
                { range: "15%", color: "#D4C68A" }
            ]
        },
        {
            title: "And trims the best piece so that the pieces are equal",
            pieces: [
                { range: "25%", color: "#FFB5B5" },
                { range: "25%", color: "#D4C68A" },
                { range: "5%", color: "#9AD69A" },
                { range: "15%", color: "#D4C68A" }
            ]
        },
        {
            title: "Then Chloe picks her favourite piece from Bobby's two favourites",
            pieces: [
                { range: "25%", color: "#FFB5B5" },
                { range: "25%", color: "#D4C68A" },
                { range: "5%", color: "#9AD69A" },
                { range: "15%", color: "#8BD4D4" }
            ]
        },
        {
            title: "Bobby gets piece which has been trimmed so Chloe gets to cut the trimming",
            pieces: [
                { range: "70%", color: "#9AD69A" }
            ]
        },
        {
            title: "Chloe cuts the trimming into three pieces which she values equally",
            pieces: [
                { range: "24%", color: "#9AD69A" },
                { range: "24%", color: "#9AD69A" },
                { range: "24%", color: "#9AD69A" }
            ]
        },
        {
            title: "Bobby picks his favourite, then Chloe, leaving Archie with the last piece",
            pieces: [
                { range: "24%", color: "#FFB5B5" },
                { range: "24%", color: "#D4C68A" },
                { range: "24%", color: "#8BD4D4" }
            ]
        },
        {
            title: "We add the trimming to the main slice for each player",
            pieces: [
                { range: "25%", color: "#FFB5B5" },
                { range: "1.7%", color: "#9AD69A" },
                { range: "25%", color: "#D4C68A" },
                { range: "1.7%", color: "#9AD69A" },
                { range: "15%", color: "#8BD4D4" },
                { range: "1.7%", color: "#9AD69A" }
            ]
        },
        {
            title: "Leaving every player feeling as though they got their fair share",
            pieces: [
                { range: "25%", color: "#FFB5B5" },
                { range: "1.7%", color: "#FFB5B5" },
                { range: "25%", color: "#D4C68A" },
                { range: "1.7%", color: "#D4C68A" },
                { range: "15%", color: "#8BD4D4" },
                { range: "1.7%", color: "#8BD4D4" }
            ]
        }
    ];

    function showStep(stepIndex) {
        const container = document.getElementById('visualization-container');
        container.innerHTML = `
            <h2 style="height:2.5em">${steps[stepIndex].title}</h2>
            <div class="cake-container">
                ${steps[stepIndex].pieces.map(piece => `
                    <div class="cake-piece" 
                            style="width:${(piece.range[1] - piece.range[0]) * 70}%; 
                                   background-position: ${-(container.clientWidth*0.7) * piece.range[0]}px 0;
                                   border-color:${piece.color}">
                    </div>
                `).join('')}
            </div>
        `;
    }
    

function restart() {
    document.getElementById(currentStep).classList.remove("active");
    currentStep = 0;
    showStep(currentStep);
    document.getElementById(currentStep).classList.add("active");
}

function next() {
    document.getElementById(currentStep).classList.remove("active");
    currentStep++;
    if (currentStep == 10) {
        currentStep = 0;
    } 
    showStep(currentStep);
    document.getElementById(currentStep).classList.add("active");
}

function previous() {
    document.getElementById(currentStep).classList.remove("active");
    currentStep--;
    showStep(currentStep);
    document.getElementById(currentStep).classList.add("active");
}



// Initialize
let currentStep = 0;
showStep(0);