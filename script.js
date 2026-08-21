// Jarvis GitHub Control Demo - Client-side JavaScript
// Note: This runs in the browser and can only access public GitHub API
// For full control, Jarvis uses server-side API with PAT

const GITHUB_API = 'https://api.github.com';
const USERNAME = 'HarithKavish';

async function fetchGitHub(endpoint) {
    const response = await fetch(`${GITHUB_API}${endpoint}`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
}

async function loadActivity() {
    try {
        const events = await fetchGitHub(`/users/${USERNAME}/events/public`);
        const recent = events.slice(0, 5).map(e => {
            const time = new Date(e.created_at).toLocaleString();
            return `${time} • ${e.type.replace('Event', '')} • ${e.repo.name}`;
        }).join('\n');
        document.getElementById('activity').textContent = recent || 'No recent public activity';
    } catch (e) {
        document.getElementById('activity').textContent = 'Could not load activity';
    }
}

async function testConnection() {
    const output = document.getElementById('output');
    output.textContent = 'Testing GitHub API connection...\n';
    
    try {
        const user = await fetchGitHub(`/users/${USERNAME}`);
        output.textContent += `✅ Connected as ${user.login} (${user.name})\n`;
        output.textContent += `📦 Public repos: ${user.public_repos}\n`;
        output.textContent += `👥 Followers: ${user.followers}\n`;
        output.textContent += `📍 Location: ${user.location || 'N/A'}\n`;
        output.textContent += `🔗 Profile: ${user.html_url}\n`;
    } catch (e) {
        output.textContent += `❌ Error: ${e.message}\n`;
    }
}

async function listRepos() {
    const output = document.getElementById('output');
    output.textContent = 'Fetching repositories...\n';
    
    try {
        let allRepos = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
            const repos = await fetchGitHub(`/users/${USERNAME}/repos?page=${page}&per_page=100&sort=updated`);
            if (repos.length === 0) {
                hasMore = false;
            } else {
                allRepos = allRepos.concat(repos);
                page++;
            }
        }
        
        output.textContent += `✅ Found ${allRepos.length} repositories\n\n`;
        
        const publicRepos = allRepos.filter(r => !r.private);
        const privateRepos = allRepos.filter(r => r.private);
        
        output.textContent += `📂 Public: ${publicRepos.length}\n`;
        output.textContent += `🔒 Private: ${privateRepos.length}\n\n`;
        
        output.textContent += 'Recent repos (by update):\n';
        allRepos.slice(0, 10).forEach(repo => {
            const visibility = repo.private ? '🔒' : '📂';
            const updated = new Date(repo.updated_at).toLocaleDateString();
            output.textContent += `  ${visibility} ${repo.name} — ${updated}\n`;
        });
        
        if (allRepos.length > 10) {
            output.textContent += `\n... and ${allRepos.length - 10} more`;
        }
    } catch (e) {
        output.textContent += `❌ Error: ${e.message}\n`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('deploy-time').textContent = new Date().toLocaleString();
    loadActivity();
    
    document.getElementById('test-btn').addEventListener('click', testConnection);
    document.getElementById('list-repos-btn').addEventListener('click', listRepos);
});