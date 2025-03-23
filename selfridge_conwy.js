// Charting logic and functions
// Initialize the values array with the provided data
for (i = 0; i < 3; i++) {
    values.push(generateRandomArray(20, 100))
}


function algorithm() {
    // P1 cuts the cake into three pieces they consider of equal size
    agent_a_initial_cuts = [
        [0, cut(values[0], 1 / 3)],
        [cut(values[0], 1 / 3), cut(values[0], 2 / 3)],
        [cut(values[0], 2 / 3), 1]
    ]
    save_initial_cuts = agent_a_initial_cuts.slice()

    // P2 trims their favourite piece, making it equal to their second
    agent_b_initial_evaluations = agent_a_initial_cuts.map(x => diff_eval(values[1], x[0], x[1]))

    agent_b_favourite_index = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    agent_b_initial_evaluations[agent_b_favourite_index] = -1

    agent_b_second_favourite_value = agent_b_initial_evaluations[agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)]
    agent_b_second_favourite_index = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)

    trim = [-1, agent_a_initial_cuts[agent_b_favourite_index][1]]

    agent_a_initial_cuts[agent_b_favourite_index] = [agent_a_initial_cuts[agent_b_favourite_index][0], diff_cut(values[1], agent_a_initial_cuts[agent_b_favourite_index][0], agent_b_second_favourite_value)]
    trim = [agent_a_initial_cuts[agent_b_favourite_index][1], trim[1]]

    no_trim = Math.abs(trim[0] - trim[1]) < 0.0000001 || isNaN(trim[0])

    save_trimmed_cuts = agent_a_initial_cuts.slice()


    agent_c_evaluations = agent_a_initial_cuts.map(x => diff_eval(values[2], x[0], x[1]))
    agent_c_assignment = agent_c_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

    if (agent_b_favourite_index == agent_c_assignment) {
        PA = 2
        PB = 1
        agent_b_assignment = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)
    } else {
        PA = 1
        PB = 2
        agent_b_assignment = agent_b_favourite_index
    }

    agent_a_assignment = [0, 1, 2].filter(item => ![agent_b_assignment, agent_c_assignment].includes(item));

    main_assignments = [agent_a_assignment[0], agent_b_assignment, agent_c_assignment]

agent_PB_trim_value = diff_eval(values[PB], trim[0], trim[1]);

agent_PB_trim_cuts = [
    [trim[0], diff_cut(values[PB], trim[0], agent_PB_trim_value / 3)],
    [diff_cut(values[PB], trim[0], agent_PB_trim_value / 3), diff_cut(values[PB], trim[0], 2 * agent_PB_trim_value / 3)],
    [diff_cut(values[PB], trim[0], 2 * agent_PB_trim_value / 3), trim[1]]
];

save_trim_piece_cuts = [...agent_PB_trim_cuts];

min_cut = Math.min(...agent_PB_trim_cuts.map(([start]) => start));
max_cut = Math.max(...agent_PB_trim_cuts.map(([, end]) => end));
range = max_cut - min_cut;

save_stretched_trim_cuts = agent_PB_trim_cuts.map(([start, end]) => [
    (start - min_cut) / range,
    (end - min_cut) / range
]);

trim_assignments = [-1, -1, -1];

paUtilities = agent_PB_trim_cuts.map((cut, index) => ({
    index,
    value: diff_eval(values[PA], cut[0], cut[1])
}));

trim_assignments[PA] = paUtilities.reduce((maxIndex, current, _, arr) => 
    current.value > arr[maxIndex].value ? current.index : maxIndex, 
    0
);

availableOptions = [0, 1, 2].filter(i => i !== trim_assignments[PA]);

agent0Utilities = availableOptions.map(index => ({
    index,
    value: diff_eval(values[0], agent_PB_trim_cuts[index][0], agent_PB_trim_cuts[index][1])
}));

agent0BestOptionIndex = agent0Utilities.reduce((maxIndex, current, i, arr) => 
    current.value > arr[maxIndex].value ? i : maxIndex, 
    0
);

