import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, X, Send, User, Circle, Search, Video, PhoneOff, PhoneIncoming, MessageCircle } from 'lucide-react'
import {
  subscribeToUsers,
  subscribeToMessages,
  sendMessageToFirestore,
  getChatId,
  registerUserInFirestore,
  setUserOffline,
  createCallOffer,
  setCallAnswer,
  subscribeToCall,
  addIceCandidate,
  subscribeToIceCandidates,
  endCall,
} from '../services/chatService'

// All visible texts in one place, so they are easy to translate or change
const T = {
  title: 'Evoca Chat',
  loginTitle: 'Մուտք գործեք չաթ',
  loginText: 'Գրանցված օգտատերերի հետ շփվելու համար խնդրում ենք մուտք գործել համակարգ:',
  loginBtn: 'Մուտք / Գրանցում',
  search: 'Փնտրել...',
  noUsers: 'Գրանցված օգտատերեր չկան',
  online: 'առցանց',
  offline: 'անցանց',
  startChat: (name) => `Սկսեք զրույցը ${name}-ի հետ`,
  pickUser: 'Ընտրեք օգտատիրոջը՝ զրույցը սկսելու համար',
  write: 'Գրեք...',
  audioCall: 'Аудиозвонок',
  videoCall: 'Видеозвонок',
  incomingAudio: (n) => `${n} զանգում է Ձեզ`,
  incomingVideo: (n) => `${n} տեսազանգում է Ձեզ`,
  decline: 'Մերժել',
  accept: 'Ընդունել',
  calling: (n) => `Զանգում ենք ${n}...`,
  cancel: 'Չեղարկել',
  voiceCall: 'Ձայնային զանգ',
  endCallTitle: 'Завершить звонок',
  mediaError: 'Չհաջողվեց միանալ խոսափողին/տեսախցիկին։ Ստուգեք թույլտվությունները բրաուզերում։',
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

const readUser = () => {
  try {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export default function Chat() {
  const navigate = useNavigate()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(readUser)
  const isRegistered = !!currentUser

  const [registeredUsers, setRegisteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  // Calls (WebRTC)
  const [callState, setCallState] = useState(null)
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const myRoleRef = useRef(null) // "caller" | "callee"
  const iceUnsubRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  // Re-read the user every time the chat is opened (the chat can live in a layout while the user logs in elsewhere)
  const toggleChat = () => {
    if (!isChatOpen) {
      const u = readUser()
      setCurrentUser((prev) => (prev?.id === u?.id ? prev : u))
    }
    setIsChatOpen(!isChatOpen)
  }

  useEffect(() => {
    if (!isRegistered) return
    registerUserInFirestore(currentUser)
    const unsubscribeUsers = subscribeToUsers(currentUser.id, (users) => setRegisteredUsers(users))
    const handleUnload = () => setUserOffline(currentUser.id)
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      unsubscribeUsers()
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [isRegistered, currentUser])

  useEffect(() => {
    if (!selectedUser || !currentUser) {
      setChatMessages([])
      return
    }
    const chatId = getChatId(currentUser.id, selectedUser.id)
    const unsubscribeMessages = subscribeToMessages(chatId, (messages) => setChatMessages(messages))
    return () => unsubscribeMessages()
  }, [selectedUser, currentUser])

  // Subscribe to the call state of the open dialog
  useEffect(() => {
    if (!selectedUser || !currentUser) {
      setCallState(null)
      return
    }
    const chatId = getChatId(currentUser.id, selectedUser.id)
    const unsubscribeCall = subscribeToCall(chatId, (call) => setCallState(call))
    return () => unsubscribeCall()
  }, [selectedUser, currentUser])

  // The caller receives the answer from the other side
  useEffect(() => {
    const pc = pcRef.current
    if (pc && myRoleRef.current === 'caller' && callState?.answer && !pc.currentRemoteDescription) {
      pc.setRemoteDescription(new RTCSessionDescription(callState.answer)).catch(() => {})
    }
  }, [callState])

  const cleanupCall = () => {
    if (iceUnsubRef.current) {
      iceUnsubRef.current()
      iceUnsubRef.current = null
    }
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    myRoleRef.current = null
  }

  // The call document was deleted: clean up after it
  useEffect(() => {
    if (!callState) cleanupCall()
  }, [callState])

  // Stop the camera/microphone if the component disappears during a call
  useEffect(() => () => cleanupCall(), [])

  function createPeerConnection(chatId, role) {
    const pc = new RTCPeerConnection(ICE_SERVERS)
    pc.onicecandidate = (e) => {
      if (e.candidate) addIceCandidate(chatId, role, e.candidate.toJSON())
    }
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]
    }
    return pc
  }

  const handleStartCall = async (type) => {
    if (!selectedUser || !currentUser) return
    const chatId = getChatId(currentUser.id, selectedUser.id)
    myRoleRef.current = 'caller'
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream

      const pc = createPeerConnection(chatId, 'caller')
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      pcRef.current = pc

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await createCallOffer(chatId, currentUser.id, selectedUser.id, type, { type: offer.type, sdp: offer.sdp })

      iceUnsubRef.current = subscribeToIceCandidates(chatId, 'callee', (candidate) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {})
      })
    } catch (err) {
      console.error('Call start failed:', err)
      window.alert(T.mediaError)
    }
  }

  const handleAcceptCall = async () => {
    if (!selectedUser || !currentUser || !callState?.offer) return
    const chatId = getChatId(currentUser.id, selectedUser.id)
    myRoleRef.current = 'callee'
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callState.type === 'video' })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream

      const pc = createPeerConnection(chatId, 'callee')
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      pcRef.current = pc

      await pc.setRemoteDescription(new RTCSessionDescription(callState.offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await setCallAnswer(chatId, { type: answer.type, sdp: answer.sdp })

      iceUnsubRef.current = subscribeToIceCandidates(chatId, 'caller', (candidate) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {})
      })
    } catch (err) {
      console.error('Call accept failed:', err)
      window.alert(T.mediaError)
      handleEndCall()
    }
  }

  const handleEndCall = async () => {
    if (!selectedUser || !currentUser) return
    const chatId = getChatId(currentUser.id, selectedUser.id)
    cleanupCall()
    await endCall(chatId)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser || !currentUser) return
    const chatId = getChatId(currentUser.id, selectedUser.id)
    const textToSend = newMessage.trim()
    setNewMessage('')
    await sendMessageToFirestore(chatId, currentUser.id, textToSend)
  }

  const filteredUsers = registeredUsers.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatTime = (createdAt) => {
    if (!createdAt?.toDate) return ''
    return createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const goLogin = () => {
    setIsChatOpen(false)
    navigate('/personal/online-banking')
  }

  const incoming = callState?.status === 'ringing' && String(callState.calleeId) === String(currentUser?.id)
  const outgoing = callState?.status === 'ringing' && String(callState.callerId) === String(currentUser?.id)

  return (
    <>
      {/* Incoming call */}
      {incoming && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <PhoneIncoming size={30} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {callState.type === 'video' ? T.incomingVideo(selectedUser?.name) : T.incomingAudio(selectedUser?.name)}
            </h3>
            <div className="flex gap-3">
              <button onClick={handleEndCall} className="flex-1 rounded-full bg-red-500 py-3 font-bold text-white transition hover:bg-red-600">{T.decline}</button>
              <button onClick={handleAcceptCall} className="flex-1 rounded-full bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-700">{T.accept}</button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting for an answer (caller side) */}
      {outgoing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-[#E4DFFF] text-[#6400dc]">
              <Phone size={30} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{T.calling(selectedUser?.name)}</h3>
            <button onClick={handleEndCall} className="w-full rounded-full bg-red-500 py-3 font-bold text-white transition hover:bg-red-600">{T.cancel}</button>
          </div>
        </div>
      )}

      {/* Active call */}
      {callState?.status === 'active' && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black">
          {callState.type === 'video' ? (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
              <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-24 right-4 h-40 w-28 rounded-xl border-2 border-white object-cover shadow-lg sm:h-48 sm:w-36" />
            </>
          ) : (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
              <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-white">
                <Phone size={40} />
              </div>
              <p className="text-lg font-bold text-white">{selectedUser?.name}</p>
              <p className="mt-1 text-sm text-white/60">{T.voiceCall}</p>
            </>
          )}
          <button onClick={handleEndCall} className="absolute right-4 top-4 rounded-full bg-red-500 p-3 text-white shadow-lg transition hover:bg-red-600" title={T.endCallTitle}>
            <PhoneOff size={20} />
          </button>
        </div>
      )}

      {/* Chat island with a round button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 flex h-[450px] w-[340px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all duration-300 sm:w-[600px]">
            <div className="flex shrink-0 items-center justify-between bg-[#6400dc] p-3.5 text-white">
              <div className="flex items-center space-x-2">
                <MessageCircle size={20} className="text-[#97FF00]" />
                <span className="text-sm font-bold sm:text-base">{T.title}</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="rounded-full p-1 text-white/70 transition hover:text-white"><X size={18} /></button>
            </div>

            {!isRegistered ? (
              <div className="my-auto space-y-4 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E4DFFF] text-[#6400dc]"><User size={28} /></div>
                <h3 className="text-lg font-bold text-gray-800">{T.loginTitle}</h3>
                <p className="mx-auto max-w-xs text-xs text-gray-500">{T.loginText}</p>
                <button onClick={goLogin} className="rounded-xl bg-[#6400dc] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#4600dc]">{T.loginBtn}</button>
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                {/* Users list */}
                <div className="flex w-1/3 shrink-0 flex-col border-r bg-slate-50">
                  <div className="border-b bg-white p-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                      <input type="text" placeholder={T.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-lg bg-gray-100 py-1.5 pl-8 pr-2 text-xs focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">{T.noUsers}</div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div key={user.id} onClick={() => setSelectedUser(user)}
                          className={`flex cursor-pointer items-center space-x-2 p-2.5 transition ${selectedUser?.id === user.id ? 'border-l-4 border-l-[#6400dc] bg-white shadow-sm' : 'hover:bg-gray-100'}`}>
                          <div className="relative">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6400dc]/10 text-xs font-bold text-[#6400dc]">{user.name.charAt(0)}</div>
                            {user.isOnline && <Circle size={8} className="absolute bottom-0 right-0 fill-emerald-500 text-emerald-500" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-gray-800">{user.name}</p>
                            <span className="block text-[10px] text-gray-400">{user.isOnline ? T.online : T.offline}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Conversation */}
                <div className="flex flex-1 flex-col bg-white">
                  {selectedUser ? (
                    <>
                      <div className="flex items-center justify-between space-x-2 border-b bg-slate-50 p-2.5">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6400dc] text-xs font-bold text-white">{selectedUser.name.charAt(0)}</div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-800">{selectedUser.name}</h4>
                            <span className="text-[10px] text-emerald-600">{selectedUser.isOnline ? T.online : T.offline}</span>
                          </div>
                        </div>
                        {!callState && (
                          <div className="flex items-center space-x-1.5">
                            <button onClick={() => handleStartCall('audio')} className="rounded-full p-2 text-[#6400dc] transition hover:bg-[#E4DFFF]" title={T.audioCall}><Phone size={16} /></button>
                            <button onClick={() => handleStartCall('video')} className="rounded-full p-2 text-[#6400dc] transition hover:bg-[#E4DFFF]" title={T.videoCall}><Video size={16} /></button>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2.5 overflow-y-auto bg-[#F8F6F0]/30 p-3">
                        {chatMessages.length === 0 ? (
                          <div className="my-auto pt-8 text-center text-xs text-gray-400">{T.startChat(selectedUser.name)}</div>
                        ) : (
                          chatMessages.map((msg) => {
                            const isMe = String(msg.senderId) === String(currentUser.id)
                            return (
                              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs ${isMe ? 'rounded-br-none bg-[#6400dc] text-white' : 'rounded-bl-none bg-gray-100 text-gray-800'}`}>{msg.text}</div>
                                <span className="mt-0.5 px-0.5 text-[9px] text-gray-400">{formatTime(msg.createdAt)}</span>
                              </div>
                            )
                          })
                        )}
                      </div>

                      <form onSubmit={handleSendMessage} className="flex items-center space-x-2 border-t p-2">
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={T.write}
                          className="flex-1 rounded-full bg-gray-100 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6400dc]" />
                        <button type="submit" className="rounded-full bg-[#6400dc] p-2 text-white transition hover:bg-[#4600dc]"><Send size={14} /></button>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center p-4 text-center text-gray-400">
                      <MessageCircle size={32} className="mb-2 text-[#6400dc] opacity-30" />
                      <p className="text-xs">{T.pickUser}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button onClick={toggleChat} className="group relative flex items-center justify-center rounded-full bg-[#6400dc] p-4 text-white shadow-2xl transition-all duration-300 hover:bg-[#4600dc] active:scale-95">
          {isChatOpen ? (
            <X size={26} />
          ) : (
            <>
              <MessageCircle size={26} className="transition group-hover:scale-110" />
              <span className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#97FF00]" />
            </>
          )}
        </button>
      </div>
    </>
  )
}
