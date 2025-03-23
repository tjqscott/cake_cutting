
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
                        `<p class="${index == cake_wise_assignments[pieceIndex] && (pieceIndex < sortedPieces.length - 1 || currentStep == 2*player_count ) && "highlight" }" style="color:${ getPlayerColor(index) }"> value: ${diff_eval(agent, piece.range[0], piece.range[1]).toFixed(4)}</p>`
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
algorithm()
showStep(0);