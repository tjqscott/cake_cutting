google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

let values = [];
let agent = 1;
let modal_up = 1;

const steps = [
    {
        title: "We have a cake which must be shared between three people!",
        pieces: [
            {width: "70%", color:"orange"}
        ]
    },
    {
        title: "Archie splits the cake into three pieces that he wants equally",
        pieces: [
            { width: "25%", color: "#FFB5B5" },
            { width: "30%", color: "#FFB5B5" },
            { width: "15%", color: "#FFB5B5" }
        ]
    },
    {
        title: "Bobby picks the two pieces that he likes the most",
        pieces: [
            { width: "25%", color: "#FFB5B5" },
            { width: "30%", color: "#D4C68A" },
            { width: "15%", color: "#D4C68A" }
        ]
    },
    {
        title: "And trims the best piece so that the pieces are equal",
        pieces: [
            { width: "25%", color: "#FFB5B5" },
            { width: "25%", color: "#D4C68A" },
            { width: "5%", color: "#9AD69A" },
            { width: "15%", color: "#D4C68A" }
        ]
    },
    {
        title: "Then Chloe picks her favourite piece from Bobby's two favourites",
        pieces: [
            { width: "25%", color: "#FFB5B5" },
            { width: "25%", color: "#D4C68A" },
            { width: "5%", color: "#9AD69A" },
            { width: "15%", color: "#8BD4D4" }
        ]
    },
    {
        title: "Bobby gets piece which has been trimmed so Chloe gets to cut the trimming",
        pieces: [
            { width: "70%", color: "#9AD69A" }
        ]
    },
    {
        title: "Chloe cuts the trimming into three pieces which she values equally",
        pieces: [
            { width: "24%", color: "#9AD69A" },
            { width: "24%", color: "#9AD69A" },
            { width: "24%", color: "#9AD69A" }
        ]
    },
    {
        title: "Bobby picks his favourite, then Chloe, leaving Archie with the last piece",
        pieces: [
            { width: "24%", color: "#FFB5B5" },
            { width: "24%", color: "#D4C68A" },
            { width: "24%", color: "#8BD4D4" }
        ]
    },
    {
        title: "We add the trimming to the main slice for each player",
        pieces: [
            { width: "25%", color: "#FFB5B5" },
            { width: "1.7%", color: "#9AD69A" },
            { width: "25%", color: "#D4C68A" },
            { width: "1.7%", color: "#9AD69A" },
            { width: "15%", color: "#8BD4D4" },
            { width: "1.7%", color: "#9AD69A" }
        ]
    },
    {
        title: "Leaving every player feeling as though they got their fair share",
        pieces: [
            { width: "25%", color: "#FFB5B5" },
            { width: "1.7%", color: "#FFB5B5" },
            { width: "25%", color: "#D4C68A" },
            { width: "1.7%", color: "#D4C68A" },
            { width: "15%", color: "#8BD4D4" },
            { width: "1.7%", color: "#8BD4D4" }
        ]
    }
];

// Initialize the values array with the provided data

//sine
values.push([0.999, 1.121, 1.241, 1.357, 1.468, 1.573, 1.668, 1.754, 1.828, 1.89, 1.939, 1.973, 1.994, 1.999, 1.989, 1.965, 1.926, 1.874, 1.808, 1.73, 1.642, 1.544, 1.437, 1.325, 1.207, 1.086, 0.964, 0.843, 0.723, 0.608, 0.499, 0.397, 0.304, 0.222, 0.151, 0.093, 0.048, 0.017, 0.001, 0.0, 0.014, 0.043, 0.085, 0.142, 0.211, 0.292, 0.383, 0.484, 0.592, 0.707, 0.825, 0.947])
//cosine
values.push([1.999, 1.992, 1.969, 1.933, 1.882, 1.818, 1.742, 1.655, 1.558, 1.453, 1.341, 1.224, 1.104, 0.982, 0.86, 0.74, 0.624, 0.514, 0.411, 0.317, 0.233, 0.16, 0.1, 0.053, 0.021, 0.003, 0.0, 0.011, 0.038, 0.078, 0.133, 0.2, 0.28, 0.37, 0.469, 0.576, 0.69, 0.808, 0.929, 1.051, 1.173, 1.291, 1.406, 1.514, 1.615, 1.706, 1.787, 1.856, 1.913, 1.955, 1.984, 1.998])
//tangent
values.push([19.133, 19.239, 19.349, 19.465, 19.591, 19.73, 19.891, 20.081, 20.316, 20.621, 21.044, 21.686, 22.813, 25.395, 38.162, 0.0, 12.767, 15.349, 16.476, 17.118, 17.541, 17.846, 18.081, 18.271, 18.432, 18.571, 18.697, 18.813, 18.923, 19.029, 19.133, 19.239, 19.349, 19.465, 19.591, 19.73, 19.891, 20.081, 20.316, 20.621, 21.044, 21.686, 22.813, 25.395, 38.162, 0.0, 12.767, 15.349, 16.476, 17.118, 17.541, 17.846, 18.081, 18.271, 18.432, 18.571, 18.697, 18.813, 18.923, 19.029])


    function toggleModal() {
        if (modal_up) {
            modal_up = false;
            document.getElementById("blur").style.visibility = "visible";
            document.getElementById("modal").style.visibility = "visible";
        } else {
            modal_up = true;
            document.getElementById("modal").style.visibility = "hidden";
            document.getElementById("blur").style.visibility = "hidden";
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
    
        var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
        chart.draw(data, options);
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
        const num = +numInput.value;
    
        if (numInput.value === '' || isNaN(num)) {
            return;
        }
    
        values[agent].push(num);
        numInput.value = '';
        drawChart();
    }
    
    function removeFromList() {
        values[agent].pop();
        drawChart();
    }
    
    function clearChart() {
        values[agent] = [];
        drawChart();
    }
    
    function setAgent(n) {
        agent = n;
        drawChart();
    }
    
    function showStep(stepIndex) {
        const container = document.getElementById('visualization-container');
        container.innerHTML = `
            <h2 style="height:2.5em">${steps[stepIndex].title}</h2>
            ${steps[stepIndex].pieces.map(piece => `
                <div class="cake-piece" 
                     style="width:${piece.width}; height: 10vw; background-color:${piece.color}">
                </div>
            `).join('')}
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