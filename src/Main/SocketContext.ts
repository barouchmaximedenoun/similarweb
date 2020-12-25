import React, { createContext, useContext } from 'react';
import { SocketService } from './SocketService';

export const SocketContext: React.Context<SocketService> = createContext(new SocketService());

export const useSocket = () => useContext(SocketContext);

