# cs-query-builder
***Simple CloudSearch structured query string builder***
## Usage
Install from npm
```bash
npm i cs-query-builder
```
The api is fairly straightforward
```javascript
const Query = require("cs-query-builder");

// All functions return simple string expressions and are composable
let queryString = Query.and(
    {boost: 2}, // optional additional cloudsearch options as an object
    Query.termStr("status", "success"),
    Query.not(
        null,
        Query.rangeNum("year", 2012, 2015),
        Query.termNum("favoriteNumber", 117),
    )
)

// output: (and boost=2 (term field=status  \'success\') (not  (range field=year  [2012,2015])))
```