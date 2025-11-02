import RoomCanvas from '../../../components/RoomCanvas';

export default async function Home({params}: {params: Promise<{roomId: string}>}) {
    const roomId = (await params).roomId;
    
    return <RoomCanvas roomId={Number(roomId)}/>
}