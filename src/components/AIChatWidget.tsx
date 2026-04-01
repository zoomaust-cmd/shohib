import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Brain, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen && currentUser && !sessionId) {
      const createSession = async () => {
        try {
          const newSessionRef = doc(collection(db, 'chatSessions'));
          await setDoc(newSessionRef, {
            userId: currentUser.uid,
            title: 'محادثة جديدة',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          setSessionId(newSessionRef.id);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'chatSessions');
        }
      };
      createSession();
    }
  }, [isOpen, currentUser, sessionId]);

  useEffect(() => {
    if (sessionId) {
      const q = query(
        collection(db, `chatSessions/${sessionId}/messages`),
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          role: doc.data().role,
          text: doc.data().text
        }));
        setMessages(msgs);
        scrollToBottom();
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `chatSessions/${sessionId}/messages`);
      });
      return () => unsubscribe();
    }
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // حفظ رسالة المستخدم
      if (sessionId) {
        await addDoc(collection(db, `chatSessions/${sessionId}/messages`), {
          sessionId,
          role: 'user',
          text: userText,
          createdAt: serverTimestamp()
        });
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
      }

      // 🔥 استدعاء السيرفر
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          type: 'advisor'
        })
      });

      const data = await response.json();
      const aiText = data.text || "عذراً، لم أتمكن من معالجة طلبك.";

      // حفظ الرد
      if (sessionId) {
        await addDoc(collection(db, `chatSessions/${sessionId}/messages`), {
          sessionId,
          role: 'model',
          text: aiText,
          createdAt: serverTimestamp()
        });
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: aiText }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "حدث خطأ في الاتصال بالخادم"
      }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 z-50 p-4 bg-slate-900 text-white rounded-full ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed bottom-6 left-6 z-50 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col" dir="rtl">
            
            <div className="bg-slate-900 text-white p-4 flex justify-between">
              <h3>المساعد الذكي</h3>
              <button onClick={() => setIsOpen(false)}><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className="p-3 bg-gray-100 rounded">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  جاري التفكير...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border rounded p-2"
                placeholder="اكتب سؤالك..."
              />
              <button className="bg-slate-900 text-white p-2 rounded">
                <Send />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}