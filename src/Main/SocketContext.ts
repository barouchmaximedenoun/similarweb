import React, { createContext, useContext } from 'react';
import { SocketService } from './SocketService';

export const SocketContext: React.Context<SocketService> = createContext(new SocketService());

// functional component context hook
export const useSocket = () => useContext(SocketContext);

