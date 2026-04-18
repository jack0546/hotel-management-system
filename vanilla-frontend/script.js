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
            snapshot.forEach(doc => { if(doc.data().totalPaid) roomRevenue += Number(doc.data().totalPaid); });
            updateDashboard(globalBookings, roomRevenue);
        });

        // Real-time listener for Food Orders
        let orderRevenue = 0;
        db.collection('orders').onSnapshot((snapshot) => {
            orderRevenue = 0;
            snapshot.forEach(doc => { if(doc.data().totalPaid) orderRevenue += Number(doc.data().totalPaid); });
            updateDashboard(globalBookings, orderRevenue); // Update DOM using current globals
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
    const roomTypes = ['Deluxe Suite', 'Executive Room', 'Presidential Suite', 'Standard Double', 'Single Studio'];
    
    for(let i = 1; i <= 6; i++) {
        const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        const price = Math.floor(Math.random() * 200) + 100;
        
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
        {name: "Burger Combo", price: 12.00, icon: "fast-food-outline"},
        {name: "Pasta Plate", price: 18.50, icon: "restaurant-outline"},
        {name: "Steak Frites", price: 32.00, icon: "restaurant"},
        {name: "House Salad", price: 9.00, icon: "leaf-outline"},
        {name: "Cocktail", price: 8.50, icon: "wine-outline"},
        {name: "Dessert", price: 6.00, icon: "ice-cream-outline"}
    ];

    let currentOrder = [];

    menu.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <div class="menu-icon"><ion-icon name="${item.icon}"></ion-icon></div>
            <h4>${item.name}</h4>
            <p>$${item.price.toFixed(2)}</p>
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
                    <span class="price">$${item.price.toFixed(2)}</span>
                </div>
            `;
        });
        
        orderTotalEl.textContent = `$${total.toFixed(2)}`;
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
