# Ticketing-Microservices

A full stack server side rendered web app built to learn more about microservices, and containerization.


Built using a microservices architecture; the client service was built using **Javascript** + **NextJs**, while the    
back-end services were built using **ExpressJs** + **Typescript**, along with **MongoDb** as the primary database,     
it also uses **Nats Streaming Server** as an event bus, **Jest** for testing, and **Stripe** for handling payments.

All the services are containerized using **Docker**, with a **Kubernetes** cluster to manage them, as for the CI/CD pipeline    
**Github Actions** were used to run the tests as well as to continuously deploy the cluster to a **Digital Ocean** server.


This project also uses a typescript library to contain & combine the common Erros, Events,     
and Middlewares used in the various microservices: https://github.com/ThabetSabha/ticketing-project-common-library

**P.S** As this is just a demo project, a few corners were cut, eg: no transactional outboxes were    
implemented, JWTs don't expire, NextJs still running in dev mode, etc...
