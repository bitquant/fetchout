'use strict';

// Based on info from these sources
// https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
// https://www.npmjs.com/package/node-fetch#request-cancellation-with-abortsignal

var defaultTimeout = 60000;

function fetchout(resource, options, timeout = defaultTimeout) {

    if (typeof(options) === 'number') {
        timeout = options;
        options = null;
    }

    if (options instanceof Request) {
        // Request objects are read-only and not enumerable so extract to a new object to add signal property
        // Duplex discussion
        // https://fetch.spec.whatwg.org/#dom-requestinit-duplex
        // https://github.com/nodejs/node/issues/46221
        const { method, headers, body, mode, credentials, cache, redirect, referrer, referrerPolicy, integrity } = options;
        options = { method, headers, body, mode, credentials, cache, redirect, referrer, referrerPolicy, integrity, duplex: 'half' };
    }

    if (options === undefined || options === null) {
        if (resource instanceof Request) {
            const { method, headers, body, mode, credentials, cache, redirect, referrer, referrerPolicy, integrity } = resource;
            options = { method, headers, body, mode, credentials, cache, redirect, referrer, referrerPolicy, integrity };
        } else {
            options = { }
        }
    }

    let controller = new AbortController();
    options.signal = controller.signal;
    let fetchPromise = fetch(resource, options);
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

async function convertReadableStreamToUint8Array(readableStream) {

    let reader = readableStream.getReader();
    let streamDone = false;
    let chunkList = [];
    let bytesReceived = 0;

    while (!streamDone) {
        let streamResult = await reader.read();
        if (!streamResult.done) {
            chunkList.push(streamResult.value);
            bytesReceived += streamResult.value.length;
        } 
        streamDone = streamResult.done;
    }

    let result = new Uint8Array(bytesReceived);
    let offset = 0;
    for (let chunk of chunkList) {
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return result;
}
