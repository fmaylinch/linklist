import Vue from "vue";

/**
 * Global event bus used to communicate between components.
 *
 * Idea from https://alligator.io/vuejs/global-event-bus/
 * found here https://stackoverflow.com/a/46145267/1121497
 */
export const EventBus = new Vue();

export const AppEvent = {
  itemChanged: "item-changed", // {item: Object, action: UpdateAction}
  logout: "logout",
  refreshList: "refresh-list"
};

// action for AppEvent.itemChanged
export const UpdateAction = {
  update: "update",
  delete: "delete",
  nothing: "nothing" // nothing changed, item is not indicated
};
