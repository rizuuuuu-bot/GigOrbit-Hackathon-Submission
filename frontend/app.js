document.addEventListener('DOMContentLoaded', () => {
    // ── DOM ELEMENTS ─────────────────────────────────────────────────────────
    const appContainer = document.getElementById('app-container');
    const chatView = document.getElementById('chat-view');
    const customerDashboardView = document.getElementById('customer-dashboard-view');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    const partnerDashboardView = document.getElementById('partner-dashboard-view');
        const trackingView = document.getElementById('tracking-view');
    const historyView = document.getElementById('history-view'); // ADDED

    const chatHistory = document.getElementById('chat-history');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const micBtn = document.getElementById('mic-btn');
    const suggestionsDiv = document.getElementById('suggestions');
    const toggleChatBtn = document.getElementById('toggle-chat');
    const toggleDashboardBtn = document.getElementById('toggle-dashboard');
    const brandLogo = document.getElementById('brand-logo');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const gpsIndicator = document.getElementById('gps-indicator');
    const newChatBtn = document.getElementById('new-chat-btn');
    
    // Modals
    const adminAuthModal = document.getElementById('admin-auth-modal');
    const userRegModal = document.getElementById('user-reg-modal');
    const adminPassInput = document.getElementById('admin-pass-input');
    const adminVerifyBtn = document.getElementById('admin-verify-btn');
    const adminCancelBtn = document.getElementById('admin-cancel-btn');
    const adminErrorMsg = document.getElementById('admin-error-msg');
    
    // Registration Form
    const regForm = document.getElementById('reg-form');
    const regName = document.getElementById('reg-name');
    const regPhone = document.getElementById('reg-phone');
    const regAddress = document.getElementById('reg-address');
    
    // Profile & Stats
    const profileName = document.getElementById('profile-name');
    const profilePhone = document.getElementById('profile-phone');
    const profileAddress = document.getElementById('profile-address');
    const statActiveOrders = document.getElementById('stat-active-orders');
    const statActiveDisputes = document.getElementById('stat-active-disputes');
    const statTotalSpent = document.getElementById('stat-total-spent');
    const recentInvoicesContainer = document.getElementById('recent-invoices-container');
    const recentChatsContainer = document.getElementById('recent-chats-container');
    
    // Partner Elements
    const btnBecomePartner = document.getElementById('btn-become-partner');
    const partnerRegModal = document.getElementById('partner-reg-modal');
    const partnerCancelBtn = document.getElementById('partner-cancel-btn');
    const partnerRegForm = document.getElementById('partner-reg-form');
    const partnerLoginForm = document.getElementById('partner-login-form');
    const partnerGpsBtn = document.getElementById('partner-gps-btn');
    const partnerLocationInput = document.getElementById('partner-location');
    const linkPartnerLogin = document.getElementById('link-partner-login');
    const linkPartnerReg = document.getElementById('link-partner-reg');
    const partnerLoginCancelBtn = document.getElementById('partner-login-cancel-btn');
    const partnerLogoutBtn = document.getElementById('partner-logout-btn');
    const switchToCustomerBtn = document.getElementById('switch-to-customer-btn');
    
    const CHAT_STORAGE_KEY = 'agentic_chat_history';
    const USER_STORAGE_KEY = 'agentic_user_session';
    const USERS_DB_KEY = 'agentic_users_db';
    const SESSIONS_STORAGE_KEY = 'agentic_chat_sessions';
    
    let sessionUser = null;
    let workersData = [];
    let currentSessionId = null;
    let partnerLat = null;
    let partnerLng = null;
    
    window.appState = {
        totalBookings: 1420,
        totalSpent: 0,
        activeDisputes: 0
    };
    
    window.userLat = null;
    window.userLng = null;
    window.lockedWorkers = [];
    window.activeJobs = JSON.parse(localStorage.getItem('active_jobs') || '[]');
    window.currentTrackingWorkerId = null;

    window.addEventListener('storage', (e) => {
        // Handle both real cross-tab storage events AND same-tab custom dispatches
        if (e.key === 'active_jobs' || e.key === 'agentic_bookings' || e.key == null || e.type === 'active_jobs_updated') {
            window.activeJobs = JSON.parse(localStorage.getItem('active_jobs') || '[]');
            if (partnerDashboardView && !partnerDashboardView.classList.contains('hidden')) {
                renderPartnerBookings();
            }
            if (window.currentTrackingWorkerId) {
                const job = window.activeJobs.find(j => j.worker_id == window.currentTrackingWorkerId);
                if (job && job.status === 'completed') {
                    const trackingLottie = document.getElementById('tracking-lottie');
                    if (trackingLottie) trackingLottie.load('complete.json');
                    setTimeout(() => {
                        const btnCompleteJob = document.getElementById('btn-complete-job');
                        if (btnCompleteJob) btnCompleteJob.click();
                    }, 2000);
                }
            }
        }
    });
    // Same-tab trigger helper
    window.triggerJobsUpdate = function() {
        window.dispatchEvent(new CustomEvent('active_jobs_updated'));
        window.dispatchEvent(new StorageEvent('storage', { key: 'active_jobs' }));
        window.dispatchEvent(new StorageEvent('storage', { key: 'agentic_bookings' }));
    };

    // ── NAVIGATION / VIEW SWITCHING (HOISTED) ────────────────────────────────
    function switchView(viewName) {
        const views = [chatView, customerDashboardView, adminDashboardView, trackingView, partnerDashboardView, historyView];
        views.forEach(view => {
            if (view) {
                view.classList.remove('opacity-100', 'pointer-events-auto', 'z-10', 'z-[90]', 'z-[100]');
                view.classList.add('opacity-0', 'pointer-events-none', 'z-0', 'hidden');
            }
        });
        
        if (toggleChatBtn) {
            toggleChatBtn.classList.remove('text-gray-900', 'dark:text-white', 'bg-white', 'dark:bg-white/10');
            toggleChatBtn.classList.add('text-gray-500', 'dark:text-gray-400');
        }
        if (toggleDashboardBtn) {
            toggleDashboardBtn.classList.remove('text-gray-900', 'dark:text-white', 'bg-white', 'dark:bg-white/10');
            toggleDashboardBtn.classList.add('text-gray-500', 'dark:text-gray-400');
        }
        
        setTimeout(() => {
            if (viewName === 'chat') {
                if (chatView) {
                    chatView.classList.remove('hidden', 'opacity-0', 'pointer-events-none', 'z-0');
                    chatView.classList.add('opacity-100', 'pointer-events-auto', 'z-10');
                }
                if (toggleChatBtn) {
                    toggleChatBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
                    toggleChatBtn.classList.add('text-gray-900', 'dark:text-white', 'bg-white', 'dark:bg-white/10');
                }
            } else if (viewName === 'customer') {
                if (customerDashboardView) {
                    customerDashboardView.classList.remove('hidden', 'opacity-0', 'pointer-events-none', 'z-0');
                    customerDashboardView.classList.add('opacity-100', 'pointer-events-auto', 'z-10');
                }
                if (toggleDashboardBtn) {
                    toggleDashboardBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
                    toggleDashboardBtn.classList.add('text-gray-900', 'dark:text-white', 'bg-white', 'dark:bg-white/10');
                }
            } else if (viewName === 'admin') {
                if (adminDashboardView) {
                    adminDashboardView.classList.remove('hidden', 'opacity-0', 'pointer-events-none', 'z-0');
                    adminDashboardView.classList.add('opacity-100', 'pointer-events-auto', 'z-10');
                }
            } else if (viewName === 'tracking') {
                if (trackingView) {
                    trackingView.classList.remove('hidden', 'opacity-0', 'pointer-events-none', 'z-0');
                    trackingView.classList.add('opacity-100', 'pointer-events-auto', 'z-[100]');
                }
            } else if (viewName === 'history') {
                if (historyView) {
                    historyView.classList.remove('hidden', 'opacity-0', 'pointer-events-none', 'z-0');
                    historyView.classList.add('opacity-100', 'pointer-events-auto', 'z-[90]');
                }
            } else if (viewName === 'partner') {
                if (partnerDashboardView) {
                    partnerDashboardView.classList.remove('hidden', 'opacity-0', 'pointer-events-none', 'z-0');
                    partnerDashboardView.classList.add('opacity-100', 'pointer-events-auto', 'z-10');
                }
            }
        }, 150);
    }
    
    // ── INITIALIZATION ───────────────────────────────────────────────────────
    
    if (userRegModal) userRegModal.classList.add('opacity-0', 'pointer-events-none');
    if (adminAuthModal) adminAuthModal.classList.add('opacity-0', 'pointer-events-none');
    if (partnerRegModal) partnerRegModal.classList.add('opacity-0', 'pointer-events-none');
    
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedPartner = localStorage.getItem('agentic_partner_session');
    
    if (storedPartner) {
        const partner = JSON.parse(storedPartner);
        switchView('partner');
        loadPartnerDashboard(partner);
    } else if (storedUser) {
        sessionUser = JSON.parse(storedUser);
        loadUserSession(sessionUser);
        switchView('customer');
    } else {
        if (userRegModal) {
            userRegModal.classList.remove('opacity-0', 'pointer-events-none');
            userRegModal.classList.add('opacity-100');
        }
    }
    
    function loadUserSession(user) {
        if (profileName) profileName.innerText = user.name;
        if (profilePhone) profilePhone.innerHTML = `<i class="fas fa-phone w-3 text-teal-400"></i><span class="ml-1">${user.phone}</span>`;
        if (profileAddress) profileAddress.innerHTML = `<i class="fas fa-map-marker-alt w-3 text-teal-400"></i><span class="ml-1">${user.address}</span>`;
        
        loadChatSessions();
        updateCustomerDashboard();
    }
    
    function loadChatSessions() {
        const sessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
        if (recentChatsContainer) {
            const emptyMsg = document.getElementById('empty-chats-msg');
            if (sessions.length > 0) {
                if (emptyMsg) emptyMsg.classList.add('hidden');
                recentChatsContainer.innerHTML = '';
                sessions.forEach(session => {
                    const div = document.createElement('div');
                    div.className = 'bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center text-sm cursor-pointer hover:bg-white/10 transition-all';
                    div.innerHTML = `
                        <div>
                            <p class="text-white font-bold">${session.title || 'Untitled Chat'}</p>
                            <p class="text-xs text-gray-500">${new Date(session.updatedAt).toLocaleString()}</p>
                        </div>
                        <i class="fas fa-chevron-right text-teal-400 text-xs"></i>
                    `;
                    div.addEventListener('click', () => {
                        loadSession(session.id);
                        switchView('chat');
                    });
                    recentChatsContainer.appendChild(div);
                });
            }
        }
        
        if (!currentSessionId) {
            if (sessions.length > 0) {
                loadSession(sessions[0].id);
            } else {
                startNewChat();
            }
        }
    }
    
    function loadSession(sessionId) {
        currentSessionId = sessionId;
        const sessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
        const session = sessions.find(s => s.id === sessionId);
        
        if (session) {
            chatHistory.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0 mt-1">
                        <i class="fas fa-robot text-white text-xs"></i>
                    </div>
                    <div class="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-tl-none max-w-[85%] text-sm text-gray-200 shadow-xl leading-relaxed">
                        System initialized. I am your AI orchestrator. How can I assist you today?
                    </div>
                </div>
            `;
            
            session.messages.forEach(msg => {
                if (msg.text !== '[Booking Card Generated]' && msg.text !== '[Dispute Card]' && msg.text !== '[Proposal Card Generated]' && msg.text !== '[Booking Confirmed & Tracking Activated]') {
                    appendMessage(msg.text, msg.role, true);
                }
            });
            
            const welcomeMsg = document.getElementById('welcome-msg');
            if (welcomeMsg && session.messages.length > 0) welcomeMsg.classList.add('hidden');
        }
    }
    
    function startNewChat() {
        const id = 'sess_' + Math.random().toString(36).substr(2, 9);
        const newSession = {
            id,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const sessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
        sessions.unshift(newSession);
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
        
        currentSessionId = id;
        
        chatHistory.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0 mt-1">
                    <i class="fas fa-robot text-white text-xs"></i>
                </div>
                <div class="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-tl-none max-w-[85%] text-sm text-gray-200 shadow-xl leading-relaxed">
                    System initialized. I am your AI orchestrator. How can I assist you today?
                </div>
            </div>
        `;
        
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) welcomeMsg.classList.remove('hidden');
        
        loadChatSessions();
    }
    
    function saveMessageToSession(role, text) {
        const sessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
        const session = sessions.find(s => s.id === currentSessionId);
        
        if (session) {
            session.messages.push({ role, text, timestamp: new Date().toISOString() });
            session.updatedAt = new Date().toISOString();
            
            if (session.title === 'New Chat' && role === 'user') {
                session.title = text.length > 20 ? text.substr(0, 20) + '...' : text;
            }
            
            localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
            loadChatSessions();
        }
    }
    
    function updateCustomerDashboard() {
        if (statActiveOrders) statActiveOrders.innerText = window.lockedWorkers.length > 0 ? "1" : "0";
        if (statActiveDisputes) statActiveDisputes.innerText = window.appState.activeDisputes;
        if (statTotalSpent) statTotalSpent.innerText = `PKR ${window.appState.totalSpent.toLocaleString()}`;
        
        if (recentInvoicesContainer) {
            const emptyMsg = document.getElementById('empty-invoices-msg');
            if (window.appState.totalSpent > 0) {
                if (emptyMsg) emptyMsg.classList.add('hidden');
                recentInvoicesContainer.innerHTML = `
                    <div class="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-sm dark:shadow-none hover:shadow-md transition-shadow">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                <i class="fas fa-tools"></i>
                            </div>
                            <div>
                                <p class="text-gray-900 dark:text-white font-bold">Recent Service</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end space-y-2">
                            <p class="text-teal-600 dark:text-teal-400 font-bold">PKR ${window.appState.totalSpent.toLocaleString()}</p>
                            <span class="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold tracking-wider uppercase">Active</span>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    function loadPartnerDashboard(partner) {
        const partnerProfileName = document.getElementById('partner-profile-name');
        const partnerProfileSkill = document.getElementById('partner-profile-skill');
        const partnerAvatar = document.getElementById('partner-avatar');
        
        if (partnerProfileName) partnerProfileName.innerText = partner.name;
        if (partnerProfileSkill) partnerProfileSkill.innerText = partner.skill;
        if (partnerAvatar) partnerAvatar.innerText = partner.name.charAt(0);
        
        const workerSelect = document.getElementById('worker-login-select');
        if (workerSelect) workerSelect.value = partner.id;
        
        renderPartnerBookings(partner.id);
    }
    
    window.completeActiveJob = function(jobId) {
        window.activeJobs = window.activeJobs.map(j => j.id === jobId ? {...j, status: 'completed'} : j);
        localStorage.setItem('active_jobs', JSON.stringify(window.activeJobs));
        
        const job = window.activeJobs.find(j => j.id === jobId);
        if (job) {
            const bookings = JSON.parse(localStorage.getItem('agentic_bookings') || '[]');
            bookings.push({
                id: job.id,
                workerId: Number(job.worker_id),
                customerName: job.customer,
                amount: job.fee,
                status: 'completed',
                date: new Date().toISOString()
            });
            localStorage.setItem('agentic_bookings', JSON.stringify(bookings));
        }
        
        if (window.triggerJobsUpdate) window.triggerJobsUpdate();
        else window.dispatchEvent(new StorageEvent('storage', { key: 'active_jobs' }));
        
        renderPartnerBookings();
    };

    function renderPartnerBookings(partnerId) {
        if (!partnerId) {
            const storedPartner = localStorage.getItem('agentic_partner_session');
            if (storedPartner) {
                try {
                    partnerId = JSON.parse(storedPartner).id;
                } catch (e) {}
            }
        }
        if (!partnerId) {
            const workerSelect = document.getElementById('worker-login-select');
            partnerId = workerSelect ? workerSelect.value : null;
        }
        if (!partnerId) return;
        partnerId = Number(partnerId);

        const container = document.getElementById('partner-bookings-container');
        const emptyMsg = document.getElementById('empty-partner-bookings-msg');
        
        const bookings = JSON.parse(localStorage.getItem('agentic_bookings') || '[]');
        const partnerBookings = bookings.filter(b => Number(b.workerId) === partnerId);
        
        const partnerStatJobs = document.getElementById('partner-stat-jobs');
        const partnerStatEarnings = document.getElementById('partner-stat-earnings');
        
        if (partnerStatJobs) partnerStatJobs.innerText = partnerBookings.filter(b => b.status === 'completed').length;
        if (partnerStatEarnings) {
            const earnings = partnerBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0);
            partnerStatEarnings.innerText = `PKR ${earnings.toLocaleString()}`;
        }

        if (!container) return;
        container.innerHTML = '';
        
        // TWO-SIDED MARKET: Always read fresh data from localStorage to avoid stale state
        window.activeJobs = JSON.parse(localStorage.getItem('active_jobs') || '[]');
        let displayJobs = window.activeJobs;
        if (partnerId) {
            displayJobs = displayJobs.filter(j => Number(j.worker_id) === partnerId);
        }

        if (displayJobs.length > 0) {
            const activeJob = displayJobs[displayJobs.length - 1];
            if (activeJob.status === 'pending') {
                const activeDiv = document.createElement('div');
                activeDiv.className = 'bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/30 rounded-3xl p-6 mb-6 shadow-[0_0_30px_rgba(249,115,22,0.1)] relative overflow-hidden animate-fade-in-up';
                activeDiv.innerHTML = `
                    <div class="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
                    
                    <div class="flex justify-between items-center mb-5 border-b border-orange-500/20 pb-4 relative z-10">
                        <span class="text-white font-black flex items-center tracking-wide"><span class="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2.5 shadow-[0_0_12px_red]"></span> LIVE BOOKING</span>
                        <span class="bg-orange-500/20 text-orange-400 px-3.5 py-1.5 rounded-xl font-black text-sm border border-orange-500/30 shadow-inner">PKR ${activeJob.fee}</span>
                    </div>
                    
                    <div class="space-y-4 mb-6 relative z-10">
                        <div class="flex items-start">
                            <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mr-3 mt-0.5"><i class="fas fa-user text-gray-400"></i></div>
                            <div>
                                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Client Details</p>
                                <p class="text-white font-bold text-lg leading-tight">${activeJob.customer}</p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mr-3 mt-0.5"><i class="fas fa-map-marker-alt text-orange-400"></i></div>
                            <div>
                                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Location & ETA</p>
                                <p class="text-white font-bold">${activeJob.distance} away <span class="text-gray-600 mx-2">•</span> <span class="text-orange-400">~15 mins</span></p>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-2 relative z-10">
                        <button class="flex-1 bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-orange-400 transition-colors shadow-lg"
                            onclick="this.innerHTML='Mark Job Done'; this.classList.replace('bg-orange-500','bg-blue-500'); this.onclick = function() { window.completeActiveJob('${activeJob.id}'); };">
                            Accept Job
                        </button>
                    </div>
                `;
                container.appendChild(activeDiv);
            }
        }

        // Historical bookings list
        if (partnerBookings.length > 0) {
            if (emptyMsg) emptyMsg.classList.add('hidden');
            partnerBookings.forEach(booking => {
                const div = document.createElement('div');
                div.className = 'bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center text-sm mb-2';
                div.innerHTML = `
                    <div>
                        <p class="text-white font-bold">Booking #${booking.id && typeof booking.id === 'string' ? booking.id.substr(3, 5) : 'N/A'}</p>
                        <p class="text-xs text-gray-500">Customer: ${booking.customerName || 'Guest'}</p>
                        <p class="text-xs text-gray-500">Status: <span class="${booking.status === 'pending' ? 'text-orange-400' : 'text-teal-400'}">${booking.status}</span></p>
                    </div>
                    <div>
                        ${booking.status === 'pending' ? `
                            <button class="btn-complete-partner-job bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 px-3 py-1.5 rounded-lg font-bold text-xs transition-all" data-booking-id="${booking.id}">
                                Mark Done
                            </button>
                        ` : `
                            <span class="text-teal-400 text-xs font-bold uppercase tracking-widest">Completed</span>
                        `}
                    </div>
                `;
                container.appendChild(div);
            });
        }
        
        if (partnerBookings.length === 0 && displayJobs.length === 0) {
            container.innerHTML = `<div class="text-center text-sm text-gray-500 mt-5 italic py-6">No active bookings yet. Keep availability on!</div>`;
        }
    }
    
    // ── THEME TOGGLE ─────────────────────────────────────────────────────────
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            if(isDark) { localStorage.setItem('theme', 'dark'); } else { localStorage.setItem('theme', 'light'); }
            document.documentElement.classList.toggle('light', !isDark);
            if (themeIcon) {
                themeIcon.className = isDark ? 'fas fa-moon text-xs' : 'fas fa-sun text-xs';
            }
        });
    }
    
    // ── NAVIGATION / VIEW SWITCHING ──────────────────────────────────────────
    
    
    if (toggleChatBtn) toggleChatBtn.addEventListener('click', () => switchView('chat'));
    if (toggleDashboardBtn) toggleDashboardBtn.addEventListener('click', () => switchView('customer'));
    
    const btnBackToChat = document.getElementById('btn-back-to-chat');
    if (btnBackToChat) {
        btnBackToChat.addEventListener('click', () => switchView('chat'));
    }
    
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            startNewChat();
            switchView('chat');
        });
    }
    
    if (switchToCustomerBtn) {
        switchToCustomerBtn.addEventListener('click', () => {
            localStorage.removeItem('agentic_partner_session');
            const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
            if (user) {
                loadUserSession(user);
                switchView('customer');
            } else {
                if (userRegModal) {
                    userRegModal.classList.remove('opacity-0', 'pointer-events-none');
                    userRegModal.classList.add('opacity-100');
                }
            }
        });
    }
    
    // ── ADMIN AUTHENTICATION ─────────────────────────────────────────────────
    let clickCount = 0;
    let clickTimer = null;
    if (brandLogo) {
        brandLogo.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
            } else if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                if (adminAuthModal) {
                    adminAuthModal.classList.remove('opacity-0', 'pointer-events-none');
                    adminAuthModal.classList.add('opacity-100');
                    if (adminPassInput) adminPassInput.focus();
                }
            }
        });
    }
    
    if (adminVerifyBtn) {
        adminVerifyBtn.addEventListener('click', () => {
            if (adminPassInput && adminPassInput.value === '0000') {
                if (adminAuthModal) {
                    adminAuthModal.classList.add('opacity-0', 'pointer-events-none');
                    adminAuthModal.classList.remove('opacity-100');
                }
                switchView('admin');
                if (adminPassInput) adminPassInput.value = '';
                if (adminErrorMsg) adminErrorMsg.classList.add('hidden');
            } else {
                if (adminErrorMsg) adminErrorMsg.classList.remove('hidden');
            }
        });
    }
    
    if (adminCancelBtn) {
        adminCancelBtn.addEventListener('click', () => {
            if (adminAuthModal) {
                adminAuthModal.classList.add('opacity-0', 'pointer-events-none');
                adminAuthModal.classList.remove('opacity-100');
            }
            if (adminPassInput) adminPassInput.value = '';
            if (adminErrorMsg) adminErrorMsg.classList.add('hidden');
        });
    }
    
    // ── USER REGISTRATION ────────────────────────────────────────────────────
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const usersDb = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            const existingUser = usersDb.find(u => u.phone === regPhone.value);
            
            let user;
            if (existingUser) {
                user = existingUser;
                appendMessage(`Welcome back, ${user.name}! Profile loaded.`, 'agent');
            } else {
                user = {
                    id: 'usr_' + Math.random().toString(36).substr(2, 9),
                    name: regName.value,
                    phone: regPhone.value,
                    address: regAddress.value
                };
                usersDb.push(user);
                localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
                appendMessage(`Profile activated! Welcome, ${user.name}.`, 'agent');
            }
            
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            sessionUser = user;
            loadUserSession(user);
            
            if (userRegModal) {
                userRegModal.classList.add('opacity-0', 'pointer-events-none');
                userRegModal.classList.remove('opacity-100');
            }
            
            switchView('customer');
        });
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(CHAT_STORAGE_KEY);
            localStorage.removeItem(SESSIONS_STORAGE_KEY);
            localStorage.removeItem('agentic_partner_session');
            window.location.reload();
        });
    }
    
    if (partnerLogoutBtn) {
        partnerLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('agentic_partner_session');
            window.location.reload();
        });
    }
    
    const btnStartChat = document.getElementById('btn-start-chat');
    if (btnStartChat) {
        btnStartChat.addEventListener('click', () => switchView('chat'));
    }
    
    // ── PARTNER ONBOARDING & LOGIN ───────────────────────────────────────────
    if (btnBecomePartner) {
        btnBecomePartner.addEventListener('click', () => {
            if (partnerRegModal) {
                partnerRegModal.classList.remove('opacity-0', 'pointer-events-none');
                partnerRegModal.classList.add('opacity-100');
                // Reset to registration form view
                if (partnerRegForm) partnerRegForm.classList.remove('hidden');
                if (partnerLoginForm) partnerLoginForm.classList.add('hidden');
            }
        });
    }
    
    if (partnerCancelBtn) {
        partnerCancelBtn.addEventListener('click', () => {
            if (partnerRegModal) {
                partnerRegModal.classList.add('opacity-0', 'pointer-events-none');
                partnerRegModal.classList.remove('opacity-100');
            }
        });
    }
    
    if (linkPartnerLogin) {
        linkPartnerLogin.addEventListener('click', () => {
            if (partnerRegForm) partnerRegForm.classList.add('hidden');
            if (partnerLoginForm) partnerLoginForm.classList.remove('hidden');
        });
    }
    
    if (linkPartnerReg) {
        linkPartnerReg.addEventListener('click', () => {
            if (partnerLoginForm) partnerLoginForm.classList.add('hidden');
            if (partnerRegForm) partnerRegForm.classList.remove('hidden');
        });
    }
    
    if (partnerLoginCancelBtn) {
        partnerLoginCancelBtn.addEventListener('click', () => {
            if (partnerRegModal) {
                partnerRegModal.classList.add('opacity-0', 'pointer-events-none');
                partnerRegModal.classList.remove('opacity-100');
            }
        });
    }
    
    if (partnerGpsBtn) {
        partnerGpsBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                partnerGpsBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        partnerLat = position.coords.latitude;
                        partnerLng = position.coords.longitude;
                        if (partnerLocationInput) partnerLocationInput.value = `${partnerLat.toFixed(4)}, ${partnerLng.toFixed(4)}`;
                        partnerGpsBtn.innerHTML = `<i class="fas fa-check"></i>`;
                        partnerGpsBtn.classList.remove('text-orange-400');
                        partnerGpsBtn.classList.add('text-teal-400');
                    },
                    (error) => {
                        console.error("Partner Geo error:", error);
                        partnerGpsBtn.innerHTML = `<i class="fas fa-times"></i>`;
                        partnerGpsBtn.classList.remove('text-orange-400');
                        partnerGpsBtn.classList.add('text-red-400');
                    }
                );
            }
        });
    }
    
    if (partnerRegForm) {
        partnerRegForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('partner-name').value;
            const phone = document.getElementById('partner-phone').value;
            const pass = document.getElementById('partner-pass').value;
            const skill = document.getElementById('partner-skill').value;
            
            try {
                const response = await fetch('http://localhost:5000/api/partner/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        phone,
                        password: pass,
                        skill,
                        lat: partnerLat,
                        lng: partnerLng
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert("Welcome to GigOrbit, Partner!");
                    
                    const newPartner = data.worker;
                    localStorage.setItem('agentic_partner_session', JSON.stringify(newPartner));
                    
                    if (partnerRegModal) {
                        partnerRegModal.classList.add('opacity-0', 'pointer-events-none');
                        partnerRegModal.classList.remove('opacity-100');
                    }
                    partnerRegForm.reset();
                    
                    
                    switchView('partner');
                    loadPartnerDashboard(newPartner);
                    populateWorkerDropdown(); // Refresh the list
                    
                } else {
                    alert("Failed to register partner.");
                }
            } catch (error) {
                console.error("Partner registration error:", error);
                alert("Error connecting to server.");
            }
        });
    }
    
    if (partnerLoginForm) {
        partnerLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = document.getElementById('login-partner-phone').value;
            const pass = document.getElementById('login-partner-pass').value;
            
            const worker = workersData.find(w => w.phone === phone && w.password === pass);
            
            if (worker) {
                alert(`Welcome back, ${worker.name}!`);
                localStorage.setItem('agentic_partner_session', JSON.stringify(worker));
                if (partnerRegModal) {
                    partnerRegModal.classList.add('opacity-0', 'pointer-events-none');
                    partnerRegModal.classList.remove('opacity-100');
                }
                switchView('partner');
                loadPartnerDashboard(worker);
            } else {
                alert("Invalid phone or password. (Hint for mock workers: password is 786)");
            }
        });
    }
    
    // ── WORKERS DATA ─────────────────────────────────────────────────────────
    function populateWorkerDropdown() {
        fetch('/mock_data/workers.json?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
                workersData = data;
                const workerSelect = document.getElementById('worker-login-select');
                if (workerSelect) {
                    workerSelect.innerHTML = '<option value="">Select Profile</option>';
                    data.forEach(w => {
                        const opt = document.createElement('option');
                        opt.value = w.id;
                        opt.textContent = `${w.name} (${w.skill})`;
                        workerSelect.appendChild(opt);
                    });

                    // Set value from active partner session if loaded
                    const storedPartner = localStorage.getItem('agentic_partner_session');
                    if (storedPartner) {
                        try {
                            const partner = JSON.parse(storedPartner);
                            workerSelect.value = partner.id;
                        } catch (e) {}
                    }

                    workerSelect.addEventListener('change', (e) => {
                        const selectedId = e.target.value;
                        if (selectedId && workersData) {
                            const worker = workersData.find(w => w.id == selectedId);
                            if (worker) {
                                const partnerProfileName = document.getElementById('partner-profile-name');
                                const partnerProfileSkill = document.getElementById('partner-profile-skill');
                                const partnerAvatar = document.getElementById('partner-avatar');
                                
                                if (partnerProfileName) partnerProfileName.innerText = worker.name;
                                if (partnerProfileSkill) partnerProfileSkill.innerText = worker.skill;
                                if (partnerAvatar) partnerAvatar.innerText = worker.name.charAt(0);
                                
                                localStorage.setItem('agentic_partner_session', JSON.stringify(worker));
                            }
                        }
                        renderPartnerBookings();
                    });
                }
            })
            .catch(err => console.error("Could not load workers data", err));
    }
    
    populateWorkerDropdown();
        
    // ── GEOLOCATION ──────────────────────────────────────────────────────────
    function requestLocation() {
        const handleLocationSuccess = (position) => {
            window.userLat = position.coords.latitude;
            window.userLng = position.coords.longitude;
            if (gpsIndicator) {
                gpsIndicator.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-teal-400 mr-1.5 animate-pulse"></span>Active';
                gpsIndicator.classList.remove('text-gray-600', 'text-gray-400', 'text-red-400');
                gpsIndicator.classList.add('text-teal-400');
            }
        };

        const handleLocationError = (error) => {
            console.warn("Geo error or denied, using Karachi fallback:", error);
            window.userLat = 24.8607;
            window.userLng = 67.0011;
            if (gpsIndicator) {
                gpsIndicator.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-teal-400 mr-1.5 animate-pulse"></span>Active (Default)';
                gpsIndicator.classList.remove('text-gray-600', 'text-gray-400', 'text-red-400');
                gpsIndicator.classList.add('text-teal-400');
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, { timeout: 5000 });
        } else {
            handleLocationError(new Error("Geolocation not supported"));
        }
    }
    requestLocation();
    
    const gpsDetectBtn = document.getElementById('gps-detect-btn');
    if (gpsDetectBtn) {
        gpsDetectBtn.addEventListener('click', () => {
            requestLocation();
            alert("Attempting to lock GPS coordinates...");
        });
    }
    
    // ── SPEECH RECOGNITION ───────────────────────────────────────────────────
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && micBtn) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        micBtn.addEventListener('click', () => {
            recognition.start();
            micBtn.classList.add('bg-teal-500/20', 'animate-pulse');
        });
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (chatInput) chatInput.value = transcript;
            sendMessage(transcript);
            micBtn.classList.remove('bg-teal-500/20', 'animate-pulse');
        };
        
        recognition.onspeechend = () => { recognition.stop(); };
        recognition.onerror = () => { micBtn.classList.remove('bg-teal-500/20', 'animate-pulse'); };
    }
    
    if (suggestionsDiv) {
        suggestionsDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                sendMessage(e.target.innerText);
            }
        });
    }
    
    // ── CHAT CORE ────────────────────────────────────────────────────────────
    
    async function sendMessage(message) {
        if (!message) return;
        
        appendMessage(message, 'user');
        if (chatInput) chatInput.value = '';
        
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) welcomeMsg.classList.add('hidden');
        
        saveMessageToSession('user', message);
        
        const loadingId = appendLoading();
        scrollToBottom();
        
        try {
            const sessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
            const session = sessions.find(s => s.id === currentSessionId);
            const history = session ? session.messages.slice(-5) : [];
            
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    user_id: sessionUser ? sessionUser.id : 'anonymous',
                    user_name: sessionUser ? sessionUser.name : 'Unknown',
                    manual_location_string: document.getElementById('manual-location-input') ? document.getElementById('manual-location-input').value : '',
                    user_lat: window.userLat,
                    user_lng: window.userLng,
                    chat_history: history,
                    locked_workers: window.lockedWorkers
                })
            });
            
            const data = await response.json();
            removeMessage(loadingId);
            
            if (response.ok) {
                if (data.action === 'quote_provided') {
                    const workerId = data.matched_worker_id || (workersData.length > 0 ? workersData[0].id : 1);
                    const worker = workersData.find(w => w.id == workerId);
                    if (worker) {
                        renderProposalCard(data, worker);
                        saveMessageToSession('agent', '[Proposal Card Generated]');
                    } else {
                        appendMessage(buildMessageText(data), 'agent');
                    }
                }
                else if (data.action === 'booking_confirmed') {
                    const workerId = window.lockedWorkers.length > 0 ? window.lockedWorkers[window.lockedWorkers.length - 1] : (data.matched_worker_id || (workersData.length > 0 ? workersData[0].id : 1));
                    const worker = workersData.find(w => w.id == workerId);
                    if (worker) {
                        activateTrackingPortal(data, worker);
                        window.appState.totalBookings += 1;
                        if (data.quote?.total_pkr) window.appState.totalSpent += data.quote.total_pkr;
                        updateCustomerDashboard();
                        
                        // Save to global bookings for Partner Dashboard
                        const bookings = JSON.parse(localStorage.getItem('agentic_bookings') || '[]');
                        bookings.push({
                            id: 'bk_' + Date.now(),
                            workerId: Number(workerId),
                            customerName: sessionUser ? sessionUser.name : 'Guest',
                            status: 'pending',
                            amount: data.quote?.total_pkr || 700,
                            createdAt: new Date().toISOString()
                        });
                        localStorage.setItem('agentic_bookings', JSON.stringify(bookings));
                        
                        saveMessageToSession('agent', '[Booking Confirmed & Tracking Activated]');
                    } else {
                        appendMessage(buildMessageText(data), 'agent');
                    }
                }
                else if (data.action === 'advisory') {
                    appendMessage(buildMessageText(data), 'agent');
                    saveMessageToSession('agent', data.reasoning || '');
                }
                else if (data.action === 'dispute_resolved') {
                    const worker = data.matched_worker_id ? workersData.find(w => w.id === data.matched_worker_id) : null;
                    appendDisputeReceipt(data, worker);
                    window.appState.activeDisputes += 1;
                    if (data.quote?.refund_amount) window.appState.totalSpent -= data.quote.refund_amount;
                    updateCustomerDashboard();
                    saveMessageToSession('agent', '[Dispute Card] ' + (data.reasoning || ''));
                }
                else {
                    appendMessage(buildMessageText(data), 'agent');
                    saveMessageToSession('agent', data.reasoning || '');
                }
            } else {
                appendMessage("Server returned an error. Please try again.", 'agent');
            }
        } catch (error) {
            console.error("Chat error:", error);
            removeMessage(loadingId);
            appendMessage("Failed to reach orchestrator. Ensure backend is running.", 'agent');
        }
    }
    
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            sendMessage(message);
        });
    }
    
    if (chatHistory) {
        chatHistory.addEventListener('click', (e) => {
            if (e.target.closest('.btn-confirm-booking')) {
                const btn = e.target.closest('.btn-confirm-booking');
                const card = btn.closest('[data-worker-id]');
                const cancelBtn = card.querySelector('.btn-cancel-booking');
                
                btn.disabled = true;
                if (cancelBtn) cancelBtn.disabled = true;
                btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1.5"></i> Confirming...`;
                
                const workerId = card.getAttribute('data-worker-id');
                if (workerId) {
                    window.lockedWorkers.push(Number(workerId));
                }
                
                sendMessage("Yes, I confirm the booking.");
                setTimeout(() => {
                    btn.innerHTML = `<i class="fas fa-check-circle mr-1.5"></i> Confirmed`;
                    btn.classList.replace('bg-gray-900', 'bg-teal-600');
                    btn.classList.replace('dark:bg-white', 'dark:bg-teal-500');
                    btn.classList.replace('text-white', 'text-white');
                    btn.classList.replace('dark:text-black', 'dark:text-white');
                }, 1500);
            } else if (e.target.closest('.btn-cancel-booking')) {
                appendMessage("I have canceled the request.", 'user');
                const actionsDiv = e.target.closest('.btn-cancel-booking').parentElement;
                actionsDiv.innerHTML = '<span class="text-gray-500 text-xs font-bold uppercase tracking-widest">Proposal Canceled</span>';
                saveMessageToSession('user', 'I have canceled the request.');
            }
        });
    }
    
    // Event Delegation for PDF Download
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-download-pdf')) {
            const btn = e.target.closest('.btn-download-pdf');
            const amount = btn.getAttribute('data-amount');
            
            document.getElementById('inv-date').innerText = `Date: ${new Date().toLocaleDateString()}`;
            document.getElementById('inv-number').innerText = `Inv #: INV-${Math.floor(Math.random() * 90000) + 10000}`;
            document.getElementById('inv-cust-name').innerText = sessionUser ? sessionUser.name : 'Guest';
            document.getElementById('inv-cust-phone').innerText = sessionUser ? sessionUser.phone : 'N/A';
            document.getElementById('inv-cust-addr').innerText = sessionUser ? sessionUser.address : 'N/A';
            
            let workerName = "Ali Khan";
            let workerSkill = "Plumber";
            
            document.getElementById('inv-work-name').innerText = workerName;
            document.getElementById('inv-work-skill').innerText = workerSkill;
            
            const total = parseInt(amount) || 700;
            const base = Math.floor(total * 0.7);
            const dist = total - base;
            
            document.getElementById('inv-base-fee').innerText = `PKR ${base}`;
            document.getElementById('inv-dist-fee').innerText = `PKR ${dist}`;
            document.getElementById('inv-total').innerText = `PKR ${total}`;
            
            const templateElement = document.getElementById('invoice-template');
            
            templateElement.classList.remove('hidden');
            
            html2pdf().set({ 
                margin: [0.5, 0.5], 
                filename: 'GigOrbit_Invoice.pdf', 
                image: { type: 'jpeg', quality: 1 }, 
                html2canvas: { scale: 2, useCORS: true }, 
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } 
            }).from(templateElement).save().then(() => {
                templateElement.classList.add('hidden');
            });
        }
    });
    
    // Event Delegation for Partner Complete Job
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-complete-partner-job')) {
            const btn = e.target.closest('.btn-complete-partner-job');
            const bookingId = btn.getAttribute('data-booking-id');
            
            const bookings = JSON.parse(localStorage.getItem('agentic_bookings') || '[]');
            const booking = bookings.find(b => b.id === bookingId);
            
            if (booking) {
                booking.status = 'completed';
                localStorage.setItem('agentic_bookings', JSON.stringify(bookings));
                
                const partnerSession = JSON.parse(localStorage.getItem('agentic_partner_session'));
                if (partnerSession) {
                    renderPartnerBookings(partnerSession.id);
                }
                
                alert("Job marked as complete!");
            }
        }
    });
    
    
    const btnCompleteJob = document.getElementById('btn-complete-job');
    const ratingModal = document.getElementById('rating-modal');
    const ratingModalInner = document.getElementById('rating-modal-inner');
    const btnSkipRating = document.getElementById('btn-skip-rating');
    const btnSubmitRating = document.getElementById('btn-submit-rating');
    let currentRatingValue = 5;

    // Star interaction
    const stars = document.querySelectorAll('#star-rating-container i');
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            currentRatingValue = parseInt(e.target.getAttribute('data-val'));
            stars.forEach((s, index) => {
                if(index < currentRatingValue) {
                    s.classList.remove('text-gray-300', 'dark:text-gray-600');
                    s.classList.add('text-yellow-400');
                } else {
                    s.classList.add('text-gray-300', 'dark:text-gray-600');
                    s.classList.remove('text-yellow-400');
                }
            });
        });
    });

    if (btnCompleteJob) {
        btnCompleteJob.addEventListener('click', () => {
            // Default 5 star UI
            stars.forEach(s => s.classList.add('text-yellow-400'));
            currentRatingValue = 5;
            
            if (ratingModal) {
                ratingModal.classList.remove('opacity-0', 'pointer-events-none');
                ratingModal.classList.add('opacity-100');
                if (ratingModalInner) ratingModalInner.classList.remove('scale-95');
                if (ratingModalInner) ratingModalInner.classList.add('scale-100');
            }
        });
    }

    function closeRatingAndFinish() {
        if (ratingModal) {
            ratingModal.classList.add('opacity-0', 'pointer-events-none');
            ratingModal.classList.remove('opacity-100');
        }
        if (window.lockedWorkers.length > 0) window.lockedWorkers.pop();
        window.currentTrackingWorkerId = null;
        switchView('customer');
        updateCustomerDashboard();
        if(window.startNewSession) window.startNewSession();
    }

    if (btnSkipRating) {
        btnSkipRating.addEventListener('click', closeRatingAndFinish);
    }

    if (btnSubmitRating) {
        btnSubmitRating.addEventListener('click', async () => {
            btnSubmitRating.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            const reviewText = document.getElementById('rating-review-text') ? document.getElementById('rating-review-text').value : '';
            
            try {
                if (window.currentTrackingWorkerId) {
                    await fetch('http://localhost:5000/api/rate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            worker_id: window.currentTrackingWorkerId,
                            rating: currentRatingValue,
                            review_text: reviewText
                        })
                    });
                }
            } catch(err) {
                console.error('Rating submit error', err);
            }
            
            btnSubmitRating.innerHTML = '<i class="fas fa-check"></i> Submitted!';
            setTimeout(closeRatingAndFinish, 600);
        });
    }

    // ── RENDER FUNCTIONS ─────────────────────────────────────────────────────
    
    function appendMessage(text, role, isHistory = false) {
        const div = document.createElement('div');
        div.className = `flex items-start space-x-3 animate-fade-in-up`;
        
        const isUser = role === 'user';
        
        div.innerHTML = `
            ${!isUser ? `
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0 mt-1">
                    <i class="fas fa-robot text-white text-xs"></i>
                </div>
            ` : ''}
            <div class="${isUser ? 'ml-auto bg-teal-500 text-black rounded-tr-none font-medium' : 'bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none'} p-4 rounded-2xl max-w-[85%] text-sm shadow-xl leading-relaxed relative">
                ${text}
                ${isUser ? '<div class="absolute top-0 right-[-6px] w-0 h-0 border-t-[8px] border-t-teal-500 border-r-[8px] border-r-transparent"></div>' : ''}
            </div>
        `;
        
        chatHistory.appendChild(div);
        if (!isHistory) scrollToBottom();
    }
    
    function appendLoading() {
        const id = 'loading_' + Math.random().toString(36).substr(2, 9);
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex items-start space-x-3';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                <i class="fas fa-robot text-white text-xs"></i>
            </div>
            <div class="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-tl-none text-sm text-gray-200 shadow-xl flex items-center space-x-1.5">
                <span class="loading-dot w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                <span class="loading-dot w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                <span class="loading-dot w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
            </div>
        `;
        chatHistory.appendChild(div);
        return id;
    }
    
    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
    
    function scrollToBottom() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' });
        }
    }
    
    function buildMessageText(data) {
        return data.reasoning || "Request processed.";
    }
    
    function renderProposalCard(data, worker) {
        const messageText = buildMessageText(data);
        const quote = data.quote || {};
        
        // Trust Data Parsing
        const exp = worker.experience_years || 5;
        const jobs = worker.completed_jobs || 120;
        const rating = worker.rating || 4.8;
        const wa = worker.whatsapp_number || "+923000000000";

        const div = document.createElement('div');
        div.className = 'w-full mx-auto max-w-[100%] sm:max-w-[95%] mt-2 mb-4 animate-fade-in-up';
        div.setAttribute('data-worker-id', worker.id);
        div.innerHTML = `
            <div class="bg-white dark:bg-[#0b1120]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:shadow-2xl">
                <!-- Header -->
                <div class="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-blue-500/20 dark:to-teal-500/10 border-b border-gray-200 dark:border-white/10 px-5 py-3.5 flex items-center justify-between">
                    <span class="text-teal-600 dark:text-teal-300 text-[10px] font-black uppercase tracking-widest flex items-center"><i class="fas fa-shield-check mr-1.5"></i> Verified Proposal</span>
                    <span class="text-[10px] font-black bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/30">QUOTATION</span>
                </div>
                
                <div class="px-5 pt-4 pb-1">
                    <p class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium">${messageText}</p>
                </div>
                
                <!-- Premium Worker Profile & Trust Badges -->
                <div class="mx-5 my-4 bg-gray-50 dark:bg-black/50 rounded-2xl border border-gray-200 dark:border-white/5 p-4 relative overflow-hidden">
                    <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-teal-500/10 rounded-full blur-xl pointer-events-none"></div>
                    
                    <div class="flex items-center space-x-4 mb-3 relative z-10">
                        <div class="w-12 h-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center text-teal-500 dark:text-teal-400 font-bold text-lg shadow-sm">${worker.name.charAt(0)}</div>
                        <div>
                            <p class="text-gray-900 dark:text-gray-100 text-base font-black flex items-center">${worker.name} <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold ml-2"><i class="fas fa-shield-check"></i> NADRA Verified</span></p>
                            <p class="text-gray-500 text-[11px] font-bold uppercase tracking-wider">${worker.skill}</p>
                        </div>
                    </div>
                    
                    <!-- Trust Badges -->
                    <div class="flex flex-wrap gap-2 relative z-10 mb-4">
                        <span class="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-black px-2 py-1 rounded-md flex items-center border border-yellow-200 dark:border-transparent">⭐ ${rating}</span>
                        <span class="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded-md flex items-center border border-blue-200 dark:border-transparent">🏆 ${jobs} Jobs</span>
                        <span class="bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 text-[10px] font-black px-2 py-1 rounded-md flex items-center border border-teal-200 dark:border-transparent">💼 ${exp} Yrs Exp</span>
                    </div>

                    <!-- Recent Review -->
                    <div class="bg-white/60 dark:bg-black/30 border border-gray-200 dark:border-white/5 rounded-xl p-3 mb-4 text-xs italic text-gray-700 dark:text-gray-300 relative z-10 flex items-start shadow-sm">
                        <i class="fas fa-quote-left text-teal-400 mr-2 mt-1 opacity-50"></i>
                        <span>"Highly professional and quick. Fixed the issue perfectly!" - Recent Customer</span>
                    </div>

                    <!-- Fee Breakdown -->
                    <div class="space-y-2 text-xs relative z-10 font-mono">
                        <div class="flex justify-between items-center"><span class="text-gray-500">Base Service Fee</span><span class="text-gray-800 dark:text-gray-300 font-bold">PKR ${quote.base_fee || 0}</span></div>
                        <div class="flex justify-between items-center"><span class="text-gray-500">Distance & Logistics</span><span class="text-gray-800 dark:text-gray-300 font-bold">PKR ${quote.distance_fee || 0}</span></div>
                        <div class="border-t border-gray-200 dark:border-white/10 pt-2 flex justify-between items-center">
                            <span class="text-gray-800 dark:text-gray-300 uppercase tracking-widest text-[10px] font-black">Net Total</span>
                            <span class="text-teal-600 dark:text-teal-400 text-lg font-black">PKR ${quote.total_pkr || 0}</span>
                        </div>
                    </div>
                    
                    <!-- GigWallet Escrow -->
                    <div class="bg-blue-50/50 border border-blue-200 text-blue-800 text-xs p-2 rounded-lg mt-3 flex items-center shadow-sm relative z-10">
                        <i class="fas fa-lock mr-2 text-blue-500"></i> Funds held securely in GigWallet. Released only when you mark the job done.
                    </div>
                </div>
                
                <!-- Action Buttons: 3 Button Grid -->
                <div class="px-5 pb-5">
                    <button class="btn-confirm-booking w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-black py-3.5 rounded-[14px] font-bold text-sm transition-all shadow-lg flex items-center justify-center mb-2.5">
                        <i class="fas fa-check-circle mr-2 text-teal-400 dark:text-teal-600"></i> Confirm Booking
                    </button>
                    <div class="grid grid-cols-2 gap-2">
                        <a href="https://wa.me/${wa.replace(/\+/g, '')}" target="_blank" class="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] dark:text-[#25D366] py-2.5 rounded-[12px] font-bold text-[11px] transition-all flex items-center justify-center">
                            <i class="fab fa-whatsapp text-sm mr-1.5"></i> WhatsApp
                        </a>
                        <a href="tel:${wa}" class="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 py-2.5 rounded-[12px] font-bold text-[11px] transition-all flex items-center justify-center">
                            <i class="fas fa-phone-alt text-sm mr-1.5"></i> Direct Call
                        </a>
                    </div>
                </div>
            </div>
        `;
        chatHistory.appendChild(div);
        scrollToBottom();
    }
    
    function activateTrackingPortal(data, worker) {
        window.currentTrackingWorkerId = worker.id;
        const etaMins = data.exact_distance_km != null ? Math.max(1, Math.round(data.exact_distance_km * 3)) : '~15';
        const dist = data.exact_distance_km != null ? data.exact_distance_km + ' km' : '2.4 km';
        
        const avatarEl = document.getElementById('tracking-worker-avatar');
        const nameEl = document.getElementById('tracking-worker-name');
        const skillEl = document.getElementById('tracking-worker-skill');
        const ratingEl = document.getElementById('tracking-worker-rating');
        const distEl = document.getElementById('tracking-distance');
        const etaEl = document.getElementById('tracking-eta');
        
        const callBtn = document.getElementById('tracking-call-btn');
        const waBtn = document.getElementById('tracking-wa-btn');

        if (nameEl) nameEl.innerText = worker.name;
        if (skillEl) skillEl.innerText = worker.skill;
        if (ratingEl) ratingEl.innerText = worker.rating || '4.8';
        if (avatarEl) avatarEl.innerText = worker.name.charAt(0);
        if (distEl) distEl.innerText = dist;
        if (etaEl) etaEl.innerText = `${etaMins} min`;

        if (callBtn && worker.whatsapp_number) callBtn.href = `tel:${worker.whatsapp_number}`;
        if (waBtn && worker.whatsapp_number) waBtn.href = `https://wa.me/${worker.whatsapp_number.replace(/\+/g, '')}`;

        // Update active jobs for partner dashboard
        window.activeJobs.push({
            id: 'job_' + Date.now(),
            customer: sessionUser ? sessionUser.name : 'Guest Customer',
            service: worker.skill,
            fee: data.quote?.total_pkr || 700,
            distance: dist,
            worker_id: worker.id,
            worker_name: worker.name,
            status: 'pending'
        });
        localStorage.setItem('active_jobs', JSON.stringify(window.activeJobs));
        if (window.triggerJobsUpdate) window.triggerJobsUpdate();
        else window.dispatchEvent(new StorageEvent('storage', { key: 'active_jobs' }));

        // Simulate tracking vehicle movement
        const vehicle = document.getElementById('tracking-vehicle');
        if(vehicle) {
            vehicle.style.transform = "translate(-60px, -40px)";
            setTimeout(() => { vehicle.style.transform = "translate(-20px, -10px)"; }, 2000);
            setTimeout(() => { vehicle.style.transform = "translate(10px, 10px)"; }, 5000);
        }

        switchView('tracking');
    }
    
    function appendDisputeReceipt(data, worker) {
        const quote = data.quote || {};
        const div = document.createElement('div');
        div.className = 'w-full mx-auto max-w-[95%] mt-2 mb-4 animate-fade-in-up';
        div.innerHTML = `
            <div class="bg-black/40 border border-red-500/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
                <div class="bg-red-500/10 border-b border-red-500/20 px-5 py-3.5 flex items-center justify-between">
                    <span class="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center">
                        <i class="fas fa-exclamation-triangle mr-1.5"></i>Dispute Resolved
                    </span>
                    <span class="text-[10px] font-bold bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/30">REFUND</span>
                </div>
                <div class="px-5 pt-4 pb-1">
                    <p class="text-sm text-gray-200 leading-relaxed">${data.reasoning || 'Dispute processed.'}</p>
                </div>
                ${worker ? `
                    <div class="mx-5 my-3 flex items-center space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <div class="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-red-400 font-bold text-xs">${worker.name.charAt(0)}</div>
                        <div>
                            <p class="text-gray-900 dark:text-gray-100 text-xs font-bold">${worker.name}</p>
                            <p class="text-gray-500 text-[10px]">${worker.skill}</p>
                        </div>
                    </div>
                ` : ''}
                <div class="px-5 py-4 bg-red-500/5 mt-2 flex justify-between items-center border-t border-red-500/10">
                    <div>
                        <p class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Refund Amount</p>
                        <p class="text-red-400 text-lg font-bold">PKR ${quote.refund_amount || 0}</p>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                        <i class="fas fa-receipt text-sm"></i>
                    </div>
                </div>
            </div>
        `;
        chatHistory.appendChild(div);
        scrollToBottom();
    }

    // Contextual Service Routing
    const serviceCards = document.querySelectorAll('#customer-dashboard-view .grid > div.cursor-pointer');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const span = card.querySelector('span');
            if (span) {
                const serviceName = span.innerText.trim();
                if (window.startNewSession) window.startNewSession();
                switchView('chat');
                
                setTimeout(() => {
                    const chatInput = document.getElementById('chat-input');
                    const chatForm = document.getElementById('chat-form');
                    
                    if (chatInput && chatForm) {
                        chatInput.value = `I need an expert ${serviceName} right now.`;
                        const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                        chatForm.dispatchEvent(submitEvent);
                    }
                }, 300); // brief delay to allow view switch animation to begin
            }
        });
    });


    // Session Isolation & Profile Management
    window.startNewSession = function() {
        if (chatHistory) {
            chatHistory.innerHTML = '';
        }
        window.lockedWorkers = [];
        
        // Use the existing startNewChat logic to generate ID and initial message
        if (typeof startNewChat === 'function') {
            startNewChat();
        }
    };

    const chatViewNewSessionBtn = document.getElementById('chat-view-new-session');
    if (chatViewNewSessionBtn) {
        chatViewNewSessionBtn.addEventListener('click', () => {
            window.startNewSession();
        });
    }

    const btnProfile = document.getElementById('btn-profile');
    const profileModal = document.getElementById('profile-modal');
    const profileModalCancelBtn = document.getElementById('profile-modal-cancel-btn');
    const modalDetectGpsBtn = document.getElementById('modal-detect-gps-btn');
    const modalSaveSettingsBtn = document.getElementById('modal-save-settings-btn');
    const modalManualLocation = document.getElementById('modal-manual-location');
    const modalGpsToast = document.getElementById('modal-gps-toast');
    const mainManualLocationInput = document.getElementById('manual-location-input');

    if (btnProfile) {
        btnProfile.addEventListener('click', () => {
            if (profileModal) {
                profileModal.classList.remove('opacity-0', 'pointer-events-none');
                profileModal.classList.add('opacity-100');
                if (modalManualLocation && mainManualLocationInput) {
                    modalManualLocation.value = mainManualLocationInput.value;
                }
            }
        });
    }

    if (profileModalCancelBtn) {
        profileModalCancelBtn.addEventListener('click', () => {
            if (profileModal) {
                profileModal.classList.add('opacity-0', 'pointer-events-none');
                profileModal.classList.remove('opacity-100');
            }
        });
    }

    if (modalDetectGpsBtn) {
        modalDetectGpsBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        window.userLat = position.coords.latitude;
                        window.userLng = position.coords.longitude;
                        if (modalGpsToast) {
                            modalGpsToast.innerText = "Location Locked!";
                            modalGpsToast.classList.remove('hidden', 'text-red-400');
                            modalGpsToast.classList.add('text-green-400');
                        }
                    },
                    (error) => {
                        console.warn("Geo error:", error);
                        if (modalGpsToast) {
                            modalGpsToast.innerText = "GPS Failed. Using Fallback.";
                            modalGpsToast.classList.remove('hidden', 'text-green-400');
                            modalGpsToast.classList.add('text-red-400');
                        }
                        window.userLat = 24.8607;
                        window.userLng = 67.0011;
                    }
                );
            }
        });
    }

    if (modalSaveSettingsBtn) {
        modalSaveSettingsBtn.addEventListener('click', () => {
            if (mainManualLocationInput && modalManualLocation) {
                mainManualLocationInput.value = modalManualLocation.value;
            }
            if (profileModal) {
                profileModal.classList.add('opacity-0', 'pointer-events-none');
                profileModal.classList.remove('opacity-100');
            }
        });
    }

    const btnViewHistory = document.getElementById('btn-view-history');
    const btnBackToDashboard = document.getElementById('btn-back-to-dashboard');

    if (btnViewHistory) {
        btnViewHistory.addEventListener('click', () => {
            switchView('history');
        });
    }

    if (btnBackToDashboard) {
        btnBackToDashboard.addEventListener('click', () => {
            switchView('customer');
        });
    }

    // Default load state: only switch to customer if no session is active
    // (Partner/user session check already calls switchView above in init block)
    const _hasPartner = localStorage.getItem('agentic_partner_session');
    const _hasUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!_hasPartner && !_hasUser) {
        switchView('customer');
    }

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered successfully:', reg.scope))
                .catch(err => console.error('Service Worker registration failed:', err));
        });
    }
});