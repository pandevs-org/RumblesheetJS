// fetchWorker.js
self.onmessage = function(e) {
    const { startIndex, endIndex } = e.data;

    // Simulate the fetch process
    // Replace this with your actual fetch logic
    const result = fetchData(startIndex, endIndex); 

    // Post the result back to the main thread
    self.postMessage(result);
};

function fetchData(startIndex, endIndex) {
    // Placeholder function for your actual fetch logic
    // Simulate a delay
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`Fetched data from ${startIndex} to ${endIndex}`);
        }, 1000);
    });
}
