import SocketIOClient from 'socket.io-client';
import { VideoSharedMessage, VideoSharedMsgEvent } from './types';
import { fromEvent, Observable } from 'rxjs';

const SERVER_URL = 'http://localhost:3001';
export class SocketService {
  private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

  /* constructor() {
    this.init();
  } */

  public init (): SocketService {
    console.log('initiating socket service');
    this.socket = SocketIOClient(SERVER_URL);
    return this;
  }

  // send a message for the server to broadcast
  public sendAddVideoMessage (video: VideoSharedMessage): void {
    console.log('emitting message: ' + video);
    this.socket.emit(VideoSharedMsgEvent.ADD_VIDEO_MESSAGE, video);
  }

  public sendRemoveVideoMessage (video: VideoSharedMessage): void {
    console.log('emitting message: ' + video);
    this.socket.emit(VideoSharedMsgEvent.REMOVE_VIDEO_MESSAGE, video);
  }

  // link message event to rxjs data source
  public onAddedVideoMessage (): Observable<VideoSharedMessage> {
    return fromEvent(this.socket, VideoSharedMsgEvent.ADDED_VIDEO_MESSAGE);
  }

  public onRemovedVideoMessage (): Observable<VideoSharedMessage> {
    return fromEvent(this.socket, VideoSharedMsgEvent.REMOVED_VIDEO_MESSAGE);
  }

  // disconnect - used when unmounting
  public disconnect (): void {
    this.socket.disconnect();
  }
}
