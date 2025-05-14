const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Caminho para o arquivo de dados
const dataPath = path.join(__dirname, 'data.json');

// Função para ler dados do arquivo
function readBooksFromFile() {
  try {
    // Verificar se o arquivo existe
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
    // Se o arquivo não existe, retornar um array vazio
    return [];
  } catch (error) {
    console.error('Erro ao ler arquivo de dados:', error);
    return [];
  }
}

// Função para salvar dados no arquivo
function saveBooksToFile(books) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(books, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar arquivo de dados:', error);
  }
}

// Inicializar dados a partir do arquivo ou com valores padrão se o arquivo estiver vazio
let books = readBooksFromFile();


if (books.length === 0) {
  books = [
    {
      id: uuidv4(),
      title: "Dom Casmurro",
      author: "Machado de Assis",
      year: 1899,
      genre: "Romance",
      description: "Um clássico da literatura brasileira que narra a história de Bentinho e seu ciúme por Capitu.",
      cover: "https://m.media-amazon.com/images/I/41ASqgEPmHL._SY445_SX342_.jpg"
    },
    {
      id: uuidv4(),
      title: "O Senhor dos Anéis",
      author: "J.R.R. Tolkien",
      year: 1954,
      genre: "Fantasia",
      description: "Uma saga épica em um mundo de fantasia onde anões, elfos e humanos lutam contra o mal.",
      cover: "https://m.media-amazon.com/images/I/71ZLavBjpRL._SY466_.jpg"
    }
  ];
  
  // Salvar os livros de exemplo no arquivo
  saveBooksToFile(books);
}

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: "Bem-vindo à API do B.Digital", 
    endpoints: {
      getAllBooks: "GET /books",
      getBookById: "GET /books/:id",
      createBook: "POST /books",
      updateBook: "PUT /books/:id",
      deleteBook: "DELETE /books/:id"
    }
  });
});

// Rotas CRUD
// GET /books - Listar todos os livros
app.get('/books', (req, res) => {
  res.status(200).json(books);
});

// GET /books/:id - Obter um livro específico pelo ID
app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Livro não encontrado" });
  }
  res.status(200).json(book);
});

// POST /books - Criar um novo livro
app.post('/books', (req, res) => {
  const { title, author, year, genre, description, cover } = req.body;
  
  // Validação básica
  if (!title || !author) {
    return res.status(400).json({ message: "Título e autor são obrigatórios" });
  }
  
  const newBook = {
    id: uuidv4(),
    title,
    author,
    year: year || 0,
    genre: genre || "Não categorizado",
    description: description || "",
    cover: cover || ""
  };
  
  books.push(newBook);
  
  // Salvar dados atualizados no arquivo
  saveBooksToFile(books);
  
  res.status(201).json(newBook);
});

// PUT /books/:id - Atualizar um livro existente
app.put('/books/:id', (req, res) => {
  const { title, author, year, genre, description, cover } = req.body;
  const id = req.params.id;
  
  // Encontrar o índice do livro
  const bookIndex = books.findIndex(b => b.id === id);
  
  // Verificar se o livro existe
  if (bookIndex === -1) {
    return res.status(404).json({ message: "Livro não encontrado" });
  }
  
  // Validação básica
  if (!title || !author) {
    return res.status(400).json({ message: "Título e autor são obrigatórios" });
  }
  
  // Atualizar o livro
  const updatedBook = {
    id,
    title,
    author,
    year: year || 0,
    genre: genre || "Não categorizado",
    description: description || "",
    cover: cover || ""
  };
  
  books[bookIndex] = updatedBook;
  
  // Salvar dados atualizados no arquivo
  saveBooksToFile(books);
  
  res.status(200).json(updatedBook);
});

// DELETE /books/:id - Remover um livro pelo ID
app.delete('/books/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === req.params.id);
  if (bookIndex === -1) {
    return res.status(404).json({ message: "Livro não encontrado" });
  }
  
  books.splice(bookIndex, 1);
  
  // Salvar dados atualizados no arquivo
  saveBooksToFile(books);
  
  res.status(200).json({ message: "Livro removido com sucesso" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Dados sendo persistidos em: ${dataPath}`);
});