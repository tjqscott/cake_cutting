// Initialize the values array with random date
for (i = 0; i < 2; i++) {
    values.push(generateRandomArray(20, 100))
}

// declare the colours of the two agents
colours = ["#DE9F9F", "#9FDEDE"]

// define the cake-cutting algorithm
function algorithm(){
    // set the pieces based on the point which player 1 feels evenly divides the cake's value
    pieces = [[0,cut(values[0], 0.5)],[cut(values[0], 0.5),1]]
    // initialise the assignments array to invalid placeholders
    assignments = [-1,-1]
    // assign to player 2 whichever piece they think holds more then half of the value
    assignments[1] = evaluate(values[1], pieces[0][1]) > 0.5 ? 0 : 1
    // assign the remaining piece to player 1
    assignments[0] = 1 - assignments[1]
    
    // define the steps array to contain each step of the algorithm, the titles explain each step
    steps = [
        {
            title: "We have a cake that we must fairly divide between two players",
            pieces: [
                {
                    range: [0,1],
                    color: "#d3d3d3"
                }
            ]
        },
        {
            title: "Player 1 cuts the cake in two two pieces such that he values both equally",
            pieces: [
                {
                    range: pieces[0],
                    color: "#d3d3d3"
                },
                {
                    range: pieces[1],
                    color: "#d3d3d3"
                }
            ]
        },
        {
            title: "Player 2 claims their favourite piece of the cake",
            pieces: pieces.map((range, index) => ({
                range: range,
                color: (index === assignments[1]) ? colours[1] : "#d3d3d3"
            }))
        },
        {
            title: "Player 1 take the remaining piece of cake",
            pieces: pieces.map((range, index) => ({
                range: range,
                color: (index === assignments[0]) ? colours[0] : colours[1]
            }))
        },
    ];

    // show the current step, initialised to zero (the first step)
    showStep(step_to_step(currentStep));
}


// Define the show steps function to send the information from the steps array to the interface
function showStep(stepIndex) {
    // store the visualisation container element as a constant
    const container = document.getElementById('visualization-container');

    // Sort the pieces at the current step index to ensure that they are in order
    const sortedPieces = [...steps[stepIndex].pieces].sort((a, b) => a.range[0] - b.range[0]);

    // Set the contents of the container
    // the title is set per the current step from the steps array
    // each piece of cake is sererately rendered with its given border colour
    // each piece of cake is given an on-hover popup revealing all evaluations
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
                        `<p class=${piece.color == colours[index] && "highlight"} style="color:${colours[index]}"> value: ${diff_eval(agent, piece.range[0], piece.range[1]).toFixed(4)}</p>`
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
    document.getElementById(currentStep).classList.remove("active"); // Remove the blue indicator from the current step
    currentStep++;                                                   // Increment the current step by one
    // If the algorithm is being auto played and the last step has been reached, stop auto playing
    if (currentStep == 3 && playing) {
        togglePlaying()
    }
    // If incrementing the step brings it beyond the end of the algorithm, go back to the start
    if (currentStep == 4) {
        currentStep = 0;
    }   
    showStep(currentStep);                                           // Show the new current step on the interface
    document.getElementById(currentStep).classList.add("active");    // Set the first element of the stack trace as active
}

// define the previous funciton to step backwards through the algorithm
function previous() {
    document.getElementById(currentStep).classList.remove("active"); // Remove the blue indicator from the current step
    currentStep--;                                                   // decrement the current step by one
    // If the new current step is negative, set it to the highest valid step
    if (currentStep == -1) {
        currentStep = 3;
    }
    showStep(currentStep);                                           // Show the new current step on the interface
    document.getElementById(currentStep).classList.add("active");    // Set the first element of the stack trace as active
}

// Initialize variables and start the visualisation
let currentStep = 0;  // Initialise the current step variable to zero
algorithm()           // Run the cake-cutting algorithm
showStep(0);          // Show the first step of the algorithm