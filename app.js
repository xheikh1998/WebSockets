
// // const WebSocket = require('ws');
// // const wss = new WebSocket.Server({ port: 8080 });

// // let clients = [];

// // wss.on('connection', function connection(ws) {
// //     clients.push(ws);
// //     console.log('A new client connected!');

// //     ws.on('message', function incoming(message) {
// //         console.log('received: %s', message);

// //         // Broadcast incoming message to all clients
// //         clients.forEach(function(client) {
// //             if (client !== ws && client.readyState === WebSocket.OPEN) {
// //                 client.send(message);
// //             }
// //         });
// //     });

// //     ws.on('close', function() {
// //         console.log('Client has disconnected.');
// //         clients = clients.filter(client => client !== ws);
// //     });
// // });

// // console.log('WebSocket server is running on ws://localhost:8080');
// // // const WebSocket = require('ws');
// // // const wss = new WebSocket.Server({ port: 8080 });
// // // let clients = [];

// // // wss.on('connection', function connection(ws) {
// // //     // Assign a unique ID or use some identifier sent by the client
// // //     const id = Math.random().toString(36).substr(2, 9);
// // //     ws.id = id;
// // //     clients.push(ws);
// // //     console.log('A new client connected with ID:', id);

// // //     ws.on('message', function incoming(message) {
// // //         console.log('Received: %s from %s', message, ws.id);

// // //         // Example message handling for specific IDs
// // //         const parsedMessage = JSON.parse(message);
// // //         if (parsedMessage.targetId) {
// // //             const targetClient = clients.find(client => client.id === parsedMessage.targetId);
// // //             if (targetClient && targetClient.readyState === WebSocket.OPEN) {
// // //                 targetClient.send(message);
// // //             }
// // //         } else {
// // //             // Broadcast to all except sender
// // //             clients.forEach(function(client) {
// // //                 if (client !== ws && client.readyState === WebSocket.OPEN) {
// // //                     client.send(message);
// // //                 }
// // //             });
// // //         }
// // //     });

// // //     ws.on('close', function() {
// // //         console.log('Client has disconnected:', ws.id);
// // //         clients = clients.filter(client => client !== ws);
// // //     });
// // // });

// // // console.log('WebSocket server is running on ws://localhost:8080');


// // wss.on('connection', function connection(ws) {
// //     clients.push(ws);
// //     console.log('A new client connected!');

// //     ws.on('message', function incoming(data) {
// //         const message = JSON.parse(data);
// //         console.log('Received:', message);

// //         // Here you can decide to broadcast based on message type or driver ID
// //         clients.forEach(function(client) {
// //             if (client !== ws && client.readyState === WebSocket.OPEN) {
// //                 // Example: Only forward location updates
// //                 if (message.type === 'location') {
// //                     client.send(JSON.stringify({
// //                         driverId: message.driverId,
// //                         latitude: message.latitude,
// //                         longitude: message.longitude,
// //                         timestamp: message.timestamp
// //                     }));
// //                 }
// //             }
// //         });
// //     });

// //     ws.on('close', function() {
// //         console.log('Client has disconnected.');
// //         clients = clients.filter(client => client !== ws);
// //     });
// // });


// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 8080 });
// let clients = [];

// wss.on('connection', function connection(ws) {
//     clients.push(ws);
//     console.log('A new client connected!');

//     ws.on('message', function incoming(data) {
//         try {
//             const message = JSON.parse(data);
//             console.log('Received:', message);

//             // Broadcast based on message type or driver ID
//             clients.forEach(function(client) {
//                 if (client !== ws && client.readyState === WebSocket.OPEN) {
//                     if (message.type === 'location') {
//                         // Optionally add additional checks or logic to filter which clients should receive the update
//                         client.send(JSON.stringify({
//                             driverId: message.driverId,
//                             latitude: message.latitude,
//                             longitude: message.longitude,
//                             timestamp: message.timestamp
//                         }));
//                     }
//                 }
//             });
//         } catch (e) {
//             console.error('Failed to parse JSON:', e);
//         }
//     });

//     ws.on('close', function() {
//         console.log('Client has disconnected.');
//         clients = clients.filter(client => client !== ws);
//     });
// });

// console.log('WebSocket server is running on ws://localhost:8080');

//Currently, your server broadcasts location updates to all connected 
//clients, regardless of whether they are interested in that particular driver. 
//To reduce unnecessary network traffic and enhance privacy, consider 
//implementing a subscription model where each client only receives updates 
//for specific drivers they are subscribed to. This can be managed by 
//maintaining a mapping of which client is interested in which driver's 
//updates.


const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); 

const wss = new WebSocket.Server({ port: 8080 });
let clients = {};

wss.on('connection', function connection(ws) {
    const clientId = uuidv4();  // Generate a unique ID for each client
    clients[clientId] = ws;

    console.log('A new client connected:', clientId);

    ws.on('message', function incoming(message) {
        console.log(`Received: ${message} from ${clientId}`);
        const data = JSON.parse(message);

        switch(data.type) {
            case 'subscribe':
                // Logic to handle subscription
                if (!clients[clientId].subscriptions) {
                    clients[clientId].subscriptions = new Set();
                }
                clients[clientId].subscriptions.add(data.driverId);
                console.log(`Client ${clientId} subscribes to driver ID: ${data.driverId}`);
                break;
            case 'location':
                // Broadcast to all clients subscribed to this driver
                Object.keys(clients).forEach(id => {
                    if (clients[id].subscriptions && clients[id].subscriptions.has(data.driverId)) {
                        if (clients[id].readyState === WebSocket.OPEN) {
                            clients[id].send(JSON.stringify({
                                type: 'location',
                                driverId: data.driverId,
                                latitude: data.latitude,
                                longitude: data.longitude,
                                timestamp: data.timestamp
                            }));
                        }
                    }
                });
                break;
        }
    });

    ws.on('close', () => {
        console.log(`Client ${clientId} disconnected.`);
        delete clients[clientId];  // Remove client from the list
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
