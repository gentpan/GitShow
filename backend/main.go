package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"

	"sync"
	"time"

	"github.com/rs/cors"
)

// ========== Config ==========

type Config struct {
	Username  string   `json:"username"`
	Token     string   `json:"token"`
	Following []string `json:"following"`
	Gender    string   `json:"gender"`
	Location  string   `json:"location"`
}

type SocialLink struct {
	Icon  string `json:"icon"`
	URL   string `json:"url"`
	Color string `json:"color"`
}

type Settings struct {
	Title             string       `json:"title"`
	GitHubUsername    string       `json:"github_username"`
	GitHubURL         string       `json:"github_url"`
	GitHubToken       string       `json:"github_token"`
	HomepageRepoCount int          `json:"homepage_repo_count"`
	HomepageRepos     []string     `json:"homepage_repos"`
	SocialLinks       []SocialLink `json:"social_links"`
	Theme             string       `json:"theme"`
	AdminPassword     string       `json:"admin_password"`
}

// ========== GitHub Models ==========

type GitHubUser struct {
	Login           string `json:"login"`
	AvatarURL       string `json:"avatar_url"`
	HtmlURL         string `json:"html_url"`
	Bio             string `json:"bio"`
	PublicRepos     int    `json:"public_repos"`
	Followers       int    `json:"followers"`
	Following       int    `json:"following"`
	Location        string `json:"location"`
	Company         string `json:"company"`
	Blog            string `json:"blog"`
	TwitterUsername string `json:"twitter_username"`
}

type GitHubRepo struct {
	ID            int64             `json:"id"`
	Name          string            `json:"name"`
	FullName      string            `json:"full_name"`
	Description   string            `json:"description"`
	HtmlURL       string            `json:"html_url"`
	Language      string            `json:"language"`
	Private       bool              `json:"private"`
	Stars         int               `json:"stargazers_count"`
	Forks         int               `json:"forks_count"`
	UpdatedAt     time.Time         `json:"updated_at"`
	Languages     map[string]int    `json:"languages"`
	LangPct       map[string]float64 `json:"lang_pct"`
	LatestVersion string            `json:"latest_version"`
}

type GitHubEvent struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	Actor     GitHubActor     `json:"actor"`
	Repo      GitHubEventRepo `json:"repo"`
	Payload   EventPayload    `json:"payload"`
	CreatedAt time.Time       `json:"created_at"`
}

type GitHubActor struct {
	Login     string `json:"login"`
	AvatarURL string `json:"avatar_url"`
}

type GitHubEventRepo struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

type EventPayload struct {
	Size        int          `json:"size"`
	Ref         string       `json:"ref"`
	RefType     string       `json:"ref_type"`
	Commits     []CommitInfo `json:"commits"`
	Action      string       `json:"action"`
	Description string       `json:"description"`
	Issue       *struct {
		Title string `json:"title"`
		URL   string `json:"html_url"`
		Number int   `json:"number"`
	} `json:"issue"`
	PullRequest *struct {
		Title  string `json:"title"`
		URL    string `json:"html_url"`
		Number int    `json:"number"`
		State  string `json:"state"`
		Merged bool   `json:"merged"`
	} `json:"pull_request"`
	Forkee *struct {
		FullName string `json:"full_name"`
		HtmlURL  string `json:"html_url"`
	} `json:"forkee"`
}

type CommitInfo struct {
	SHA     string `json:"sha"`
	Message string `json:"message"`
	URL     string `json:"url"`
	Author  struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	} `json:"author"`
}

// ========== GraphQL Models ==========

