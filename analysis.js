// Переменная для хранения данных файла
let fileData = null;

// Обработчик события для загрузки файла
document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
// Обработчик события для кнопки "Start"
document.getElementById('startButton').addEventListener('click', startAnalysis, false);

// Функция обработки выбора файла
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('File selected:', file.name);
        // Использование PapaParse для разбора CSV файла
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                console.log('File data:', results.data);
                fileData = results.data;
                // Включение кнопки "Start" после успешной загрузки файла
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

// Функция запуска анализа
function startAnalysis() {
    if (fileData) {
        // Получение параметров стоп-лосса, тейк-профита и времени входа
        const stopLossTicks = parseFloat(document.getElementById('stopLoss').value);
        const takeProfitTicks = parseFloat(document.getElementById('takeProfit').value);
        const entryHour = parseInt(document.getElementById('entryHour').value);
        const entryMinute = parseInt(document.getElementById('entryMinute').value);

        console.log('Starting analysis with data:', fileData);
        // Выполнение анализа данных
        analyzeData(fileData, stopLossTicks, takeProfitTicks, entryHour, entryMinute);
    } else {
        console.log('No file data available for analysis');
    }
}

// Функция анализа данных
function analyzeData(data, stopLossTicks, takeProfitTicks, entryHour, entryMinute) {
    const stopLoss = stopLossTicks / 10000; // Преобразование стоп-лосса в доллары
    const takeProfit = takeProfitTicks / 10000; // Преобразование тейк-профита в доллары
    const lotSize = 1; // Размер лота
    const results = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const date = new Date(row.timestamp);
        // Проверка времени входа
        if (date.getUTCHours() === entryHour && date.getUTCMinutes() === entryMinute) {
            const entryPrice = row.open;
            let exitPrice = entryPrice;
            let result = 'Day Close';

            // Проверка условий стоп-лосса и тейк-профита
            for (let j = i + 1; j < data.length; j++) {
                const high = data[j].high;
                const low = data[j].low;

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
    }

    console.log('Analysis results:', results);
    // Отображение результатов в таблице
    displayResults(results);
}

// Функция отображения результатов анализа
function displayResults(results) {
    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    results.forEach(result => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = result.date;
        row.insertCell(1).textContent = result.trade;
        row.insertCell(2).textContent = result.entryPrice.toFixed(5);
        row.insertCell(3).textContent = result.exitPrice.toFixed(5);
        row.insertCell(4).textContent = result.result;
        row.insertCell(5).textContent = result.pnl.toFixed(5);
    });

    console.log('Results displayed in table');
}