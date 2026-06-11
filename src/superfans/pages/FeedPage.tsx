// Superfans — Feed page
import Shell from "../components/Shell";
import { Composer, FeedList } from "../components/Feed";

export default function FeedPage() {
  return (
    <Shell>
      <h1 className="mb-4 text-xl font-extrabold">Fan Feed</h1>
      <div className="mb-4"><Composer /></div>
      <FeedList />
    </Shell>
  );
}
