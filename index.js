const Peer = require('./peer/peer');

const servers = [
  { host: 'localhost', port: 3001 },
  { host: 'localhost', port: 3002 },
  { host: 'localhost', port: 3003 }
];

// Create a server instance
servers.forEach(s => {
  const server = new Peer('storage', true);
  server.createServer(s.port);
  //server.startMiner();
})

servers.forEach(_server => {
  const client = new Peer('storage', false, `./storage/file_server_${_server.port}.json`);
  servers.forEach(s => {
    client.createClient(s.host, s.port); 
  })
})