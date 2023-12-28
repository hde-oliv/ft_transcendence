'use client'
import { createContext, ReactElement, use, useCallback, useEffect, useState } from 'react';
import { Button, Grid, GridItem, HStack, IconButton, useToast, UseToastOptions } from '@chakra-ui/react';
import React from 'react';

import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/lib/Theme";

import PongNavBar, { logOff } from '../nav/PongNavBar';
import { getMe, MeResponseData } from '@/lib/fetchers/me';
import { acceptP2P } from '@/lib/fetchers/matches';
import applicationSocket from '@/lib/sockets/applicationSocket';
import { NextRouter, useRouter } from 'next/router';
import { GameState } from '@/lib/dto/game.dto';
import { AxiosError } from 'axios';
import { fetchWrapper } from '@/lib/fetchers/SafeAuthWrapper';
import { CloseIcon } from '@chakra-ui/icons';



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
  const router = useRouter()
  const updateMe = useCallback(async () => {
    try {
      const resp = await fetchWrapper(router, getMe);
      setMe(resp);
    } catch (e) {
      console.log(e);
      console.log('manage different possible errors'); //TODO
    }
  }, [router])
  const onChannelKick = useCallback((data: { name: string }) => {
    toast({
      title: `Kiked`,
      description: `You were kicked from "${data.name}" channel.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }, [toast])
  const onFriendAdd = useCallback((data: { name: string }) => {
    toast({
      title: `New Friend`,
      description: `You were added as a friend by "${data.name}"`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }, [toast])
  const acceptInvite = useCallback(async (inviteId: string) => {
    try {
      fetchWrapper(router, acceptP2P, inviteId);
    } catch (e) {
      console.log(e);
    }
  }, [router]);


  const onChannelBan = useCallback((data: { name: string, banned: boolean }) => {
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
  const onGoToGame = useCallback((data: { gameId: string }) => {
    const toastDuration = 1500;
    toast({
      title: `Let's play`,
      description: `You are being redirected to game (id : ${data.gameId})`,
      status: 'success',
      duration: toastDuration,
      onCloseComplete: () => { router.push({ pathname: '/game', query: { id: data.gameId } }) },
      isClosable: true,
    })
  }, [toast, router])
  const onReQueued = useCallback((data: { reason: string }) => {
    toast({
      title: `Server error`,
      description: data.reason,
      status: 'error',
      duration: 3000,
      isClosable: true,
    })
  }, [toast])

  const receivesInvite = useCallback((data: { id: string, issuer: { nickname: string, userId: string } }) => {
    const toastConfig: UseToastOptions = {
      render: (props) => {
        return (<HStack>
          <Button
            alignItems="center"
            colorScheme='blue'
            size='lg'
            onClick={() => acceptInvite(data.id)}>
            Clique para aceitar partida de {data.issuer.nickname}
          </Button>
          <IconButton onClick={props.onClose} icon={<CloseIcon />} aria-label='reject invite' />
        </HStack>)

      }
    }
    toast(toastConfig)
  }, [toast, acceptInvite])

  useEffect(() => {
    try {
      if (me.intra_login === '')
        updateMe();
    } catch (e) {
      console.warn(`me is undefined!`)
    }
  }, [me, updateMe]);
  useEffect(() => {
    applicationSocket.connect();
    applicationSocket.on('kicked', onChannelKick);
    applicationSocket.on('banned', onChannelBan);
    applicationSocket.on('addedAsFriend', onFriendAdd);
    applicationSocket.on('goToGame', onGoToGame);
    applicationSocket.on('reQueued ', onReQueued);
    applicationSocket.on('newInvite', receivesInvite);
    return (() => {
      applicationSocket.off('kicked', onChannelKick);
      applicationSocket.off('banned', onChannelBan);
      applicationSocket.off('addedAsFriend', onFriendAdd);
      applicationSocket.off('goToGame', onGoToGame);
      applicationSocket.off('reQueued ', onReQueued);
      applicationSocket.off('newInvite', receivesInvite);
      applicationSocket.disconnect();
    })
  }, [onChannelKick, onChannelBan, onFriendAdd, onGoToGame, onReQueued, receivesInvite]);
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
