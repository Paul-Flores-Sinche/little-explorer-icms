import { notFound } from "next/navigation";

import { RoomDetail } from "@/components/staff/room-detail";
import { roomConfig, roomFromSlug } from "@/data/centre";

export function generateStaticParams() {
  return Object.values(roomConfig).map((config) => ({ room: config.slug }));
}

export default async function RoomPage({ params }: PageProps<"/staff/rooms/[room]">) {
  const { room: slug } = await params;
  const room = roomFromSlug(slug);
  if (!room) notFound();
  return <RoomDetail room={room} />;
}
