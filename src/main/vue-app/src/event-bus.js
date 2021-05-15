import Vue from "vue";

/**
 * Global event bus used to communicate between components.
 *
 * Idea from https://alligator.io/vuejs/global-event-bus/
 * found here https://stackoverflow.com/a/46145267/1121497
 *
 * TODO: I think that I will rarely use this now,
 *       since I will try to use only the Main component with child components,
 *       so components can do `this.$emit`.
 */
export const EventBus = new Vue();

export const AppEvent = {
  logout: "logout",
  login: "login", // {credentials: Object}
  credentialsChanged: "credentials-changed" // {credentials: Object?}
};
