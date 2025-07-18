type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return;
    
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      callback(...args);
    });
  }

  once(event: string, callback: EventCallback) {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    
    this.on(event, onceCallback);
  }
}

export const eventEmitter = new EventEmitter();

// Event types
export const EVENTS = {
  CART_UPDATED: 'cart_updated',
  BALANCE_UPDATED: 'balance_updated',
  ORDER_CREATED: 'order_created',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart'
} as const; 