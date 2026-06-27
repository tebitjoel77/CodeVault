let books = [];
let isEditMode = false;
let activeId = null;

$(document).ready(() => {
    loadBooks();
    $('#book-form').on('submit', handleForm);
    $('#btn-clear').on('click', clearForm);
    $('#search').on('input', searchBooks);
    $('#table-body').on('click', '.edit-btn', function() { editBook($(this).data('id')); });
    $('#table-body').on('click', '.del-btn', function() { 
        activeId = $(this).data('id'); 
        $('#modal').removeClass('hidden'); 
    });
    $('#btn-cancel').on('click', () => { $('#modal').addClass('hidden'); });
    $('#btn-confirm').on('click', () => { if(activeId) deleteBook(activeId); $('#modal').addClass('hidden'); });
});

const loadBooks = () => {
    books = JSON.parse(localStorage.getItem('libBooks')) || [];
    displayBooks(books);
};

const saveBooks = () => {
    localStorage.setItem('libBooks', JSON.stringify(books));
    searchBooks(); // Refresh UI based on current search
};

const handleForm = (e) => {
    e.preventDefault();
    const id = $('#book-id').val().trim();
    const title = $('#book-title').val().trim();
    const author = $('#book-author').val().trim();
    const category = $('#book-category').val();

    if (!validateForm(id, title, author, category)) return;

    if (isEditMode) updateBook(id, title, author, category);
    else addBook(id, title, author, category);
};

const validateForm = (id, title, author, category) => {
    let valid = true;
    $('.error').text('');

    if (!id) { $('#err-id').text('ID is required'); valid = false; }
    else if (!isEditMode && books.some(b => b.id.toLowerCase() === id.toLowerCase())) {
        $('#err-id').text('ID already exists'); valid = false;
    }
    if (!title) { $('#err-title').text('Title is required'); valid = false; }
    if (!author) { $('#err-author').text('Author is required'); valid = false; }
    if (!category) { $('#err-category').text('Category is required'); valid = false; }
    
    return valid;
};

const addBook = (id, title, author, category) => {
    books.push({ id, title, author, category });
    saveBooks();
    clearForm();
    showMessage('Book added successfully!', 'green');
};

const updateBook = (id, title, author, category) => {
    const idx = books.findIndex(b => b.id === String(id));
    if (idx !== -1) books[idx] = { id, title, author, category };
    saveBooks();
    clearForm();
    showMessage('Book updated successfully!', 'green');
};

const deleteBook = (id) => {
    books = books.filter(b => b.id !== String(id));
    saveBooks();
    if(isEditMode && $('#book-id').val() === String(id)) clearForm();
    showMessage('Book deleted successfully!', 'green');
};

const editBook = (id) => {
    const book = books.find(b => b.id === String(id));
    if (!book) return;
    
    isEditMode = true;
    $('#book-id').val(book.id).prop('disabled', true);
    $('#book-title').val(book.title);
    $('#book-author').val(book.author);
    $('#book-category').val(book.category);
    $('.error').text('');
    
    $('#btn-submit').html('<i class="fas fa-save"></i> Update Book').removeClass('blue').addClass('green');
};

const clearForm = () => {
    $('#book-form')[0].reset();
    isEditMode = false;
    $('#book-id').prop('disabled', false);
    $('#btn-submit').html('<i class="fas fa-plus"></i> Add Book').removeClass('green').addClass('blue');
    $('.error').text('');
};

const searchBooks = () => {
    const term = $('#search').val().trim().toLowerCase();
    const data = term ? books.filter(b => b.title.toLowerCase().includes(term)) : books;
    displayBooks(data);
};

const displayBooks = (data) => {
    renderTable(data);
};

const renderTable = (data) => {
    const tbody = $('#table-body');
    tbody.empty();

    if (data.length === 0) {
        $('#books-table').addClass('hidden');
        $('#empty-state').removeClass('hidden');
        return;
    }

    $('#books-table').removeClass('hidden');
    $('#empty-state').addClass('hidden');

    const html = data.map(b => `
        <tr style="display:none">
            <td><strong>${b.id}</strong></td>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td><span class="category-badge">${b.category}</span></td>
            <td>
                <button class="btn sm orange edit-btn" data-id="${b.id}" title="Edit"><i class="fas fa-pen"></i></button>
                <button class="btn sm red del-btn" data-id="${b.id}" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
    
    tbody.html(html);
    tbody.find('tr').fadeIn(400); // jQuery smooth animation
};

const showMessage = (msg, color) => {
    // If the color matches "green", use success icon. If red, use exclamation icon.
    const icon = color === 'green' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    const toast = $(`<div class="toast" style="border-left-color: var(--${color})"><i class="fas ${icon}" style="color: var(--${color})"></i> <span>${msg}</span></div>`).hide();
    
    $('#toast-container').append(toast);
    toast.slideDown(200);
    setTimeout(() => toast.slideUp(200, function(){ $(this).remove(); }), 3000);
};
