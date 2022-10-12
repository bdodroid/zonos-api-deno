import { ZonosCart } from "./types/zonosCart.ts";
import { ZonosConfig } from "./types/zonosConfig.ts";

/*
    * Zonos API
    A basic integration with the zonos system. 
    This will allow you to quickly get started with our API and start creating and managing orders.
*/
class Zonos {
    private config: ZonosConfig;
    constructor(config: ZonosConfig){
        this.config = config;
        if(!config.apiUrl){ 
            if(!config.apiVersion){ this.config.apiVersion = "1"; }
            this.config.apiUrl = `https://api.iglobalstores.com/v${this.config.apiVersion?.toString()}`; 
        }
    }

    private buildApiUrl(config: ZonosConfig){
        if(!config.apiVersion){ this.config.apiVersion = "1"; }
        this.config.apiUrl = `https://api.iglobalstores.com/v${this.config.apiVersion?.toString()}`; 
        
    }

    setVersion(version: string | number){
        this.config.apiVersion = version.toString();
        this.buildApiUrl(this.config);
    }

    async apiCall(path: string, body: any){
        body.store = this.config.apiKey.toString();
        body.secret = this.config.apiSecret;

        const apiResponse = await fetch(`${this.config.apiUrl}/${path}`,{
            headers: {
              "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(body),
          })
          .then(result => result.json())
          .then(data => {
              
            return data;
          })
          .catch((error: any) => {
            console.log(error);
            return error;
          });
          return apiResponse;
    }

    /* begin specific api calls */

    /* 
        Checkout API 
        https://docs.zonos.com/api-reference/checkout-api

        This will allow you to create checkouts,
        get orders created from checkouts,
        update the orders status,
        and add tracking information to those orders,
    */

    /*
        GetOrder
        returns the order information for a specific order.
        can search based off the zonos order id, or the merchants reference id if one was passed in the checkout create call.
    */
    async getOrder(orderId?: string | number, referenceId?: string){
        if(!orderId && !referenceId){ return { "error": "orderId or referenceId is required" }; }
        // TODO: add option to get by referenceId instead of id
        const searchParamiters: {
            orderId?: string;
            referenceId?: string;
        } = {};

        if(orderId){
            searchParamiters.orderId = orderId.toString();
        }else if(referenceId){
            searchParamiters.referenceId = referenceId.toString();
        }

        return await this.apiCall(
            "orderDetail",
            searchParamiters
        );
    }

    /*
        GetOrders
        Returns a list of orders that have been created from your checkouts.
    */
    async getOrders(statuses: boolean, sinceDate: string){ 
        return await this.apiCall(
            "orderNumbers",
            {
                "statuses": statuses,
                "sinceDate": sinceDate
            }
        );
    }

    /*
        UpdateOrderStatus
        Updates the status of an order. 
        This statis is reflected in the getOrder result and is shown in the zonos dashboard.
    */
    async updateOrderStatus(orderId: string | number, status: string){
        let statusValue = status;
        const statusMap = {
            "preparing": "VENDOR_PREPARING_ORDER",
            "ready": "VENDOR_SHIPMENT_READY",
            "printed": "VENDOR_LABELS_PRINTED_DATE",
            "cancelled": "VENDOR_CANCELLATION_REQUEST",
            "completed": "VENDOR_END_OF_DAY_COMPLETE",
        } as {[key: string]: string};

        if(statusMap[status]){ statusValue = statusMap[status]; }

        this.setVersion(1);
        // TODO: make status an enum
        return await this.apiCall(
            "updateVendorOrderStatus",
            {
                "orderId": orderId.toString(),
                "orderStatus": statusValue
            }
        );
    }

    /*
        UpdateOrderNumber
        Adds a mercahntOrderId to an order.
        MerchantOrderId is the order id that you use in your system, not the Zonos Order id.
    */
    async updateOrderNumber(orderId: string | number, merchantOrderId: string | number){ // working
        this.setVersion(1);
        return await this.apiCall(
            "updateMerchantOrderId",
            {
                "orderId": orderId.toString(),
                "merchantOrderId": merchantOrderId.toString()
            }
        );
    }
    
    /* 
        UpdateOrderTracking
        Adds/modifys tracking information to an order.
    */
    async updateOrderTracking(orderId: string | number, trackingNumber: string){
        this.setVersion(2);
        return await this.apiCall(
            "setShipmentTracking",
            {
                "orderId": orderId.toString(),
                "trackingList": [{"numbers": trackingNumber}]
            }
        );
    }

    /* 
        CreateCheckout
        Creates a checkout for a customer.
        This will return a checkout url that you can redirect the customer to.
        
        Passing in a country code will set the default country for the checkout (customers can change this in checkout). 
        If no code is specificed, the country will be set to the defualt specified for your store in the zonos dashboard. 
    */
    async createCheckout(cart: ZonosCart, countryCode?: string){
        this.setVersion(1);
        if(!cart.storeId){ cart.storeId = this.config.apiKey.toString(); }
        if(!countryCode){ countryCode = ""; }

        const tempCart = await this.apiCall(
            "createTempCart",
            cart
        );

        if(tempCart.tempCartUUID){
            return {
                "tempCartUUID": tempCart.tempCartUUID,
                "redirectUrl": `https://checkout.iglobalstores.com/?tempCartUUID=${tempCart.tempCartUUID}&country=${countryCode}`
            };
        }
        return tempCart;
    }
    

    /* end CheckoutApi */
}

export default Zonos;