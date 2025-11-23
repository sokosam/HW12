import time
import subprocess
import shutil
import os
import tempfile
from pathlib import Path
from google import genai
import datetime
import requests
from docker_tools import get_container_state, get_container_logs, get_container_env
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()
class GeminiResponse(BaseModel):
    explanation: str = Field(..., description="Detailed explanation of the error")
    suggestedFix: str = Field(..., description="Suggested fix for the error")

gemini_api = os.environ.get("GENAI_API_KEY")
backend_route = os.environ.get("AGENT_BACKEND_URL")
agent_id = int(os.environ.get("AGENT_ID"))

# File extensions to include when analyzing repo
CODE_EXTENSIONS = {'.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.cpp', '.c', '.h', 
                   '.go', '.rs', '.rb', '.php', '.cs', '.swift', '.kt', '.scala',
                   '.yaml', '.yml', '.json', '.toml', '.md', '.txt', '.sh', '.dockerfile'}


def post_status( service_name :str, error_logs: str, explanation: str, suggestion: str, time: datetime.datetime):
    headers = {
        "Content-Type": "application/json",
        # "Authorization": f"Bearer"
    }
    
    payload = {
        "agentId": agent_id,
        "containerId": agent_id,
        "serviceName": service_name,
        "errorMessage": error_logs,
        "explanation": explanation,
        "suggestedFix": suggestion,
        "occurredAt": time.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
    }
    
    print(f"Posting status to backend: {payload}")
    error_route = f"{backend_route}/api/agent/data-ingest"

    try:
        response = requests.post(error_route, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Failed to post status: {e}")
        return None



def clone_git_repo(repo_url: str, target_dir: str, timeout: int = 30, full_history: bool = False) -> bool:
    """Clone a git repository to a temporary directory with timeout"""
    try:
        print(f"Cloning repository: {repo_url}")
        clone_args = ["git", "clone"]
        if not full_history:
            clone_args.extend(["--depth", "50"])  # Get last 50 commits for history
        clone_args.extend([repo_url, target_dir])
        
        result = subprocess.run(
            clone_args,
            check=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        print(f"✅ Repository cloned successfully to {target_dir}")
        return True
    except subprocess.TimeoutExpired:
        print(f"❌ Git clone timed out after {timeout} seconds")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to clone repository: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error during git clone: {e}")
        return False


def get_recent_commits(repo_dir: str, limit: int = 10) -> str:
    """Get recent commit history from the repository"""
    try:
        result = subprocess.run(
            ["git", "log", f"-{limit}", "--pretty=format:%H|%an|%ae|%ad|%s", "--date=iso"],
            cwd=repo_dir,
            check=True,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        commits = []
        for line in result.stdout.strip().split('\n'):
            if line:
                parts = line.split('|')
                if len(parts) == 5:
                    commit_hash, author, email, date, message = parts
                    commits.append(f"  • [{date}] {message}\n    Author: {author} <{email}>\n    Commit: {commit_hash[:8]}")
        
        if commits:
            return "\n\n".join(commits)
        return "No commits found"
    except Exception as e:
        print(f"Warning: Could not fetch git commits: {e}")
        return "Could not retrieve commit history"


def get_github_pull_requests(repo_url: str, limit: int = 5) -> str:
    """Fetch recent pull requests from GitHub API"""
    try:
        # Extract owner and repo from URL
        # Examples: https://github.com/owner/repo or git@github.com:owner/repo.git
        if 'github.com' not in repo_url:
            return "Not a GitHub repository"
        
        if repo_url.startswith('http'):
            parts = repo_url.rstrip('/').rstrip('.git').split('/')
            owner, repo = parts[-2], parts[-1]
        else:
            # git@github.com:owner/repo.git format
            parts = repo_url.split(':')[-1].rstrip('.git').split('/')
            owner, repo = parts[0], parts[1]
        
        api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
        params = {
            'state': 'all',
            'sort': 'updated',
            'direction': 'desc',
            'per_page': limit
        }
        
        response = requests.get(api_url, params=params, timeout=10)
        
        if response.status_code == 404:
            return "Repository not found or is private (cannot access PRs without authentication)"
        
        response.raise_for_status()
        pulls = response.json()
        
        if not pulls:
            return "No pull requests found"
        
        pr_info = []
        for pr in pulls:
            status = "✅ MERGED" if pr.get('merged_at') else f"⚠️ {pr['state'].upper()}"
            date = pr.get('merged_at') or pr.get('closed_at') or pr['updated_at']
            pr_info.append(
                f"  • [{status}] PR #{pr['number']}: {pr['title']}\n"
                f"    Author: {pr['user']['login']}\n"
                f"    Updated: {date}\n"
                f"    URL: {pr['html_url']}"
            )
        
        return "\n\n".join(pr_info)
    except requests.exceptions.RequestException as e:
        print(f"Warning: Could not fetch GitHub PRs: {e}")
        return "Could not retrieve pull request information"
    except Exception as e:
        print(f"Warning: Error parsing GitHub data: {e}")
        return "Error retrieving pull request information"


def extract_repo_contents(repo_dir: str, max_size_mb: int = 10) -> str:
    """Extract all relevant source code files from the repository"""
    repo_path = Path(repo_dir)
    files_content = []
    total_size = 0
    max_size_bytes = max_size_mb * 1024 * 1024
    
    # Walk through all files in the repo
    for file_path in sorted(repo_path.rglob('*')):
        # Skip directories, hidden files, and common ignore patterns
        if (file_path.is_dir() or 
            file_path.name.startswith('.') or
            'node_modules' in file_path.parts or
            '__pycache__' in file_path.parts or
            'venv' in file_path.parts or
            '.git' in file_path.parts or
            'dist' in file_path.parts or
            'build' in file_path.parts):
            continue
        
        # Only include relevant file types
        if file_path.suffix.lower() not in CODE_EXTENSIONS:
            continue
        
        try:
            # Read file content
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            file_size = len(content.encode('utf-8'))
            
            # Stop if we exceed max size
            if total_size + file_size > max_size_bytes:
                files_content.append(f"\n\n--- TRUNCATED: Reached size limit of {max_size_mb}MB ---\n")
                break
            
            total_size += file_size
            relative_path = file_path.relative_to(repo_path)
            files_content.append(f"\n\n{'='*80}\nFile: {relative_path}\n{'='*80}\n{content}")
            
        except Exception as e:
            print(f"Warning: Could not read {file_path}: {e}")
            continue
    
    result = ''.join(files_content)
    print(f"📁 Extracted {len(files_content)} files ({total_size / 1024:.2f} KB)")
    return result


def get_gemini_response(prompt: str) -> str:
    client = genai.Client(api_key=gemini_api)
    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents= prompt,
        config={
            "response_mime_type" : "application/json",
            "response_schema" : GeminiResponse
        }
    )
    return GeminiResponse.model_validate_json(response.text).model_dump()



def heartbeat():
    heartbeat_route = f"{backend_route}/api/agent/heartbeat"
    headers = {
        "Content-Type": "application/json",
        # "Authorization": f"Bearer"
    }

    payload = {
        "containerId": agent_id,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

    try:
        response = requests.post(heartbeat_route, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Failed to post status: {e}")
        return None

    



# Get target containers from environment variable
TARGETS = os.environ.get("TARGET_CONTAINERS", "demo-backend,demo-frontend").split(",")
TARGETS = [name.strip() for name in TARGETS]  # Remove any whitespace
print(f"Monitoring containers: {TARGETS}")

# Track restart counts to detect exits
restart_counts = {}

# Track container status: "alive" or "fail"
container_status = {}

bad_states = ["exited", "dead", "restarting"]


def on_fail(container_name: str, logs: str):
    """Called when a container transitions from alive to fail"""
    print(f"[{container_name}] 🔥 FAILURE DETECTED - Transitioning to FAIL state")

    try:
        # Build the prompt with error logs
        prompt = f"""Analyze the following error logs and provide:
1. A concise explanation of what went wrong
2. A suggested fix to resolve the issue

Logs:
{logs}
"""

        # Get the Git repository URL from the container's environment variables
        repo_context = ""
        git_history = ""
        pr_history = ""
        git_repo_url = get_container_env(container_name, "GIT_REPO_URL")
        print(f"[{container_name}] GIT_REPO_URL: {git_repo_url}")
        
        if git_repo_url:
            print(f"[{container_name}] 📦 Git repo configured: {git_repo_url}")
            
            # Fetch GitHub PR information first (doesn't require cloning)
            print(f"[{container_name}] 🔍 Fetching recent pull requests...")
            pr_history = get_github_pull_requests(git_repo_url, limit=5)
            
            with tempfile.TemporaryDirectory() as temp_dir:
                if clone_git_repo(git_repo_url, temp_dir, full_history=False):
                    # Get recent commit history
                    print(f"[{container_name}] 📜 Fetching recent commits...")
                    git_history = get_recent_commits(temp_dir, limit=10)
                    
                    # Extract source code
                    print(f"[{container_name}] 📁 Extracting source code...")
                    repo_context = extract_repo_contents(temp_dir)
                    
                    prompt = f"""{prompt}

Recent Pull Requests:
{pr_history}

Recent Commits (Last 10):
{git_history}

Repository Source Code:
{repo_context}

Now analyze the error logs in the context of this source code, recent commits, and pull requests. 
Consider:
1. What recent changes might have introduced this error?
2. Which commit or PR might be responsible?
3. What specific code changes are needed to fix it?

Provide a detailed explanation and fix with specific references to files, line numbers, and recent changes.
"""
                else:
                    print(f"[{container_name}] ⚠️ Failed to clone repo, analyzing logs only")
        
        print(f"[{container_name}] 🤖 Sending to Gemini for analysis...")
        response = get_gemini_response(prompt)
        print(f"[{container_name}] ✅ Analysis complete")

        post_status(
            service_name=container_name,
            error_logs=logs,
            explanation=response['explanation'],
            suggestion=response['suggestedFix'],
            time=datetime.datetime.utcnow()
        )
        print(f"[{container_name}] 📤 Status posted to backend")
        
    except Exception as e:
        print(f"[{container_name}] ❌ Error during failure analysis: {e}")
        import traceback
        traceback.print_exc()



def main():
    print("Starting Agent Monitor...")
    print(f"PATH: {os.environ.get('PATH')}")
    print(f"Docker binary: {shutil.which('docker')}")
    
    # Initialize all containers as alive
    for name in TARGETS:
        container_status[name] = "alive"
    
    while True:
        heartbeat()
        for name in TARGETS:
            state = get_container_state(name)
            
            if state is None:
                print(f"[{name}] Error: Could not inspect container")
                continue
            
            status = state["status"]
            restart_count = state["restart_count"]
            exit_code = state["exit_code"]
            
            # Initialize restart count tracking
            if name not in restart_counts:
                restart_counts[name] = restart_count
                print(f"[{name}] Initial state: {status}, RestartCount={restart_count}")
                continue
            
            # Determine if container is currently in a failed state
            is_failed = status in bad_states or restart_count > restart_counts[name]
            
            if is_failed:
                # Container is in a failed state
                if container_status[name] == "alive":
                    # Transition from alive -> fail
                    error_logs = get_container_logs(name, lines=300)
                    print(f"[{name}] ⚠️  Container failed! Status={status}, ExitCode={exit_code}, RestartCount={restart_count}")
                    container_status[name] = "fail"
                    on_fail(name, error_logs)
                    
                    # Update restart count
                    if restart_count > restart_counts[name]:
                        restart_counts[name] = restart_count
                # else: Already in fail state, don't call on_fail again
            else:
                # Container is healthy/running
                if container_status[name] == "fail":
                    # Transition from fail -> alive (recovery)
                    print(f"[{name}] ✅ Container recovered! Status={status}")
                    container_status[name] = "alive"
                else:
                    # Still alive
                    print(f"[{name}] Status={status}, RestartCount={restart_count}")
        
        time.sleep(5)

if __name__ == "__main__":
    main()


