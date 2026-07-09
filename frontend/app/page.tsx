"use client";

import {
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const CHAT_HISTORY_KEY = "airi-set-chat-history";

type Paper = {
  id: string;
  title: string;
  category: string;
  path: string;
  source: string;
};

type Citation = {
  paper: string;
  page: number;
  snippet: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  createdAt: string;
};

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Halo, aku AIRi-set. Upload paper, lalu tanya apa pun soal metode, dataset, hasil, kesimpulan, atau research gap. Aku akan jawab dari dokumen dan tetap kasih sumber halamannya.",
  citations: [],
  createdAt: new Date().toISOString(),
};

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);
  const [status, setStatus] = useState("Siap menerima paper.");
  const [connection, setConnection] = useState<"checking" | "online" | "offline">("checking");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const uploadedCount = papers.filter((paper) => paper.source === "upload").length;
  const knowledgeBaseCount = papers.filter((paper) => paper.source === "knowledge_base").length;

  const groupedPapers = useMemo(() => {
    return papers.reduce<Record<string, Paper[]>>((groups, paper) => {
      const label = paper.source === "upload" ? "Uploaded Papers" : paper.category;
      groups[label] = groups[label] ?? [];
      groups[label].push(paper);
      return groups;
    }, {});
  }, [papers]);

  useEffect(() => {
    const saved = window.localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
        }
      } catch {
        window.localStorage.removeItem(CHAT_HISTORY_KEY);
      }
    }

    loadPapers()
      .then(() => setConnection("online"))
      .catch(() => {
        setConnection("offline");
        setStatus("Backend belum terhubung.");
      });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function loadPapers() {
    const response = await fetch("/api/papers");
    if (!response.ok) {
      throw new Error(await readApiError(response));
    }
    setPapers(await response.json());
  }

  async function handleIndex() {
    setIsLoading(true);
    setStatus("Meng-index ulang semua paper...");
    try {
      const response = await fetch("/api/index", { method: "POST" });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const data = await response.json();
      setConnection("online");
      setStatus(`${data.indexed_chunks ?? 0} chunk siap dipakai untuk chat.`);
      await loadPapers();
    } catch (error) {
      setConnection("offline");
      setStatus(`Gagal index: ${getErrorMessage(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    setIsUploading(true);
    setStatus("Mengunggah dan membaca PDF...");
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const data = await response.json();
      setConnection("online");
      setStatus(`${data.uploaded ?? 0} PDF berhasil diproses. ${data.indexed_chunks ?? 0} chunk masuk database.`);
      await loadPapers();
    } catch (error) {
      setConnection("offline");
      setStatus(`Upload gagal: ${getErrorMessage(error)}`);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleDeleteUpload(paper: Paper) {
    const confirmed = window.confirm(`Hapus "${paper.title}" dari upload?`);
    if (!confirmed) return;

    setDeletingPaperId(paper.id);
    setStatus(`Menghapus ${paper.title}...`);
    try {
      const response = await fetch(`/api/papers/${paper.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const data = await response.json();
      setStatus(`Paper dihapus. ${data.indexed_chunks ?? 0} chunk tersisa setelah re-index.`);
      await loadPapers();
    } catch (error) {
      setStatus(`Gagal hapus: ${getErrorMessage(error)}`);
    } finally {
      setDeletingPaperId(null);
    }
  }

  async function handleAsk(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      const data = await response.json();
      setConnection("online");
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          citations: data.citations ?? [],
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setConnection("offline");
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Aku belum bisa menghubungi backend. Detailnya: ${getErrorMessage(error)}`,
          citations: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleAsk();
    }
  }

  function clearHistory() {
    setMessages([welcomeMessage]);
    window.localStorage.removeItem(CHAT_HISTORY_KEY);
  }

  return (
    <main className="min-h-screen bg-paper px-3 py-3 text-ink md:px-5 md:py-5">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex max-h-none flex-col overflow-hidden rounded-lg border border-line bg-white shadow-panel lg:max-h-[calc(100vh-40px)]">
          <div className="border-b border-line p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-forest text-white">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">AIRi-set</h1>
                  <p className="text-sm text-slate-600">Research Assistant</p>
                </div>
              </div>
              <ConnectionBadge status={connection} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-line p-3">
            <Metric label="Knowledge" value={knowledgeBaseCount} />
            <Metric label="Upload" value={uploadedCount} />
          </div>

          <div className="space-y-3 border-b border-line p-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              Upload PDF
              <input className="hidden" type="file" accept="application/pdf" multiple onChange={handleUpload} />
            </label>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-medium transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleIndex}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              Re-index Papers
            </button>

            <div className="rounded-md border border-line bg-paper p-3 text-sm leading-5 text-slate-700">{status}</div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Database size={16} />
              Paper Library
            </div>
            <div className="space-y-4">
              {Object.entries(groupedPapers).length === 0 ? (
                <EmptyState />
              ) : (
                Object.entries(groupedPapers).map(([category, items]) => (
                  <section key={category}>
                    <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">{category}</h2>
                    <div className="space-y-2">
                      {items.map((paper) => (
                        <div key={paper.id} className="group flex gap-2 rounded-md border border-line bg-white p-2 text-sm">
                          <FileText className="mt-0.5 shrink-0 text-coral" size={16} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{paper.title}</p>
                            <p className="truncate text-xs text-slate-500">{paper.source}</p>
                          </div>
                          {paper.source === "upload" && (
                            <button
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              onClick={() => handleDeleteUpload(paper)}
                              disabled={deletingPaperId === paper.id}
                              title="Hapus upload"
                              type="button"
                            >
                              {deletingPaperId === paper.id ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-24px)] flex-col overflow-hidden rounded-lg border border-line bg-white shadow-panel md:min-h-[calc(100vh-40px)]">
          <header className="border-b border-line px-4 py-4 md:px-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-forest">RAG Workspace</p>
                <h2 className="text-xl font-semibold md:text-2xl">Chat dengan paper, lengkap dengan referensi</h2>
              </div>
              <button
                className="flex items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium transition hover:bg-paper"
                onClick={clearHistory}
                type="button"
              >
                <Clock3 size={16} />
                Reset Riwayat
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#fbfcfd] p-3 md:p-5">
            <div className="mx-auto flex max-w-4xl flex-col gap-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="mr-auto flex max-w-[88%] items-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm text-slate-600">
                  <Loader2 className="animate-spin text-forest" size={16} />
                  AIRi-set sedang membaca konteks paper...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form className="border-t border-line bg-white p-3 md:p-4" onSubmit={handleAsk}>
            <div className="mx-auto flex max-w-4xl gap-2 md:gap-3">
              <div className="flex min-h-12 flex-1 items-start gap-2 rounded-md border border-line bg-white px-3 py-2 transition focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/20">
                <Search className="mt-1 shrink-0 text-slate-400" size={18} />
                <textarea
                  className="max-h-32 min-h-8 flex-1 resize-none border-0 bg-transparent py-1 text-sm leading-6 outline-none"
                  placeholder="Tanya: metode apa yang digunakan, dataset apa, hasilnya bagaimana..."
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  rows={1}
                />
              </div>
              <button
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-coral text-white transition hover:bg-[#bd4d3c] disabled:cursor-not-allowed disabled:opacity-50"
                type="submit"
                disabled={isLoading || !question.trim()}
                title="Kirim"
              >
                {isLoading ? <Loader2 className="animate-spin" size={19} /> : <ArrowUp size={19} />}
              </button>
            </div>
            <p className="mx-auto mt-2 max-w-4xl text-xs text-slate-500">Enter untuk kirim, Shift + Enter untuk baris baru.</p>
          </form>
        </section>
      </div>
    </main>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-lg border p-4 md:max-w-[78%] ${
          isUser ? "border-forest bg-forest text-white" : "border-line bg-white text-ink"
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className={`text-xs font-semibold ${isUser ? "text-white/80" : "text-forest"}`}>
            {isUser ? "Kamu" : "AIRi-set"}
          </span>
          <span className={`text-[11px] ${isUser ? "text-white/70" : "text-slate-400"}`}>
            {formatTime(message.createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        {!!message.citations?.length && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Referensi</p>
            {message.citations.map((citation, index) => (
              <div key={`${citation.paper}-${citation.page}-${index}`} className="rounded-md border border-line bg-paper p-3 text-sm text-ink">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-white px-2 py-1 text-xs font-semibold">{citation.paper}</span>
                  <span className="rounded bg-forest px-2 py-1 text-xs font-semibold text-white">Page {citation.page}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{citation.snippet}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-paper p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function ConnectionBadge({ status }: { status: "checking" | "online" | "offline" }) {
  if (status === "checking") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
        <Loader2 className="animate-spin" size={13} />
        Checking
      </span>
    );
  }

  if (status === "online") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
        <CheckCircle2 size={13} />
        Online
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">
      <XCircle size={13} />
      Offline
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-line bg-paper p-4 text-sm leading-6 text-slate-600">
      Belum ada paper. Upload PDF dari tombol di atas atau letakkan file di folder knowledge base.
    </div>
  );
}

async function readApiError(response: Response) {
  try {
    const data = await response.json();
    return data.detail ?? data.message ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Pastikan backend berjalan dan CORS sudah aktif.";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
