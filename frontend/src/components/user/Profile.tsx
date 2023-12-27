
// import {
//   ReactElement,
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// import {
//   fetchUserById
// } from "@/lib/fetchers/users";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
//   PopoverHeader,
//   PopoverBody,
//   PopoverFooter,
//   PopoverArrow,
//   PopoverCloseButton,
//   PopoverAnchor,
//   ChakraProvider,
// } from '@chakra-ui/react'
// import { Button, Portal } from "@chakra-ui/react";
// import { useRouter } from "next/router";
// import { fetchWrapper } from "@/lib/fetchers/SafeAuthWrapper";

// function profilePopover(intraLogin: string) {
//   const router = useRouter();
//   useEffect(() => {
//     const fetchUserStatus = async () => {
//       const userStats = await fetchWrapper(router, fetchUserById, intraLogin);
//     };
//     fetchUserStatus();
//   }, [intraLogin, router]);



//   return (
//     <Popover>
//       <PopoverTrigger>
//         <Button>Trigger</Button>
//       </PopoverTrigger>
//       <Portal>
//         <PopoverContent>
//           <PopoverArrow />
//           <PopoverHeader>Header</PopoverHeader>
//           <PopoverCloseButton />
//           <PopoverBody>
//             <Button colorScheme='blue'>Invite to game</Button>
//             <Button colorScheme='blue'>Add as friend</Button>
//           </PopoverBody>
//           <PopoverFooter>Stats goes here</PopoverFooter>
//         </PopoverContent>
//       </Portal>
//     </Popover>
//   )
// }

// export default profilePopover;