trim_assignments[0] = agent0Utilities[agent0BestOptionIndex].index;

trim_assignments[PB] = [0, 1, 2].find(i => 
    i !== trim_assignments[PA] && 
    i !== trim_assignments[0]
);


    colours = ["#DE9F9F", "#DEDE9F", "#9FDEDE"]

    // Visualisation and stepping
    steps = [{
            title: "We have a cake which must be shared between three people!",
            pieces: [{
                range: [0, 1],
                color: "#d3d3d3"
            }]
        },
        {
            title: "Player 1 splits the cake into three pieces that they value equally",
            pieces: [{
                    range: save_initial_cuts[0],
                    color: colours[0]
                },
                {
                    range: save_initial_cuts[1],
                    color: colours[0]
                },
                {
                    range: save_initial_cuts[2],
                    color: colours[0]
                }
            ]
        },
        {
            title: "Player 2 trims their favourite piece to be equal to their second favourite, leaving a `trimmed piece` and creating a `trimming`",
            pieces: [{
                    range: trim,
                    color: "#d3d3d3"
                },
                ...save_trimmed_cuts.map((cut, index) => ({
                    range: cut,
                    color: (index === agent_b_favourite_index || index === agent_b_second_favourite_index) ?
                        colours[1] :
                        "#d3d3d3"
                }))
            ]
        },
        {
            title: "Then Player 3 picks their favourite piece that isnt the trimming",
            pieces: [{
                    range: trim,
                    color: "#d3d3d3"
                },
                ...save_trimmed_cuts.map((cut, index) => ({
                    range: cut,
                    color: (index === agent_c_assignment) ?
                        colours[2] :
                        "#d3d3d3"
                }))
            ]
        },
        {
            title: "Then Player 2 picks from the remaining two pieces, they have to take the trimmed piece if it is available",
            pieces: [{
                    range: trim,
                    color: "#d3d3d3"
                },
                ...save_trimmed_cuts.map((cut, index) => ({
                    range: cut,
                    color: (index === agent_c_assignment) ?
                        colours[2] :
                        (index === agent_b_assignment) ?
                        colours[1] :
                        "#d3d3d3"
                }))
            ]
        },
        {
            title: "Player 1 takes the remaining piece of the cake",
            pieces: [{
                    range: trim,
                    color: "#d3d3d3"
                },
                ...save_trimmed_cuts.map((cut, index) => ({
                    range: cut,
                    color: (index === agent_c_assignment) ?
                        colours[2] :
                        (index === agent_b_assignment) ?
                        colours[1] :
                        colours[0]
                }))
            ]
        },
        {
            title: no_trim ?
                "There is no trim piece so we can jump right to the final evaluation!" :
                "Now we have to divide up the trimming which Player 2 left",
            pieces: [{
                    range: trim,
                    color: "green"
                },
                ...save_trimmed_cuts.map(x => ({
                    range: x,
                    color: "#d3d3d3"
                }))
            ]
        },
        {
            title: "We call whoever ended up with the trimmed piece Player A and whichever of Player 2 and Player 3 didn't Player B",
            pieces: [{
                range: trim,
                color: "green"
            }]
        },
        {
            title: "Player B trims the trimming into three pieces which they value equally",
            pieces: [{
                    range: save_stretched_trim_cuts[0],
                    color: (PB === 1) ? colours[1] : colours[2]
                },
                {
                    range: save_stretched_trim_cuts[1],
                    color: (PB === 1) ? colours[1] : colours[2]
                },
                {
                    range: save_stretched_trim_cuts[2],
                    color: (PB === 1) ? colours[1] : colours[2]
                }
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
                color: (index === trim_assignments[PA]) ? colours[PA] :
                    (index === trim_assignments[0]) ? colours[0] :
                    "#d3d3d3"
            }))
        },
        {
            title: "Finally, Player B is left with the last piece of the trimming",
            pieces: save_stretched_trim_cuts.map((range, index) => ({
                range: save_stretched_trim_cuts[index],
                color: (index === trim_assignments[PA]) ? colours[PA] :
                    (index === trim_assignments[0]) ? colours[0] :
                    colours[PB]
            }))
        },
        {
            title: "We can add the trimming back to the original pieces to see what everyone ends up with",
            pieces: [
                ...save_trimmed_cuts.map((range, index) => ({
                    range,
                    color: index === main_assignments[0] ? colours[0] : index === main_assignments[1] ? colours[1] : colours[2]
                })),
                ...save_trim_piece_cuts.map((range, index) => ({
                    range,
                    color: index === trim_assignments[0] ? colours[0] : index === trim_assignments[1] ? colours[1] : colours[2]
                }))
            ]
        }

    ];

    if (no_trim) {
        for (i = 7; i < 12; i++) {
            element = document.getElementById(i)
            element.innerHTML = "<s style='text-decoration-thickness: 2px'>" + element.innerText + "</s>"
        }
    } else {
        for (i = 7; i < 12; i++) {
            element = document.getElementById(i)
            element.innerHTML = element.innerText
        }
    }

    
    showStep(step_to_step(currentStep));

}




