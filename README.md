## Zonos API
### _zonos api integration for deno_  

<br>

---

<br>

## Configuration  

### Initialize
```typescript
import { Zonos } from "https://raw.githubusercontent.com/bdodroid/zonos-api-deno/main/mod.ts";

const zonos = new Zonos({
  account_number: "",
  api_key: ""
});
```
> Note: register for an `account_number` and `api_key` at [Zonos]

<br>

### Change API version
```typescript
// Values: 1 | 2
zonos.setVersion(1);
```  

### Direct API Call  

```typescript
zonos.directApiCall(
    "PATH",
    { 
        "json": "body"
    },
    "POST|GET|PUT|DELETE"
);
```

<br>  

---

<br>


## Orders

<br>


### Get Order
Returns a single orders details
```typescript
/* 
    id: string | number
    isReferenceId?: boolean
*/
zonos.getOrder();

// mock response? 
```

<br>


### Get Orders
Returns a list of orders that have been created from your checkouts.
```typescript
/* 
    sinceDate: string
    statuses?: boolean 
*/
zonos.getOrders("2022-09-12", true);
```

<br>

### Update Order Status
Updates an orders status in Zonos Dashboard
```typescript
/* 
    orderId: string | number
    status: string 
*/
zonos.updateOrderStatus("152352", "ready");
```
> Allowed statuses: `preparing` - `ready` - `printed` - `cancelled` - `completed`

<br>

### Update Order Number
Adds a merchant order id to the order.

```typescript
    /*
        orderId: string | number 
        merchantOrderId: string | number
    */
    zonos.updateOrderNumber("152352", "bc_123");
 ```
> `merchantOrderId` should match the order id used in your ecomm platform

<br>

### Add/Update Order Tracking Numbers
Add or update a tracking number to the order.

```typescript
/*
    orderId: string | number
    trackingNumber: string
*/
zonos.updateOrderTracking("152352", "fedex_tracking_number");
```

> this will automatically mark the order as `completed` in Zonos Dashboard

<br>

## Checkout

<br>

### Create a Checkout
creates a checkout and returns a url for the customer to access the checkout
```typescript
/*
    cart: ZonosCart
    countryCode?: string
*/
zonos.createCheckout({CART_JSON}, "CA");
```
> cart must be json format with at least the rquired fields shown in the ZonosCart type




[Zonos]: <https://account.zonos.com/register?referrer=deno_api>