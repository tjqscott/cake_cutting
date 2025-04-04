// Initialize the values array with random data
for (i = 0; i < 3; i++) {
    values.push(generateRandomArray(20, 100))
}

// define the cake cutting algorithm
function algorithm() {
    // player 1 cuts the cake into three pieces they consider of equal size
    agent_a_initial_cuts = [
        [0, cut(values[0], 1 / 3)],
        [cut(values[0], 1 / 3), cut(values[0], 2 / 3)],
        [cut(values[0], 2 / 3), 1]
    ]
    // save these cuts for display purposes
    save_initial_cuts = agent_a_initial_cuts.slice()

    // player 2 evaluates the initial pices 
    agent_b_initial_evaluations = agent_a_initial_cuts.map(x => diff_eval(values[1], x[0], x[1]))

    // get the index of player 2's favourite piece
    agent_b_favourite_index = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    
    // remove player 2's favourite piece from the evaluations 
    agent_b_initial_evaluations[agent_b_favourite_index] = -1

    // get the value of player 2's new favourite piece, that is their second favourite
    agent_b_second_favourite_value = agent_b_initial_evaluations[agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)]
    // get the index of player 2's new favourite piece, that is their second favourite
    agent_b_second_favourite_index = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)

    // initialise the trim with a placeholder start position and an end positin at the end of player 2's favourite piece 
    trim = [-1, agent_a_initial_cuts[agent_b_favourite_index][1]]

    // change the end position of player 2's favourite piece such that the new piece has the same value as their second favourite
    agent_a_initial_cuts[agent_b_favourite_index] = [agent_a_initial_cuts[agent_b_favourite_index][0], diff_cut(values[1], agent_a_initial_cuts[agent_b_favourite_index][0], agent_b_second_favourite_value)]
    // update the start of the trim to start where the piece that was just trimmed ends
    trim = [agent_a_initial_cuts[agent_b_favourite_index][1], trim[1]]

    // If the trimming is vanishingly small, that is, it doesnt exist but for errors in floating point repreesntation, no_trim is true, else false
    no_trim = Math.abs(trim[0] - trim[1]) < 0.0000001 || isNaN(trim[0])

    // save the trimed cuts for display
    save_trimmed_cuts = agent_a_initial_cuts.slice()

    // player 3 evaluates the new pieces 
    agent_c_evaluations = agent_a_initial_cuts.map(x => diff_eval(values[2], x[0], x[1]))
    // player 3 picks their favourte piece and is assigned it
    agent_c_assignment = agent_c_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

    // if player 3 picked the piece that was trimmed, they become Player A and Player 2 becomes Player B, otherwise, the roles are reversed
    // Player 2 picks their favourite of the two remaining pieces but must pick the trimmed piece if it is available
    if (agent_b_favourite_index == agent_c_assignment) {
        PA = 2
        PB = 1
        agent_b_assignment = agent_b_initial_evaluations.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)
    } else {
        PA = 1
        PB = 2
        agent_b_assignment = agent_b_favourite_index
    }

    // Player 1 is assigned the final piece of the original three
    agent_a_assignment = [0, 1, 2].filter(item => ![agent_b_assignment, agent_c_assignment].includes(item));

    // the three main assignments are stored
    main_assignments = [agent_a_assignment[0], agent_b_assignment, agent_c_assignment]

    // the value which Player B assigns to the trimming is stored
    agent_PB_trim_value = diff_eval(values[PB], trim[0], trim[1]);

    // Player B cuts the trimming into three equally valuable pieces (one third the stored value each)
    agent_PB_trim_cuts = [
        [trim[0], diff_cut(values[PB], trim[0], agent_PB_trim_value / 3)],
        [diff_cut(values[PB], trim[0], agent_PB_trim_value / 3), diff_cut(values[PB], trim[0], 2 * agent_PB_trim_value / 3)],
        [diff_cut(values[PB], trim[0], 2 * agent_PB_trim_value / 3), trim[1]]
    ];

    // these pieces are saved for display
    save_trim_piece_cuts = [...agent_PB_trim_cuts];

    // the start, end and range of the trimming is stored
    min_cut = Math.min(...agent_PB_trim_cuts.map(([start]) => start));
    max_cut = Math.max(...agent_PB_trim_cuts.map(([, end]) => end));
    range = max_cut - min_cut;

    // the cut pieces of the trimming are stretched to fill the full range and stored for display
    save_stretched_trim_cuts = agent_PB_trim_cuts.map(([start, end]) => [
        (start - min_cut) / range,
        (end - min_cut) / range
    ]);

    // an array is initialised with placeholders for the trimming assignments
    trim_assignments = [-1, -1, -1];

    // an object is defined storing the index of the cut pieces of the trimmings and their value according to Player A
    paUtilities = agent_PB_trim_cuts.map((cut, index) => ({
        index,
        value: diff_eval(values[PA], cut[0], cut[1])
    }));

    // Player A chooses and is assigned their favourite piece of the trimming
    trim_assignments[PA] = paUtilities.reduce((maxIndex, current, _, arr) => 
        current.value > arr[maxIndex].value ? current.index : maxIndex, 
        0
    );

    // the remaining piece indexes are calculated
    availableOptions = [0, 1, 2].filter(i => i !== trim_assignments[PA]);

    // Player 1 evaluates the remaining two pieces of the trimming
    agent0Utilities = availableOptions.map(index => ({
        index,
        value: diff_eval(values[0], agent_PB_trim_cuts[index][0], agent_PB_trim_cuts[index][1])
    }));

    // Player 1 picks their favourite remaining piece
    agent0BestOptionIndex = agent0Utilities.reduce((maxIndex, current, i, arr) => 
        current.value > arr[maxIndex].value ? i : maxIndex, 
        0
    );

    // Player 1 is assingned the selected piece
    trim_assignments[0] = agent0Utilities[agent0BestOptionIndex].index;

    // Player B receives the final piece of the trimming
    trim_assignments[PB] = [0, 1, 2].find(i => 
        i !== trim_assignments[PA] && 
        i !== trim_assignments[0]
    );


    // declare the colours of the three agents
    colours = ["#DE9F9F", "#DEDE9F", "#9FDEDE"]

    // define the steps array to contain each step of the algorithm, the titles explain each step
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

    // in the special case where there is no trimming, strike out all of the steps concerned with the trimming
    if (no_trim) {
        for (i = 7; i < 12; i++) {
            element = document.getElementById(i)
            element.innerHTML = "<s style='text-decoration-thickness: 2px'>" + element.innerText + "</s>"
        }
    } 
    // for the normal case, make sure all of theose steps are not struck out incase they previously were
    else {
        for (i = 7; i < 12; i++) {
            element = document.getElementById(i)
            element.innerHTML = element.innerText
        }
    }

    // show the current step, initialised to zero (the first step)
    showStep(step_to_step(currentStep));

}




