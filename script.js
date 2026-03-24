/**
 * MAIN SCRIPT FOR PROJECT PORTFOLIO
 * 
 * Features:
 * - Dynamic project rendering
 * - Lazy loading for images
 * - Smooth interactions and animations
 * - Mobile-responsive behavior
 * - Interactive button hover effects
 * - Particle generation
 */

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    setupIntersectionObserver();
    setupSmoothScroll();
    setupButtonHover();
    setupCardParallax();
    generateParticles();
});

/**
 * Render Projects from PROJECTS array
 */
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('emptyState');

    // Clear existing content
    projectsGrid.innerHTML = '';

    // Check if projects exist
    if (!PROJECTS || PROJECTS.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Render each project
    PROJECTS.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsGrid.appendChild(projectCard);
    });
    
    // Setup observers and interactions
    setTimeout(() => {
        setupIntersectionObserver();
        observeElements();
    }, 100);
}

/**
 * Create a project card element
 */
function createProjectCard(project, index) {
    const card = document.createElement('article');
    card.className = 'project-card' + (project.featured ? ' featured' : '');
    card.setAttribute('data-project-id', project.id);
    card.style.animationDelay = `${index * 0.1}s`;

    // Generate tags HTML
    const tagsHTML = project.tags
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');

    // Create card content
    card.innerHTML = `
        ${project.featured ? '<div class="featured-badge">⭐ Featured</div>' : ''}
        <img 
            class="project-image" 
            data-src="${project.image}" 
            alt="${project.title} - ${project.description}"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250'%3E%3Crect fill='%230d0f1c' width='400' height='250'/%3E%3C/svg%3E"
            loading="lazy"
        >
        <div class="project-content">
            <h3 class="project-title">${escapeHtml(project.title)}</h3>
            <p class="project-description">${escapeHtml(project.description)}</p>
            <div class="project-tags">
                ${tagsHTML}
            </div>
            <a href="${project.liveUrl}" class="live-button" target="_blank" rel="noopener noreferrer" title="View ${project.title} live">
                <span>Live</span>
                <i class="bi bi-arrow-up-right"></i>
            </a>
        </div>
    `;

    return card;
}

/**
 * Setup Intersection Observer for lazy loading images
 */
function setupIntersectionObserver() {
    const imageOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const dataSrc = img.getAttribute('data-src');

                if (dataSrc) {
                    img.src = dataSrc;
                    img.removeAttribute('data-src');
                    
                    img.addEventListener('load', () => {
                        img.style.animation = 'fadeIn 0.5s ease-in-out';
                    });
                }

                observer.unobserve(img);
            }
        });
    }, imageOptions);

    // Observe all lazy-loaded images
    setTimeout(() => {
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }, 100);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Smooth scroll for anchor links
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Add project dynamically (for future CMS integration)
 * Usage: addProject({ id: 10, title: "...", ... })
 */
function addProject(projectData) {
    if (
        projectData.id &&
        projectData.title &&
        projectData.description &&
        projectData.image &&
        projectData.tags &&
        projectData.liveUrl
    ) {
        PROJECTS.push(projectData);
        renderProjects();
        setupIntersectionObserver();
        console.log(`Project "${projectData.title}" added successfully!`);
    } else {
        console.error('Invalid project data. Missing required fields.');
    }
}

/**
 * Remove project by ID
 * Usage: removeProject(1)
 */
function removeProject(projectId) {
    const index = PROJECTS.findIndex(p => p.id === projectId);
    
    if (index > -1) {
        const removedProject = PROJECTS[index];
        PROJECTS.splice(index, 1);
        renderProjects();
        setupIntersectionObserver();
        console.log(`Project "${removedProject.title}" removed successfully!`);
    } else {
        console.error(`Project with ID ${projectId} not found.`);
    }
}

/**
 * Update project by ID
 * Usage: updateProject(1, { title: "New Title", ... })
 */
function updateProject(projectId, updatedData) {
    const project = PROJECTS.find(p => p.id === projectId);
    
    if (project) {
        Object.assign(project, updatedData);
        renderProjects();
        setupIntersectionObserver();
        console.log(`Project "${updatedData.title || project.title}" updated successfully!`);
    } else {
        console.error(`Project with ID ${projectId} not found.`);
    }
}

/**
 * Get all projects
 */
function getAllProjects() {
    return PROJECTS;
}

/**
 * Get featured projects
 */
function getFeaturedProjects() {
    return PROJECTS.filter(p => p.featured);
}

/**
 * Search projects by keywords
 */
function searchProjects(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return PROJECTS.filter(p =>
        p.title.toLowerCase().includes(lowerKeyword) ||
        p.description.toLowerCase().includes(lowerKeyword) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
}

/**
 * Get projects by tag
 */
function getProjectsByTag(tag) {
    return PROJECTS.filter(p => p.tags.includes(tag));
}

// Add fade-in animation for lazy-loaded images
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export functions for console use (optional)
window.projectPortfolio = {
    addProject,
    removeProject,
    updateProject,
    getAllProjects,
    getFeaturedProjects,
    searchProjects,
    getProjectsByTag
};

// Log available commands (helpful for developers)
console.log(
    '%cProject Portfolio loaded!',
    'color: #00d4ff; font-size: 14px; font-weight: bold;'
);
console.log(
    '%cAvailable commands:\n' +
    'projectPortfolio.addProject(data)\n' +
    'projectPortfolio.removeProject(id)\n' +
    'projectPortfolio.updateProject(id, data)\n' +
    'projectPortfolio.getAllProjects()\n' +
    'projectPortfolio.getFeaturedProjects()\n' +
    'projectPortfolio.searchProjects(keyword)\n' +
    'projectPortfolio.getProjectsByTag(tag)',
    'color: #7b68ee; font-size: 12px;'
);

/**
 * Setup interactive button hover effects
 */
function setupButtonHover() {
    const buttons = document.querySelectorAll('.cta-button, .live-button, .contact-link');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            button.style.setProperty('--px', x + '%');
            button.style.setProperty('--py', y + '%');
        });
    });
}

/**
 * Setup creative parallax effect on project cards
 */
function setupCardParallax() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
}

/**
 * Generate animated particles
 */
function generateParticles() {
    const particleField = document.querySelector('.particle-field');
    
    if (!particleField) return;
    
    const particleCount = window.innerWidth > 768 ? 20 : 10;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 12;
        const delay = Math.random() * 5;
        const dx = (Math.random() - 0.5) * 100;
        const dy = -Math.random() * 100 - 50;
        
        particle.style.setProperty('--size', size + 'px');
        particle.style.setProperty('--top', top + '%');
        particle.style.setProperty('--left', left + '%');
        particle.style.setProperty('--duration', duration + 's');
        particle.style.setProperty('--delay', delay + 's');
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');
        
        particleField.appendChild(particle);
    }
}

/**
 * Observe when elements come into view
 */
function observeElements() {
    const cards = document.querySelectorAll('[data-project-id]');
    const contactSection = document.querySelector('.contact-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => observer.observe(card));
    if (contactSection) observer.observe(contactSection);
}
