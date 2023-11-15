# fetchout - fetch with a timeout
Add request timeouts to `fetch()` calls.

## Install
```
$ npm install fetchout
```

## Usage
```javascript
const fetch = require('fetchout');

// Default timeout for all requests. If not set the default is 60 seconds.
fetch.defaultTimeout(5000);


(async function() {

    try {
        // default timeout of 5 seconds used
        let response1 = await fetch('http://httpbin.org/delay/3');
        console.log(`response1 status ${response1.status}`)

        // Set a 7 sec timeout for a GET fetch request
        let response2 = await fetch('http://httpbin.org/delay/3', 7000);
        console.log(`response2 status ${response2.status}`)

        // Set a 6 sec timeout for a POST fetch request - timeout error
        let response3 = await fetch('http://httpbin.org/delay/9',
           { method: 'POST', body: '{"foo": "bar"}' }, 6000);
    }
    catch (err) {
        console.log(`${err}`);
    }

})();
```


## License
Apache 2.0 license; see [LICENSE](./LICENSE).
