import { SITE_MOVIES } from './search-data.js';

const params = new URLSearchParams(window.location.search);
const keyword = (params.get('q') || '').trim();
const input = document.querySelector('.big-search input[name="q"]');
const title = document.querySelector('[data-search-title]');
const summary = document.querySelector('[data-search-summary]');
const results = document.querySelector('[data-search-results]');

if (input) {
    input.value = keyword;
}

const normalize = (value) => String(value || '').toLowerCase();

const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const createCard = (movie) => {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
<article class="movie-card">
    <a class="movie-cover" href="${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
        <img src="${escapeHtml(movie.image)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="movie-badge">${escapeHtml(movie.category)}</span>
        <span class="movie-play">▶</span>
    </a>
    <div class="movie-info">
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="movie-tags">${tags}</div>
        <div class="movie-meta">
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.type)}</span>
            <span>${escapeHtml(movie.score)} 分</span>
        </div>
    </div>
</article>`;
};

const searchMovies = (term) => {
    if (!term) {
        return [];
    }
    const value = normalize(term);
    return SITE_MOVIES.filter((movie) => {
        const text = [
            movie.title,
            movie.category,
            movie.year,
            movie.type,
            movie.region,
            movie.genre,
            movie.oneLine,
            movie.summary,
            ...(movie.tags || [])
        ].map(normalize).join(' ');
        return text.includes(value);
    });
};

if (results && title && summary) {
    const matches = searchMovies(keyword);
    if (!keyword) {
        title.textContent = '搜索结果';
        summary.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
    } else {
        title.textContent = `“${keyword}” 的搜索结果`;
        summary.textContent = `找到 ${matches.length} 部相关影片。`;
        results.innerHTML = matches.slice(0, 200).map(createCard).join('');
    }
}