type GraphQLResponse struct {
	Data struct {
		User *struct {
			ContributionsCollection struct {
				TotalCommitContributions          int `json:"totalCommitContributions"`
				TotalIssueContributions           int `json:"totalIssueContributions"`
				TotalPullRequestContributions     int `json:"totalPullRequestContributions"`
				ContributionCalendar struct {
					TotalContributions int `json:"totalContributions"`
					Weeks              []struct {
						ContributionDays []struct {
							Date              string `json:"date"`
							ContributionCount int    `json:"contributionCount"`
							Color             string `json:"color"`
						} `json:"contributionDays"`
					} `json:"weeks"`
				} `json:"contributionCalendar"`
			} `json:"contributionsCollection"`
		} `json:"user"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

// ========== Cache Models ==========

type HeatmapDay struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
	Color string `json:"color"`
}

type FollowingCache struct {
	User   *GitHubUser    `json:"user"`
	Events []GitHubEvent  `json:"events"`
	Repos  []GitHubRepo   `json:"repos"`
}

type StarHistoryPoint struct {
	Date  string `json:"date"`
	Stars int    `json:"stars"`
}

type CacheData struct {
	User          *GitHubUser
	Repos         []GitHubRepo
	Events        []GitHubEvent
	Following     map[string]*FollowingCache
	FollowingNames []string
	Heatmap       []HeatmapDay
	TotalStars    int
	TotalCommits  int
	TotalRepos    int
	LastUpdated   time.Time
}

// ========== Response Models ==========

type MeResponse struct {
	User        *GitHubUser `json:"user"`
	Stats       UserStats   `json:"stats"`
	Gender      string      `json:"gender"`
	Location    string      `json:"location"`
	Following   int         `json:"following_count"`
	LastUpdated time.Time   `json:"last_updated"`
}

type UserStats struct {
	TotalStars   int `json:"total_stars"`
	TotalCommits int `json:"total_commits"`
	TotalRepos   int `json:"total_repos"`
}

type ActivityItem struct {
	ID        string       `json:"id"`
	Type      string       `json:"type"`
	Actor     string       `json:"actor"`
	AvatarURL string       `json:"avatar_url"`
	Repo      string       `json:"repo"`
	RepoURL   string       `json:"repo_url"`
	Commits   []CommitInfo `json:"commits"`
	Message   string       `json:"message"`
	Action    string       `json:"action"`
	Target    string       `json:"target"`
	TargetURL string       `json:"target_url"`
	CreatedAt time.Time    `json:"created_at"`
}

type FollowingItem struct {
	Username     string        `json:"username"`
	AvatarURL    string        `json:"avatar_url"`
	Bio          string        `json:"bio"`
	LastActive   *time.Time    `json:"last_active"`
	RecentRepos  []GitHubRepo  `json:"recent_repos"`
	RecentEvents []ActivityItem `json:"recent_events"`
}

type FeedItem struct {
	ID        string       `json:"id"`
	Type      string       `json:"type"`
	Actor     string       `json:"actor"`
	AvatarURL string       `json:"avatar_url"`
	Action    string       `json:"action"`
	Repo      string       `json:"repo"`
	RepoURL   string       `json:"repo_url"`
	Commits   []CommitInfo `json:"commits"`
	Message   string       `json:"message"`
	Target    string       `json:"target"`
	TargetURL string       `json:"target_url"`
	CreatedAt time.Time    `json:"created_at"`
}

// ========== Server ==========

type Server struct {
	config   Config
	client   *http.Client
	mu       sync.RWMutex
	cache    *CacheData
	settings Settings
}

func NewServer(cfg Config) *Server {
	return &Server{
		config: cfg,
		client: &http.Client{Timeout: 30 * time.Second},
		cache:  &CacheData{Following: make(map[string]*FollowingCache)},
	}
}

func (s *Server) loadSettings() {
	data, err := os.ReadFile("settings.json")
	if err != nil {
		log.Printf("[settings] read error: %v, using defaults", err)
		s.settings = Settings{Title: "GitShow", HomepageRepoCount: 6}
		return
	}
	var st Settings
	if err := json.Unmarshal(data, &st); err != nil {
		log.Printf("[settings] parse error: %v, using defaults", err)
		s.settings = Settings{Title: "GitShow", HomepageRepoCount: 6}
		return
	}
	if st.Title == "" {
		st.Title = "GitShow"
	}
	if st.HomepageRepoCount == 0 {
		st.HomepageRepoCount = 6
	}
	s.settings = st
}

func (s *Server) getUsername() string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	u := s.settings.GitHubUsername
	if u == "" {
		return s.config.Username
	}
	return u
}

func (s *Server) getGitHubURL() string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	u := s.settings.GitHubURL
	if u == "" {
		return "https://github.com/" + s.config.Username
	}
	return u
}

func (s *Server) getToken() string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	t := s.settings.GitHubToken
	if t != "" {
		return t
	}
	return s.config.Token
}

func (s *Server) saveSettings(st Settings) error {
	data, err := json.MarshalIndent(st, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile("settings.json", data, 0644); err != nil {
		return err
	}
	s.mu.Lock()
	s.settings = st
	s.mu.Unlock()
	return nil
}

func (s *Server) getSettings() Settings {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.settings
}

// ---------- GitHub API Helpers ----------

func (s *Server) githubRequest(method, url string, body []byte) ([]byte, error) {
	req, err := http.NewRequest(method, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	if s.config.Token != "" && s.config.Token != "ghp_your_token_here" {
		req.Header.Set("Authorization", "Bearer "+s.getToken())
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("github api %s: %d %s", url, resp.StatusCode, string(data))
	}
	return data, nil
}

func (s *Server) getUser(username string) (*GitHubUser, error) {
	data, err := s.githubRequest("GET", "https://api.github.com/users/"+username, nil)
	if err != nil {
		return nil, err
	}
	var user GitHubUser
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *Server) getRepos(username string) ([]GitHubRepo, error) {
	userRepos, err := s.getUserRepos(username)
	if err != nil {
		log.Printf("[repos] get user repos error: %v", err)
	}
	orgRepos, err := s.getUserOrgRepos(username)
	if err != nil {
		log.Printf("[repos] get org repos error: %v", err)
	}
	// deduplicate by full name
	seen := make(map[string]bool)
	var merged []GitHubRepo
	for _, r := range userRepos {
		if !r.Private {
			seen[r.FullName] = true
			merged = append(merged, r)
		}
	}
	for _, r := range orgRepos {
		if !r.Private && !seen[r.FullName] {
			seen[r.FullName] = true
			merged = append(merged, r)
		}
	}
	return merged, nil
}

func (s *Server) getUserRepos(username string) ([]GitHubRepo, error) {
	url := fmt.Sprintf("https://api.github.com/users/%s/repos?sort=updated&per_page=100&type=owner", username)
	data, err := s.githubRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	var repos []GitHubRepo
	if err := json.Unmarshal(data, &repos); err != nil {
		return nil, err
	}
	public := repos[:0]
	for _, r := range repos {
		if !r.Private {
			public = append(public, r)
		}
	}
	return public, nil
}

func (s *Server) getUserOrgRepos(username string) ([]GitHubRepo, error) {
	// list orgs where user is owner
	orgsUrl := fmt.Sprintf("https://api.github.com/user/memberships?per_page=100&state=active")
	data, err := s.githubRequest("GET", orgsUrl, nil)
	if err != nil {
		return nil, err
	}
	var memberships []struct {
		Organization struct {
			Login string `json:"login"`
		} `json:"organization"`
		Role string `json:"role_name"`
	}
	if err := json.Unmarshal(data, &memberships); err != nil {
		return nil, err
	}

	var allRepos []GitHubRepo
	var mu sync.Mutex
	var wg sync.WaitGroup

	for _, m := range memberships {
		role := m.Role
		if role != "owner" {
			continue
		}
		org := m.Organization.Login
		wg.Add(1)
		go func(org string) {
			defer wg.Done()
			url := fmt.Sprintf("https://api.github.com/orgs/%s/repos?sort=updated&per_page=100", org)
			data, err := s.githubRequest("GET", url, nil)
			if err != nil {
				return
			}
			var repos []GitHubRepo
			if err := json.Unmarshal(data, &repos); err != nil {
				return
			}
			mu.Lock()
			for _, r := range repos {
				if !r.Private {
					allRepos = append(allRepos, r)
				}
			}
			mu.Unlock()
		}(org)
	}
	wg.Wait()
	return allRepos, nil
}

func (s *Server) getUserFollowing(username string, limit int) ([]string, error) {
	url := fmt.Sprintf("https://api.github.com/users/%s/following?per_page=100", username)
	data, err := s.githubRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	var users []GitHubUser
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}
	var names []string
	for i, u := range users {
		if limit > 0 && i >= limit {
			break
		}
		names = append(names, u.Login)
	}
	return names, nil
}

func (s *Server) getRepoLanguages(owner, repo string) (map[string]int, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/languages", owner, repo)
	data, err := s.githubRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	var langs map[string]int
	if err := json.Unmarshal(data, &langs); err != nil {
		return nil, err
	}
	return langs, nil
}

func (s *Server) getLatestRelease(owner, repo string) (string, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/releases/latest", owner, repo)
	data, err := s.githubRequest("GET", url, nil)
	if err != nil {
		return "", nil
	}
	var release struct {
		TagName string `json:"tag_name"`
	}
	if err := json.Unmarshal(data, &release); err != nil {
		return "", nil
	}
	return release.TagName, nil
}

func (s *Server) getEvents(username string, page int) ([]GitHubEvent, error) {
	url := fmt.Sprintf("https://api.github.com/users/%s/events/public?per_page=100&page=%d", username, page)
	data, err := s.githubRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	var events []GitHubEvent
	if err := json.Unmarshal(data, &events); err != nil {
		return nil, err
	}
	return events, nil
}

func (s *Server) getAllEvents(username string) ([]GitHubEvent, error) {
	var all []GitHubEvent
	for page := 1; page <= 3; page++ {
		evts, err := s.getEvents(username, page)
		if err != nil {
			if page == 1 {
				return nil, err
			}
			break
		}
		if len(evts) == 0 {
			break
		}
		all = append(all, evts...)
	}
	return all, nil
}

func (s *Server) getContributions(username string) ([]HeatmapDay, int, int, error) {
	query := fmt.Sprintf(`{
		user(login: "%s") {
			contributionsCollection {
				totalCommitContributions
				totalIssueContributions
				totalPullRequestContributions
				contributionCalendar {
					totalContributions
					weeks {
						contributionDays {
							date
							contributionCount
							color
						}
					}
				}
			}
		}
	}`, username)

	body, _ := json.Marshal(map[string]string{"query": query})
	data, err := s.githubRequest("POST", "https://api.github.com/graphql", body)
	if err != nil {
		return nil, 0, 0, err
	}

	var resp GraphQLResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, 0, 0, err
	}
	if len(resp.Errors) > 0 {
		return nil, 0, 0, fmt.Errorf("graphql error: %s", resp.Errors[0].Message)
	}
	if resp.Data.User == nil {
		return nil, 0, 0, fmt.Errorf("user not found")
	}

	var days []HeatmapDay
	cc := resp.Data.User.ContributionsCollection
	total := cc.ContributionCalendar.TotalContributions
	totalCommits := cc.TotalCommitContributions
	for _, week := range cc.ContributionCalendar.Weeks {
		for _, day := range week.ContributionDays {
			days = append(days, HeatmapDay{
				Date:  day.Date,
				Count: day.ContributionCount,
				Color: day.Color,
			})
		}
	}
	return days, total, totalCommits, nil
}

// ---------- Cache Refresh ----------

func (s *Server) refreshCache() {
	log.Println("[cache] refreshing...")
	start := time.Now()

	cache := &CacheData{
		Following: make(map[string]*FollowingCache),
	}

	// 1. current user
	username := s.getUsername()
	user, err := s.getUser(username)
	if err != nil {
		log.Printf("[cache] get user error: %v", err)
	} else {
		cache.User = user
	}

	// 2. repos
	repos, err := s.getRepos(username)
	if err != nil {
		log.Printf("[cache] get repos error: %v", err)
	} else {
		cache.Repos = repos
		for _, r := range repos {
			cache.TotalStars += r.Stars
		}
		cache.TotalRepos = len(repos)
		// fetch languages & latest release concurrently
		var langWg sync.WaitGroup
		var langMu sync.Mutex
		for i := range repos {
			langWg.Add(1)
			go func(idx int) {
				defer langWg.Done()
				owner, repoName := username, repos[idx].Name
				if repos[idx].FullName != "" {
					p := strings.SplitN(repos[idx].FullName, "/", 2)
					if len(p) == 2 {
						owner, repoName = p[0], p[1]
					}
				}
				langs, err := s.getRepoLanguages(owner, repoName)
				if err != nil {
					return
				}
				var total int
				for _, v := range langs {
					total += v
				}
				pct := make(map[string]float64)
				for k, v := range langs {
					if total > 0 {
						pct[k] = float64(v) / float64(total) * 100
					}
				}
				tag, _ := s.getLatestRelease(owner, repoName)
				langMu.Lock()
				repos[idx].Languages = langs
				repos[idx].LangPct = pct
				repos[idx].LatestVersion = tag
				langMu.Unlock()
			}(i)
		}
		langWg.Wait()
	}

	// 3. events
	events, err := s.getAllEvents(username)
	if err != nil {
		log.Printf("[cache] get events error: %v", err)
	} else {
		cache.Events = events
	}

	// 4. heatmap & commits via GraphQL
	days, _, totalCommits, err := s.getContributions(username)
	if err != nil {
		log.Printf("[cache] get contributions error: %v", err)
		// fallback: build from events
		days = s.buildHeatmapFromEvents(events)
		for _, e := range events {
			if e.Type == "PushEvent" {
				totalCommits += e.Payload.Size
			}
		}
	}
	cache.Heatmap = days
	cache.TotalCommits = totalCommits

	// 5. following
	var followingNames []string
	if len(s.config.Following) > 0 {
		followingNames = s.config.Following
	} else {
		// auto fetch from GitHub, limit to 20 to avoid too many requests
		fetched, err := s.getUserFollowing(username, 20)
		if err != nil {
			log.Printf("[cache] get user following error: %v", err)
		} else {
			followingNames = fetched
		}
	}
	cache.FollowingNames = followingNames

	var wg sync.WaitGroup
	var mu sync.Mutex
	for _, f := range followingNames {
		wg.Add(1)
		go func(name string) {
			defer wg.Done()
			fu, err1 := s.getUser(name)
			fe, err2 := s.getAllEvents(name)
			fr, err3 := s.getRepos(name)
			if err1 != nil {
				log.Printf("[cache] get following %s error: %v", name, err1)
				return
			}
			fc := &FollowingCache{User: fu}
			if err2 == nil {
				fc.Events = fe
			}
			if err3 == nil {
				// take top 5 repos
				if len(fr) > 5 {
					fr = fr[:5]
				}
				fc.Repos = fr
			}
			mu.Lock()
			cache.Following[name] = fc
			mu.Unlock()
		}(f)
	}
	wg.Wait()

	cache.LastUpdated = time.Now()

	s.mu.Lock()
	s.cache = cache
	s.mu.Unlock()

	// Record star history
	s.recordStarHistory(cache.TotalStars)

	log.Printf("[cache] refreshed in %v", time.Since(start))
}

func (s *Server) recordStarHistory(totalStars int) {
	today := time.Now().Format("2006-01-02")
	var history []StarHistoryPoint
	data, _ := os.ReadFile("star-history.json")
	if len(data) > 0 {
		json.Unmarshal(data, &history)
	}
	// Update or append today's record
	updated := false
	for i := range history {
		if history[i].Date == today {
			history[i].Stars = totalStars
			updated = true
			break
		}
	}
	if !updated {
		history = append(history, StarHistoryPoint{Date: today, Stars: totalStars})
	}
	// Keep last 90 days
	if len(history) > 90 {
		history = history[len(history)-90:]
	}
	out, _ := json.MarshalIndent(history, "", "  ")
	os.WriteFile("star-history.json", out, 0644)
}

func (s *Server) getStarHistory() []StarHistoryPoint {
	var history []StarHistoryPoint
	data, _ := os.ReadFile("star-history.json")
	if len(data) > 0 {
		json.Unmarshal(data, &history)
	}
	return history
}

func (s *Server) buildHeatmapFromEvents(events []GitHubEvent) []HeatmapDay {
	counts := make(map[string]int)
	for _, e := range events {
		if e.Type == "PushEvent" {
			day := e.CreatedAt.Format("2006-01-02")
			counts[day] += e.Payload.Size
		}
	}
	// build last 365 days
	var days []HeatmapDay
	now := time.Now()
	for i := 364; i >= 0; i-- {
		d := now.AddDate(0, 0, -i).Format("2006-01-02")
		days = append(days, HeatmapDay{Date: d, Count: counts[d]})
	}
	return days
}

func (s *Server) startRefreshLoop() {
	s.refreshCache()
	ticker := time.NewTicker(30 * time.Minute)
	go func() {
		for range ticker.C {
			s.refreshCache()
		}
	}()
}

// ---------- API Helpers ----------

func (s *Server) getCache() *CacheData {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.cache
}

func eventsToActivities(events []GitHubEvent, actor, avatar string) []ActivityItem {
	// deduplicate: for PushEvents, keep only the latest per (repo+ref)
	// and limit total per repo to 5 items
	seen := make(map[string]bool)
	repoCount := make(map[string]int)
	var filtered []GitHubEvent
	for i := len(events) - 1; i >= 0; i-- {
		e := events[i]
		if e.Type == "PushEvent" {
			ref := e.Payload.Ref
			if ref == "" {
				ref = "main"
			}
			key := e.Repo.Name + "#" + ref
			if seen[key] {
				continue
			}
			seen[key] = true
		}
		// limit to 5 per repo
		if repoCount[e.Repo.Name] >= 5 {
			continue
		}
		repoCount[e.Repo.Name]++
		filtered = append(filtered, e)
	}

	var items []ActivityItem
	for _, e := range filtered {
		repoURL := "https://github.com/" + e.Repo.Name
		switch e.Type {
		case "PushEvent":
			msg := ""
			if len(e.Payload.Commits) > 0 {
				msg = e.Payload.Commits[0].Message
				if len(e.Payload.Commits) > 1 {
					msg = fmt.Sprintf("%s and %d more", msg, len(e.Payload.Commits)-1)
				}
			}
			items = append(items, ActivityItem{
				ID:        e.ID,
				Type:      e.Type,
				Actor:     actor,
				AvatarURL: avatar,
				Repo:      e.Repo.Name,
				RepoURL:   repoURL,
				Commits:   e.Payload.Commits,
				Message:   msg,
				Action:    "pushed to",
				CreatedAt: e.CreatedAt,
			})
		case "CreateEvent":
			items = append(items, ActivityItem{
				ID:        e.ID,
				Type:      e.Type,
				Actor:     actor,
				AvatarURL: avatar,
				Repo:      e.Repo.Name,
				RepoURL:   repoURL,
				Action:    "created " + e.Payload.RefType,
				Target:    e.Payload.Ref,
				TargetURL: repoURL + "/tree/" + e.Payload.Ref,
				CreatedAt: e.CreatedAt,
			})
		case "PullRequestEvent":
			pr := e.Payload.PullRequest
			action := e.Payload.Action
			if pr != nil && pr.Merged {
				action = "merged"
			}
			target := ""
			targetURL := ""
			if pr != nil {
				target = fmt.Sprintf("#%d %s", pr.Number, pr.Title)
				targetURL = pr.URL
			}
			items = append(items, ActivityItem{
				ID:        e.ID,
				Type:      e.Type,
				Actor:     actor,
				AvatarURL: avatar,
				Repo:      e.Repo.Name,
				RepoURL:   repoURL,
				Action:    action + " pull request",
				Target:    target,
				TargetURL: targetURL,
				CreatedAt: e.CreatedAt,
			})
		case "IssuesEvent":
			issue := e.Payload.Issue
			target := ""
			targetURL := ""
			if issue != nil {
				target = fmt.Sprintf("#%d %s", issue.Number, issue.Title)
				targetURL = issue.URL
			}
			items = append(items, ActivityItem{
				ID:        e.ID,
				Type:      e.Type,
				Actor:     actor,
				AvatarURL: avatar,
				Repo:      e.Repo.Name,
				RepoURL:   repoURL,
				Action:    e.Payload.Action + " issue",
				Target:    target,
				TargetURL: targetURL,
				CreatedAt: e.CreatedAt,
			})
		case "WatchEvent":
			items = append(items, ActivityItem{
				ID:        e.ID,
				Type:      e.Type,
				Actor:     actor,
				AvatarURL: avatar,
				Repo:      e.Repo.Name,
				RepoURL:   repoURL,
				Action:    "starred",
				CreatedAt: e.CreatedAt,
			})
		case "ForkEvent":
			target := ""
			targetURL := ""
			if e.Payload.Forkee != nil {
				target = e.Payload.Forkee.FullName
				targetURL = e.Payload.Forkee.HtmlURL
			}
			items = append(items, ActivityItem{
				ID:        e.ID,
				Type:      e.Type,
				Actor:     actor,
				AvatarURL: avatar,
				Repo:      e.Repo.Name,
				RepoURL:   repoURL,
				Action:    "forked",
				Target:    target,
				TargetURL: targetURL,
				CreatedAt: e.CreatedAt,
			})
		case "ReleaseEvent":
			items = append(items, ActivityItem{
				ID:        e.ID,
				Type:      e.Type,
				Actor:     actor,
				AvatarURL: avatar,
				Repo:      e.Repo.Name,
				RepoURL:   repoURL,
				Action:    "released",
				Target:    e.Payload.Ref,
				TargetURL: repoURL + "/releases",
				Message:   e.Payload.Description,
				CreatedAt: e.CreatedAt,
			})
		}
	}
	return items
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// ---------- HTTP Handlers ----------

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	c := s.getCache()
	if c.User == nil {
		writeJSON(w, 503, map[string]string{"error": "cache not ready"})
		return
	}
	loc := s.config.Location
	if loc == "" {
		loc = c.User.Location
	}
	writeJSON(w, 200, MeResponse{
		User: c.User,
		Stats: UserStats{
			TotalStars:   c.TotalStars,
			TotalCommits: c.TotalCommits,
			TotalRepos:   c.TotalRepos,
		},
		Gender:      s.config.Gender,
		Location:    loc,
		Following:   c.User.Following,
		LastUpdated: c.LastUpdated,
	})
}

func (s *Server) handleRepos(w http.ResponseWriter, r *http.Request) {
	c := s.getCache()
	writeJSON(w, 200, c.Repos)
}

func (s *Server) handleActivity(w http.ResponseWriter, r *http.Request) {
	c := s.getCache()
	username := r.URL.Query().Get("username")
	if username == "" {
		username = s.getUsername()
	}

	var events []GitHubEvent
	var actor, avatar string

	if username == s.getUsername() {
		events = c.Events
		if c.User != nil {
			actor = c.User.Login
			avatar = c.User.AvatarURL
		}
	} else if fc, ok := c.Following[username]; ok && fc != nil {
		events = fc.Events
		if fc.User != nil {
			actor = fc.User.Login
			avatar = fc.User.AvatarURL
		}
	}

	limit := 20
	if l := r.URL.Query().Get("limit"); l != "" {
		fmt.Sscanf(l, "%d", &limit)
	}
	items := eventsToActivities(events, actor, avatar)
	if len(items) > limit {
		items = items[:limit]
	}
	writeJSON(w, 200, items)
}

func (s *Server) handleFollowing(w http.ResponseWriter, r *http.Request) {
	c := s.getCache()
	var result []FollowingItem
	for _, name := range c.FollowingNames {
		fc, ok := c.Following[name]
		if !ok || fc == nil || fc.User == nil {
			continue
		}
		var lastActive *time.Time
		if len(fc.Events) > 0 {
			t := fc.Events[0].CreatedAt
			lastActive = &t
		}
		recentEvents := eventsToActivities(fc.Events, fc.User.Login, fc.User.AvatarURL)
		if len(recentEvents) > 5 {
			recentEvents = recentEvents[:5]
		}
		result = append(result, FollowingItem{
			Username:     fc.User.Login,
			AvatarURL:    fc.User.AvatarURL,
			Bio:          fc.User.Bio,
			LastActive:   lastActive,
			RecentRepos:  fc.Repos,
			RecentEvents: recentEvents,
		})
	}
	writeJSON(w, 200, result)
}

func activityToFeedItem(it ActivityItem) FeedItem {
	return FeedItem{
		ID:        it.ID,
		Type:      it.Type,
		Actor:     it.Actor,
		AvatarURL: it.AvatarURL,
		Action:    it.Action,
		Repo:      it.Repo,
		RepoURL:   it.RepoURL,
		Commits:   it.Commits,
		Message:   it.Message,
		Target:    it.Target,
		TargetURL: it.TargetURL,
		CreatedAt: it.CreatedAt,
	}
}

func (s *Server) handleFeed(w http.ResponseWriter, r *http.Request) {
	c := s.getCache()
	var all []FeedItem

	// add self
	selfActor, selfAvatar := "", ""
	if c.User != nil {
		selfActor, selfAvatar = c.User.Login, c.User.AvatarURL
	}
	selfItems := eventsToActivities(c.Events, selfActor, selfAvatar)
	for _, it := range selfItems {
		all = append(all, activityToFeedItem(it))
	}

	// add following
	for _, fc := range c.Following {
		if fc == nil || fc.User == nil {
			continue
		}
		items := eventsToActivities(fc.Events, fc.User.Login, fc.User.AvatarURL)
		for _, it := range items {
			all = append(all, activityToFeedItem(it))
		}
	}

	// sort by time desc
	sort.Slice(all, func(i, j int) bool {
		return all[i].CreatedAt.After(all[j].CreatedAt)
	})

	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		fmt.Sscanf(l, "%d", &limit)
	}
	if len(all) > limit {
		all = all[:limit]
	}
	writeJSON(w, 200, all)
}

func (s *Server) handleHeatmap(w http.ResponseWriter, r *http.Request) {
	c := s.getCache()
	writeJSON(w, 200, c.Heatmap)
}

func (s *Server) handleStats(w http.ResponseWriter, r *http.Request) {
	c := s.getCache()
	writeJSON(w, 200, UserStats{
		TotalStars:   c.TotalStars,
		TotalCommits: c.TotalCommits,
		TotalRepos:   c.TotalRepos,
	})
}

func (s *Server) handleStarHistory(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, s.getStarHistory())
}

func (s *Server) handleRSS(w http.ResponseWriter, r *http.Request) {
	c := s.getCache()
	settings := s.getSettings()
	title := settings.Title
	if title == "" {
		title = "GitShow"
	}

	var items []FeedItem
	selfActor, selfAvatar := "", ""
	if c.User != nil {
		selfActor, selfAvatar = c.User.Login, c.User.AvatarURL
	}
	selfActivities := eventsToActivities(c.Events, selfActor, selfAvatar)
	for _, it := range selfActivities {
		items = append(items, activityToFeedItem(it))
	}
	for _, fc := range c.Following {
		if fc == nil || fc.User == nil {
			continue
		}
		acts := eventsToActivities(fc.Events, fc.User.Login, fc.User.AvatarURL)
		for _, it := range acts {
			items = append(items, activityToFeedItem(it))
		}
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].CreatedAt.After(items[j].CreatedAt)
	})
	if len(items) > 50 {
		items = items[:50]
	}

	w.Header().Set("Content-Type", "application/rss+xml; charset=utf-8")
	fmt.Fprintf(w, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
	fmt.Fprintf(w, "<rss version=\"2.0\">\n")
	fmt.Fprintf(w, "  <channel>\n")
	fmt.Fprintf(w, "    <title>%s Activity Feed</title>\n", escapeXML(title))
	fmt.Fprintf(w, "    <link>%s</link>\n", escapeXML(s.getGitHubURL()))
	fmt.Fprintf(w, "    <description>GitHub activity feed for %s and following</description>\n", escapeXML(s.getUsername()))
	fmt.Fprintf(w, "    <lastBuildDate>%s</lastBuildDate>\n", time.Now().Format(time.RFC1123))
	for _, it := range items {
		t := fmt.Sprintf("%s %s %s", it.Actor, it.Action, it.Repo)
		if it.Target != "" {
			t = fmt.Sprintf("%s %s %s - %s", it.Actor, it.Action, it.Repo, it.Target)
		}
		link := it.RepoURL
		if it.TargetURL != "" {
			link = it.TargetURL
		}
		desc := it.Message
		if desc == "" && len(it.Commits) > 0 {
			desc = it.Commits[0].Message
		}
		fmt.Fprintf(w, "    <item>\n")
		fmt.Fprintf(w, "      <title>%s</title>\n", escapeXML(t))
		fmt.Fprintf(w, "      <link>%s</link>\n", escapeXML(link))
		fmt.Fprintf(w, "      <pubDate>%s</pubDate>\n", it.CreatedAt.Format(time.RFC1123))
		if desc != "" {
			fmt.Fprintf(w, "      <description>%s</description>\n", escapeXML(desc))
		}
		fmt.Fprintf(w, "    </item>\n")
	}
	fmt.Fprintf(w, "  </channel>\n")
	fmt.Fprintf(w, "</rss>\n")
}

func escapeXML(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	return s
}

func (s *Server) handleSettingsGet(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, s.getSettings())
}

func (s *Server) handleSettingsPost(w http.ResponseWriter, r *http.Request) {
	var st Settings
	if err := json.NewDecoder(r.Body).Decode(&st); err != nil {
		writeJSON(w, 400, map[string]string{"error": "invalid json"})
		return
	}
	if st.Title == "" {
		st.Title = "GitShow"
	}
	if st.HomepageRepoCount == 0 {
		st.HomepageRepoCount = 6
	}
	if err := s.saveSettings(st); err != nil {
		writeJSON(w, 500, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, 200, st)
}

// ---------- Main ----------

func main() {
	data, err := os.ReadFile("config.json")
	if err != nil {
		log.Fatalf("read config: %v", err)
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		log.Fatalf("parse config: %v", err)
	}
	// Allow overriding token via environment variable for security
	if envToken := os.Getenv("GITHUB_TOKEN"); envToken != "" {
		cfg.Token = envToken
	}
	if cfg.Username == "" || cfg.Token == "" || cfg.Token == "ghp_your_token_here" {
		log.Fatal("please set valid username and token in config.json or GITHUB_TOKEN env")
	}

	srv := NewServer(cfg)
	srv.loadSettings()
	srv.startRefreshLoop()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/me", srv.handleMe)
	mux.HandleFunc("/api/repos", srv.handleRepos)
	mux.HandleFunc("/api/activity", srv.handleActivity)
	mux.HandleFunc("/api/following", srv.handleFollowing)
	mux.HandleFunc("/api/feed", srv.handleFeed)
	mux.HandleFunc("/api/heatmap", srv.handleHeatmap)
	mux.HandleFunc("/api/stats", srv.handleStats)
	mux.HandleFunc("/api/stars-history", srv.handleStarHistory)
	mux.HandleFunc("/api/settings", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			srv.handleSettingsGet(w, r)
		} else if r.Method == "POST" {
			srv.handleSettingsPost(w, r)
		} else {
			writeJSON(w, 405, map[string]string{"error": "method not allowed"})
		}
	})
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, map[string]interface{}{"ok": true, "last_updated": srv.getCache().LastUpdated})
	})
	mux.HandleFunc("/api/refresh", func(w http.ResponseWriter, r *http.Request) {
		go srv.refreshCache()
		writeJSON(w, 200, map[string]string{"status": "refreshing"})
	})
	mux.HandleFunc("/rss", srv.handleRSS)

	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	}).Handler(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	log.Printf("server listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
