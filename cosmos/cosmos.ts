import { QueryClient } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { QueryClientImpl } from "./proto-ts/bettery/events/v1/query";
import { createProtobufRpcClient } from "@cosmjs/stargate";

export default async function getParticipantStatusByID(
  id: number,
  eventId: number,
) {
  const rpcUrl = process.env.RPC_URL;

  try {
    const tmClient = await Tendermint37Client.connect(rpcUrl as string);

    const queryClient = new QueryClient(tmClient);
    const rpcClient = createProtobufRpcClient(queryClient);

    const eventsQuery = new QueryClientImpl(rpcClient);
    const partRes = await eventsQuery.ParticipantStatus({
      participantId: id,
      eventId: eventId,
    });

    if (partRes) {
      return partRes;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
  }
}
