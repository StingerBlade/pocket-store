
const API_URL = 'http://jsonplaceholder.typicode.com/users';


function loadUsers() {
    const customerList = document.getElementById('customer-list');

    fetch(API_URL)
        .then(response => response.json())
        .then(users => {
            customerList.innerHTML = users
                .map(user => `
                    <div class="user-card">
                        <h2>${user.name}</h2>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Teléfono:</strong> ${user.phone}</p>
                    </div>
                `)
                .join('');
        })
        .catch(error => {
            console.error('Error al cargar usuarios:', error);
            customerList.innerHTML = '<p>Error al cargar los datos</p>';
        });
}

document.addEventListener('DOMContentLoaded', loadUsers);
