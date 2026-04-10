document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const habitInput = document.getElementById('habit-input');
    const btnGood = document.getElementById('btn-good-habit');
    const btnBad = document.getElementById('btn-bad-habit');
    const habitList = document.getElementById('habit-list');
    
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    const API_BASE_URL = 'http://localhost:8000/api';
    
    // Fallback Mock DB
    let mockDB = JSON.parse(localStorage.getItem('nutriflow_habits_backup')) || [
        { name: "Drank 8 glasses of water", is_healthy: true, timestamp: new Date(Date.now() - 3600000).toISOString() },
        { name: "Ate a loaded pizza", is_healthy: false, timestamp: new Date(Date.now() - 7200000).toISOString() }
    ];

    // -----------------------------------------
    // Habit Tracker Logic
    // -----------------------------------------
    
    async function fetchHabits() {
        try {
            const res = await fetch(`${API_BASE_URL}/habits`);
            if (!res.ok) throw new Error("Server error");
            const habits = await res.json();
            renderHabits(habits, "Saved on cloud");
        } catch (err) {
            console.warn("Backend offline, using local fallback.", err);
            renderHabits(mockDB, "Saved offline");
        }
    }

    function renderHabits(habits, saveStatus) {
        habitList.innerHTML = '';
        if (!habits || habits.length === 0) {
            habitList.innerHTML = '<li class="feed-item"><div class="feed-content"><strong>No habits logged yet</strong><span>Connect your first habit via Quick Log</span></div></li>';
            return;
        }

        const sorted = [...habits].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

        sorted.forEach(h => {
            const li = document.createElement('li');
            li.className = 'feed-item';
            
            // handle string timestamp properly depending on source
            let dateObj = new Date(h.timestamp);
            if (isNaN(dateObj.getTime()) && h.timestamp) {
               dateObj = new Date(h.timestamp + 'Z'); 
            }
            if (isNaN(dateObj.getTime())) {
               dateObj = new Date();
            }
            
            const date = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            li.innerHTML = `
                <div class="feed-icon ${h.is_healthy ? 'good' : 'bad'}">
                    <ion-icon name="${h.is_healthy ? 'fitness-outline' : 'warning-outline'}"></ion-icon>
                </div>
                <div class="feed-content">
                    <strong>${h.name}</strong>
                    <span>${date} • ${saveStatus}</span>
                </div>
            `;
            habitList.appendChild(li);
        });
    }

    async function addHabit(isHealthy) {
        const text = habitInput.value.trim();
        if (!text) return;

        habitInput.disabled = true;
        
        try {
            const res = await fetch(`${API_BASE_URL}/habits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: text, is_healthy: isHealthy })
            });
            if (!res.ok) throw new Error("Server error");
        } catch (err) {
            console.warn("Backend offline, saving habit to local storage fallback.");
            mockDB.push({
                name: text,
                is_healthy: isHealthy,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('nutriflow_habits_backup', JSON.stringify(mockDB));
        } finally {
            habitInput.value = '';
            habitInput.disabled = false;
        }
        
        fetchHabits();
    }

    btnGood.addEventListener('click', () => addHabit(true));
    btnBad.addEventListener('click', () => addHabit(false));

    // -----------------------------------------
    // Chatbot Logic
    // -----------------------------------------
    function appendMsg(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        
        div.innerHTML = `
            ${sender === 'bot' ? '<div class="msg-avatar"><ion-icon name="sparkles"></ion-icon></div>' : ''}
            <div class="msg-bubble">${text}</div>
        `;
        
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendChat() {
        const msg = chatInput.value.trim();
        if (!msg) return;

        appendMsg(msg, 'user');
        chatInput.value = '';
        
        // Disable input while waiting
        chatInput.disabled = true;
        chatSend.disabled = true;

        try {
            const res = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            
            if (!res.ok) throw new Error("Server error");
            const data = await res.json();
            appendMsg(data.reply, 'bot');
            
        } catch (err) {
            console.warn("Backend API offline for chat.", err);
            // Fallback response simulating AI
            setTimeout(() => {
                let reply = "Hello! (Running in Offline Mode) Try logging your habits above!";
                const lowerMsg = msg.toLowerCase();
                if (lowerMsg.includes("breakfast") || lowerMsg.includes("morning")) {
                    reply = "For breakfast, aim for complex carbs and protein. Oatmeal with berries provides sustained energy.";
                } else if (lowerMsg.includes("night") || lowerMsg.includes("dinner")) {
                    reply = "Lean proteins like grilled salmon or chicken with steamed asparagus are perfect.";
                } else if (lowerMsg.includes("bad")) {
                    reply = "Sugar spikes your insulin and creates false hunger. Try drinking a large glass of water instead.";
                }
                appendMsg(reply, 'bot');
            }, 600);
        } finally {
            chatInput.disabled = false;
            chatSend.disabled = false;
            chatInput.focus();
        }
    }

    chatSend.addEventListener('click', sendChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !chatInput.disabled) sendChat();
    });

    // Boot App
    fetchHabits();
});
