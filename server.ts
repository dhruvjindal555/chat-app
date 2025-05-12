import './src/types/socket-augment'
import './src/lib/firebase/firebase.admin.config'
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import dbConnect from './src/lib/dbConnect';
import Chat from './src/models/ChatSchema';
import Message from './src/models/MessageSchema';
import { getAuth } from 'firebase-admin/auth';
require('dotenv')
dotenv.config();



const onlineUsers = new Map<string, string>(); // userId -> socket.id
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
});

io.use(async (socket, next) => {
	// console.log('socket',socket.handshake);

	const token = socket.handshake.auth.token;

	try {
		const decodedToken = await getAuth().verifyIdToken(token);
		socket.user = {
			uid: decodedToken.uid,
			email: decodedToken.email || '',
			auth_time: decodedToken.auth_time,
		};
		console.log('decodedToken', decodedToken);
		next();
	} catch (error) {
		console.error("Firebase auth failed:", error);
		next(new Error("Unauthorized"));
	}
});



(async () => {
	try {
		await dbConnect();
		io.on('connection', (socket) => {

			if (!socket.user) return

			console.log('saved as', socket.user?.uid, socket.id);
			onlineUsers.set(socket.user.email, socket.id)

			console.log('Active users : ', onlineUsers.size);

			console.log('User connected:', socket.id);

			// console.log('socketINHandle',socket);      
			socket.on('join', (chatId) => {
				console.log('join req');

				socket.join(chatId);
			});

			// typing 
			socket.on('typing', (props) => {
				try {

					// console.log(props);				
					const receiverSocketId = onlineUsers.get(props.to);
					if (!receiverSocketId || !socket.user) return;

					console.log(socket.user.email, 'to', props.to);
					// console.log(receiverSocketId);

					io.to(receiverSocketId).emit('someoneTyping', {
						isTyping: props.isTyping,
						from: socket.user.email
					});
				} catch (error) {
					console.error(`Error sending typing to ${props.to}:`, error);
				}
			})

			socket.on('sendMessage', async (props, callback) => {
				// console.log('working', props);
				try {
					console.log('In the map', onlineUsers.get(props.receiverEmail) || '');

					console.log(`from ${socket.user?.email} to ${props.receiverEmail} that ${props.message}`);

					const receiverSocketId = onlineUsers.get(props.receiverEmail)!; // or assert non-null
					if (receiverSocketId) {
						io.to(receiverSocketId).timeout(1000).emit('newMessage', {
							message: props.message,
							fromId: socket.user?.uid
						}, function (err: any, responses: any) {
							if (err) {
								// the peer did not ack in time
								return callback({
								  status: "Delivered",
								  data: { to: props.receiverEmail, timestamp: Date.now() }
								});
							  }
			
							  const ack = responses[0];
							  console.log(ack);
							  
							  return callback({
								status: ack.status === "Read" ? "Read" : "Delivered",
								data: {
								  to: props.receiverEmail,
								  timestamp:
									ack.status === "Read" ? ack.data.timestamp : Date.now()
								}
							  });
						})
					} else {
						callback({ status: 'Sent', error: 'User not connected' })
					}
				} catch (error) {
					console.error(`Error sending message to ${props.receiverEmail}:`, error);
					callback({ status: 'error', error: 'Something went wrong' });
				}
			});

			socket.on('notify-online-status', (props) => {
				if (!props.isOnline) {
					console.log(props);
					console.log('Got offline request');
				}

				const toNotify = props.chatPartners

				toNotify.forEach((partner: string) => {
					const partnerSocketId = onlineUsers.get(partner)
					if (partnerSocketId && socket.user) {
						io.to(partnerSocketId).emit('partner-online-status', {
							partnerEmail: socket.user.email,
							isOnline: props.isOnline
						})

						io.to(socket.id).emit('partner-online-status', {
							partnerEmail: partner,
							isOnline: true
						})
					}
				})
			})

			socket.on('disconnect', () => {
				if (socket.user?.email) {
					onlineUsers.delete(socket.user.email)
				}
				console.log('User disconnected:', socket.id);
				console.log('Active users : ', onlineUsers.size);
			});

			socket.on('user-read-all-messages', (props:{partnerEmail: string})=>{
				const partnerEmail = props.partnerEmail
				
				const partnerSocketId = onlineUsers.get(partnerEmail)
				if(!partnerSocketId) return 

				console.log('User read all messages of partner now telling this to the partner');
				

				io.to(partnerSocketId).emit('partner-read-all-messages',{partnerId: socket.user?.uid,partnerEmail: socket.user?.email})
			})
		});

		server.listen(5000, () => {
			console.log('Socket server running on port 8888');
		});
	} catch (error) {
		console.error('Error starting server:', error);
	}
})();
