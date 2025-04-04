// Set player count to a random integer between four and eight
let player_count = Math.floor(Math.random() * 5) + 4;


// Define a function to draw agents initially and when the number of agents changes
function drawAgents() {
    // Get the agent container element and store it in the agent_container variable
    let agent_container = document.getElementById("agent_container");
    
    // Clear the existing content before adding new elements
    agent_container.innerHTML = "";
    
    // Loop for the number of players 
    for (let i = 0; i < player_count; i++) {
        // Add ad agent into the agent container with id, label, buttons, and colour corresponding to the id
        agent_container.innerHTML += `
            <div class="agent_wrapper">
                <img title="Click to edit" onclick="setAgent(${i})" src="./assets/agent.png" alt="user icon" class="agent_icon" style="filter: hue-rotate(${(i*(360/player_count))}deg)">
                <div class="agent-text-container" ><p id="P${i+1}">P${i+1}</p><div class="remove" onclick="removeAgent(${i})">x</div></div>
            </div>`;
    }
    
    // Finally, add a 'add agent' button
    agent_container.innerHTML += 
    `<div id="addPlayer" onclick="addAgent()"><p>+</p></div>`
}

// Call the drawAgents() function after the DOM is fully loaded
drawAgents()


// Initialize the values array with the random data
for (i = 0; i < player_count; i++) {
    values.push(generateRandomArray(20, 100))
}

// Define a function to remove a given agent 
function removeAgent(n){
    // As long as there are at least two agents
    if (player_count > 1){
        restart()            // Set the algorithm step back to the start
        values.splice(n, 1)  // Remove the value function at the given index
        player_count --      // Decrement the number of players
        drawAgents()         // Call the drawAgents() functiom
        algorithm()          // Run the cake-cutting algorithm with the new set of agents
    }else{
        // If there are less than two agents, tell the user that the can't remove any more
        alert("You cant have zero players!")
    }
}

// Define a function to remove a given agent 
function addAgent(){
    // As long as there are no more that nine agents
    if (player_count < 10){
        restart()                                    // Set the algorithm step back to the start
        values.push(generateRandomArray(20, 100))    // Append a random funciton to the values array
        player_count ++                              // Increment the player count
        drawAgents()                                 // Call the drawAgents() functiom
        algorithm()                                  // Run the cake-cutting algorithm with the new set of agents
    }else{
        // If there are already at least ten players, tell the user that they can't add any more
        alert("Too many players!")
    }
}

// Define the getPlayerColour funciton to assign as colour to a given agent
function getPlayerColor(playerIndex) {
    // Define the hue as the proportion around the colour wheel of the current agent over the number of agents
    const hue = (360 / player_count) * playerIndex;
    // Return the hue with half saturation and 75% lightness for a pastel effect
    return `hsl(${hue}, 50%, 75%)`;
  }

