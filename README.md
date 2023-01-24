# Safe Eats
## Overview

Safe Eats is the name of my engineering capstone project. This project was designed to allow a caregiver to create meals to be reheated and identify them with a QR code. Then leave the food with the patient who when they are ready removes the food from storage and scans the QR code using our customized toaster oven. This toaster oven then reads the cooking information and automatically sets the appropriate cooking time and temperature and will also remotely notify the caregiver via our mobile app that a meal has started, finished, along with other warnings such as expired food or fire warnings.

## Package Overview

This package is built using the following tools:

Embedded System:
- ESP32 microcontroller
- Solid state relays for controlling the toaster oven
- Barcode scanner to scan the QR code
- K-type thermocoouple for measuring the temperature

Mobile Application:
- React Native for cross platform deployments
- Expo for deployment capabilities and built in functionality
- NativeWind for styling using TailwindCSS
- TRPC for typesafe calls to the backend
- Designed in Figma
- Sentry for logging and crash tracing


Backend: 
- Prisma as a database ORM for typesafety
- TRPC for typesafety with the frontend
- Zod for typesafe validation of data
- Planetscale for automatic database scaling
- Railway for infrastructure
- Axiom for backend logging and issue monitoring

## Next Steps

The app is mostly finished and is in a mostly usable state but I want to:
- Finish the new styling
- Maybe redo the forms to use React Hook Form
- Finish the new authentication page and allow sharing of device information so multiple people can easily view the same device status
