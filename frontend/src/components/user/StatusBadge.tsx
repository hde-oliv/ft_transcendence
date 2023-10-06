'use client'
import { Badge } from "@chakra-ui/react";

interface StatusBadgeProps {
	rawStatus: string;
}

const StatusBadge = (props: StatusBadgeProps) => {
	let color: string;
	let status: string;

	if (props.rawStatus === "on") {
		color = "green";
		status = "Online";
	} else if (props.rawStatus === "off") {
		color = "red";
		status = "Offline";
	} else {
		color = "yellow";
		status = "AFK";
	}

	return <Badge colorScheme={color}>{status}</Badge>;
};

export default StatusBadge;
