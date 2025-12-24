let currentFilter = 'all';
let axeResult = null;

function updateStats(result) {
    document.getElementById('violations-count').textContent = result.violations.length;
    document.getElementById('passes-count').textContent = result.passes.length;
    document.getElementById('incomplete-count').textContent = result.incomplete.length;
    document.getElementById('inapplicable-count').textContent = result.inapplicable.length;
}

function getSeverityClass(impact) {
    const severityMap = {
        'critical': 'severity-critical',
        'serious': 'severity-serious',
        'moderate': 'severity-moderate',
        'minor': 'severity-minor'
    };
    return severityMap[impact] || 'severity-minor';
}

function renderIssues(result, filter = 'all') {
    const container = document.getElementById('issues-container');

    let violations = result.violations;
    if (filter !== 'all') {
        violations = violations.filter(v => v.impact === filter);
    }

    if (violations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <div class="empty-title">No Issues Found</div>
                <div class="empty-description">${filter === 'all' ? 'Great job! No accessibility violations detected.' : `No ${filter} severity issues found.`}</div>
            </div>
        `;
        return;
    }

    container.innerHTML = violations.map((violation, index) => `
        <div class="issue-card" data-index="${index}">
            <div class="issue-header" onclick="toggleIssue(${index})">
                <div class="issue-title-section">
                    <div class="issue-title">
                        <span class="severity-badge ${getSeverityClass(violation.impact)}">${violation.impact}</span>
                        <span>${violation.help}</span>
                    </div>
                    <div class="issue-description">${violation.description}</div>
                    <div class="issue-meta">
                        <div class="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                            <span>ID: ${violation.id}</span>
                        </div>
                        <div class="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>${violation.nodes.length} instance${violation.nodes.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
                <div class="expand-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
            <div class="issue-details">
                <div class="details-section">
                    <div class="detail-group">
                        <div class="detail-title">Learn More</div>
                        <div class="detail-content">
                            <a href="${violation.helpUrl}" target="_blank" style="color: var(--primary-color);">${violation.helpUrl}</a>
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-title">Affected Elements</div>
                        <ul class="node-list">
                            ${violation.nodes.map(node => `
                                <li class="node-item">
                                    <div class="node-target">${Array.isArray(node.target) ? node.target.join(', ') : node.target}</div>
                                    <div class="node-html">${escapeHtml(node.html)}</div>
                                    ${node.failureSummary ? `<div class="detail-content" style="margin-top: 8px;">${escapeHtml(node.failureSummary)}</div>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleIssue(index) {
    const card = document.querySelector(`.issue-card[data-index="${index}"]`);
    card.classList.toggle('expanded');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        if (axeResult) {
            renderIssues(axeResult, currentFilter);
        }
    });
});

// Listen for Electron messages
let flag = false;
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const storedResult = localStorage.getItem('UIExpertanalyze');
        
        if (!storedResult) {
            showError('No accessibility analysis data found. Please run the analysis first.');
            return;
        }
        
        // Parse the JSON string back into an object
        const result = JSON.parse(storedResult);
        
        // Clean up localStorage after reading
        localStorage.removeItem('UIExpertanalyze');
        
        analyze(result);
    } catch (error) {
        console.error('Failed to load analysis results:', error);
        showError('Failed to load analysis results. The data may be corrupted.');
    }
})

async function analyze(result) {
    try {
        axeResult = result;
        updateStats(result);
        renderIssues(result, currentFilter);
        console.log(result);
    } catch (error) {
        console.error('Axe scan error:', error);
        showError('An error occurred while displaying the analysis results.');
    } finally {
        flag = false;
    }
}

// Helper function to show error messages
function showError(message) {
    const container = document.getElementById('issues-container');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <div class="empty-title">Error</div>
                <div class="empty-description">${message}</div>
            </div>
        `;
    }
}