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
values.push([1, 1.1736, 1.3420, 1.5000, 1.6428, 1.7660, 1.8660, 1.9397, 1.9848, 2.0000,
    1.9848, 1.9397, 1.8660, 1.7660, 1.6428, 1.5000, 1.3420, 1.1736, 1, 0.8264,
    0.6580, 0.5000, 0.3572, 0.2340, 0.1340, 0.0603, 0.0152, 0, 0.0152, 0.0603,
    0.1340, 0.2340, 0.3572, 0.5000, 0.6580, 0.8264, 1]);

    values.push([2.0000, 1.9962, 1.9848, 1.9659, 1.9397, 1.9063, 1.8660, 1.8192, 1.7660, 1.7071,
        1.6428, 1.5736, 1.5000, 1.4226, 1.3420, 1.2588, 1.1736, 1.0872, 1.0000, 0.9128,
        0.8264, 0.7412, 0.6580, 0.5774, 0.5000, 0.4264, 0.3572, 0.2929, 0.2340, 0.1808,
        0.1340, 0.0937, 0.0603, 0.0341, 0.0152, 0.0038, 0.0000, 0.0038, 0.0152, 0.0341,
        0.0603, 0.0937, 0.1340, 0.1808, 0.2340, 0.2929, 0.3572, 0.4264, 0.5000, 0.5774,
        0.6580, 0.7412, 0.8264, 0.9128, 1.0000, 1.0872, 1.1736, 1.2588, 1.3420, 1.4226,
        1.5000, 1.5736, 1.6428, 1.7071, 1.7660, 1.8192, 1.8660, 1.9063, 1.9397, 1.9659,
        1.9848, 1.9962, 2.0000]);
    
    values.push([
        2.0000, 2.0875, 2.1763, 2.2679, 2.3640, 2.4663, 2.5774, 2.7002, 2.8391, 3.0000,
        3.1918, 3.4281, 3.7321, 4.1445, 4.7475, 5.7321, 7.6713, 13.4301, 27.6363, 92.2306,
        -88.2306, -23.6363, -9.4301, -3.6713, -1.7321, -0.7475, -0.1445, 0.2679, 0.5719,
        0.8082, 1.0000, 1.1609, 1.2998, 1.4226, 1.5337, 1.6360, 1.7321, 1.8237, 1.9125
    ]);
    
    values.push([
        6.84, 6.25, 5.69, 5.16, 4.66, 4.19, 3.75, 3.34, 2.96, 2.61,
        2.29, 2.00, 1.74, 1.51, 1.31, 1.14, 1.00, 0.89, 0.81, 0.76,
        0.74, 0.76, 0.81, 0.89, 1.00, 1.14, 1.31, 1.51, 1.74, 2.00,
        2.29, 2.61
    ]);
    
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
            values[agent] = text.split(',').map(Number).filter(value => !isNaN(value));
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