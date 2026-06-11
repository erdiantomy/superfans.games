// Superfans — social feed (composer + post cards)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { type SFPost, useCreatePost, useFeed, useToggleLike } from "../lib/queries";
import { Avatar, EmptyState, Spinner } from "./ui";

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function Composer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const create = useCreatePost();
  const [body, setBody] = useState("");

  async function post() {
    if (!user) { navigate("/login"); return; }
    const text = body.trim();
    if (!text) return;
    try {
      await create.mutateAsync({ authorId: user.id, body: text });
      setBody("");
      toast.success("Posted to the feed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not post");
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
      <textarea
        value={body} onChange={(e) => setBody(e.target.value)}
        placeholder={user ? "Share your take on the football…" : "Sign in to share your analysis…"}
        rows={2} maxLength={2000}
        className="w-full resize-none bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-zinc-600">{body.length}/2000</span>
        <button onClick={post} disabled={create.isPending || !body.trim()}
          className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50">
          {create.isPending ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}

export function PostCard({ p }: { p: SFPost }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const like = useToggleLike();
  const name = p.author?.display_name || p.author?.username || "Fan";

  function toggle() {
    if (!user) { navigate("/login"); return; }
    like.mutate({ postId: p.id, userId: user.id, liked: !!p.liked });
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-2.5">
        <Avatar name={name} src={p.author?.avatar_url} size={36} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-100">{name}</div>
          <div className="text-[11px] text-zinc-500">{timeAgo(p.created_at)} ago</div>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{p.body}</p>
      {p.match && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-zinc-400">
          ⚽ {p.match.home_team_name} v {p.match.away_team_name}
        </div>
      )}
      <div className="mt-3 flex items-center gap-4 text-zinc-500">
        <button onClick={toggle} className={`flex items-center gap-1.5 text-xs font-semibold transition ${p.liked ? "text-rose-400" : "hover:text-rose-300"}`}>
          <Heart size={16} fill={p.liked ? "currentColor" : "none"} /> {p.like_count || 0}
        </button>
      </div>
    </div>
  );
}

export function FeedList() {
  const { user } = useAuth();
  const { data, isLoading } = useFeed(user?.id);
  if (isLoading) return <Spinner label="Loading the feed…" />;
  if (!data?.length)
    return <EmptyState title="No posts yet" subtitle="Be the first to share your take on today's matches." icon="📝" />;
  return (
    <div className="space-y-3">
      {data.map((p) => <PostCard key={p.id} p={p} />)}
    </div>
  );
}