function showStep(stepIndex) {
    const container = document.getElementById('visualization-container');

    agents = ["P1", "P2", "P3"]
    if (stepIndex > 6) {
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
        ${sortedPieces.map((piece, pieceIndex) => `
            <div class="cake-piece" 
                    style="width:${ piece.range == trim && sortedPieces.length == 1 ? "70" : (piece.range[1] - piece.range[0]) * 70}%; 
                           background-position: ${piece.range == trim && sortedPieces.length == 1 ? 0 :-(container.clientWidth * 0.7) * piece.range[0]}px 0;
                           border-color:${piece.color};
                           display:${isNaN(piece.range[0]) || Math.abs(piece.range[0] - piece.range[1]) < 0.0000001 ? 'none' : 'inline-block'}">
                           
                <div class="hover-info" >
                    <p style="color:black">(${
                        // Check if the current piece index is in save_stretched_trim_cuts
                        save_stretched_trim_cuts.includes(piece.range) 
                            ? save_trim_piece_cuts[save_stretched_trim_cuts.indexOf(piece.range)][0].toFixed(4) 
                            : piece.range[0].toFixed(4)
                    }, ${
                        // Check if the current piece index is in save_stretched_trim_cuts
                        save_stretched_trim_cuts.includes(piece.range) 
                            ? save_trim_piece_cuts[save_stretched_trim_cuts.indexOf(piece.range)][1].toFixed(4) 
                            : piece.range[1].toFixed(4)
                    })</p>
                    ${values
                    .map((agent, index) => 
                        `<p class=${piece.color == colours[index] && "highlight"} style="color:${colours[index]}"> value: ${
                            // Use the updated range for calculating diff_eval if the piece is in save_stretched_trim_cuts
                            save_stretched_trim_cuts.includes(piece.range)
                                ? diff_eval(agent, 
                                    save_trim_piece_cuts[save_stretched_trim_cuts.indexOf(piece.range)][0], 
                                    save_trim_piece_cuts[save_stretched_trim_cuts.indexOf(piece.range)][1]
                                ).toFixed(4)
                                : diff_eval(agent, piece.range[0], piece.range[1]).toFixed(4)
                        }</p>` 
                    )
                    .join("") }
                </div>
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
    if (no_trim && currentStep > 6 && currentStep < 12) {
        currentStep = 12
    }
    if (currentStep == 12 && playing) {
        togglePlaying()
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
    if (no_trim && currentStep > 6 && currentStep < 12) {
        currentStep = 6
    }
    if (currentStep == -1) {
        currentStep = 12;
    }
    showStep(currentStep);
    document.getElementById(currentStep).classList.add("active");
}

// Initialize
let currentStep = 0;
algorithm()
showStep(0);