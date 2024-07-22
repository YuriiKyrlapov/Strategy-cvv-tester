let fileData = null;

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('startButton').addEventListener('click', startAnalysis, false);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('File selected:', file.name);
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                console.log('File data:', results.data);
                fileData = results.data;
                document.getElementById('startButton').disabled = false;
            },
            error: function(error) {
                console.error('Error parsing file:', error);
            }
        });
    } else {
        console.log('No file selected');
    }
}

function startAnalysis() {
    if (fileData) {
        const stopLossTicks = parseFloat(document.getElementById('stopLoss').value);
        const takeProfitTicks = parseFloat(document.getElementById('takeProfit').value);
        const entryHour = parseInt(document.getElementById('entryHour').value);
        const entryMinute = parseInt(document.getElementById('entryMinute').value);

        console.log('Starting analysis with data:', fileData);
        analyzeData(fileData, stopLossTicks, takeProfitTicks, entryHour, entryMinute);
    } else {
        console.log('No file data available for analysis');
    }
}

function analyzeData(data, stopLossTicks, takeProfitTicks, entryHour, entryMinute) {
    const stopLoss = stopLossTicks / 10000;
    const takeProfit = takeProfitTicks / 10000;
    const lotSize = 1;
    const results = [];

    data.forEach((row, index) => {
        const date = new Date(row.timestamp);
        if (date.getHours() === entryHour && date.getMinutes() === entryMinute) {
            const entryPrice = row.open;
            let exitPrice = entryPrice;
            let result = 'Day Close';

            for (let i = index; i < data.length; i++) {
                const high = data[i].high;
                const low = data[i].low;

                if (low <= entryPrice - stopLoss) {
                    exitPrice = entryPrice - stopLoss;
                    result = 'Stop Loss';
                    break;
                }

                if (high >= entryPrice - takeProfit) {
                    exitPrice = entryPrice - takeProfit;
                    result = 'Take Profit';
                    break;
                }
            }

            const pnl = (entryPrice - exitPrice) * lotSize;
            results.push({ date: date.toLocaleString(), trade: 'Sell', entryPrice, exitPrice, result, pnl });
        }
    });

    console.log('Analysis results:', results);
    displayResults(results);
}

function displayResults(results) {
    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    results.forEach(result => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = result.date;
        row.insertCell(1).textContent = result.trade;
        row.insertCell(2).textContent = result.entryPrice;
        row.insertCell(3).textContent = result.exitPrice;
        row.insertCell(4).textContent = result.result;
        row.insertCell(5).textContent = result.pnl;
    });

    console.log('Results displayed in table');
}