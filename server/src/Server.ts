import path from 'path';
import express from 'express';
import { createServer, Server } from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import { VideoSharedMsgServer } from './VideoSharedMsgServer';

class NodeServer {
    public static readonly PORT: number = 3001;
    public static readonly CLIENT_BUILD_PATH: string = '../../build';
    private app: express.Application;
    private server: Server;
    private videoMsgServer: VideoSharedMsgServer;
    private io: SocketIO.Server;
    private port: string | number;
  
    constructor () {
      this.app = express();
      this.port = process.env.PORT || NodeServer.PORT;
      this.app.use(cors(),
        bodyParser.urlencoded({extended:true}),
        bodyParser.json());
      this.app.options('*', cors());
      this.server = createServer(this.app);
      this.listen();
      this.videoMsgServer = new VideoSharedMsgServer(this.server);
      this.addRoutes();
    }
    private addRoutes() {
        this.addMovieListRoute();
    }
    private addMovieListRoute(): void {
        this.app.get('/movie/list',async (req, res) => {
            const result = {
                videoList: this.videoMsgServer.videoList
            }
            //console.log(result)
            res.status(200).send(JSON.stringify(result));
        });
    }
    private listen (): void {
        this.server.listen(this.port, () => {
          console.log('Running server on port %s', this.port);
        });
        this.server.on('error', this.onError);
        this.server.on('listening', this.onListening);

        if (process.env.NODE_ENV === `production`) {
            console.log('dirname=', __dirname);
            this.app.use(express.static(path.resolve(__dirname, NodeServer.CLIENT_BUILD_PATH)));
            this.app.get('/',(req,res) => {
                res.sendFile(path.resolve(__dirname, NodeServer.CLIENT_BUILD_PATH + '/index.html'));
            });
        }
    }
    private onError(error: any): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind = typeof this.port === 'string'
            ? 'Pipe ' + this.port
            : 'Port ' + this.port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
            case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
            default:
            throw error;
        }
    }
    private onListening(): void {
        /* const addr = this.server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port; */
        console.log('Listening on '); // + bind);
    }
    get application (): express.Application {
        return this.app;
    }
}
const app = new NodeServer().application;
export { app };
