import CallDetail from '@/components/call-intelligence/CallDetail'

export default async function Page({ params }: { params: Promise<{ callId: string }> }) {
  const { callId } = await params
  return <CallDetail callId={callId} />
}
