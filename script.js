// Imports and declarations 
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

let values = [];
let position = undefined;
let agent = 1;
let modal_hidden = 1;


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
        if (values[agent].length == 0){
            values[agent] = [1]
            position = 0
            chart.setSelection([{ row: position * 3 +1, column: 2 }])
        }
        selfridge_conway()
        showStep(currentStep)
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

function selfridge_conway(){
    // P1 cuts the cake into three pieces they consider of equal size
    agent_a_initial_cuts = [[0,cut(values[0], 1/3)], [cut(values[0], 1/3),cut(values[0], 2/3)], [cut(values[0], 2/3),1]]
    save_initial_cuts = agent_a_initial_cuts.slice()

    // P2 trims their favourite piece, making it equal to their second
    agent_b_initial_evaluations = agent_a_initial_cuts.map(x => diff_eval(values[1], x[0], x[1]))

    agent_b_favourite_index = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    agent_b_initial_evaluations[agent_b_favourite_index] = -1

    agent_b_second_favourite_value = agent_b_initial_evaluations[agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)]
    agent_b_second_favourite_index = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)

    trim = [-1, agent_a_initial_cuts[agent_b_favourite_index][1]]

    agent_a_initial_cuts[agent_b_favourite_index] = [agent_a_initial_cuts[agent_b_favourite_index][0], diff_cut(values[1], agent_a_initial_cuts[agent_b_favourite_index][0], agent_b_second_favourite_value)]
    trim = [agent_a_initial_cuts[agent_b_favourite_index][1],trim[1]]

    no_trim = Math.abs(trim[0] - trim[1]) < 0.0001 || isNaN(trim[0])

    save_trimmed_cuts = agent_a_initial_cuts.slice()


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

    save_trim_piece_cuts = agent_PA_trim_cuts.slice()

    save_stretched_trim_cuts = agent_PA_trim_cuts.map(([start, end]) => [(start - (agent_PA_trim_cuts.sort(([a], [b]) => a - b)[0][0])) / (agent_PA_trim_cuts.sort(([, a], [, b]) => b - a)[0][1] - agent_PA_trim_cuts.sort(([a], [b]) => a - b)[0][0]), (end - (agent_PA_trim_cuts.sort(([a], [b]) => a - b)[0][0])) / (agent_PA_trim_cuts.sort(([, a], [, b]) => b - a)[0][1] - agent_PA_trim_cuts.sort(([a], [b]) => a - b)[0][0])]);

    // Initialize the assignments array
    trim_assignments = [-1, -1, -1];

    // Store a copy of the original cuts for reference
    const originalCuts = [...agent_PA_trim_cuts];

    // Step 1: Find the best option for PB
    let pbUtilities = agent_PA_trim_cuts.map((x, i) => ({
    index: i,
    value: diff_eval(values[PB], x[0], x[1])
    }));
    trim_assignments[PB] = pbUtilities.reduce((iMax, x, i, arr) => 
    x.value > arr[iMax].value ? i : iMax, 0
    );

    // Step 2: Find the best option for agent 0, excluding PB's choice
    let availableOptions = [0, 1, 2].filter(i => i !== trim_assignments[PB]);
    let agent0Utilities = availableOptions.map(i => ({
    index: i,
    value: diff_eval(values[0], originalCuts[i][0], originalCuts[i][1])
    }));
    trim_assignments[0] = agent0Utilities.reduce((iMax, x, i, arr) => 
    x.value > arr[iMax].value ? i : iMax, 0
    );
    // Fix: We need to get the actual index, not the position in the reduced array
    trim_assignments[0] = agent0Utilities[trim_assignments[0]].index;

    // Step 3: PA gets the remaining option
    trim_assignments[PA] = [0, 1, 2].find(i => 
    i !== trim_assignments[PB] && 
    i !== trim_assignments[0]
    );

    
    colours = ["#DE9F9F", "#DEDE9F", "#9FDEDE"]

    // Visualisation and stepping
    steps = [
        {
            title: "We have a cake which must be shared between three people!",
            pieces: [
                {range: [0,1], color:"#d3d3d3"}
            ]
        },
        {
            title: "Player 1 splits the cake into three pieces that they value equally",
            pieces: [
                { range: save_initial_cuts[0], color: colours[0] },
                { range: save_initial_cuts[1], color: colours[0] },
                { range: save_initial_cuts[2], color: colours[0] }
            ]
        },
        {
            title: "Player 2 trims their favourite piece to be equal to their second favourite, leaving a `trimmed piece` and creating a `trimming`",
            pieces: [
                { range: trim, color: "#d3d3d3" },
                ...save_trimmed_cuts.map((cut, index) => ({
                    range: cut,
                    color: (index === agent_b_favourite_index || index === agent_b_second_favourite_index) 
                        ? colours[1] 
                        : "#d3d3d3" 
                }))
            ]
        },
        {
            title: "Then Player 3 picks their favourite piece that isnt the trimming",
            pieces: [
                { range: trim, color: "#d3d3d3" },
                ...save_trimmed_cuts.map((cut, index) => ({
                    range: cut,
                    color: (index === agent_c_assignment) 
                        ? colours[2] 
                        : "#d3d3d3"
                }))
            ]
        },
        {
            title: "Then Player 2 picks from the remaining two pieces, they have to take the trimmed piece if it is available",
            pieces: [
                { range: trim, color: "#d3d3d3" },
                ...save_trimmed_cuts.map((cut, index) => ({
                    range: cut,
                    color: (index === agent_c_assignment) 
                        ? colours[2] 
                        : (index === agent_b_assignment) 
                            ? colours[1] 
                            : "#d3d3d3" 
                }))
            ]
        },
        {
            title: "Player 1 takes the remaining piece of the cake",
            pieces: [
                { range: trim, color: "#d3d3d3" },
                ...save_trimmed_cuts.map((cut, index) => ({
                    range: cut,
                    color: (index === agent_c_assignment) 
                        ? colours[2]
                        : (index === agent_b_assignment) 
                            ? colours[1] 
                            : colours[0] 
                }))
            ]
        },
        {
            title: 
            no_trim ? 
            "There is no trim piece so we can jump right to the final evaluation!"
            :
            "Now we have to divide up the trimming which Player 2 left"
            ,
            pieces: [
                {range: [0,1], color:"#d3d3d3"}
            ]
        },
        {
            title: "We call whoever ended up with the trimmed piece Player A and whichever of Player 2 and Player 3 didn't Player B",
            pieces: [
                {range: [0,1], color:"#d3d3d3"}
            ]
        },
        {
            title: "Player B trims the trimming into three pieces which they value equally",
            pieces: [
                { range: save_stretched_trim_cuts[0], color: (PB === 1) ? colours[1] : colours[2] },
                { range: save_stretched_trim_cuts[1], color: (PB === 1) ? colours[1] : colours[2] },
                { range: save_stretched_trim_cuts[2], color: (PB === 1) ? colours[1] : colours[2] }
            ]
        },
        {
            title: "Then Player A picks their favourite piece of the trimming",
            pieces: save_stretched_trim_cuts.map((range, index) => ({
                range: save_stretched_trim_cuts[index], 
                color: (index === trim_assignments[PA]) ? colours[PA] : "#d3d3d3" 
            }))
        },
        {
            title: "Player 1 Picks next",
            pieces: save_stretched_trim_cuts.map((range, index) => ({
                range: save_stretched_trim_cuts[index], 
                color: (index === trim_assignments[PA]) ? colours[PA] 
                    : (index === trim_assignments[0]) ? colours[0]
                    : "#d3d3d3"
            }))
        },
        {
            title: "Finally, Player B is left with the last piece of the trimming",
            pieces: save_stretched_trim_cuts.map((range, index) => ({
                range: save_stretched_trim_cuts[index],
                color: (index === trim_assignments[PA]) ? colours[PA] 
                    : (index === trim_assignments[0]) ? colours[0]
                    : colours[PB] 
            }))
        },
        {
            title: "We can add the trimming back to the original pieces to see what everyone ends up with",
            pieces: [
                ...save_trimmed_cuts.map((range, index) => ({
                    range,
                    color: index === main_assignments[0] ? colours[0] : 
                           index === main_assignments[1] ? colours[1] : 
                           colours[2] 
                })),
                ...save_trim_piece_cuts.map((range, index) => ({
                    range,
                    color: index === trim_assignments[0] ? colours[0] : 
                           index === trim_assignments[1] ? colours[1] :  
                           colours[2] 
                }))
            ]
        }
        
    ];

    if (no_trim){
        for (i = 7; i < 12 ; i++){
            element = document.getElementById(i)
            element.innerHTML = "<strike>"+ element.innerText +"</strike>"
        }
    }else{
        for (i = 7; i < 12 ; i++){
            element = document.getElementById(i)
            element.innerHTML = element.innerText
        }
    }

}

