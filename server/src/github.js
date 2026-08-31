export async function getGithubSummary(url) {
  if (!url) return { username: "", summary: "No GitHub profile supplied." };
  const match = url.match(/github\.com\/([^/?#]+)/i);
  if (!match) return { username: "", summary: "Invalid GitHub URL." };

  const username = match[1];
  try {
    const r = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
    if (!r.ok) throw new Error("GitHub profile not found");
    const u = await r.json();
    return {
      username,
      summary: `${u.name || username} has ${u.public_repos ?? 0} public repositories, ${u.followers ?? 0} followers, and joined GitHub in ${String(u.created_at || "").slice(0,4)}.`
    };
  } catch {
    return { username, summary: `GitHub profile: ${username}. Public profile analysis was unavailable.` };
  }
}