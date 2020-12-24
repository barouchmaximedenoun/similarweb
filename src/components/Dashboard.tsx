import { useCallback, useEffect, useState } from 'react';
// import YoutubeFinder from 'youtube-finder';
import qs from 'querystring';
import VideoSearch from './VideoSearch';
import YouTube, { Options } from 'react-youtube';
// import axios from 'axios';
// import axios, { AxiosRequestConfig } from 'axios-jsonp-pro';
import axios from 'axios-jsonp-pro';

import { VideoSharedMessage } from '../Main/types';
import { useSocket } from '../Main/SocketContext';

import Button from '@material-ui/core/Button'

// const API_KEY = 'AIzaSyCT5YNj0WpEUrt_4K8b3GZ6NoBZTOImXMA';
// const API_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
// const API_KEY= 'AIzaSyDOfT_BO81aEZScosfTYMruJobmpjqNeEk';
// const API_KEY = 'AIzaSyBS2OE65llWg0UZs-Ug9JgkacXHZAbzz5M';
const API_KEY = 'AIzaSyD2GKdvyivTvaG_XyQ_GvZ4ga3FKup_ws0';
const GOOGLE_UTUBE_API = 'https://www.googleapis.com/youtube/v3';
const SERVER_URL = '//localhost:3001';
/* interface Config extends AxiosRequestConfig {
    crossDomain?: boolean,
}
const requestConfig: Config = {
    crossDomain: true, 
} */
const YoutubeFinder = {
    createClient: ({key}:{key:string}) => {
        /* axios.create({
            baseURL: "https://www.googleapis.com/youtube/v3",
            params: {
              part: "snippet",
              maxResult: 5,
              key: KEY
            }
          
          }) */
        return {
        search: async (params: any, callback: (error:any, results?: any) => void) => {
            let url = GOOGLE_UTUBE_API;
            if (params) url = url + '/search?' + qs.encode(params) + '&key=' + key;
            console.log(url);
            try {
                const result:any = await axios.get(url);//, requestConfig);
                console.log("jsonp results >> ", result);
                //const results: string[] = data[1].map((item: any[]) => item[0]);
                callback(null, result);
            }
            catch(err) {
                callback(err);
            }
        }
    }}
};

const Dashboard = () => {
    const [playList, setPlayList] = useState<VideoSharedMessage[]>([]);
    const [currentVideoId, setCurrentVideoId] = useState<string>('');
    const videoMsgSocket = useSocket();
    useEffect( () => {
        async function fetchPlayList() {
            const url: string = SERVER_URL + '/movie/list'
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
        width: '640',
        playerVars: {
          // https://developers.google.com/youtube/player_parameters
          autoplay: 1,
        },
      };

    return (
        <>
            <div>Dashboard</div>
            <VideoSearch
                onAddToPlayList={(event: {search: string}) => {
                    console.log(event.search);
                    const YoutubeClient = YoutubeFinder.createClient({ key: API_KEY }),
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
                {currentVideoId !== '' ?
                    <YouTube videoId={currentVideoId} opts={opts} onEnd={event => {
                        console.log(event.target);
                        if(playList.length > 1) {
                            setCurrentVideoId(playList[1].videoId);
                        }
                        else {
                            setCurrentVideoId('')
                        }
                        setPlayList([...playList.slice(1)])
                    }} /> 
                    : null
                }
                {playList.map((video: VideoSharedMessage, index:number) => (
                    <div>
                        <div key={index}>{video.title}</div>
                        <Button variant="text"
                            color="primary"
                            onClick={() => {
                                removeToPlayList(video.videoId);
                                videoMsgSocket.sendRemoveVideoMessage(video);
                            }}
                        >
                            Add
                        </Button>
                    </div>
                ))}
        </>

    )
}
export default Dashboard;