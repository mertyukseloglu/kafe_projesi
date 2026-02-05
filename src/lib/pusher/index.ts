// Server exports
export {
  getPusher,
  CHANNELS,
  EVENTS,
  triggerEvent,
  notifyNewOrder,
  notifyOrderStatusChanged,
  notifyWaiterCalled,
} from "./server"

// Client exports are in separate file due to "use client"
// Import from "@/lib/pusher/client" for client-side usage
