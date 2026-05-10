
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Users, 
  Calendar, 
  ShieldAlert, 
  X, 
  Send, 
  UserMinus, 
  Flag, 
  Plus,
  MoreVertical,
  ChevronRight,
  Mic,
  PhoneOff,
  Navigation,
  Search
} from "lucide-react";
import { cn, getNumericDistance } from "@/lib/utils";

interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: number;
  isPrivate?: boolean;
  recipient?: string;
}

interface Group {
  id: string;
  name: string;
  members: string[];
}

interface Meeting {
  id: string;
  title: string;
  time: string;
  location: string;
}

interface Entity {
  id: number;
  name: string;
  species: string;
  realm: string;
  x: number;
  y: number;
  threat: number;
  status: string;
  color?: string;
  history?: any[];
}

interface CommunicationSystemProps {
  messages: Message[];
  onSendMessage: (text: string, recipient?: string) => void;
  onSendInvite: (recipient: string) => void;
  blockedUsers: string[];
  onBlockUser: (username: string) => void;
  onReportUser: (username: string, reason: string) => void;
  groups: Group[];
  onCreateGroup: (name: string, members: string[]) => void;
  meetings: Meeting[];
  onCreateMeeting: (title: string, time: string, location: string) => void;
  onClose: () => void;
  entities: Entity[];
  proximityRange: number;
  initialRecipientId?: number;
}

