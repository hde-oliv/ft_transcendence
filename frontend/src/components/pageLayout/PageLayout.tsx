'use client'
import { createContext, ReactElement, useEffect, useState } from 'react';
import { Grid, GridItem } from '@chakra-ui/react';
import React from 'react';

import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/lib/Theme";

import PongNavBar from '../nav/PongNavBar';
import { getMe, MeResponseData } from '@/lib/fetchers/me';
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

  const [me, setMe] = useState<MeResponseData>(defaultMe);
  const updateMe = async () => {
    try {
      const resp = await getMe()
      setMe(resp);
    } catch (e) {
      console.log('manage different possible errors'); //TODO
    }
  };
  useEffect(() => {
    if (me.intra_login === '')
      updateMe();
  }, [me]);
  useEffect(() => {
    applicationSocket.connect();
    return (() => {
      applicationSocket.disconnect()
    })
  }, []);
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