// Define the show steps function to send the information from the steps array to the interface
function showStep(stepIndex) {
    // store the visualisation container element as a constant
    const container = document.getElementById('visualization-container');

    // define the shorthand names given to each agent
    agents = ["P1", "P2", "P3"]
    // when dealing with the trimming, provide the additional labels (PA, PB) to the appropriate agents
    if (stepIndex > 6) {
        document.getElementById(agents[PA]).innerHTML = agents[PA] + ", PA"
        document.getElementById(agents[PB]).innerHTML = agents[PB] + ", PB"
    // remove these labels when traversing back to the main body of the algorithm
    } else if (stepIndex < 7) {
        document.getElementById("P2").innerHTML = "P2"
        document.getElementById("P3").innerHTML = "P3"
    }

    // Sort the pieces at the current step index to ensure that they are in order
    const sortedPieces = [...steps[stepIndex].pieces].sort((a, b) => a.range[0] - b.range[0]);

    
    // Set the contents of the container
    // the title is set per the current step from the steps array
    // each piece of cake is sererately rendered with its given border colour
    // each piece of cake is given an on-hover popup revealing all evaluations
    // when dealing exclusively with trimmings, the pieces are swapped for stretched out counterparts
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
                        // If it is, use the stretched trimmings instead of the actual ones
                        save_stretched_trim_cuts.includes(piece.range) 
                            ? save_trim_piece_cuts[save_stretched_trim_cuts.indexOf(piece.range)][0].toFixed(4) 
                            : piece.range[0].toFixed(4)
                    }, ${
                        // Check if the current piece index is in save_stretched_trim_cuts
                        // If it is, use the stretched trimmings instead of the actual ones
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



// define the restart function to set the stack trace and the visualisation to step zero
function restart() {
    document.getElementById(currentStep).classList.remove("active"); // Remove the blue indicator from the current step
    currentStep = 0;                                                 // Set the curernt step variable to zero
    showStep(currentStep);                                           // Show the new current step on the interface
    document.getElementById(currentStep).classList.add("active");    // Set the first element of the stack trace as active
}

// define the next funciton to step through the algorithm
function next() {
    document.getElementById(currentStep).classList.remove("active");  // Remove the blue indicator from the current step
    currentStep++;                                                    // Increment the current step by one
    // If there is no trimmin and the new step would be part of the trimming, move to the final step
    if (no_trim && currentStep > 6 && currentStep < 12) {
        currentStep = 12
    }
    // If the algorithm is being auto played and the last step has been reached, stop auto playing
    if (currentStep == 12 && playing) {
        togglePlaying()
    }
    // If incrementing the step brings it beyond the end of the algorithm, go back to the start
    if (currentStep == 13) {
        currentStep = 0;
    }
    showStep(currentStep);                                            // Show the new current step on the interface
    document.getElementById(currentStep).classList.add("active");     // Set the first element of the stack trace as active
}

// define the previous funciton to step backwards through the algorithm
function previous() {
    document.getElementById(currentStep).classList.remove("active"); // Remove the blue indicator from the current step
    currentStep--;                                                   // decrement the current step by one
    // If there is no trimmin and the new step would be part of the trimming, last step which explains the issue
    if (no_trim && currentStep > 6 && currentStep < 12) {
        currentStep = 6
    }
    // If the new current step is negative, set it to the highest valid step
    if (currentStep == -1) {
        currentStep = 12;
    }
    showStep(currentStep);                                           // Show the new current step on the interface
    document.getElementById(currentStep).classList.add("active");    // Set the first element of the stack trace as active
}

// Initialize variables and start the visualisation
let currentStep = 0;  // Initialise the current step variable to zero
algorithm()           // Run the cake-cutting algorithm
showStep(0);          // Show the first step of the algorithm