export function CommunicationSystem({
  messages,
  onSendMessage,
  onSendInvite,
  blockedUsers,
  onBlockUser,
  onReportUser,
  groups,
  onCreateGroup,
  meetings,
  onCreateMeeting,
  onClose,
  entities,
  proximityRange,
  initialRecipientId
}: CommunicationSystemProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'groups' | 'meetings' | 'call'>('chat');
  const [selectedChat, setSelectedChat] = useState<string | null>(() => {
    if (initialRecipientId) {
      const entity = entities.find(e => e.id === initialRecipientId);
      return entity ? entity.name : null;
    }
    return null;
  }); // null means global
  const [newMessage, setNewMessage] = useState("");
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: "", time: "", location: "" });
  const [isCalling, setIsCalling] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  const filteredMessages = messages.filter(m => {
    if (blockedUsers.includes(m.sender)) return false;
    if (selectedChat) {
      return (m.sender === selectedChat && m.recipient === "Filip Adamek") || 
             (m.sender === "Filip Adamek" && m.recipient === selectedChat);
    }
    return !m.isPrivate;
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    if (selectedChat) {
      if (groups.find(g => g.name === selectedChat)) {
        // Group message: send to all members? The current API only takes a single recipient, 
        // I might need to iterate or change onSendMessage implementation. 
        // Let's assume onSendMessage can handle group names or I'll just send individually.
        groups.find(g => g.name === selectedChat)?.members.forEach(member => {
           if (member !== "Filip Adamek") onSendMessage(newMessage, member);
        });
      } else {
        onSendMessage(newMessage, selectedChat);
      }
    } else {
      onSendMessage(newMessage); // Global
    }
    setNewMessage("");
  };

  const startCall = () => {
    setIsCalling(true);
    setCallTimer(0);
    const interval = setInterval(() => setCallTimer(prev => prev + 1), 1000);
    (window as any)._callInterval = interval;
  };

  const endCall = () => {
    setIsCalling(false);
    clearInterval((window as any)._callInterval);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#020617]/95 border-l border-[#2A3459] z-[250] flex flex-col shadow-2xl backdrop-blur-md"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#2A3459] flex items-center justify-between bg-[#0a0f1c]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">S.T.A.R. Comms</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Secure Link Active</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2A3459] bg-[#0a0f1c]/50">
        {[
          { id: 'chat', icon: MessageSquare, label: 'Chat' },
          { id: 'groups', icon: Users, label: 'Groups' },
          { id: 'meetings', icon: Calendar, label: 'Planner' },
          { id: 'call', icon: Phone, label: 'Call' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-3 flex flex-col items-center gap-1 transition-all relative",
              activeTab === tab.id ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-tighter">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' && (
          <>
            {/* Chat Selector */}
            <div className="p-2 flex gap-2 overflow-x-auto border-b border-[#2A3459] bg-[#020617]">
              <button
                onClick={() => setSelectedChat(null)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                  selectedChat === null 
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" 
                    : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                )}
              >
                Global Terminal
              </button>
              {/* Mock contacts */}
              {["Bonnie Bennett", "Klaus Mikaelson", "Damon Salvatore", "Alaric Saltzman"].map(contact => (
                <button
                  key={contact}
                  onClick={() => setSelectedChat(contact)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2",
                    selectedChat === contact 
                      ? "bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-400" 
                      : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                  )}
                >
                  {contact}
                  {blockedUsers.includes(contact) && <ShieldAlert className="w-3 h-3 text-red-500" />}
                </button>
              ))}
              <button
                onClick={() => selectedChat && onSendInvite(selectedChat)}
                disabled={!selectedChat}
                className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-3 h-3" /> Send App Invite
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                  <MessageSquare className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-mono italic">No transmissions detected in this frequency.</p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.sender === "Filip Adamek" ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-tighter">
                        {msg.sender}
                      </span>
                      <span className="text-[8px] text-gray-600">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender !== "Filip Adamek" && (
                        <div className="group relative">
                          <MoreVertical className="w-3 h-3 text-gray-600 cursor-pointer hover:text-gray-400" />
                          <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-[#0a0f1c] border border-[#2A3459] rounded shadow-xl z-10 p-1 min-w-[100px]">
                            <button 
                              onClick={() => onBlockUser(msg.sender)}
                              className="w-full text-left px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10 rounded flex items-center gap-2"
                            >
                              <UserMinus className="w-3 h-3" /> Block
                            </button>
                            <button 
                              onClick={() => setShowReportModal(msg.sender)}
                              className="w-full text-left px-2 py-1 text-[10px] text-orange-400 hover:bg-orange-500/10 rounded flex items-center gap-2"
                            >
                              <Flag className="w-3 h-3" /> Report
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "px-3 py-2 rounded-2xl text-sm font-mono border",
                      msg.sender === "Filip Adamek" 
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-100 rounded-tr-none" 
                        : "bg-white/5 border-white/10 text-gray-300 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Nearby Entities List */}
            <div className="p-4 border-t border-[#2A3459] bg-[#020617]">
              <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3">Nearby Entities</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {entities
                  .filter(e => e.id !== 999 && getNumericDistance(entities.find(u => u.id === 999)?.x || 0, entities.find(u => u.id === 999)?.y || 0, e.x, e.y) <= proximityRange)
                  .map(entity => (
                    <div key={entity.id} className="flex justify-between items-center text-xs font-mono text-gray-400 bg-white/5 p-2 rounded">
                      <span>{entity.name}</span>
                      <span className="text-cyan-400">{getNumericDistance(entities.find(u => u.id === 999)?.x || 0, entities.find(u => u.id === 999)?.y || 0, entity.x, entity.y).toFixed(2)} units</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0a0f1c] border-t border-[#2A3459]">
              <div className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={selectedChat ? `Secure message to ${selectedChat}...` : "Broadcast to global terminal..."}
                  className="w-full bg-[#020617] border border-[#2A3459] rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <div className="p-4 space-y-4">
            {selectedGroup ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <button 
                    onClick={() => setSelectedGroup(null)}
                    className="p-1.5 bg-white/5 border border-white/10 rounded text-gray-400 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <h3 className="text-sm font-bold text-white">{selectedGroup.name}</h3>
                </div>
                
                <div className="bg-[#020617] border border-[#2A3459] rounded-xl p-4">
                  <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Group Members ({selectedGroup.members.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {selectedGroup.members.map((member, idx) => {
                      const entity = entities.find(e => e.name === member);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 border border-[#2A3459] flex items-center justify-center text-xs text-white font-bold">
                              {member[0]}
                            </div>
                            <div>
                              <p className="text-sm text-gray-200 font-mono">{member}</p>
                              {entity && <p className="text-[10px] text-cyan-400 font-mono">{entity.species} • {entity.realm}</p>}
                            </div>
                          </div>
                          {entity && (
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border",
                                entity.threat >= 9 ? "bg-red-500/10 border-red-500/30 text-red-400" :
                                entity.threat >= 7 ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                                "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                              )}>
                                T-{entity.threat}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedChat(selectedGroup.name);
                    setActiveTab('chat');
                  }}
                  className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Message Group
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Groups</h3>
                  <button 
                    onClick={() => setShowCreateGroup(true)}
                    className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 hover:bg-cyan-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {groups.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#2A3459] rounded-xl">
                    <Users className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-mono">No active group sectors established.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groups.map(group => (
                      <div 
                        key={group.id} 
                        onClick={() => setSelectedGroup(group)}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{group.name}</span>
                          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-gray-500">{group.members.length} members</span>
                          <div className="flex -space-x-2">
                            {group.members.slice(0, 3).map((m, i) => (
                              <div key={i} className="w-4 h-4 rounded-full bg-gray-700 border border-[#020617] text-[6px] flex items-center justify-center text-white">
                                {m[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Meeting Planner</h3>
              <button 
                onClick={() => setShowCreateMeeting(true)}
                className="p-1.5 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {meetings.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#2A3459] rounded-xl">
                <Calendar className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-mono">No strategic meetings scheduled.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map(meeting => (
                  <div key={meeting.id} className="p-4 bg-[#0a0f1c] border border-[#2A3459] rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500" />
                    <h4 className="text-sm font-bold text-white mb-1">{meeting.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {meeting.time}</span>
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {meeting.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'call' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
            <div className="relative">
              <div className={cn(
                "w-32 h-32 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center transition-all duration-1000",
                isCalling && "animate-pulse scale-110 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.3)]"
              )}>
                <Phone className={cn("w-12 h-12", isCalling ? "text-cyan-400" : "text-gray-600")} />
              </div>
              {isCalling && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 border-2 border-cyan-500 rounded-full"
                />
              )}
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1">
                {isCalling ? "Secure Voice Link Active" : "Voice Communication"}
              </h3>
              <p className="text-sm text-gray-500 font-mono">
                {isCalling ? `Duration: ${formatTime(callTimer)}` : "Encrypted point-to-point audio"}
              </p>
            </div>

            <div className="flex gap-6">
              {!isCalling ? (
                <button 
                  onClick={startCall}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-xl shadow-green-500/20 hover:scale-110 transition-transform"
                >
                  <Phone className="w-6 h-6" />
                </button>
              ) : (
                <>
                  <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={endCall}
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-500/20 hover:scale-110 transition-transform"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                  <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            key="report-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0f1c] border border-red-500/50 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" /> Report Incident
              </h3>
              <p className="text-xs text-gray-400 mb-4 font-mono">
                Reporting: <span className="text-red-400">{showReportModal}</span>
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the rude or hostile behavior..."
                className="w-full bg-[#020617] border border-[#2A3459] rounded-xl p-3 text-sm text-white h-32 focus:outline-none focus:border-red-500/50 transition-all font-mono mb-4"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowReportModal(null)}
                  className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onReportUser(showReportModal, reportReason);
                    setShowReportModal(null);
                    setReportReason("");
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Submit Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCreateGroup && (
          <motion.div 
            key="create-group-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0f1c] border border-cyan-500/50 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-500" /> Establish Group Sector
              </h3>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group Designation Name..."
                className="w-full bg-[#020617] border border-[#2A3459] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono mb-4"
              />
              
              <div className="mb-4 max-h-40 overflow-y-auto border border-[#2A3459] rounded-xl bg-[#020617] p-2">
                <p className="text-xs text-gray-500 font-mono mb-2 px-2">Select Entities:</p>
                {entities.filter(e => e.id !== 999).map(entity => (
                  <label key={entity.id} className="flex items-center gap-2 p-2 hover:bg-[#2A3459]/30 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedGroupMembers.includes(entity.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGroupMembers(prev => [...prev, entity.name]);
                        } else {
                          setSelectedGroupMembers(prev => prev.filter(m => m !== entity.name));
                        }
                      }}
                      className="accent-cyan-500"
                    />
                    <span className="text-sm text-gray-300 font-mono">{entity.name}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowCreateGroup(false);
                    setSelectedGroupMembers([]);
                  }}
                  className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (!newGroupName.trim()) return;
                    onCreateGroup(newGroupName, ["Filip Adamek", ...selectedGroupMembers]);
                    setShowCreateGroup(false);
                    setNewGroupName("");
                    setSelectedGroupMembers([]);
                  }}
                  className="flex-1 py-2 rounded-lg bg-cyan-500 text-white text-sm font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Create Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCreateMeeting && (
          <motion.div 
            key="create-meeting-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0f1c] border border-fuchsia-500/50 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-fuchsia-500" /> Strategic Meeting
              </h3>
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting(prev => ({...prev, title: e.target.value}))}
                  placeholder="Meeting Objective..."
                  className="w-full bg-[#020617] border border-[#2A3459] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 transition-all font-mono"
                />
                <input
                  type="datetime-local"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting(prev => ({...prev, time: e.target.value}))}
                  className="w-full bg-[#020617] border border-[#2A3459] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 transition-all font-mono"
                />
                <input
                  type="text"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting(prev => ({...prev, location: e.target.value}))}
                  placeholder="Sector Location..."
                  className="w-full bg-[#020617] border border-[#2A3459] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 transition-all font-mono"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateMeeting(false)}
                  className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-sm font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onCreateMeeting(newMeeting.title, newMeeting.time, newMeeting.location);
                    setShowCreateMeeting(false);
                    setNewMeeting({ title: "", time: "", location: "" });
                  }}
                  className="flex-1 py-2 rounded-lg bg-fuchsia-500 text-white text-sm font-bold hover:bg-fuchsia-600 transition-all shadow-lg shadow-fuchsia-500/20"
                >
                  Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
