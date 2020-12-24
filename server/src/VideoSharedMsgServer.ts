import Socket from 'socket.io';
import { VideoSharedMsgEvent } from './constants';
import { VideoSharedMessage } from './types';
import { Server } from 'http';

export class VideoSharedMsgServer {
  private io: Socket.Server;
  private videos: VideoSharedMessage[] = [];

  constructor (server: Server) {
    this.initSocket(server);
    this.listen();
  }

  get videoList(): VideoSharedMessage[] {
    return [...this.videos];
  }

  private initSocket (server: Server): void {
    this.io = new Socket.Server(server);
    //this.io = require("socket.io")(server);//Socket(server);
  }

  private listen (): void {
    this.io.on(VideoSharedMsgEvent.CONNECT, (socket: any) => {
      console.log('Connected client on port.');

      socket.on(VideoSharedMsgEvent.ADD_VIDEO_MESSAGE, (m: VideoSharedMessage) => {
        console.log('[server](message): %s', JSON.stringify(m));
        this.videos.push(m);
        socket.broadcast.emit(VideoSharedMsgEvent.ADDED_VIDEO_MESSAGE, m);
      });

      socket.on(VideoSharedMsgEvent.REMOVE_VIDEO_MESSAGE, (m: VideoSharedMessage) => {
        console.log('[server](message): %s', JSON.stringify(m));
        this.videos = this.videos.filter(video => video.videoId !== m.videoId);
        socket.broadcast.emit(VideoSharedMsgEvent.REMOVED_VIDEO_MESSAGE, m);
      });

      /* socket.on(VideoSharedMsgEvent.GET_ALL_VIDEO_MESSAGE, (m: VideoSharedMessage) => {
        console.log('[server](message): %s', JSON.stringify(m));
        this.videos = this.videos.filter(video => video.videoId !== m.videoId);
        this.io.emit(VideoSharedMsgEvent.REMOVE_VIDEO_MESSAGE, m);
      }); */

      socket.on(VideoSharedMsgEvent.DISCONNECT, () => {
        console.log('Client disconnected');
      });
    });
  }
}
