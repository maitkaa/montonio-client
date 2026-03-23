# Unofficial Montonio API Client

![CI/CD](https://github.com/maitkaa/montonio-client/actions/workflows/release.yml/badge.svg)
[![npm version](https://badgen.net/npm/v/@almightytech/montonio-client)](https://www.npmjs.com/package/@almightytech/montonio-client)
![GitHub release](https://badgen.net/github/release/maitkaa/montonio-client)

An unofficial TypeScript client for the [Montonio API](https://docs.montonio.com/introduction), providing a convenient interface for payments, payment links, webhook validation, and shipping.

## Installation

```bash
npm install --save @almightytech/montonio-client
```

## Usage

### Payments Client

```typescript
import { MontonioClient, MontonioClientOptions, Currency, PaymentMethod, Locale } from '@almightytech/montonio-client';

const client = new MontonioClient({
    accessKey: 'your-access-key',
    secretKey: 'your-secret-key',
    sandbox: true, // defaults to true (sandbox mode)
});
```

#### Create an Order

```typescript
const paymentUrl = await client.createOrder({
    merchantReference: 'ORDER-001',
    returnUrl: 'https://yourstore.com/return',
    notificationUrl: 'https://yourstore.com/webhooks/montonio',
    grandTotal: 99.99,
    currency: Currency.EUR,
    locale: Locale.En,
    payment: {
        method: PaymentMethod.PaymentInitiation,
        currency: Currency.EUR,
        amount: 99.99,
        methodOptions: {
            preferredProvider: 'lhv',
        },
    },
});
// Redirect customer to paymentUrl
```

#### Create a Payment Link

Payment links are shareable URLs that allow customers to pay without a full checkout flow.

```typescript
import { PaymentLinkOptions } from '@almightytech/montonio-client';

const link = await client.createPaymentLink({
    merchantReference: 'INVOICE-001',
    amount: 50.00,
    currency: Currency.EUR,
    description: 'Invoice payment',
    returnUrl: 'https://yourstore.com/return',
    notificationUrl: 'https://yourstore.com/webhooks/montonio',
    preferredProvider: 'lhv', // Optional: skip bank selection screen
    locale: Locale.En,
});
// link.paymentUrl — send to customer
```

#### Validate a Webhook

When Montonio POSTs a payment notification to your `notificationUrl`, validate the JWT token:

```typescript
app.post('/webhooks/montonio', async (req, res) => {
    const { orderToken } = req.body;
    const payment = await client.validateWebhook(orderToken);

    if (payment.paymentStatus === 'PAID') {
        // Fulfil the order
    }
    res.sendStatus(200);
});
```

#### Mobile Wallets (Apple Pay / Google Pay)

```typescript
import { CardPaymentMethod, WalletProvider } from '@almightytech/montonio-client';

const paymentUrl = await client.createOrder({
    // ...order fields
    payment: {
        method: PaymentMethod.CardPayments,
        currency: Currency.EUR,
        amount: 99.99,
        methodOptions: {
            preferredMethod: CardPaymentMethod.WALLET,
            preferredWallet: WalletProvider.ApplePay, // or WalletProvider.GooglePay
        },
    },
});
```

#### Other Payment Methods

```typescript
// BLIK (PLN only)
payment: {
    method: PaymentMethod.Blik,
    currency: Currency.PLN,
    amount: 99.99,
    methodOptions: { preferredLocale: Locale.Pl },
}

// Buy Now Pay Later (1–3 periods)
payment: {
    method: PaymentMethod.Bnpl,
    currency: Currency.EUR,
    amount: 200.00,
    methodOptions: { period: 3 }, // 1, 2, or 3 months
}

// Hire Purchase (€100–€10,000)
payment: {
    method: PaymentMethod.HirePurchase,
    currency: Currency.EUR,
    amount: 1500.00,
    methodOptions: {},
}
```

#### Other Methods

```typescript
// Get available payment methods for your store
const methods = await client.getPaymentMethods();

// Retrieve an order by UUID
const order = await client.getOrder('order-uuid');

// Check if an order is paid (from webhook token)
const paid = await client.isOrderPaid(orderToken);

// Create a refund
const refund = await client.createRefund('order-uuid', 49.99);

// List payouts (requires storeUuid in options)
const payouts = await client.listPayouts({ limit: 50, offset: 0, order: 'DESC' });

// Export payout report
const { PayoutOutputType } = require('@almightytech/montonio-client');
const url = await client.exportPayments('payout-uuid', PayoutOutputType.EXCEL);

// Get store balances
const balances = await client.getStoreBalances();
```

---

### Shipping Client

```typescript
import { MontonioShippingClient, ShippingMethodType, PickupPointSubtype } from '@almightytech/montonio-client';

const shipping = new MontonioShippingClient({
    accessKey: 'your-access-key',
    secretKey: 'your-secret-key',
    sandbox: true,
});
```

#### Get Carriers and Shipping Methods

```typescript
const carriers = await shipping.getCarriers();
const methods = await shipping.getShippingMethods();
```

#### Get Pickup Points

```typescript
// All pickup points for a carrier + country
const points = await shipping.getPickupPoints('omniva', 'EE');

// Filter by type
const parcelMachines = await shipping.getPickupPoints('omniva', 'EE', PickupPointSubtype.ParcelMachine);
```

#### Create a Shipment

```typescript
const shipment = await shipping.createShipment({
    merchantReference: 'SHIP-001',
    shippingMethod: {
        type: ShippingMethodType.PickupPoint,
        id: 'shipping-method-uuid',
    },
    receiver: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phoneCountryCode: '+372',
        phoneNumber: '55512345',
    },
    parcels: [{ weight: 1.5 }],
    pickupPointId: 'PP-001',
});

// shipment.trackingCode — send to customer
// shipment.trackingUrl  — tracking page
```

#### Get Shipment Details and Label

```typescript
const details = await shipping.getShipment('shipment-uuid');
const labelUrl = await shipping.getShipmentLabel('shipment-uuid');
```

---

## Configuration Options

### `MontonioClientOptions`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `accessKey` | `string` | ✓ | Your Montonio access key |
| `secretKey` | `string` | ✓ | Your Montonio secret key |
| `sandbox` | `boolean` | | Use sandbox environment (default: `true`) |
| `url` | `string` | | Override base URL |
| `endpoints` | `object` | | Override individual endpoint paths |
| `storeUuid` | `string` | | Required for payout statistics |

### `MontonioShippingClientOptions`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `accessKey` | `string` | ✓ | Your Montonio access key |
| `secretKey` | `string` | ✓ | Your Montonio secret key |
| `sandbox` | `boolean` | | Use sandbox environment (default: `true`) |
| `url` | `string` | | Override base URL |

---

## Error Handling

The client throws `ApiError` for API-level failures and `NetworkError` for connection issues:

```typescript
import { ApiError, NetworkError } from '@almightytech/montonio-client';

try {
    const url = await client.createOrder(orderData);
} catch (error) {
    if (error instanceof ApiError) {
        console.error('Montonio API error:', error.message);
    } else if (error instanceof NetworkError) {
        console.error('Network error:', error.message);
    }
}
```

---

## Contributing

Contributions are welcome! Please submit a pull request or create an issue to get started.

## License

[MIT License](/LICENSE)
