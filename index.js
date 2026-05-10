const express = require('express');
const users = require('./MOCK_DATA.json');
const fs = require('fs');

const app = express();

app.use(express.urlencoded({ extended: false }));
const PORT = 8000;

// Middleware

app.use((req, res, next) => {
    console.log('Hello from middleware 1');
    next();
});

app.use((req, res, next) => {
    req.username = 'username';
    next();
});

app.use((req, res, next) => {
    fs.appendFile('log.txt', `${Date.now()} | ${req.method} | ${req.path}\n`, (err, data) => {
        next();
    });
});

// Routes

// HTML
app.get('/users', (req, res) => {
    const html = `
        <ul>
            ${users.map((user) => {
                return `<li>${user.first_name}</li>`
            }).join("")}
        </ul>
    `;

    res.send(html);
});


// APIs
app.route('/api/users')
.get((req, res) => {
    res.setHeader('x-my-name', 'Aman Srivatsa');
    res.json(users);
})
.post((req, res) => {
    const body = req.body;
    if(
        !body || 
        !body.first_name || 
        !body.last_name || 
        !body.email || 
        !body.gender || 
        !body.job_title
    ) {
        res.status(400).json({ status: 'All form fields are required.' });
        return;
    }

    const newId = users.length + 1;
    users.push({ ...body, id: newId });
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        res.status(201).json({ status: 'User added.', id: newId });
    });
});

app.route('/api/users/:id')
.get((req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex(item => item.id === id);

    if(index === -1) {
        res.status(404).json({ status: 'User not found.' });
        return;
    }

    const user = users.find(item => item.id === id);
    res.json(user);
})
.patch((req, res) => {
    const id = Number(req.params.id);
    const body = req.body;
    const index = users.findIndex(item => item.id === id);

    if(index === -1) {
        res.status(404).json({ status: 'User not found.' });
        return;
    }

    users[index] = {
        ...users[index],
        ...body,
    };

    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        res.json({ status: 'User updated.' });
    });
})
.delete((req, res) => {
    const id = Number(req.params.id);

    const index = users.findIndex(item => item.id === id);

    if(index === -1) {
        res.status(404).json({ status: 'User not found.' });
        return;
    }
    
    users.splice(index, 1);

    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        res.json({ status: 'User Deleted from database.' });
    });
});

app.listen(8000, () => {
    console.log('Server started!');
});
