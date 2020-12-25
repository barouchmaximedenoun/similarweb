import React, { useCallback, useEffect, useState } from 'react';
import qs from 'querystring';
import VideoSearch from './VideoSearch';
import YouTube, { Options } from 'react-youtube';
import axios from 'axios-jsonp-pro';
import YouTubeIcon from '@material-ui/icons/YouTube';

import { VideoSharedMessage } from '../Main/types';
import { useSocket } from '../Main/SocketContext';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
const playerSize = 490;
const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'row',
        [theme.breakpoints.down("sm")]: {
            flexDirection: 'column',
        },
        margin: 5,
    },
    searchBar: {
        marginBottom: 15,
    },
    playlist: {
        display: 'flex',
        flexDirection: 'column',
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    item: {
        display: 'flex',
        flexDirection: 'row',
    },
    player: {
        width: playerSize,
    },
    icon: {
        color: 'red',
        fontSize: 180,
        marginRight: theme.spacing(2),
      },
  }));
const YoutubeFinder = {
    createClient: ({key}:{key:string}) => {
        return {
        search: async (params: any, callback: (error:any, results?: any) => void) => {
            let url: string = process.env.REACT_APP_GOOGLE_UTUBE_API as string;
            if (params) url = url + '/search?' + qs.encode(params) + '&key=' + key;
            console.log(url);
            try {
                const result:any = await axios.get(url);
                console.log("jsonp results >> ", result);
                callback(null, result);
            }
            catch(err) {
                callback(err);
            }
        }
    }}
};

const Dashboard = () => {
    const classes = useStyles();
    const [playList, setPlayList] = useState<VideoSharedMessage[]>([]);
    const [currentVideoId, setCurrentVideoId] = useState<string>('');
    const videoMsgSocket = useSocket();
    useEffect( () => {
        async function fetchPlayList() {
            const url: string = '/movie/list';
            const results:{data:{videoList: VideoSharedMessage[]}} = await axios.get(url);//, requestConfig);
            console.log(results);
            if(results?.data?.videoList?.length > 0) {
                const videoList: VideoSharedMessage[] = results.data.videoList;
                setPlayList(videoList);
                if(currentVideoId === '') {
                    setCurrentVideoId(videoList[0].videoId);
                }
            }
        }
        fetchPlayList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        videoMsgSocket.init();
        return () => {
            videoMsgSocket.disconnect();
        }
    }, [videoMsgSocket])
    const removeToPlayList = useCallback(
        (videoId: string): void => {
            if(currentVideoId === videoId) {
                playList.length > 1 ? setCurrentVideoId(playList[1].videoId) : setCurrentVideoId('');
            }
            setPlayList(playList.filter(video => video.videoId !== videoId));
        }, [playList, currentVideoId]
    );
    useEffect(() => {
        const observable = videoMsgSocket.onRemovedVideoMessage();
        const subscribtion = observable.subscribe((m: VideoSharedMessage) => {
            removeToPlayList(m.videoId);
        })
        return () => {
            subscribtion.unsubscribe();
        }
    },[removeToPlayList, videoMsgSocket ])
    const addToPlayList = useCallback(
        (video: VideoSharedMessage) => {
            if(currentVideoId === '') {
                setCurrentVideoId(video.videoId);
            }
            setPlayList([...playList, video]);
        }, [playList, currentVideoId]
    );
    useEffect(() => {
        const observable = videoMsgSocket.onAddedVideoMessage();
        const subscribtion = observable.subscribe((m: VideoSharedMessage) => {
            addToPlayList(m);
        })
        return () => {
            subscribtion.unsubscribe();
        }
    },[addToPlayList, videoMsgSocket ])

    const opts: Options = {
        height: '390',
        width: `${playerSize}`, //'580', // 640
        playerVars: {
          // https://developers.google.com/youtube/player_parameters
          autoplay: 1,
        },
      };

    return (
        <div className={classes.container}>
            <div className={classes.playlist}>
                <div className={classes.searchBar}>
                    <VideoSearch
                        onAddToPlayList={(event: {search: string}) => {
                            console.log(event.search);
                            const YoutubeClient = YoutubeFinder.createClient({ key: process.env.REACT_APP_API_KEY as string }),
                                params        = {
                                part        : 'id,snippet',
                                type        : 'video',
                                q           : event.search,
                                maxResults  : 1
                            };
                            YoutubeClient.search(params, function(error: unknown, results: {data: { items: any[]}}){
                                if(error) return console.log(error);
                                console.log(results.data.items[0].id.videoId);
                                const item = results.data.items[0];
                                const video: VideoSharedMessage = {title: item.snippet.title, videoId: item.id.videoId};
                                addToPlayList(video);
                                videoMsgSocket.sendAddVideoMessage(video);
                            });
                        }}></VideoSearch>
                </div>
                {playList.map((video: VideoSharedMessage, index:number) => (
                    <div className={classes.item}>
                        <div key={index}>{video.title}</div>
                        <Button variant="text"
                            color="primary"
                            onClick={() => {
                                removeToPlayList(video.videoId);
                                videoMsgSocket.sendRemoveVideoMessage(video);
                            }}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
            </div>
            <div className={classes.player}>
                {currentVideoId !== '' ?
                    <YouTube videoId={currentVideoId} opts={opts} onEnd={event => {
                        console.log(event.target);
                        if(playList.length > 1) {
                            setCurrentVideoId(playList[1].videoId);
                        }
                        else {
                            setCurrentVideoId('')
                        }
                        videoMsgSocket.sendEndVideoMessage(playList[0]);
                        setPlayList([...playList.slice(1)])
                    }} /> 
                    : <YouTubeIcon className={classes.icon} />
                }
            </div>   
        </div>
    )
}
export default Dashboard;