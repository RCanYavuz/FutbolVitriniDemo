import { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, CheckCheck } from 'lucide-react';
import { PENDING_CLASS, PENDING_HINT } from '../lib/pending';

/* ─── Mock Data ─── */
const MOCK_CONTACTS = [
  { id: 1, name: 'Ahmet Yılmaz', role: 'Scout', lastMessage: 'Son maç raporunu sisteme yükledim.', time: '10:42', unread: 2, online: true, avatar: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=10b981&color=fff' },
  { id: 2, name: 'Caner Erkin', role: 'Oyuncu', lastMessage: 'Antrenman programı için teşekkürler hocam.', time: 'Dün', unread: 0, online: false, avatar: 'https://ui-avatars.com/api/?name=Caner+Erkin&background=3b82f6&color=fff' },
  { id: 3, name: 'Fatih Terim', role: 'Antrenör', lastMessage: 'Yarınki toplantı saat kaçta?', time: 'Dün', unread: 0, online: true, avatar: 'https://ui-avatars.com/api/?name=Fatih+Terim&background=f59e0b&color=fff' },
  { id: 4, name: 'Mehmet Ali', role: 'Menajer', lastMessage: 'Sözleşme detaylarını mail attım.', time: 'Pzt', unread: 0, online: false, avatar: 'https://ui-avatars.com/api/?name=Mehmet+Ali&background=8b5cf6&color=fff' },
];

const INITIAL_MESSAGES = [
  { id: 1, senderId: 1, text: 'Merhaba, Kerem\'in son maçını izledin mi?', time: '10:30', isMine: false },
  { id: 2, senderId: 0, text: 'Evet hocam, gerçekten çok etkileyiciydi. Fiziksel olarak çok güçlenmiş.', time: '10:35', isMine: true },
  { id: 3, senderId: 1, text: 'Kesinlikle. Son maç raporunu sisteme yükledim.', time: '10:42', isMine: false },
];

export default function MessagingHub() {
  const [activeContactId, setActiveContactId] = useState<number>(MOCK_CONTACTS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = MOCK_CONTACTS.find((c) => c.id === activeContactId);
  const filteredContacts = MOCK_CONTACTS.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      senderId: 0,
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate reply after 1.5s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        {
          id: Date.now() + 1,
          senderId: activeContactId,
          text: 'Harika, teşekkür ederim. Görüşmek üzere!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: false,
        }
      ]);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex bg-surface-primary p-4 lg:p-6">
      <div className="max-w-[1440px] mx-auto w-full flex bg-surface-container border border-border-standard rounded-2xl overflow-hidden shadow-lg">
        
        {/* LEFT PANEL: Contacts */}
        <div className="w-full md:w-[320px] lg:w-[380px] flex flex-col border-r border-border-standard bg-surface-primary">
          {/* Header */}
          <div className="p-4 border-b border-border-standard bg-surface-container flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface">Mesajlar</h2>
            <button
              type="button"
              disabled
              title={PENDING_HINT}
              className={`text-text-muted hover:text-on-surface transition-colors p-2 ${PENDING_CLASS}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-border-standard">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Sohbet veya kişi ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-high border border-border-standard rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:outline-none focus:border-tactical-blue focus:ring-1 focus:ring-tactical-blue transition-all"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`w-full flex items-center gap-3 p-4 transition-colors border-b border-border-standard/30 text-left ${
                  activeContactId === contact.id ? 'bg-surface-secondary' : 'hover:bg-surface-container-high'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface-container" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-on-surface truncate">{contact.name}</h4>
                    <span className="text-[11px] text-text-muted flex-shrink-0">{contact.time}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-xs text-text-muted truncate">{contact.lastMessage}</p>
                    {contact.unread > 0 && (
                      <span className="w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full flex-shrink-0">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-tactical-blue/80 uppercase mt-0.5 inline-block">{contact.role}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Chat Window */}
        {activeContact ? (
          <div className="hidden md:flex flex-1 flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-surface-container relative">
            <div className="absolute inset-0 bg-surface-container/90 z-0" />
            
            {/* Chat Header */}
            <div className="p-4 border-b border-border-standard bg-surface-primary flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-base font-bold text-on-surface">{activeContact.name}</h3>
                  <p className="text-xs text-text-muted">{activeContact.online ? 'Çevrimiçi' : 'Son görülme yakın zamanda'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  title={PENDING_HINT}
                  className={`p-2 text-text-muted hover:text-on-surface transition-colors rounded-lg hover:bg-surface-secondary ${PENDING_CLASS}`}
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  disabled
                  title={PENDING_HINT}
                  className={`p-2 text-text-muted hover:text-on-surface transition-colors rounded-lg hover:bg-surface-secondary ${PENDING_CLASS}`}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 z-10 custom-scrollbar">
              <div className="flex justify-center mb-6">
                <span className="bg-surface-secondary text-text-muted text-xs px-3 py-1 rounded-lg border border-border-standard/50 shadow-sm">Bugün</span>
              </div>
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[75%] rounded-2xl p-3 shadow-md ${
                      msg.isMine 
                        ? 'bg-emerald-600 text-white rounded-br-sm' 
                        : 'bg-surface-primary border border-border-standard text-on-surface rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isMine ? 'text-emerald-200' : 'text-text-muted'}`}>
                      <span className="text-[10px]">{msg.time}</span>
                      {msg.isMine && <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border-standard bg-surface-primary flex items-center gap-3 z-10">
              <button
                type="button"
                disabled
                title={PENDING_HINT}
                className={`p-2 text-text-muted hover:text-on-surface transition-colors ${PENDING_CLASS}`}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                placeholder="Mesajınızı yazın..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-surface-container-high border border-border-standard rounded-full py-2.5 px-4 text-sm text-on-surface focus:outline-none focus:border-emerald-500/50"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-surface-container z-10">
            <div className="w-20 h-20 bg-surface-secondary rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-border-standard" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Futbol Vitrini Web</h3>
            <p className="text-text-muted text-sm text-center max-w-md">
              Sohbet etmek için sol taraftan bir kişi seçin.<br/>Mesajlarınız uçtan uca şifrelenmektedir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
