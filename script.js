document.addEventListener('DOMContentLoaded', function () {
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const chatPage = document.getElementById('chat');
    const goToRegisterLink = document.getElementById('go-to-register');
    const goToLoginLink = document.getElementById('go-to-login');

    // Redirect to register page
    if (goToRegisterLink) {
        goToRegisterLink.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = 'register.html';
        });
    }

    // Redirect to login page
    if (goToLoginLink) {
        goToLoginLink.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = 'login.html';
        });
    }

    // Login functionality
    if (document.getElementById('login')) {
        document.getElementById('login').addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('Attempting to login with:', { email, password });

            try {
                const response = await fetch('https://neodove-backend.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('Login response:', data);

                if (data.success) {
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('username', email.split('@')[0]);
                    alert('Login successful');
                    window.location.href = 'chat.html';
                } else {
                    alert('Login failed: ' + data.error);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed: ' + error.message);
            }
        });
    }

    // Register functionality
    if (document.getElementById('register')) {
        document.getElementById('register').addEventListener('click', async () => {
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            console.log('Attempting to register with:', { username, email, password });

            try {
                const response = await fetch('https://neodove-backend.onrender.com/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();
                console.log('Register response:', data);

                if (data.success) {
                    alert('Registration successful');
                    window.location.href = 'login.html';
                } else {
                    alert('Registration failed: ' + data.error);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed: ' + error.message);
            }
        });
    }

    // Logout functionality
    if (document.getElementById('logout')) {
        document.getElementById('logout').addEventListener('click', () => {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('username');
            window.location.href = 'login.html';
        });
    }

    // Chat functionality
    if (chatPage) {
        const username = sessionStorage.getItem('username');
        if (username) {
            document.getElementById('chat-username').textContent = username;
            initializeChat(username);
        } else {
            window.location.href = 'login.html';
        }
    }

    function formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    function initializeChat(username) {
        const token = sessionStorage.getItem('token');
        const ws = new WebSocket(`https://neodove-backend.onrender.com`, [token]);

        ws.onmessage = (event) => {
            const msgData = JSON.parse(event.data);
            console.log('Received message:', msgData);

            const chatHistory = document.getElementById('chat-history');
            const msgElement = document.createElement('div');
            msgElement.classList.add('chat-message');
            if (msgData.username === username) {
                msgElement.classList.add('chat-message-sent');
            } else {
                msgElement.classList.add('chat-message-received');
            }
            msgElement.textContent = `${msgData.username} (${formatAMPM(new Date(msgData.timestamp))}): ${msgData.message}`;
            chatHistory.appendChild(msgElement);
        };

        document.getElementById('send').addEventListener('click', () => {
            const message = document.getElementById('message').value;
            const msgData = {
                username: username,
                message,
                timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(msgData));
            document.getElementById('message').value = '';
        });

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed.');
        };
    }
});