selfridge_conway()



function showStep(stepIndex) {
    const container = document.getElementById('visualization-container');

    agents = ["P1", "P2", "P3"]
    if (stepIndex == 7) {
        document.getElementById(agents[PA]).innerHTML = agents[PA] + ", PA"
        document.getElementById(agents[PB]).innerHTML = agents[PB] + ", PB"
    } else if (stepIndex < 7) {
        document.getElementById("P2").innerHTML = "P2"
        document.getElementById("P3").innerHTML = "P3"
    }
    
    const sortedPieces = [...steps[stepIndex].pieces].sort((a, b) => a.range[0] - b.range[0]);

    container.innerHTML = `
        <h3 id="title_container" style="height:2.5em">${steps[stepIndex].title}</h3>
        <div class="cake-container">
            ${sortedPieces.map(piece => `
                <div class="cake-piece" 
                        style="width:${(piece.range[1] - piece.range[0]) * 70}%; 
                               background-position: ${-(container.clientWidth * 0.7) * piece.range[0]}px 0;
                               border-color:${piece.color};
                               display:${isNaN(piece.range[0]) || Math.abs(piece.range[0] - piece.range[1]) < 0.0001 ? 'none' : 'inline-block'}">
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
    if (no_trim && currentStep == 7){
        currentStep += 5
    }
    if (currentStep == 13) {
        currentStep = 0;
    } 
    showStep(currentStep);
    document.getElementById(currentStep).classList.add("active");
}

function previous() {
    document.getElementById(currentStep).classList.remove("active");
    currentStep--;
    if (no_trim && currentStep == 11){
        currentStep -= 5
    }
    if (currentStep == -1) {
        currentStep = 12;
    } 
    showStep(currentStep);
    document.getElementById(currentStep).classList.add("active");
}




// Initialize
let currentStep = 0;
showStep(0);