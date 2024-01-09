"use client";
import { FC } from "react";
import { Center, Heading } from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody, Tr,
  Th,
  Td, TableContainer
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { HistoryRecord } from "@/lib/fetchers/matches";

const HistoryRecordLine: FC<HistoryRecord> = (props) => {
  let score = <Td textAlign='center'>{props.target.score} | {props.adversary.score}</Td>;
  let wonIcon;
  if (props.status === 'aborted') {
    score = <Td textAlign='center'><WarningTwoIcon color='yellow.300' /></Td>;
  }
  if (props.target.score > props.adversary.score) {
    wonIcon = <CheckIcon color={'green.400'} />
  } else {
    wonIcon = <CloseIcon color='red.500' />
  }
  return (
    <Tr>
      <Td textAlign={'center'}>
        {wonIcon}
      </Td>
      <Td>{props.start.toLocaleDateString()}</Td>
      <Td>{props.adversary.nickname}</Td>
      {score}
    </Tr>
  )

}

export const HistoryCard: FC<{ matches: HistoryRecord[]; }> = (props) => {
  //limitar historico a 5 registros
  return (
    <Center flexDir="column" h="370px" w="370px">
      <Heading mb="1vh">History</Heading>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr bgColor="gray">
              <Th color="yellow.300" textAlign={'center'}>Won</Th>
              <Th color="yellow.300">Date</Th>
              <Th color="yellow.300">Adversary</Th>
              <Th color="yellow.300">Score</Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.matches.map(e => <HistoryRecordLine {...e} key={e.id} />)}
          </Tbody>
        </Table>
      </TableContainer>
    </Center>
  );
};
