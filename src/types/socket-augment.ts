import 'socket.io';

declare module 'socket.io' {
  interface Socket {
    user?: {
      uid: string;
      email: string;
      auth_time:number;
    };
  }
}