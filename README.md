# Alert

Send alert to explorer server.

## Methods

- `Alert.info(reason[, callback])`

- `Alert.warn(reason[, callback])`

- `Alert.error(reason[, callback])`


## Usage

```javascript
var alert = require('alert');

alert.info(-1);

alert.info('hello');

alert.info(-1, function (error) {
});

alert.info('hello', function (error) {
});
```
