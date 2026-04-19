document.addEventListener('DOMContentLoaded', () => {

    // --- FIREBASE FIRESTORE SYNC LOGIC ---
    const firebaseConfig = {
        apiKey: "AIzaSyC8BoL8yfKIQ2o-tVmbrVfx0TXcUvudzyY",
        authDomain: "project-3cccff25-b1fb-4aa9-978.firebaseapp.com",
        projectId: "project-3cccff25-b1fb-4aa9-978",
        storageBucket: "project-3cccff25-b1fb-4aa9-978.firebasestorage.app",
        messagingSenderId: "1009826575246",
        appId: "1:1009826575246:web:595912191007526e5deadf"
    };

    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    const db = (typeof firebase !== 'undefined') ? firebase.firestore() : null;

    if(db) {
        // State variables to sum globally
        let globalRevenue = 0;
        let globalBookings = 0;

        // Real-time listener for Room Bookings
        db.collection('bookings').onSnapshot((snapshot) => {
            globalBookings = snapshot.size;
            let roomRevenue = 0;
            let tableHTML = '';
            
            let docs = [];
            snapshot.forEach(doc => docs.push(doc.data()));
            docs.sort((a,b) => {
               const tA = a.timestamp ? a.timestamp.toMillis() : 0;
               const tB = b.timestamp ? b.timestamp.toMillis() : 0;
               return tB - tA; // Sort Descending
            });
            
            docs.forEach(d => {
                if(d.totalPaid) roomRevenue += Number(d.totalPaid); 
                
                const statusColor = (d.status && d.status.includes('Unpaid')) ? '#ef4444' : '#22c55e';
                tableHTML += `
                    <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.3s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 15px; font-weight: bold; color: var(--text-main);">${d.guestName || 'Anonymous Guest'}</td>
                        <td style="padding: 15px; font-size: 13px;">${d.guestPhone || 'N/A'}</td>
                        <td style="padding: 15px;">${d.roomType || 'Walk-In'}</td>
                        <td style="padding: 15px; font-weight: 500;">${d.roomNumber || 'N/A'}</td>
                        <td style="padding: 15px; font-size: 13px;">${d.checkin || '-'} to ${d.checkout || '-'}</td>
                        <td style="padding: 15px; font-weight:bold; color: ${statusColor};">${d.status || 'Paid'}</td>
                        <td style="padding: 15px; font-weight:bold;">GHS ${d.totalPaid ? parseFloat(d.totalPaid).toFixed(2) : '0.00'}</td>
                    </tr>
                `;
            });
            
            const tableBody = document.getElementById('bookings-table-body');
            if(tableBody) tableBody.innerHTML = tableHTML || '<tr><td colspan="5" style="padding: 15px; text-align:center;">No bookings found yet.</td></tr>';
            
            updateDashboard(globalBookings, roomRevenue);
        });

        // Real-time listener for Food Orders
        let orderRevenue = 0;
        db.collection('orders').onSnapshot((snapshot) => {
            orderRevenue = 0;
            let tableHTML = '';
            
            let docs = [];
            snapshot.forEach(doc => docs.push(doc.data()));
            docs.sort((a,b) => {
               const tA = a.timestamp ? a.timestamp.toMillis() : 0;
               const tB = b.timestamp ? b.timestamp.toMillis() : 0;
               return tB - tA; // Sort Descending
            });
            
            docs.forEach(d => {
                if(d.totalPaid) orderRevenue += Number(d.totalPaid); 
                
                const statusColor = (d.status && d.status.includes('Unpaid')) ? '#f59e0b' : '#22c55e';
                const dateStr = d.timestamp ? new Date(d.timestamp.toMillis()).toLocaleString() : 'Just Now';
                tableHTML += `
                    <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.3s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 15px; font-weight: bold; color: var(--text-main);">${d.guestName || 'Walk-in'}</td>
                        <td style="padding: 15px; font-size: 13px;">${d.guestPhone || 'N/A'}</td>
                        <td style="padding: 15px;">${d.quantity || 1}x ${d.item || 'Custom Order'}</td>
                        <td style="padding: 15px; font-weight: 500;">${d.roomTarget || 'Lobby'}</td>
                        <td style="padding: 15px; font-size: 13px;">${dateStr}</td>
                        <td style="padding: 15px; font-weight:bold; color: ${statusColor};">${d.status || 'Paid'}</td>
                        <td style="padding: 15px; font-weight:bold;">GHS ${d.totalPaid ? parseFloat(d.totalPaid).toFixed(2) : '0.00'}</td>
                    </tr>
                `;
            });
            
            const tableBody = document.getElementById('orders-table-body');
            if(tableBody) tableBody.innerHTML = tableHTML || '<tr><td colspan="5" style="padding: 15px; text-align:center;">No restaurant orders yet.</td></tr>';

            updateDashboard(globalBookings, orderRevenue); 
        });

        function updateDashboard(activeBookings, additionalRevenue) {
            // Aggregate both revenues
            let combinedRevenue = 0;
            // Best effort without complex async wait, we just re-sum locally from memory
            db.collection('bookings').get().then(snap => {
                snap.forEach(d => { if(d.data().totalPaid) combinedRevenue += Number(d.data().totalPaid); });
            }).then(() => {
                db.collection('orders').get().then(snap => {
                    snap.forEach(d => { if(d.data().totalPaid) combinedRevenue += Number(d.data().totalPaid); });
                    // Render Live Data dynamically
                    document.querySelectorAll('.stat-card .stat-value')[2].textContent = `GHS ${combinedRevenue.toFixed(2)}`;
                    document.querySelectorAll('.stat-card .stat-value')[3].textContent = activeBookings;
                });
            });
        }
    }

    // Global Test Registration to test Firestore writes
    window.testFirestoreBooking = function(roomType, price) {
        if(!db) { alert("Firebase is not connected in the code yet."); return; }
        
        db.collection('bookings').add({
            roomType: roomType,
            totalPaid: price,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert('Success! Room booking stored safely in your Cloud Firestore database.\nThe Admin Dashboard metrics have synchronized perfectly in Realtime!');
        }).catch(err => {
            alert("Firestore Error: " + err.message + "\nAre your Firestore database 'rules' set to allow read/write?");
        });
    };

    // Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked item
            item.classList.add('active');
            
            const target = item.getAttribute('data-target');
            pageTitle.textContent = item.textContent.trim();

            // Hide all views
            views.forEach(view => view.classList.add('hidden'));
            
            // Show target view
            document.getElementById(target).classList.remove('hidden');
        });
    });

    // Populate Rooms
    const roomsContainer = document.getElementById('rooms-container');
    const roomTypes = [
        "Deluxe Queen Suite", "Executive Family Room", "King Ocean View", 
        "Master Honeymoon Suite", "Presidential Business Suite", "Classic Economy Room"
    ];
    
    for(let i = 1; i <= 6; i++) {
        const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        const price = 1;
        
        roomsContainer.innerHTML += `
            <div class="room-card">
                <div class="room-img" style="background-image: url('https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60')">
                    <div class="room-overlay">
                        <span>Room 10${i}</span>
                    </div>
                    <div class="room-status">Available</div>
                </div>
                <div class="room-info">
                    <h4>${type}</h4>
                    <div class="room-footer">
                        <p class="room-price">GHS ${price}<span>/night</span></p>
                        <button class="btn btn-dark" onclick="testFirestoreBooking('${type}', ${price})">Book Now (Test DB Write)</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Populate POS
    const menuContainer = document.getElementById('menu-container');
    const orderItems = document.getElementById('order-items');
    const orderTotalEl = document.getElementById('order-total');
    
    const menu = [
        {name: "Burger Combo", price: 1.00, icon: "fast-food-outline"},
        {name: "Pasta Plate", price: 1.00, icon: "restaurant-outline"},
        {name: "Steak Frites", price: 1.00, icon: "restaurant"},
        {name: "House Salad", price: 1.00, icon: "leaf-outline"},
        {name: "Cocktail", price: 1.00, icon: "wine-outline"},
        {name: "Dessert", price: 1.00, icon: "ice-cream-outline"}
    ];

    let currentOrder = [];

    menu.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <div class="menu-icon"><ion-icon name="${item.icon}"></ion-icon></div>
            <h4>${item.name}</h4>
            <p>GHS ${item.price.toFixed(2)}</p>
        `;
        div.addEventListener('click', () => {
            currentOrder.push(item);
            updateOrder();
        });
        menuContainer.appendChild(div);
    });

    function updateOrder() {
        orderItems.innerHTML = '';
        let total = 0;
        
        currentOrder.forEach((item, idx) => {
            total += item.price;
            orderItems.innerHTML += `
                <div class="order-row">
                    <span class="name">${item.name}</span>
                    <span class="price">GHS ${item.price.toFixed(2)}</span>
                </div>
            `;
        });
        
        orderTotalEl.textContent = `GHS ${total.toFixed(2)}`;
    }

    // AI Assistant Logic
    const aiFab = document.getElementById('ai-fab');
    const aiChat = document.getElementById('ai-chat');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatBody = document.getElementById('chat-body');

    aiFab.addEventListener('click', () => {
        aiChat.classList.toggle('hidden');
    });

    function handleSend() {
        const text = chatInput.value.trim();
        if(text === '') return;

        // User message
        chatBody.innerHTML += `
            <div class="chat-bubble user-bubble">
                ${text}
            </div>
        `;
        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        // Simulate AI reply
        setTimeout(() => {
            chatBody.innerHTML += `
                <div class="chat-bubble ai-bubble">
                    I am the Smart AI Assistant. I have received your request regarding "${text}". Since your system is currently offline, I will just say: Excellent choice! Can I help you with anything else?
                </div>
            `;
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
    }

    chatSend.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') handleSend();
    });
});
