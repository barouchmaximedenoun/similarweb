export interface VideoSharedMessage {
  title: string;
  videoId: string;
}
export enum VideoSharedMsgEvent {
  ADD_VIDEO_MESSAGE = 'add-video',
  ADDED_VIDEO_MESSAGE = 'added-video',
  REMOVE_VIDEO_MESSAGE = 'remove-video',
  REMOVED_VIDEO_MESSAGE = 'removed-video',
  GET_ALL_VIDEO_MESSAGE= 'get-all-video'
}
