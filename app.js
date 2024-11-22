// Importar dependencias
const express = require('express');
const fs = require('fs');
const cors = require('cors'); // Importar el paquete CORS
const app = express();
const PORT = 3000;

// Middleware para habilitar CORS
app.use(cors()); // Permitir solicitudes desde cualquier origen

// Middleware para parsear JSON
app.use(express.json());

// Leer datos iniciales de mascotas desde un archivo JSON
let pets;
try {
    pets = JSON.parse(fs.readFileSync('./pets.json', 'utf-8'));
} catch (error) {
    console.error('Error al leer el archivo pets.json:', error);
    pets = [];
}

// Ruta para listar todas las mascotas (con filtros opcionales)
app.get('/api/pets', (req, res) => {
    const { raza, tipo } = req.query;
    let filteredPets = pets;

    if (raza) {
        filteredPets = filteredPets.filter(pet => pet.raza.toLowerCase() === raza.toLowerCase());
    }
    if (tipo) {
        filteredPets = filteredPets.filter(pet => pet.tipo.toLowerCase() === tipo.toLowerCase());
    }

    res.json(filteredPets);
});

// Ruta para obtener una mascota por ID
app.get('/api/pets/:id', (req, res) => {
    const petId = parseInt(req.params.id, 10);
    const pet = pets.find(p => p.id === petId);

    if (pet) {
        res.json(pet);
    } else {
        res.status(404).json({ message: 'Mascota no encontrada' });
    }
});

// Ruta para agregar una nueva mascota
app.post('/api/pets', (req, res) => {
    const newPet = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!newPet.nombre || !newPet.tipo || !newPet.raza || newPet.edad === undefined) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    newPet.id = pets.length ? pets[pets.length - 1].id + 1 : 1;
    pets.push(newPet);
    savePets();
    res.status(201).json(newPet);
});

// Ruta para actualizar una mascota existente
app.put('/api/pets/:id', (req, res) => {
    const petId = parseInt(req.params.id, 10);
    const updatedPet = req.body;

    const petIndex = pets.findIndex(pet => pet.id === petId);
    if (petIndex !== -1) {
        pets[petIndex] = { ...pets[petIndex], ...updatedPet };
        savePets();
        res.json(pets[petIndex]);
    } else {
        res.status(404).json({ message: 'Mascota no encontrada' });
    }
});

// Ruta para eliminar una mascota
app.delete('/api/pets/:id', (req, res) => {
    const petId = parseInt(req.params.id, 10);
    const petIndex = pets.findIndex(pet => pet.id === petId);

    if (petIndex !== -1) {
        const deletedPet = pets.splice(petIndex, 1);
        savePets();
        res.json(deletedPet);
    } else {
        res.status(404).json({ message: 'Mascota no encontrada' });
    }
});

// Función para guardar los datos en el archivo JSON
function savePets() {
    try {
        fs.writeFileSync('./pets.json', JSON.stringify(pets, null, 2));
    } catch (error) {
        console.error('Error al guardar en el archivo pets.json:', error);
    }
}

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
