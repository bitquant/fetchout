'use strict';

// Based on info from these sources
// https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
// https://www.npmjs.com/package/node-fetch#request-cancellation-with-abortsignal

var defaultTimeout = 60000;

function fetchout(url, params = { }, timeout = defaultTimeout) {

    if (typeof(params) === 'number') {
        timeout = params;
        params = { }
    }

    let controller = new AbortController();
    params.signal = controller.signal;
    let fetchPromise = fetch(url, params);
    let timeoutId = setTimeout(() => controller.abort(), timeout);

    let errorHandler = (err) => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error(`request timed out after ${timeout} ms`);
        } else {
            throw err;
        }
    }

    let responseHandler = (response) => {
        clearTimeout(timeoutId);
        return response
    }

    return fetchPromise.then(responseHandler, errorHandler);
}

fetchout.defaultTimeout = function(timeout) {
    defaultTimeout = timeout;
}


module.exports = fetchout;
