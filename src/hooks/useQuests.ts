import { supabase } from "@/integrations/supabase/client";

function getISOWeek(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export async function incrementQuestProgress(
  playerId: string,
  actionType: string
) {
  const today = new Date().toISOString().slice(0, 10);
  const week = getISOWeek();
  const month = today.slice(0, 7);
  const periods: Record<string, string> = {
    daily: today, weekly: week, monthly: month,
  };

  const { data: quests } = await (supabase as any)
    .from("quest_definitions")
    .select("*")
    .eq("action_type", actionType)
    .eq("active", true);

  for (const quest of quests ?? []) {
    const periodKey = periods[quest.cadence];
    const { data: existing } = await (supabase as any)
      .from("player_quests")
      .select("*")
      .eq("player_id", playerId)
      .eq("quest_id", quest.id)
      .eq("period_key", periodKey)
      .maybeSingle();

    if (existing?.completed) continue;

    const newProgress = (existing?.progress ?? 0) + 1;
    const completed = newProgress >= quest.target_count;

    await (supabase as any).from("player_quests").upsert({
      player_id: playerId,
      quest_id: quest.id,
      period_key: periodKey,
      progress: newProgress,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    }, { onConflict: "player_id,quest_id,period_key" });
  }
}
