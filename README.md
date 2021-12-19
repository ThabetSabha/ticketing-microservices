# Ticketing-Microservices

A full stack server side rendered web app built to learn more about microservices, and containerization.

Built using a microservices architecture, the client service was built using Javascript + NextJs, while the    
back-end services were built using ExpressJs with Typescript, along with MongoDb as the primary database,     
it uses Nats Streaming Server as an event bus, Jest for testing, and Stripe for handling payments.

All the services are containerized using Docker, with a Kubernetes cluster to manage them, as for the CI/CD pipeline    
Github Actions were used to run the tests as well as deploy the cluster to a Digital Ocean server.

