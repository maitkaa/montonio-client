# Unofficial Montonio API Client

This is an unofficial client for the Montonio API. It provides a convenient way to interact with the Montonio API from
your JavaScript or TypeScript code.

[Montonio API Docs](https://docs.montonio.com/introduction)

## Installation

[NPM:@almightytech/montonio-client](https://www.npmjs.com/package/@almightytech/montonio-client)

To install the client, you can use npm:

```bash
npm install --save @almightytech/montonio-client
```

## Usage

First, import the client:

```javascript
import { MontonioClient, MontonioClientOptions } from '@almightytech/montonio-client';
```

Then, create a new client instance:

```javascript
const options: MontonioClientOptions = {
    // Your access key (required)
    accessKey: 'your-access-key',

    // Your secret key (required)
    secretKey: 'your-secret-key',

    // Use the sandbox environment (optional, defaults to true)
    sandbox: true,

    // Overrides the base URL for all requests (optional)
    // If not provided, the URL will be determined by the `sandbox` option
    url: 'https://your-custom-url.com',

    // Overrides some default endpoints (optional)
    // Each key should be the name of an endpoint, and the value should be the new endpoint
    endpoints: {
        getPaymentMethods: '/your-custom-endpoint',
        // ...other endpoints...
    },

    // The UUID of the store for which to retrieve payout statistics (optional)
    storeUuid: 'your-store-uuid',
};

const client = new MontonioClient(options);
```

Now you can use the client to interact with the Montonio API:

```javascript
// Get available payment methods
const paymentMethods = await client.getPaymentMethods();

// Create an order
const orderData = {
// ...your order data...
};
const paymentUrl = await client.createOrder(orderData);

// ...and more!
```

## API

The client provides the following methods:

- `getPaymentMethods()`: Get available payment methods.
- `createOrder(orderData)`: Create an order in Montonio.
- `getOrder(orderUuid)`: Get an order's details.
- `isOrderPaid(orderToken)`: Check if an order is paid.
- `createRefund(orderUuid, amount)`: Create a refund for an order.
- `listPayments(input)`: List payments.
- `exportPayments(payoutUuid, payoutType)`: Export payments.
- `getStoreBalances()`: Get store balances.

Each method returns a Promise that resolves with the response data from the Montonio API.

## Error Handling

The client includes built-in error handling. If an API request fails, the client will throw an error that you can catch
and handle in your code.

## Contributing

Contributions are welcome! Please submit a pull request or create an issue to get started.

## License

[MIT License](/LICENSE)