// Define the cake cutting algorithm
function algorithm(){

    
    current_position = 0                            // Initialise the current position to zero (the start of the cake)
    player_count = values.length                    // Define the player count as the number of value funcitons
    target = 1/player_count                         // Define the target as a fair proportion of the cake (1/n)
    assignments = new Array(player_count).fill(-1)  // Initialise an array of invalid placeholder assignments
    cake_wise_assignments = []                      // Define an empty array to store cake wise assignments

    // Loop for one less than the number of players
    for (i=0;i<player_count-1;i++){
        // Get the position at which each player feels their fair proportion is met
        offers = values.map((x,index) => assignments[index] == -1 ? diff_cut(x,current_position,target) : Infinity)
        // Call the lowest bidder the winner
        winner = offers.indexOf(Math.min(...offers))
        // Push the index of the winner to the cakewise assignments array
        cake_wise_assignments.push(winner)
        // Set the assignments entry of the winner to their assignment (from the current position to their bid)
        assignments[winner] = [current_position, offers[winner]]
        // Set the current position to the winning bid position
        current_position = offers[winner]
    }

    // Once their is only one player left, get their index
    last_player = assignments.findIndex(a => a == -1)
    // Set their assignments entry to the remainder of the cake (from current position to the end (1))
    assignments[last_player] = [current_position, 1]
    // Push the index to the cakewise assignments array
    cake_wise_assignments.push(last_player)
    
    // Send each step of the algorithm to the steps array for display, the title represents the step
    steps = [
        // The initial state of the cake is the first step
        {
          title: "We have a cake that we must fairly divide between the players",
          pieces: [
            {
              range: [0, 1],
              color: "#d3d3d3"
            }
          ]
        },
        // Each iteration of the main loop corresponds to a unique step
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
            // The point at which only one player remains unassigned is a unique step
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
                    // The final allocation is a unique step
                    title: "The last players gets the entire remainder of the cake which they think is great",
                    pieces: [
                        ...cake_wise_assignments.slice(0, cake_wise_assignments.length).map((y, j) => ({
                            range: assignments[y],
                            color: getPlayerColor(cake_wise_assignments[j])
                          }))
                    ]
                }
      ];
      
      // Once all of the steps are defined, the show step function is called.
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
                           margin-top: 7.5vh;
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
`;}

// Define the move knife function to move the knife across the surface of the cake
function moveKnife(stepIndex, move_step) {
    // If resetting, just go to initial position
    if (move_step == 0) {
        document.getElementById("knife").style.left = initialposition + "px";
        return;
    }
    // If the current step is one where the knife should move
    if (move_step == 1){
        // Initialise to the current positon
        let newPosition = initialposition;
    
        // Iterate over each step up to and including the current one
        for (let i = 0; i < stepIndex + 1; i++) {
            // calculate the proportion of the cake which should be traversed, including the gap betwen pieces and their borders
            let adjustment = (steps[i+1].pieces[steps[i+1].pieces.length-2].range[1] - 
                steps[i+1].pieces[steps[i+1].pieces.length-2].range[0]) * initialwidth + 7.5;
            // add this value to the new position element
            newPosition += adjustment;
        }
        // Set the absolute position directly
        document.getElementById("knife").style.left = newPosition + "px";
    }

}

// Define step_to_step to convert the step counter to the value that should be passed to showStep and moveKnife
function step_to_step(n) {
    // when dealing with the last player, return the appropriate step value to match the expected values
    if (currentStep >= (player_count - 1) * 2 + 1) {
        return (currentStep - (player_count - 1) * 2 + player_count - 1);
    }
    // otherwise, return half of the step parameter, roudned down
    return parseInt(n / 2);
}

// define step to stack to convert the step coutner to the corresponding stack trace index
function step_to_stack(n){
    // The first step is a direct match
    if (n == 0){
        return 0
    // For the last player, the last line of the stack trace is uniquely accessible
    }else if(currentStep >= (player_count-1)*2 + 1){
        return (currentStep - ((player_count-1)*2 + 1) + 3)
    }
    // For the normal allocations, lines 1 and 2 are provided on a loop using the modulo function (%)
    else{
        return (1 + (n - 1)%2)
    }
}

// define the restart function to set the stack trace and the visualisation to step zero
function restart() {
    document.getElementById(step_to_stack(currentStep)).classList.remove("active");  // Remove the blue indicator from the current step
    currentStep = 0;                                                                 // Set the curernt step variable to zero
    showStep(step_to_step(currentStep));                                             // Show the new current step on the interface
    document.getElementById(step_to_stack(currentStep)).classList.add("active");     // Set the first element of the stack trace as active
    document.getElementById("knife").style.left = initialposition + "px";            // Explicitly return the knife to the start positon
}

// define the next funciton to step through the algorithm
function next() {
    document.getElementById(step_to_stack(currentStep)).classList.remove("active"); // Remove the blue indicator from the current step
    currentStep++;                                                                  // Increment the current step by one
    // If the algorithm is being auto played and the last step has been reached, stop auto playing
    if (currentStep == 2*player_count  && playing) {
        togglePlaying()
    }
    // If incrementing the step brings it beyond the end of the algorithm, go back to the start
    if (currentStep == 2*player_count + 1) {
        currentStep = 0;
    }
    showStep(step_to_step(currentStep));                                            // Show the new current step on the interface
    moveKnife(step_to_step(currentStep), step_to_stack(currentStep));               // Move the knife based on the new step
    document.getElementById(step_to_stack(currentStep)).classList.add("active");    // Set the first element of the stack trace as active
}

// define the previous funciton to step backwards through the algorithm
function previous() {
    document.getElementById(step_to_stack(currentStep)).classList.remove("active"); // Remove the blue indicator from the current step
    currentStep--;                                                                  // decrement the current step by one
    // If the new current step is negative, set it to the highest valid step
    if (currentStep < 0) {
        currentStep = 2*player_count;
    }
    showStep(step_to_step(currentStep));                                          // Show the new current step on the interface
    moveKnife(step_to_step(currentStep), step_to_stack(currentStep));             // Move the knife based on the new step
    document.getElementById(step_to_stack(currentStep)).classList.add("active");  // Set the first element of the stack trace as active
}

// Initialize variables and start the visualisation
let currentStep = 0;  // Initialise the current step variable to zero
algorithm()           // Run the cake-cutting algorithm
showStep(0);          // Show the first step of the algorithm

// initialise the moving knife once the cake has been displayed
// Position the knife vertically to be touching the top of the cake
document.getElementById("knife").style.top = document.getElementsByClassName("cake-piece")[0].getBoundingClientRect().top - 0.07 * window.innerHeight + "px";
// declare the intital position as the leftmost point of the cake
initialposition = document.getElementsByClassName("cake-piece")[0].getBoundingClientRect().left
// declare the initial width as the width of the uncut cake for reference
initialwidth = document.getElementsByClassName("cake-piece")[0].getBoundingClientRect().right - initialposition
// set the horizontal position of the knife the the niitial initial position
document.getElementById("knife").style.left = initialposition + "px";