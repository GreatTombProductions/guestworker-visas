/**
 * H-2A Guestworker Visa Tracker — Client-side search
 * Letter-sharded employer search + state browse + MD5-keyed detail
 */

(function() {
    'use strict';

    const DATA_BASE = 'data';
    const cache = {};
    let summary = null;
    let stateIndex = null;
    let searchTimeout = null;

    // State names
    const STATE_NAMES = {
        'AL':'Alabama','AK':'Alaska','AZ':'Arizona','AR':'Arkansas','CA':'California',
        'CO':'Colorado','CT':'Connecticut','DE':'Delaware','DC':'D.C.','FL':'Florida',
        'GA':'Georgia','HI':'Hawaii','ID':'Idaho','IL':'Illinois','IN':'Indiana',
        'IA':'Iowa','KS':'Kansas','KY':'Kentucky','LA':'Louisiana','ME':'Maine',
        'MD':'Maryland','MA':'Massachusetts','MI':'Michigan','MN':'Minnesota',
        'MS':'Mississippi','MO':'Missouri','MT':'Montana','NE':'Nebraska','NV':'Nevada',
        'NH':'New Hampshire','NJ':'New Jersey','NM':'New Mexico','NY':'New York',
        'NC':'North Carolina','ND':'North Dakota','OH':'Ohio','OK':'Oklahoma',
        'OR':'Oregon','PA':'Pennsylvania','PR':'Puerto Rico','RI':'Rhode Island',
        'SC':'South Carolina','SD':'South Dakota','TN':'Tennessee','TX':'Texas',
        'UT':'Utah','VT':'Vermont','VA':'Virginia','VI':'Virgin Islands',
        'WA':'Washington','WV':'West Virginia','WI':'Wisconsin','WY':'Wyoming',
        'GU':'Guam','AS':'American Samoa','MP':'Northern Mariana Islands'
    };

    // --- Utility ---

    function fmt(n) {
        if (n == null) return '—';
        return Number(n).toLocaleString();
    }

    function fmtDollar(n) {
        if (n == null) return '—';
        return '$' + Number(n).toFixed(2);
    }

    function md5shard(str) {
        // Simple hash to 2-char hex — matches Python's hashlib.md5
        // We need actual MD5. Use a minimal implementation.
        return md5(str).substring(0, 2);
    }

    // Minimal MD5 implementation
    function md5(string) {
        function md5cycle(x, k) {
            var a = x[0], b = x[1], c = x[2], d = x[3];
            a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586);
            c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
            a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426);
            c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
            a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417);
            c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
            a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101);
            c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
            a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632);
            c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
            a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083);
            c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
            a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690);
            c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
            a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784);
            c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
            a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463);
            c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
            a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353);
            c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
            a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222);
            c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
            a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835);
            c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
            a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415);
            c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
            a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606);
            c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
            a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744);
            c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
            a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379);
            c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
            x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
        }
        function cmn(q, a, b, x, s, t) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b); }
        function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
        function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
        function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
        function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
        function md5blk(s) {
            var md5blks = [], i;
            for (i = 0; i < 64; i += 4) {
                md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
            }
            return md5blks;
        }
        function md5blk_array(a) {
            var md5blks = [], i;
            for (i = 0; i < 64; i += 4) {
                md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
            }
            return md5blks;
        }
        function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
        function hex(x) {
            var res = '';
            for (var i = 0; i < 4; i++) {
                res += ('0' + ((x >> (i * 8)) & 0xFF).toString(16)).slice(-2);
            }
            return res;
        }

        var n = string.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
        var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 64; i <= n; i += 64) {
            md5cycle(state, md5blk(string.substring(i - 64, i)));
        }
        string = string.substring(i - 64);
        var arr = [];
        for (i = 0; i < string.length; i++) arr.push(string.charCodeAt(i));
        arr.push(0x80);
        while (arr.length < (arr.length <= 56 ? 56 : 120)) arr.push(0);
        // Pad to 64 bytes
        while (arr.length % 64 !== 56) arr.push(0);
        // Length in bits
        var lo = n * 8;
        arr.push(lo & 0xff, (lo >> 8) & 0xff, (lo >> 16) & 0xff, (lo >> 24) & 0xff);
        arr.push(0, 0, 0, 0);
        for (i = 0; i < arr.length; i += 64) {
            md5cycle(state, md5blk_array(arr.slice(i, i + 64)));
        }
        return hex(state[0]) + hex(state[1]) + hex(state[2]) + hex(state[3]);
    }

    // --- Data Loading ---

    async function fetchJSON(path) {
        if (cache[path]) return cache[path];
        try {
            const resp = await fetch(`${DATA_BASE}/${path}`);
            if (!resp.ok) return null;
            const data = await resp.json();
            cache[path] = data;
            return data;
        } catch (e) {
            return null;
        }
    }

    async function loadSummary() {
        summary = await fetchJSON('summary.json');
        if (!summary) return;
        document.getElementById('stat-workers').textContent = fmt(summary.total_certified_workers);
        document.getElementById('stat-employers').textContent = fmt(summary.unique_employers);
        document.getElementById('stat-apps').textContent = fmt(summary.total_applications);
        document.getElementById('stat-wage').textContent = fmtDollar(summary.wage_stats.median);
    }

    async function loadStateIndex() {
        stateIndex = await fetchJSON('states.json');
        if (!stateIndex) return;
        renderStateGrid();
    }

    // --- Employer Search ---

    async function searchEmployer(query) {
        if (query.length < 2) {
            document.getElementById('results').innerHTML = '';
            return;
        }

        const firstChar = query[0].toLowerCase();
        const shard = firstChar.match(/[a-z]/) ? firstChar : '_';
        const data = await fetchJSON(`e/index_${shard}.json`);

        if (!data) {
            document.getElementById('results').innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        const q = query.toLowerCase();
        const matches = data.filter(e => e.n.toLowerCase().includes(q));
        matches.sort((a, b) => b.w - a.w);
        const top = matches.slice(0, 50);

        if (top.length === 0) {
            document.getElementById('results').innerHTML = '<div class="no-results">No employers matching "' + escHtml(query) + '"</div>';
            return;
        }

        let html = `<div class="results-header">${fmt(matches.length)} employer${matches.length !== 1 ? 's' : ''} found</div>`;
        for (const emp of top) {
            html += `<div class="result-card" onclick="loadEmployerDetail('${escAttr(emp.k)}')">
                <div class="result-header">
                    <span class="result-name">${escHtml(emp.n)}</span>
                </div>
                <div class="result-meta">
                    <span>${fmt(emp.w)} workers certified</span>
                    <span>${emp.a} application${emp.a !== 1 ? 's' : ''}</span>
                    ${emp.wg ? `<span>${fmtDollar(emp.wg)}/hr avg</span>` : ''}
                    ${emp.st && emp.st.length ? `<span>${emp.st.join(', ')}</span>` : ''}
                </div>
            </div>`;
        }
        if (matches.length > 50) {
            html += `<div class="search-hint" style="text-align:center;margin-top:12px">Showing 50 of ${fmt(matches.length)} results. Refine your search.</div>`;
        }
        document.getElementById('results').innerHTML = html;
    }

    // --- Employer Detail ---

    window.loadEmployerDetail = async function(key) {
        const shard = md5shard(key);
        const data = await fetchJSON(`d/${shard}.json`);
        if (!data || !data[key]) {
            document.getElementById('results').innerHTML = '<div class="no-results">Employer details not found</div>';
            return;
        }

        const emp = data[key];
        document.getElementById('results').classList.add('hidden');
        document.getElementById('state-detail-view').classList.add('hidden');

        const wageStats = emp.wage_range;
        const medianWage = summary ? summary.wage_stats.median : 15.67;
        const wageColor = wageStats.avg && wageStats.avg >= medianWage ? 'var(--green)' : 'var(--orange)';

        // Build applications table
        let appRows = '';
        for (const app of emp.applications) {
            const statusBadge = getStatusBadge(app.status);
            const complianceHtml = renderCompliance(app.compliance);

            appRows += `<tr>
                <td>${escHtml(app.case || '')}</td>
                <td>${statusBadge}</td>
                <td>${escHtml(app.job || app.soc || '')}</td>
                <td>${app.workers_certified || 0}</td>
                <td>${app.wage ? fmtDollar(app.wage) : '—'}${app.per ? '/' + app.per : ''}</td>
                <td>${escHtml(app.city || '')}${app.state ? ', ' + app.state : ''}</td>
                <td>${app.begin || '—'}</td>
                <td>${complianceHtml}</td>
            </tr>`;
        }

        // Worksite states
        const stateList = Object.entries(emp.states)
            .sort((a, b) => b[1] - a[1])
            .map(([st, ct]) => `<span class="tag">${st} (${ct})</span>`).join('');

        // Job types
        const jobList = Object.entries(emp.job_types)
            .sort((a, b) => b[1] - a[1])
            .map(([j, ct]) => `<span class="tag">${escHtml(j)} (${ct})</span>`).join('');

        const html = `
            <button class="back-btn" onclick="backToResults()">← Back to results</button>
            <div class="detail-panel">
                <h2>${escHtml(emp.name)}</h2>
                <div class="detail-section">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="label">Applications</div>
                            <div class="value">${emp.total_applications}</div>
                        </div>
                        <div class="detail-item">
                            <div class="label">Workers Certified</div>
                            <div class="value">${fmt(emp.total_workers_certified)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="label">Workers Needed</div>
                            <div class="value">${fmt(emp.total_workers_needed)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="label">Wage Range (Hourly)</div>
                            <div class="value" style="color:${wageColor}">${wageStats.min != null ? fmtDollar(wageStats.min) + ' – ' + fmtDollar(wageStats.max) : '—'}</div>
                            ${wageStats.avg != null ? `<div class="wage-bar-container">
                                <div class="wage-bar"><div class="wage-bar-fill" style="width:${Math.min(100, (wageStats.avg / 30) * 100)}%;background:${wageColor}"></div></div>
                                <div class="wage-bar-label"><span>$0</span><span>avg ${fmtDollar(wageStats.avg)}</span><span>$30</span></div>
                            </div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Worksite States</h3>
                    <div>${stateList}</div>
                </div>

                <div class="detail-section">
                    <h3>Job Types</h3>
                    <div>${jobList}</div>
                </div>

                <div class="detail-section">
                    <h3>Applications (${emp.total_applications})</h3>
                    <div style="overflow-x:auto">
                        <table class="app-table">
                            <thead><tr>
                                <th>Case</th><th>Status</th><th>Job</th><th>Workers</th><th>Wage</th><th>Location</th><th>Start</th><th>Housing</th>
                            </tr></thead>
                            <tbody>${appRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;

        const detailView = document.getElementById('detail-view');
        detailView.innerHTML = html;
        detailView.classList.remove('hidden');
        detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- State Browse ---

    function renderStateGrid() {
        if (!stateIndex) return;
        const grid = document.getElementById('state-grid');
        const sorted = Object.entries(stateIndex)
            .sort((a, b) => b[1].certified_workers - a[1].certified_workers);

        let html = '';
        for (const [code, info] of sorted) {
            const name = STATE_NAMES[code] || code;
            html += `<button class="state-btn" onclick="loadStateDetail('${code}')">
                <div class="state-name">${code} — ${name}</div>
                <div class="state-info">${fmt(info.certified_workers)} workers · ${info.employers} employers</div>
            </button>`;
        }
        grid.innerHTML = html;
    }

    window.loadStateDetail = async function(code) {
        const data = await fetchJSON(`s/${code.toLowerCase()}.json`);
        if (!data) return;

        const info = stateIndex[code] || {};
        const name = STATE_NAMES[code] || code;

        document.getElementById('state-mode').classList.add('hidden');
        document.getElementById('results').classList.add('hidden');
        document.getElementById('detail-view').classList.add('hidden');

        // Filter and sort by workers
        const certified = data.filter(e => e.status && e.status.includes('Certification'));
        const wages = certified.map(e => e.wage).filter(w => w && w > 0);
        const avgWage = wages.length ? (wages.reduce((a, b) => a + b, 0) / wages.length) : null;

        let html = `
            <button class="back-btn" onclick="backToStates()">← Back to states</button>
            <div class="detail-panel">
                <div class="state-header">
                    <h2>${name} (${code})</h2>
                </div>
                <div class="detail-grid" style="margin-bottom:20px">
                    <div class="detail-item">
                        <div class="label">Applications</div>
                        <div class="value">${fmt(info.applications)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Workers Certified</div>
                        <div class="value">${fmt(info.certified_workers)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Employers</div>
                        <div class="value">${fmt(info.employers)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Avg Hourly Wage</div>
                        <div class="value">${avgWage ? fmtDollar(avgWage) : '—'}</div>
                    </div>
                </div>

                <div class="state-filter">
                    <input type="text" id="state-filter-input" placeholder="Filter by employer or job title..." oninput="filterStateResults()">
                </div>

                <div id="state-results">
                    ${renderStateTable(data)}
                </div>
            </div>`;

        const view = document.getElementById('state-detail-view');
        view.innerHTML = html;
        view.classList.remove('hidden');
        view._data = data;
        view.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    function renderStateTable(data, limit) {
        const show = limit ? data.slice(0, limit) : data.slice(0, 100);
        let html = `<div style="overflow-x:auto"><table class="app-table">
            <thead><tr>
                <th>Employer</th><th>Status</th><th>Job</th><th>Workers</th><th>Wage</th>
                <th>City</th><th>Period</th><th>Housing</th>
            </tr></thead><tbody>`;

        for (const e of show) {
            const statusBadge = getStatusBadge(e.status);
            const compHtml = e.compliance ? e.compliance.map(c =>
                `<span class="compliance-flag ${c === 'None reported' ? 'compliance-none' : 'compliance-yes'}">${c}</span>`
            ).join('') : '<span class="compliance-flag compliance-none">None</span>';

            html += `<tr onclick="searchAndShowEmployer('${escAttr(e.employer)}')" style="cursor:pointer">
                <td><strong>${escHtml(e.employer || '')}</strong></td>
                <td>${statusBadge}</td>
                <td>${escHtml(e.job || e.soc || '')}</td>
                <td>${e.workers_certified || 0}</td>
                <td>${e.wage ? fmtDollar(e.wage) : '—'}${e.per ? '/' + e.per : ''}</td>
                <td>${escHtml(e.city || '')}${e.county ? '<br><small>' + escHtml(e.county) + '</small>' : ''}</td>
                <td>${e.begin || '—'}<br><small>to ${e.end || '—'}</small></td>
                <td>${compHtml}</td>
            </tr>`;
        }
        html += '</tbody></table></div>';
        if (data.length > show.length) {
            html += `<div class="search-hint" style="text-align:center;margin-top:12px">Showing ${show.length} of ${fmt(data.length)} applications. Use filter to narrow.</div>`;
        }
        return html;
    }

    window.filterStateResults = function() {
        const view = document.getElementById('state-detail-view');
        const data = view._data;
        if (!data) return;
        const q = document.getElementById('state-filter-input').value.toLowerCase();
        if (!q) {
            document.getElementById('state-results').innerHTML = renderStateTable(data);
            return;
        }
        const filtered = data.filter(e =>
            (e.employer || '').toLowerCase().includes(q) ||
            (e.job || '').toLowerCase().includes(q) ||
            (e.soc || '').toLowerCase().includes(q) ||
            (e.city || '').toLowerCase().includes(q) ||
            (e.county || '').toLowerCase().includes(q)
        );
        document.getElementById('state-results').innerHTML = renderStateTable(filtered);
    };

    window.searchAndShowEmployer = function(name) {
        // Switch to employer mode and search
        switchMode('employer');
        document.getElementById('employer-search').value = name;
        searchEmployer(name);
    };

    // --- Navigation ---

    window.backToResults = function() {
        document.getElementById('detail-view').classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.backToStates = function() {
        document.getElementById('state-detail-view').classList.add('hidden');
        document.getElementById('state-mode').classList.remove('hidden');
        document.getElementById('state-mode').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- Helpers ---

    function getStatusBadge(status) {
        if (!status) return '';
        if (status.includes('Denied')) return `<span class="result-badge badge-denied">Denied</span>`;
        if (status.includes('Withdrawn')) return `<span class="result-badge badge-withdrawn">Withdrawn</span>`;
        if (status.includes('Partial')) return `<span class="result-badge badge-partial">Partial</span>`;
        if (status.includes('Certification')) return `<span class="result-badge badge-certified">Certified</span>`;
        return `<span class="result-badge">${escHtml(status)}</span>`;
    }

    function renderCompliance(flags) {
        if (!flags || !flags.length) return '<span class="compliance-flag compliance-none">None</span>';
        return flags.map(f => {
            if (f === 'None reported') return `<span class="compliance-flag compliance-none">None reported</span>`;
            return `<span class="compliance-flag compliance-yes">${f}</span>`;
        }).join('');
    }

    function escHtml(s) {
        if (!s) return '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escAttr(s) {
        if (!s) return '';
        return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    // --- Mode Switching ---

    function switchMode(mode) {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
        document.getElementById('employer-mode').classList.toggle('hidden', mode !== 'employer');
        document.getElementById('state-mode').classList.toggle('hidden', mode !== 'state');
        document.getElementById('results').innerHTML = '';
        document.getElementById('results').classList.remove('hidden');
        document.getElementById('detail-view').classList.add('hidden');
        document.getElementById('state-detail-view').classList.add('hidden');
    }

    // --- Init ---

    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    document.getElementById('employer-search').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const q = this.value.trim();
        searchTimeout = setTimeout(() => searchEmployer(q), 200);
    });

    loadSummary();
    loadStateIndex();

})();
