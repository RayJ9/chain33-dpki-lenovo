const net = require('net');
const path = require('path');
const fs = require('fs');

const PORT = 12349;
const HOST = '0.0.0.0';



const server = net.createServer((socket) => {
    console.log('New client connected:', socket.remoteAddress, socket.remotePort);
    socket.on('data', (data) => {
        console.log('Received message:', data.toString());
        try {
            const message = JSON.parse(data.toString());
            if (message.type === 'CSR') {
                const ueName = message.ue_name;
                const csrContent = message.csr_content;
                const csrDir1 = path.join(__dirname, `tempUE_${ueName}`);
                
                if (!fs.existsSync(csrDir1)) {
                    fs.mkdirSync(csrDir1);
                }

                const csrDir2 = path.join(csrDir1, `certs`);
                if (!fs.existsSync(csrDir2)) {
                    fs.mkdirSync(csrDir2);
                }

                const filePath = path.join(csrDir2, `${ueName}.csr`);
                fs.writeFile(filePath, csrContent, (err) => {
                    if (err) {
                        console.error('存储失败:', err);
                        socket.write('存储CSR失败');
                    } else {
                        console.log(`CSR已收到:${filePath}`);
                        socket.write('CSR已收到，等待证书颁发');
                    }
                });
                
            } else {
                console.log('Unknown message type');
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST}:${PORT}`);
});
