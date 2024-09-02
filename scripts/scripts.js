window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hide-preloader');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 600);
});

async function loadGitHubProjects() {
    const username = 'mikhail-kirillov';
    const excludedRepos = ['mikhail-kirillov', 'mikhail-kirillov.github.io'];
    const projectsContainer = document.getElementById('github-projects');

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        
        const repositories = await response.json();
        const filteredRepos = repositories.filter(repo => !excludedRepos.includes(repo.name));

        filteredRepos.forEach(repo => {
            const projectElement = document.createElement('div');
            projectElement.classList.add('project');
            projectElement.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${repo.description || 'Описание отсутствует'}</p>
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">Посмотреть на GitHub</a>
            `;
            projectsContainer.appendChild(projectElement);
        });

        observeElements([document.querySelector('.projects-grid')]);
    } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
        projectsContainer.innerHTML = '<p>Не удалось загрузить проекты.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadGitHubProjects();

    const aboutContent = document.querySelector('.about-content');
    const contactInfoItems = document.querySelectorAll('.contact-info p');

    observeElements([aboutContent, ...contactInfoItems]);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.getElementById('animated-background').appendChild(canvas);

    const cellSize = 10;
    const speed = 210;
    let cells = [];
    let cols, rows;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);
        initCells();
    }

    function initCells() {
        cells = Array.from({ length: rows }, () => Array(cols).fill(0));
        initMultiplePoints();
        initMultipleGliders(Math.floor(rows * cols / 100));
    }

    function initMultiplePoints() {
        const centerX = Math.floor(cols / 2);
        const centerY = Math.floor(rows / 2);
        const radius = 10;

        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    cells[y][x] = Math.random() < 0.5 ? 1 : 0;
                }
            }
        }
    }

    function initMultipleGliders(count) {
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * cols);
            const y = Math.floor(Math.random() * rows);
            setGlider(x, y);
        }
    }

    function setGlider(x, y) {
        if (x + 2 < cols && y + 2 < rows) {
            cells[y][x + 1] = 1;
            cells[y + 1][x + 2] = 1;
            cells[y + 2][x] = 1;
            cells[y + 2][x + 1] = 1;
            cells[y + 2][x + 2] = 1;
        }
    }

    function updateGrid() {
        const newCells = cells.map(arr => [...arr]);
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const neighbors = getNeighbors(x, y);
                if (cells[y][x] === 1) {
                    if (neighbors < 2 || neighbors > 3) newCells[y][x] = 0;
                } else {
                    if (neighbors === 3) newCells[y][x] = 1;
                }
            }
        }
        cells = newCells;
    }

    function getNeighbors(x, y) {
        const neighbors = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        return neighbors.reduce((acc, [dx, dy]) => {
            const newX = (x + dx + cols) % cols;
            const newY = (y + dy + rows) % rows;
            acc += cells[newY][newX];
            return acc;
        }, 0);
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (cells[y][x] === 1) {
                    ctx.fillStyle = document.body.classList.contains('dark-mode') ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    function loop() {
        updateGrid();
        drawGrid();
        setTimeout(loop, speed);
    }

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const parallaxFactor = 0.01;
        canvas.style.transform = `translateY(${scrollTop * parallaxFactor}px)`;
    });

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    loop();
});

const profilePhoto = document.querySelector('.profile-photo');
const LIGHT_MODE_IMAGE = profilePhoto.getAttribute('data-light-src');
const DARK_MODE_IMAGE = profilePhoto.getAttribute('data-dark-src');

const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';

    const newImageSrc = isDarkMode ? DARK_MODE_IMAGE : LIGHT_MODE_IMAGE;
    profilePhoto.classList.add('fade-out');
    setTimeout(() => {
        profilePhoto.src = newImageSrc;
        profilePhoto.classList.remove('fade-out');
    }, 190);
});

const backToTopButton = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function observeElements(elements) {
    const options = { threshold: 0.1 };
    const observer = new IntersectionObserver(showElement, options);
    elements.forEach(el => observer.observe(el));
}

function showElement(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}
