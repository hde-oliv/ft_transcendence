"use client";
import { PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Center, CircularProgress, CircularProgressLabel, CircularProgressLabelProps, CircularProgressProps, Flex, Heading, Spinner, useToast } from "@chakra-ui/react";
import { acceptMatch, joinQueue, leaveQueue } from "@/lib/fetchers/matches";
import { SocketContext } from "@/components/pageLayout/PageLayout";
import ClashIcon from "@/components/icons/ClashIcon";
import z from 'zod'
import { AxiosError } from "axios";
import { fetchWrapper } from "@/lib/fetchers/SafeAuthWrapper";
import { useRouter } from "next/router";

//{ to: { intra_login: p_two, nickname: nickname_one }, expiresAt }
const matchedEventPayload = z.object({
  to: z.object({
    intra_login: z.string(),
    nickname: z.string()
  }),
  expiresAt: z.number().int()
})

type MatchEventPayload = z.infer<typeof matchedEventPayload>;

const QueuedComponent: React.FC<{ [key: string]: any } & { prev: any, next: any, setMatched: any }> = (props) => {
  const [commaCount, setCommaCount] = useState(0);
  const socket = useContext(SocketContext);
  const toast = useToast();
  const router = useRouter();
  const { setMatched, next } = props;


  const onLeaveQueue = async () => {
    await fetchWrapper(router, leaveQueue);
    if (props.prev)
      props.prev();
  }

  const onMatched = useCallback((data: any) => {
    try {
      const payload = matchedEventPayload.parse(data);
      setMatched(payload)
      next();
    } catch (e) {
      console.log(e)
    }
  }, [setMatched, next])

  useEffect(() => {
    socket.on('matched', onMatched)
    return () => {
      socket.off('matched', onMatched)
    }
  }, [socket, onMatched]);
  useEffect(() => {
    const ticks = setInterval(() => {
      setCommaCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(ticks);
  }, [])
  useEffect(() => {
    const onJoinQueue = async () => {
      try {
        await fetchWrapper(router, joinQueue);
      } catch (e) {
        if (e instanceof AxiosError) {
          toast({
            title: 'Could not join queue',
            description: e.message,
            status: 'warning',
            duration: 3000,
            isClosable: true,
          })
        }
        props.prev();
      }
    }
    onJoinQueue();
  }, [props, router, toast])
  return (
    <Center flexDir={'column'}>
      <Heading alignSelf={'start'} pl='30%' >Waiting {Array(commaCount % 6).fill('.').join('')}</Heading>
      <Spinner color='yellow.300' size='xl' thickness="0.5em" speed="2s" boxSize='8em' mt='1em' mb='1em' />
      <Button
        bgColor={'red.500'}
        onClick={onLeaveQueue}
      >Leave Queue</Button>
    </Center>
  )
}

const useProgress = (durationMs: number) => {
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState<string>('green.300')
  const [accepted, setAccepted] = useState(false);
  const steptime = Math.floor(durationMs / 100);
  const colors = {
    start: 'yellow.300',
    midStart: 'orange.300',
    midEnd: 'red.200',
    ended: 'red.400',
    okEd: 'green.300'
  }
  const setDone = () => {
    setAccepted(true);
    setProgress(prev => 100);
  }
  const setCancelled = () => { setProgress(prev => 100); setColor(colors.ended) }
  const increment = () => {
    setProgress(prev => {
      if (prev < 100)
        return prev + 1
      return 100;
    });
  }
  useEffect(() => {
    const tickTimeout = setTimeout(() => {
      increment();
    }, steptime);
    return () => {
      if (tickTimeout !== null)
        clearTimeout(tickTimeout)
    };
  }, [progress, steptime])
  useEffect(() => {
    if (progress > 40 && progress < 70)
      setColor(colors.midStart)
    else if (progress > 70 && progress < 100)
      setColor(colors.midEnd)
    else if (progress === 100) {
      if (accepted)
        setColor('green.300')
      else
        setColor(colors.ended)
    }
  }, [progress, accepted, colors.ended, colors.midEnd, colors.midStart])
  return { progress, color, setDone, cancel: setCancelled };
}

const MatchedComponent: React.FC<{ to: string, expiresAt: number, goIdle: any, reQueue: any }> = (props) => {
  const { progress, color, setDone, cancel } = useProgress(props.expiresAt - Date.now());
  const [accepted, setAccepted] = useState(false);
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { reQueue } = props;

  const onCancel = async () => {
    cancel();
    props.goIdle();
  }
  const onAccept = async () => {
    setLoading(true)
    try {
      const worked = await fetchWrapper(router, acceptMatch);
      if (worked) {
        setDone();
        setAccepted(true);
      }
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response) {
          if (e.response.status === 404)
            onCancel()
        } else {
          if (e.code === 'ERR_NETWORK')
            console.error('API is offline');
          onCancel()
        }
      }
      setLoading(false)
    }
  }
  const onDecline = () => {
    onCancel();
  }
  const onRequeued = useCallback(() => {
    reQueue();
  }, [reQueue]);

  useEffect(() => {
    socket.on('reQueued', onRequeued);
    socket.on('deQueued', props.goIdle);
    return () => {
      socket.off('reQueued', onRequeued)
      socket.off('deQueued', props.goIdle)
    };
  }, [socket, onRequeued, props.goIdle])
  return (
    <Center flexDir={'column'}>
      <CircularProgress value={progress} color={accepted ? 'green.300' : color} size={'100%'}>
        <CircularProgressLabel display={'flex'} alignItems={'center'} flexDir={'column'} justifyContent={'center'}>
          <Heading size='sm'>Player found:</Heading>
          <Heading size='sm'>{props.to}</Heading>
          <ClashIcon fill='yellow.300' boxSize={'20%'} />
          <ButtonGroup isAttached>
            <Button
              isDisabled={progress === 100 || loading}
              mt='0.5em'
              size='sm'
              bgColor={'green.300'}
              onClick={onAccept}
            >Accept</Button>
            <Button
              isDisabled={progress === 100}
              mt='0.5em'
              size='sm'
              bgColor={'red.300'}
              onClick={onDecline}
            >Decline</Button>
          </ButtonGroup>
          <Flex dir="column">
          </Flex>
        </CircularProgressLabel>
      </CircularProgress>
    </Center >
  )
}

export default function PlayCard(props: PropsWithChildren) {
  const [currentStage, setCurrentStage] = useState<'idle' | 'queued' | 'matched'>('idle');
  const [matched, setMatched] = useState<MatchEventPayload | null>(null)

  const ContentSteps = useCallback(() => {
    if (currentStage === 'idle')
      return <PlayButton next={() => setCurrentStage('queued')} />
    if (currentStage === "queued")
      return <QueuedComponent next={() => setCurrentStage('matched')} prev={() => setCurrentStage('idle')} setMatched={setMatched} />
    if (matched !== null)
      return <MatchedComponent to={matched.to.nickname} expiresAt={matched.expiresAt} goIdle={() => setCurrentStage('idle')} reQueue={() => setCurrentStage('queued')} />
    setCurrentStage('idle');
    return <></>;
  }, [currentStage, matched])

  return (
    <Center
      flexDir="column"
      alignItems="stretch"
      h="370px"
      w="370px"
      justifyContent="center"
    >
      <ContentSteps />
    </Center>
  );
}
const PlayButton: React.FC<any> = (props) => {
  return <Button
    borderRadius="25"
    h="45%"
    backgroundColor="yellow.300"
    color="pongBlue.400"
    onClick={props.next}
  >
    Play now
  </Button>;
}

