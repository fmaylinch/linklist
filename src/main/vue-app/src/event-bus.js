import Vue from "vue";

/**
 * Global event bus used to communicate between components.
 *
 * Idea from https://alligator.io/vuejs/global-event-bus/
 * found here https://stackoverflow.com/a/46145267/1121497
 */
export const EventBus = new Vue();

export const AppEvent = {
  itemChanged: "item-changed", // {newItem: Object, oldItem: object, action: UpdateAction}
  logout: "logout",
  refreshList: "refresh-list"
};

// action for AppEvent.itemChanged
export const UpdateAction = {
  insert: "insert",  // oldItem is null
  update: "update",  // oldItem is the original item, newItem the updated item
  delete: "delete",  // newItem is null
  nothing: "nothing" // newItem is irrelevant, but contains the data in the form
};
