'use client'
import { createContext, ReactElement, useCallback, useEffect, useState } from 'react';
import { Button, Grid, GridItem, useToast, UseToastOptions } from '@chakra-ui/react';
import React from 'react';

import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/lib/Theme";

import PongNavBar from '../nav/PongNavBar';
import { getMe, MeResponseData } from '@/lib/fetchers/me';
import {acceptP2P} from '@/lib/fetchers/matches';
import applicationSocket from '@/lib/sockets/applicationSocket';



const defaultMe = {
  avatar: '',
  intra_login: '',
  nickname: '',
  otp_enabled: false
}

export const MeStateContext = createContext<[MeResponseData, () => Promise<void>]>([defaultMe, async () => { }]);
export const SocketContext = createContext(applicationSocket);

export default function PageLayout({ children }: { children: ReactElement }) {
  const toast = useToast();
  const [me, setMe] = useState<MeResponseData>(defaultMe);
  const updateMe = async () => {
    try {
      const resp = await getMe()
      setMe(resp);
    } catch (e) {
      console.log('manage different possible errors'); //TODO
    }
  };
  const channelKick = useCallback((data: { name: string }) => {
    toast({
      title: `Kiked`,
      description: `You were kicked from "${data.name}" channel.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }, [toast])
  const friendAdd = useCallback((data: { name: string }) => {
    toast({
      title: `New Friend`,
      description: `You were added as a friend by "${data.name}"`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }, [toast])

  const acceptInvite = useCallback(async (target_id: string)=> {
    try {
      acceptP2P(target_id);
    } catch (e) {
      console.log(e);
    }
  }, []);


  const channelBan = useCallback((data: { name: string, banned: boolean }) => {
    const { banned } = data
    const toastConfig: UseToastOptions = {
      title: banned ? `Banned` : `Unbanned`,
      description: `You were ${banned ? 'banned' : 'unbanned'} from "${data.name}" channel.`,
      status: banned ? 'warning' : 'success',
      duration: 3000,
      isClosable: true,
    }
    toast(toastConfig)
  }, [toast])
  const receivesInvite = useCallback((data: { id: string, user_id: string, target_id: string, fulfilled: boolean}) => {
    const toastConfig: UseToastOptions = {
      render:(props)=>{return <Button 
        alignItems="center"
        colorScheme='blue' 
        size='lg'
        onClick={() => acceptInvite(data.user_id)}>
        Aceitar partida de {data.user_id} 
        </Button>}
    }
    toast(toastConfig)
  }, [toast])

  useEffect(() => {
    if (me.intra_login === '')
      updateMe();
  }, [me]);
  useEffect(() => {
    applicationSocket.connect();
    applicationSocket.on('kicked', channelKick);
    applicationSocket.on('banned', channelBan);
    applicationSocket.on('addedAsFriend', friendAdd);
    applicationSocket.on('newInvite', receivesInvite)
    return (() => {
      applicationSocket.disconnect();
      applicationSocket.off('kicked', channelKick);
      applicationSocket.off('banned', channelBan);
      applicationSocket.off('addedAsFriend', friendAdd);
      applicationSocket.off('newInvite', receivesInvite);
    })
  }, [channelKick, channelBan, friendAdd]);
  return (
    <ChakraProvider theme={theme}>
      <SocketContext.Provider value={applicationSocket}>
        <MeStateContext.Provider value={[me, updateMe]}>
          <Grid
            h='100px'
            gap='0'
            templateAreas={`"nav"
							"content"`}
            gridTemplateRows={'10vh 90vh'}
            templateColumns={'100%'}
          >
            <GridItem area={'nav'} bg='yellow.300'>
              <PongNavBar {...me} />
            </GridItem>
            <GridItem area={'content'} bg='pongBlue.400' overflowY='auto'>
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, { ...me });
                }
                return child
              })}
            </GridItem>
          </Grid>
        </MeStateContext.Provider>
      </SocketContext.Provider>
    </ChakraProvider>
  )
}
