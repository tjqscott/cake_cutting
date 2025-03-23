
// Charting logic and functions
// Initialize the values array with the provided data
for (i = 0; i < 2; i++) {
    values.push(generateRandomArray(20, 100))
}

function algorithm(){
    pieces = [[0,cut(values[0], 0.5)],[cut(values[0], 0.5),1]]
    assignments = [-1,-1]
    assignments[1] = evaluate(values[1], pieces[0][1]) > 0.5 ? 0 : 1
    assignments[0] = 1 - assignments[1]
    
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

    showStep(step_to_step(currentStep));
}


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
                        `<p style="color:${colours[index]}"> value: ${diff_eval(agent, piece.range[0], piece.range[1]).toFixed(4)}</p>`
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
    if (currentStep == 3 && playing) {
        togglePlaying()
    }
    if (currentStep == 4) {
        currentStep = 0;
    }
    showStep(currentStep);
    document.getElementById(currentStep).classList.add("active");
}

function previous() {
    document.getElementById(currentStep).classList.remove("active");
    currentStep--;
    if (currentStep == -1) {
        currentStep = 3;
    }
    showStep(currentStep);
    document.getElementById(currentStep).classList.add("active");
}


// Initialize
let currentStep = 0;
algorithm()
showStep(0);