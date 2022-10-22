export default async () => {

  console.log("swRegister.js: Checking serviceWorker");

  if (!("serviceWorker" in navigator)) {
    console.log("swRegister.js: No serviceWorker in navigator")
    return "No serviceWorker in navigator";
  }

  console.log("swRegister.js: Registering sw.js");
  let swRegistration;

  try {
    swRegistration = await navigator.serviceWorker.register('sw.js');
  } catch (e) {
    return e;
  }
  console.log("swRegister.js: swRegistration", swRegistration);

  let serviceWorker;
  if (swRegistration.installing) {
    console.log("swRegister.js: swRegistration.installing");
    serviceWorker = swRegistration.installing;
  } else if (swRegistration.waiting) {
    console.log("swRegister.js: swRegistration.waiting");
    serviceWorker = swRegistration.waiting;
  } else if (swRegistration.active) {
    console.log("swRegister.js: swRegistration.active");
    serviceWorker = swRegistration.active;
  }

  serviceWorker.addEventListener("statechange", e => {
    console.log("swRegister.js: state changed to: ", e.target.state);
  });

  return "sw ok";
}